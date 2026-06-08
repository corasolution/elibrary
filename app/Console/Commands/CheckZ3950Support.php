<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\Z3950\Z3950Client;

class CheckZ3950Support extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'z3950:check
                          {--test : Test connection to Library of Congress}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check Z39.50 support and optionally test connection';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🔍 Checking Z39.50 Support...');
        $this->newLine();

        // Check if YAZ extension is loaded
        if (!Z3950Client::isAvailable()) {
            $this->error('❌ YAZ extension not installed.');
            $this->newLine();
            $this->warn('Z39.50 features are unavailable.');
            $this->newLine();
            $this->info('To enable Z39.50 support, install the YAZ extension:');
            $this->line('  • Ubuntu/Debian: apt-get install php-yaz && systemctl restart php-fpm');
            $this->line('  • CentOS/RHEL: yum install php-yaz && systemctl restart php-fpm');
            $this->line('  • macOS (Homebrew): pecl install yaz');
            $this->newLine();
            return Command::FAILURE;
        }

        $this->info('✅ YAZ extension loaded');

        // Get YAZ version
        if (function_exists('yaz_version')) {
            $version = yaz_version();
            $this->line("   Version: {$version}");
        }

        $this->newLine();
        $this->info('✅ Z39.50 client available');
        $this->newLine();

        // Show common servers
        $this->info('📚 Common Z39.50 Servers:');
        $servers = Z3950Client::getCommonServers();

        foreach ($servers as $key => $server) {
            $this->line("  • {$server['name']}");
            $this->line("    Host: {$server['host']}:{$server['port']}");
            $this->line("    Database: {$server['database']}");
        }

        $this->newLine();

        // Test connection if requested
        if ($this->option('test')) {
            $this->info('🔗 Testing connection to Library of Congress...');

            try {
                $client = new Z3950Client();
                $client->connect('lx2.loc.gov', 210, 'LCDB');

                $this->info('✅ Successfully connected to Library of Congress');

                // Try a simple search
                $this->line('   Testing search by ISBN...');
                $results = $client->searchByISBN('9780743273565'); // The Great Gatsby

                $this->info("✅ Search successful ({count($results)} results)");

                $client->disconnect();

            } catch (\Exception $e) {
                $this->error('❌ Connection test failed: ' . $e->getMessage());
                return Command::FAILURE;
            }
        }

        $this->newLine();
        $this->info('✨ Z39.50 support is fully operational!');
        $this->newLine();
        $this->comment('Usage example:');
        $this->line('  $client = new Z3950Client();');
        $this->line('  $client->connect(\'lx2.loc.gov\', 210, \'LCDB\');');
        $this->line('  $results = $client->searchByISBN(\'9780743273565\');');

        return Command::SUCCESS;
    }
}
