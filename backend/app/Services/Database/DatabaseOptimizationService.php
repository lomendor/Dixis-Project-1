<?php

namespace App\Services\Database;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class DatabaseOptimizationService
{
    /**
     * Analyze database performance and suggest optimizations
     */
    public function analyzePerformance(): array
    {
        $analysis = [
            'slow_queries' => $this->getSlowQueries(),
            'missing_indexes' => $this->findMissingIndexes(),
            'table_sizes' => $this->getTableSizes(),
            'index_usage' => $this->getIndexUsage(),
            'recommendations' => []
        ];

        $analysis['recommendations'] = $this->generateRecommendations($analysis);

        return $analysis;
    }

    /**
     * Get slow queries from the database
     */
    private function getSlowQueries(): array
    {
        try {
            // For MySQL/MariaDB
            if (DB::getDriverName() === 'mysql') {
                $slowQueries = DB::select("
                    SELECT 
                        query_time,
                        lock_time,
                        rows_sent,
                        rows_examined,
                        sql_text
                    FROM mysql.slow_log 
                    WHERE start_time >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
                    ORDER BY query_time DESC 
                    LIMIT 10
                ");
                
                return array_map(function($query) {
                    return [
                        'query_time' => $query->query_time,
                        'lock_time' => $query->lock_time,
                        'rows_sent' => $query->rows_sent,
                        'rows_examined' => $query->rows_examined,
                        'sql_text' => substr($query->sql_text, 0, 200) . '...'
                    ];
                }, $slowQueries);
            }

            return [];
        } catch (\Exception $e) {
            Log::warning('Could not retrieve slow queries: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Find missing indexes based on query patterns
     */
    private function findMissingIndexes(): array
    {
        $missingIndexes = [];

        // Common query patterns that need indexes
        $patterns = [
            'products' => [
                'WHERE is_active = 1 AND category_id = ?',
                'WHERE producer_id = ? AND is_active = 1',
                'WHERE is_featured = 1 AND is_active = 1',
                'ORDER BY created_at DESC',
                'WHERE price BETWEEN ? AND ?'
            ],
            'orders' => [
                'WHERE user_id = ? AND status = ?',
                'WHERE created_at >= ? AND status IN (?)',
                'WHERE business_user_id = ? AND is_bulk_order = 1'
            ],
            'invoices' => [
                'WHERE user_id = ? AND status = ?',
                'WHERE due_date < NOW() AND status != "paid"',
                'WHERE invoice_type = ? AND created_at >= ?'
            ]
        ];

        foreach ($patterns as $table => $queries) {
            $existingIndexes = $this->getTableIndexes($table);
            
            foreach ($queries as $pattern) {
                if (!$this->hasOptimalIndex($pattern, $existingIndexes)) {
                    $missingIndexes[] = [
                        'table' => $table,
                        'pattern' => $pattern,
                        'suggested_index' => $this->suggestIndex($pattern)
                    ];
                }
            }
        }

        return $missingIndexes;
    }

    /**
     * Get table sizes for optimization planning
     */
    private function getTableSizes(): array
    {
        try {
            if (DB::getDriverName() === 'mysql') {
                $sizes = DB::select("
                    SELECT 
                        table_name,
                        ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb,
                        table_rows,
                        ROUND((data_length / 1024 / 1024), 2) AS data_mb,
                        ROUND((index_length / 1024 / 1024), 2) AS index_mb
                    FROM information_schema.tables 
                    WHERE table_schema = DATABASE()
                    ORDER BY (data_length + index_length) DESC
                    LIMIT 20
                ");

                return array_map(function($table) {
                    return [
                        'table_name' => $table->table_name,
                        'size_mb' => $table->size_mb,
                        'rows' => $table->table_rows,
                        'data_mb' => $table->data_mb,
                        'index_mb' => $table->index_mb
                    ];
                }, $sizes);
            }

            return [];
        } catch (\Exception $e) {
            Log::warning('Could not retrieve table sizes: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get index usage statistics
     */
    private function getIndexUsage(): array
    {
        try {
            if (DB::getDriverName() === 'mysql') {
                $usage = DB::select("
                    SELECT 
                        t.table_name,
                        s.index_name,
                        s.cardinality,
                        IFNULL(u.rows_read, 0) as rows_read
                    FROM information_schema.tables t
                    LEFT JOIN information_schema.statistics s ON t.table_name = s.table_name
                    LEFT JOIN performance_schema.table_io_waits_summary_by_index_usage u 
                        ON s.table_name = u.object_name AND s.index_name = u.index_name
                    WHERE t.table_schema = DATABASE()
                    AND s.index_name IS NOT NULL
                    ORDER BY u.rows_read DESC
                    LIMIT 50
                ");

                return array_map(function($index) {
                    return [
                        'table_name' => $index->table_name,
                        'index_name' => $index->index_name,
                        'cardinality' => $index->cardinality,
                        'rows_read' => $index->rows_read
                    ];
                }, $usage);
            }

            return [];
        } catch (\Exception $e) {
            Log::warning('Could not retrieve index usage: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Generate optimization recommendations
     */
    private function generateRecommendations(array $analysis): array
    {
        $recommendations = [];

        // Check for large tables without proper indexes
        foreach ($analysis['table_sizes'] as $table) {
            if ($table['size_mb'] > 100 && $table['index_mb'] < $table['data_mb'] * 0.1) {
                $recommendations[] = [
                    'type' => 'index_optimization',
                    'priority' => 'high',
                    'message' => "Table {$table['table_name']} ({$table['size_mb']}MB) may need more indexes",
                    'action' => 'Review query patterns and add appropriate indexes'
                ];
            }
        }

        // Check for unused indexes
        foreach ($analysis['index_usage'] as $index) {
            if ($index['rows_read'] == 0 && $index['index_name'] !== 'PRIMARY') {
                $recommendations[] = [
                    'type' => 'unused_index',
                    'priority' => 'medium',
                    'message' => "Index {$index['index_name']} on {$index['table_name']} appears unused",
                    'action' => 'Consider dropping this index to improve write performance'
                ];
            }
        }

        // Check for missing indexes
        if (count($analysis['missing_indexes']) > 0) {
            $recommendations[] = [
                'type' => 'missing_indexes',
                'priority' => 'high',
                'message' => count($analysis['missing_indexes']) . ' potential missing indexes found',
                'action' => 'Review and add suggested indexes for better query performance'
            ];
        }

        return $recommendations;
    }

    /**
     * Get existing indexes for a table
     */
    private function getTableIndexes(string $table): array
    {
        try {
            if (DB::getDriverName() === 'mysql') {
                $indexes = DB::select("SHOW INDEX FROM {$table}");
                return array_map(function($index) {
                    return $index->Column_name;
                }, $indexes);
            }

            return [];
        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Check if optimal index exists for query pattern
     */
    private function hasOptimalIndex(string $pattern, array $existingIndexes): bool
    {
        // Simple heuristic - check if columns mentioned in WHERE clauses have indexes
        preg_match_all('/(\w+)\s*[=<>]/', $pattern, $matches);
        $columns = $matches[1] ?? [];

        foreach ($columns as $column) {
            if (!in_array($column, $existingIndexes)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Suggest index for query pattern
     */
    private function suggestIndex(string $pattern): string
    {
        preg_match_all('/(\w+)\s*[=<>]/', $pattern, $matches);
        $columns = $matches[1] ?? [];

        if (count($columns) > 1) {
            return 'INDEX (' . implode(', ', $columns) . ')';
        } elseif (count($columns) === 1) {
            return 'INDEX (' . $columns[0] . ')';
        }

        return 'Review query pattern manually';
    }

    /**
     * Optimize database tables
     */
    public function optimizeTables(): array
    {
        $results = [];

        try {
            if (DB::getDriverName() === 'mysql') {
                $tables = DB::select("SHOW TABLES");
                
                foreach ($tables as $table) {
                    $tableName = array_values((array)$table)[0];
                    
                    // Optimize table
                    DB::statement("OPTIMIZE TABLE {$tableName}");
                    
                    $results[] = [
                        'table' => $tableName,
                        'status' => 'optimized'
                    ];
                }
            }
        } catch (\Exception $e) {
            Log::error('Table optimization failed: ' . $e->getMessage());
            $results[] = [
                'error' => $e->getMessage()
            ];
        }

        return $results;
    }

    /**
     * Clear query cache
     */
    public function clearQueryCache(): bool
    {
        try {
            if (DB::getDriverName() === 'mysql') {
                DB::statement('RESET QUERY CACHE');
                return true;
            }
            return false;
        } catch (\Exception $e) {
            Log::error('Query cache clear failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get database connection statistics
     */
    public function getConnectionStats(): array
    {
        try {
            if (DB::getDriverName() === 'mysql') {
                $stats = DB::select("SHOW STATUS LIKE 'Connections'");
                $maxConnections = DB::select("SHOW VARIABLES LIKE 'max_connections'");
                $threadsConnected = DB::select("SHOW STATUS LIKE 'Threads_connected'");

                return [
                    'total_connections' => $stats[0]->Value ?? 0,
                    'max_connections' => $maxConnections[0]->Value ?? 0,
                    'current_connections' => $threadsConnected[0]->Value ?? 0,
                    'connection_usage_percent' => round(
                        ($threadsConnected[0]->Value ?? 0) / ($maxConnections[0]->Value ?? 1) * 100, 2
                    )
                ];
            }

            return [];
        } catch (\Exception $e) {
            Log::warning('Could not retrieve connection stats: ' . $e->getMessage());
            return [];
        }
    }
}