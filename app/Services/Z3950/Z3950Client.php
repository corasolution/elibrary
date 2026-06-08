<?php

namespace App\Services\Z3950;

use Illuminate\Support\Facades\Log;

/**
 * Z39.50 Client Service
 *
 * Requires YAZ PHP extension: https://www.php.net/manual/en/book.yaz.php
 * Install: apt-get install php-yaz && systemctl restart php-fpm
 *
 * Use this service to import catalog records from external Z39.50 servers
 * such as Library of Congress, OCLC WorldCat, British Library, etc.
 */
class Z3950Client
{
    private $connection = null;
    private string $host;
    private int $port;
    private string $database;

    /**
     * Check if YAZ extension is available
     */
    public static function isAvailable(): bool
    {
        return extension_loaded('yaz');
    }

    /**
     * Connect to Z39.50 server
     *
     * @param string $host Server hostname (e.g., 'lx2.loc.gov')
     * @param int $port Server port (usually 210)
     * @param string $database Database name (e.g., 'LCDB', 'VOYAGER')
     * @throws \Exception if YAZ extension not available or connection fails
     */
    public function connect(string $host, int $port = 210, string $database = 'voyager'): bool
    {
        if (!self::isAvailable()) {
            throw new \Exception('YAZ PHP extension not installed. Install with: apt-get install php-yaz');
        }

        $this->host = $host;
        $this->port = $port;
        $this->database = $database;

        $connectionString = "{$host}:{$port}/{$database}";
        $this->connection = yaz_connect($connectionString);

        if (!$this->connection) {
            throw new \Exception("Failed to connect to Z39.50 server: {$connectionString}");
        }

        Log::info('Z39.50 connection established', [
            'host' => $host,
            'port' => $port,
            'database' => $database
        ]);

        return true;
    }

    /**
     * Search for records using PQF (Prefix Query Format)
     *
     * Common BIB-1 attributes:
     * - @attr 1=4   Title
     * - @attr 1=7   ISBN
     * - @attr 1=8   ISSN
     * - @attr 1=1003 Author
     * - @attr 1=21  Subject
     * - @attr 1=12  LCCN (Library of Congress Control Number)
     *
     * Example queries:
     * - Search by ISBN: '@attr 1=7 9780743273565'
     * - Search by title: '@attr 1=4 "to kill a mockingbird"'
     * - Search by author: '@attr 1=1003 "harper lee"'
     *
     * @param string $query PQF query string
     * @param string $syntax Record syntax (USMARC, UNIMARC, XML, SUTRS)
     * @param int $maxResults Maximum number of results to return (default 50)
     * @return array Array of MARC records
     * @throws \Exception if not connected or search fails
     */
    public function search(string $query, string $syntax = 'USMARC', int $maxResults = 50): array
    {
        if (!$this->connection) {
            throw new \Exception('Not connected to Z39.50 server. Call connect() first.');
        }

        // Set preferred record syntax
        yaz_syntax($this->connection, $syntax);

        // Set element set (full records)
        yaz_element($this->connection, 'F');

        // Execute search (PQF query format)
        yaz_search($this->connection, 'rpn', $query);

        // Wait for response
        yaz_wait();

        // Check for errors
        $error = yaz_error($this->connection);
        if ($error) {
            throw new \Exception("Z39.50 search error: {$error}");
        }

        // Get hit count
        $hits = yaz_hits($this->connection);

        if ($hits === 0) {
            Log::info('Z39.50 search returned no results', ['query' => $query]);
            return [];
        }

        Log::info('Z39.50 search completed', [
            'query' => $query,
            'hits' => $hits,
            'retrieving' => min($hits, $maxResults)
        ]);

        // Retrieve records
        $records = [];
        for ($i = 1; $i <= min($hits, $maxResults); $i++) {
            $record = yaz_record($this->connection, $i, 'raw');

            if ($record) {
                try {
                    $parsed = $this->parseMARC($record);
                    $records[] = $parsed;
                } catch (\Exception $e) {
                    Log::warning('Failed to parse MARC record', [
                        'position' => $i,
                        'error' => $e->getMessage()
                    ]);
                }
            }
        }

        return $records;
    }

    /**
     * Search by ISBN (convenience method)
     */
    public function searchByISBN(string $isbn): array
    {
        // Clean ISBN (remove dashes)
        $isbn = str_replace(['-', ' '], '', $isbn);

        // BIB-1 attribute 7 = ISBN
        $query = "@attr 1=7 {$isbn}";

        return $this->search($query);
    }

    /**
     * Search by LCCN (convenience method)
     */
    public function searchByLCCN(string $lccn): array
    {
        // BIB-1 attribute 12 = LCCN
        $query = "@attr 1=12 {$lccn}";

        return $this->search($query);
    }

    /**
     * Search by title (convenience method)
     */
    public function searchByTitle(string $title): array
    {
        // BIB-1 attribute 4 = Title
        $query = "@attr 1=4 \"{$title}\"";

        return $this->search($query);
    }

    /**
     * Parse ISO 2709 MARC binary format to associative array
     *
     * This is a simplified parser. For production use, consider using
     * a dedicated MARC parsing library like File_MARC.
     */
    private function parseMARC(string $raw): array
    {
        // This is a simplified implementation
        // Full MARC parsing is complex - would typically use a library

        $result = [
            'raw' => $raw,
            'leader' => substr($raw, 0, 24),
            'fields' => []
        ];

        // For now, just return raw + leader
        // TODO: Implement full ISO 2709 parsing or use File_MARC library

        return $result;
    }

    /**
     * Disconnect from Z39.50 server
     */
    public function disconnect(): void
    {
        if ($this->connection) {
            yaz_close($this->connection);
            $this->connection = null;

            Log::info('Z39.50 connection closed', [
                'host' => $this->host
            ]);
        }
    }

    /**
     * Common Z39.50 servers configuration
     */
    public static function getCommonServers(): array
    {
        return [
            'loc' => [
                'name' => 'Library of Congress',
                'host' => 'lx2.loc.gov',
                'port' => 210,
                'database' => 'LCDB',
                'description' => 'Library of Congress catalog'
            ],
            'oclc' => [
                'name' => 'OCLC WorldCat',
                'host' => 'zcat.oclc.org',
                'port' => 210,
                'database' => 'OLUCWorldCat',
                'description' => 'OCLC WorldCat union catalog'
            ],
            'bl' => [
                'name' => 'British Library',
                'host' => 'z3950cat.bl.uk',
                'port' => 9909,
                'database' => 'BNB03U',
                'description' => 'British National Bibliography'
            ],
        ];
    }

    /**
     * Destructor - ensure connection is closed
     */
    public function __destruct()
    {
        $this->disconnect();
    }
}
