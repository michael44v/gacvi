<?php

if (file_exists(__DIR__ . '/../autoloader.php')) {
    require_once __DIR__ . '/../autoloader.php';
} else if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
}

use App\Database\Schema;

echo "Running GACVI Database Migrations...\n";
Schema::up();
echo "Migration complete.\n";
