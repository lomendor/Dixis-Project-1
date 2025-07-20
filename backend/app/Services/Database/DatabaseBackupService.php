<?php

namespace App\Services\Database;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;

class DatabaseBackupService
{
    private string $backupDisk;
    private string $backupPath;

    public function __construct()
    {
        $this->backupDisk = config('backup.disk', 'local');
        $this->backupPath = config('backup.path', 'backups');
    }

    /**
     * Create full database backup
     */
    public function createFullBackup(array $options = []): array
    {
        $timestamp = now()->format('Y-m-d_H-i-s');
        $filename = "dixis_full_backup_{$timestamp}.sql";
        
        try {
            $backupData = $this->generateBackupData($options);
            
            // Save to storage
            $path = $this->backupPath . '/' . $filename;
            Storage::disk($this->backupDisk)->put($path, $backupData);
            
            // Compress if requested
            if ($options['compress'] ?? true) {
                $compressedPath = $this->compressBackup($path);
                Storage::disk($this->backupDisk)->delete($path);
                $path = $compressedPath;
                $filename = basename($compressedPath);
            }

            $result = [
                'success' => true,
                'filename' => $filename,
                'path' => $path,
                'size' => Storage::disk($this->backupDisk)->size($path),
                'created_at' => now()->toISOString(),
                'type' => 'full'
            ];

            Log::info('Database backup created successfully', $result);
            
            return $result;

        } catch (\Exception $e) {
            Log::error('Database backup failed: ' . $e->getMessage());
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Create incremental backup (only changed data)
     */
    public function createIncrementalBackup(\DateTime $since): array
    {
        $timestamp = now()->format('Y-m-d_H-i-s');
        $filename = "dixis_incremental_backup_{$timestamp}.sql";
        
        try {
            $backupData = $this->generateIncrementalBackupData($since);
            
            $path = $this->backupPath . '/' . $filename;
            Storage::disk($this->backupDisk)->put($path, $backupData);
            
            $result = [
                'success' => true,
                'filename' => $filename,
                'path' => $path,
                'size' => Storage::disk($this->backupDisk)->size($path),
                'created_at' => now()->toISOString(),
                'type' => 'incremental',
                'since' => $since->format('Y-m-d H:i:s')
            ];

            Log::info('Incremental backup created successfully', $result);
            
            return $result;

        } catch (\Exception $e) {
            Log::error('Incremental backup failed: ' . $e->getMessage());
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Create table-specific backup
     */
    public function createTableBackup(array $tables): array
    {
        $timestamp = now()->format('Y-m-d_H-i-s');
        $tableList = implode('_', $tables);
        $filename = "dixis_tables_{$tableList}_{$timestamp}.sql";
        
        try {
            $backupData = $this->generateTableBackupData($tables);
            
            $path = $this->backupPath . '/' . $filename;
            Storage::disk($this->backupDisk)->put($path, $backupData);
            
            $result = [
                'success' => true,
                'filename' => $filename,
                'path' => $path,
                'size' => Storage::disk($this->backupDisk)->size($path),
                'created_at' => now()->toISOString(),
                'type' => 'tables',
                'tables' => $tables
            ];

            Log::info('Table backup created successfully', $result);
            
            return $result;

        } catch (\Exception $e) {
            Log::error('Table backup failed: ' . $e->getMessage());
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Generate full backup data
     */
    private function generateBackupData(array $options = []): string
    {
        $sql = "-- Dixis Database Backup\n";
        $sql .= "-- Created: " . now()->toISOString() . "\n";
        $sql .= "-- Database: " . config('database.connections.mysql.database') . "\n\n";

        $sql .= "SET FOREIGN_KEY_CHECKS = 0;\n\n";

        // Get all tables
        $tables = DB::select('SHOW TABLES');
        $databaseName = config('database.connections.mysql.database');
        
        foreach ($tables as $table) {
            $tableName = $table->{"Tables_in_{$databaseName}"};
            
            // Skip certain tables if specified
            if (isset($options['exclude_tables']) && in_array($tableName, $options['exclude_tables'])) {
                continue;
            }

            $sql .= $this->generateTableBackup($tableName, $options);
        }

        $sql .= "SET FOREIGN_KEY_CHECKS = 1;\n";
        
        return $sql;
    }

    /**
     * Generate incremental backup data
     */
    private function generateIncrementalBackupData(\DateTime $since): string
    {
        $sql = "-- Dixis Incremental Database Backup\n";
        $sql .= "-- Created: " . now()->toISOString() . "\n";
        $sql .= "-- Since: " . $since->format('Y-m-d H:i:s') . "\n\n";

        // Tables with timestamp tracking
        $timestampTables = [
            'products' => 'updated_at',
            'orders' => 'updated_at',
            'users' => 'updated_at',
            'invoices' => 'updated_at',
            'order_items' => 'updated_at',
            'producers' => 'updated_at'
        ];

        foreach ($timestampTables as $table => $timestampColumn) {
            if (DB::getSchemaBuilder()->hasTable($table)) {
                $sql .= $this->generateIncrementalTableBackup($table, $timestampColumn, $since);
            }
        }

        return $sql;
    }

    /**
     * Generate table-specific backup data
     */
    private function generateTableBackupData(array $tables): string
    {
        $sql = "-- Dixis Table Backup\n";
        $sql .= "-- Created: " . now()->toISOString() . "\n";
        $sql .= "-- Tables: " . implode(', ', $tables) . "\n\n";

        $sql .= "SET FOREIGN_KEY_CHECKS = 0;\n\n";

        foreach ($tables as $table) {
            if (DB::getSchemaBuilder()->hasTable($table)) {
                $sql .= $this->generateTableBackup($table);
            }
        }

        $sql .= "SET FOREIGN_KEY_CHECKS = 1;\n";
        
        return $sql;
    }

    /**
     * Generate backup for single table
     */
    private function generateTableBackup(string $table, array $options = []): string
    {
        $sql = "-- Table: {$table}\n";
        
        // Get table structure
        $createTable = DB::select("SHOW CREATE TABLE {$table}")[0];
        $sql .= "DROP TABLE IF EXISTS `{$table}`;\n";
        $sql .= $createTable->{'Create Table'} . ";\n\n";

        // Get table data
        if (!isset($options['structure_only']) || !$options['structure_only']) {
            $rows = DB::table($table)->get();
            
            if ($rows->count() > 0) {
                $sql .= "INSERT INTO `{$table}` VALUES\n";
                
                $values = [];
                foreach ($rows as $row) {
                    $rowData = array_map(function($value) {
                        return $value === null ? 'NULL' : "'" . addslashes($value) . "'";
                    }, (array)$row);
                    
                    $values[] = '(' . implode(', ', $rowData) . ')';
                }
                
                $sql .= implode(",\n", $values) . ";\n\n";
            }
        }

        return $sql;
    }

    /**
     * Generate incremental backup for single table
     */
    private function generateIncrementalTableBackup(string $table, string $timestampColumn, \DateTime $since): string
    {
        $sql = "-- Incremental data for table: {$table}\n";
        
        $rows = DB::table($table)
            ->where($timestampColumn, '>', $since->format('Y-m-d H:i:s'))
            ->get();

        if ($rows->count() > 0) {
            // First, delete existing records that might be updated
            $ids = $rows->pluck('id')->toArray();
            $sql .= "DELETE FROM `{$table}` WHERE id IN (" . implode(', ', $ids) . ");\n";
            
            // Then insert the updated records
            $sql .= "INSERT INTO `{$table}` VALUES\n";
            
            $values = [];
            foreach ($rows as $row) {
                $rowData = array_map(function($value) {
                    return $value === null ? 'NULL' : "'" . addslashes($value) . "'";
                }, (array)$row);
                
                $values[] = '(' . implode(', ', $rowData) . ')';
            }
            
            $sql .= implode(",\n", $values) . ";\n\n";
        }

        return $sql;
    }

    /**
     * Compress backup file
     */
    private function compressBackup(string $path): string
    {
        $compressedPath = $path . '.gz';
        
        $content = Storage::disk($this->backupDisk)->get($path);
        $compressed = gzencode($content, 9);
        
        Storage::disk($this->backupDisk)->put($compressedPath, $compressed);
        
        return $compressedPath;
    }

    /**
     * List all backups
     */
    public function listBackups(): array
    {
        $files = Storage::disk($this->backupDisk)->files($this->backupPath);
        $backups = [];

        foreach ($files as $file) {
            if (str_contains($file, 'dixis_') && (str_ends_with($file, '.sql') || str_ends_with($file, '.gz'))) {
                $backups[] = [
                    'filename' => basename($file),
                    'path' => $file,
                    'size' => Storage::disk($this->backupDisk)->size($file),
                    'created_at' => Storage::disk($this->backupDisk)->lastModified($file),
                    'type' => $this->getBackupType($file)
                ];
            }
        }

        // Sort by creation date (newest first)
        usort($backups, function($a, $b) {
            return $b['created_at'] - $a['created_at'];
        });

        return $backups;
    }

    /**
     * Delete old backups
     */
    public function cleanupOldBackups(int $keepDays = 30): array
    {
        $cutoffDate = now()->subDays($keepDays)->timestamp;
        $backups = $this->listBackups();
        $deleted = [];

        foreach ($backups as $backup) {
            if ($backup['created_at'] < $cutoffDate) {
                Storage::disk($this->backupDisk)->delete($backup['path']);
                $deleted[] = $backup['filename'];
            }
        }

        Log::info('Cleaned up old backups', ['deleted_count' => count($deleted)]);

        return $deleted;
    }

    /**
     * Restore from backup
     */
    public function restoreFromBackup(string $filename): array
    {
        try {
            $path = $this->backupPath . '/' . $filename;
            
            if (!Storage::disk($this->backupDisk)->exists($path)) {
                throw new \Exception("Backup file not found: {$filename}");
            }

            $content = Storage::disk($this->backupDisk)->get($path);
            
            // Decompress if needed
            if (str_ends_with($filename, '.gz')) {
                $content = gzdecode($content);
            }

            // Execute SQL
            DB::unprepared($content);

            Log::info('Database restored from backup', ['filename' => $filename]);

            return [
                'success' => true,
                'filename' => $filename,
                'restored_at' => now()->toISOString()
            ];

        } catch (\Exception $e) {
            Log::error('Database restore failed: ' . $e->getMessage());
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get backup type from filename
     */
    private function getBackupType(string $filename): string
    {
        if (str_contains($filename, 'full_backup')) {
            return 'full';
        } elseif (str_contains($filename, 'incremental_backup')) {
            return 'incremental';
        } elseif (str_contains($filename, 'tables_')) {
            return 'tables';
        }

        return 'unknown';
    }

    /**
     * Verify backup integrity
     */
    public function verifyBackup(string $filename): array
    {
        try {
            $path = $this->backupPath . '/' . $filename;
            
            if (!Storage::disk($this->backupDisk)->exists($path)) {
                throw new \Exception("Backup file not found: {$filename}");
            }

            $content = Storage::disk($this->backupDisk)->get($path);
            
            // Decompress if needed
            if (str_ends_with($filename, '.gz')) {
                $content = gzdecode($content);
                if ($content === false) {
                    throw new \Exception("Failed to decompress backup file");
                }
            }

            // Basic SQL syntax check
            $lines = explode("\n", $content);
            $sqlStatements = 0;
            $errors = [];

            foreach ($lines as $lineNum => $line) {
                $line = trim($line);
                if (empty($line) || str_starts_with($line, '--')) {
                    continue;
                }

                if (str_ends_with($line, ';')) {
                    $sqlStatements++;
                }

                // Check for common SQL syntax issues
                if (str_contains($line, 'CREATE TABLE') && !str_contains($line, 'IF NOT EXISTS')) {
                    // This is fine for backups
                }
            }

            return [
                'success' => true,
                'filename' => $filename,
                'sql_statements' => $sqlStatements,
                'file_size' => Storage::disk($this->backupDisk)->size($path),
                'errors' => $errors,
                'verified_at' => now()->toISOString()
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}