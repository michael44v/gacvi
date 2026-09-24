<?php

require_once __DIR__ . '/../vendor/autoload.php';

use App\Database\Schema;

echo "Running GACVI Database Migrations...\n";
Schema::up();
echo "Migration complete.\n";
