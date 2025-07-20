<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class GenerateApiDocs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'api:docs 
                            {--generate : Generate API documentation}
                            {--serve : Serve the documentation}
                            {--publish : Publish documentation assets}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate and manage Dixis API documentation';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🚀 Dixis API Documentation Manager');
        $this->info('=====================================');

        if ($this->option('generate')) {
            $this->generateDocs();
        } elseif ($this->option('serve')) {
            $this->serveDocs();
        } elseif ($this->option('publish')) {
            $this->publishAssets();
        } else {
            $this->showMenu();
        }

        return 0;
    }

    /**
     * Show interactive menu
     */
    private function showMenu()
    {
        $choice = $this->choice(
            'What would you like to do?',
            [
                'generate' => 'Generate API documentation',
                'serve' => 'Serve documentation locally',
                'publish' => 'Publish documentation assets',
                'view' => 'View documentation info',
                'exit' => 'Exit'
            ],
            'generate'
        );

        switch ($choice) {
            case 'generate':
                $this->generateDocs();
                break;
            case 'serve':
                $this->serveDocs();
                break;
            case 'publish':
                $this->publishAssets();
                break;
            case 'view':
                $this->viewInfo();
                break;
            case 'exit':
                $this->info('Goodbye! 👋');
                break;
        }
    }

    /**
     * Generate API documentation
     */
    private function generateDocs()
    {
        $this->info('🔧 Generating API documentation...');

        try {
            // Clear existing docs
            if (file_exists(storage_path('api-docs'))) {
                $this->info('🗑️  Clearing existing documentation...');
                $this->callSilent('l5-swagger:generate');
            }

            // Generate new docs
            $this->info('📝 Scanning controllers for annotations...');
            
            // Run l5-swagger generate command
            Artisan::call('l5-swagger:generate');
            
            $this->checkGeneration();
            
        } catch (\Exception $e) {
            $this->error('❌ Failed to generate documentation: ' . $e->getMessage());
            $this->warn('💡 Make sure you have installed darkaonline/l5-swagger package');
            $this->warn('💡 Run: composer require darkaonline/l5-swagger');
            return 1;
        }
    }

    /**
     * Check if documentation was generated successfully
     */
    private function checkGeneration()
    {
        $docsPath = storage_path('api-docs/api-docs.json');
        
        if (file_exists($docsPath)) {
            $this->info('✅ Documentation generated successfully!');
            
            $size = filesize($docsPath);
            $this->info("📊 Documentation size: " . $this->formatBytes($size));
            
            // Show endpoints count
            $docs = json_decode(file_get_contents($docsPath), true);
            if (isset($docs['paths'])) {
                $endpointCount = 0;
                foreach ($docs['paths'] as $path => $methods) {
                    $endpointCount += count($methods);
                }
                $this->info("🔗 Total endpoints documented: {$endpointCount}");
            }

            $this->newLine();
            $this->info('🌐 Access documentation at:');
            $this->line('   📖 Swagger UI: ' . url('/api/documentation'));
            $this->line('   📄 JSON: ' . url('/docs/api-docs.json'));
            
        } else {
            $this->error('❌ Documentation generation failed!');
            $this->warn('💡 Check your OpenAPI annotations in controllers');
            return 1;
        }
    }

    /**
     * Serve documentation locally
     */
    private function serveDocs()
    {
        $this->info('🌐 Starting documentation server...');
        
        if (!file_exists(storage_path('api-docs/api-docs.json'))) {
            $this->warn('⚠️  Documentation not found. Generating first...');
            $this->generateDocs();
        }

        $this->info('🚀 Documentation is available at:');
        $this->line('   📖 Swagger UI: ' . url('/api/documentation'));
        $this->line('   📄 Raw JSON: ' . url('/docs/api-docs.json'));
        
        $this->newLine();
        $this->info('💡 Make sure your Laravel server is running:');
        $this->line('   php artisan serve');
    }

    /**
     * Publish documentation assets
     */
    private function publishAssets()
    {
        $this->info('📦 Publishing Swagger UI assets...');
        
        try {
            Artisan::call('vendor:publish', [
                '--provider' => 'L5Swagger\L5SwaggerServiceProvider'
            ]);
            
            $this->info('✅ Assets published successfully!');
            
        } catch (\Exception $e) {
            $this->error('❌ Failed to publish assets: ' . $e->getMessage());
            return 1;
        }
    }

    /**
     * View documentation information
     */
    private function viewInfo()
    {
        $this->info('📋 Dixis API Documentation Info');
        $this->info('===============================');

        $docsPath = storage_path('api-docs/api-docs.json');
        
        if (file_exists($docsPath)) {
            $docs = json_decode(file_get_contents($docsPath), true);
            
            $this->table([
                'Property', 'Value'
            ], [
                ['Title', $docs['info']['title'] ?? 'N/A'],
                ['Version', $docs['info']['version'] ?? 'N/A'],
                ['Description', $docs['info']['description'] ?? 'N/A'],
                ['Generated', date('Y-m-d H:i:s', filemtime($docsPath))],
                ['File Size', $this->formatBytes(filesize($docsPath))],
            ]);

            if (isset($docs['paths'])) {
                $this->newLine();
                $this->info('📊 Endpoint Statistics:');
                
                $stats = [];
                foreach ($docs['paths'] as $path => $methods) {
                    foreach ($methods as $method => $details) {
                        $tag = $details['tags'][0] ?? 'Untagged';
                        $stats[$tag] = ($stats[$tag] ?? 0) + 1;
                    }
                }

                $tableData = [];
                foreach ($stats as $tag => $count) {
                    $tableData[] = [$tag, $count];
                }

                $this->table(['Tag', 'Endpoints'], $tableData);
            }

        } else {
            $this->warn('⚠️  Documentation not found. Run generation first.');
        }

        $this->newLine();
        $this->info('🔗 Useful URLs:');
        $this->line('   📖 Swagger UI: ' . url('/api/documentation'));
        $this->line('   📄 JSON Schema: ' . url('/docs/api-docs.json'));
        $this->line('   🔧 Config: config/l5-swagger.php');
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = array('B', 'KB', 'MB', 'GB', 'TB');

        for ($i = 0; $bytes > 1024; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}