<?php
header('Content-Type: application/json');
set_include_path($_SERVER["DOCUMENT_ROOT"].'/include_path');
session_start();
session_regenerate_id();
require_once 'queries.php';
setlocale (LC_TIME, "it_IT");

$table = filter_input(INPUT_POST, 'tableName');

$q = new Queries();

$result = $q->describe($table);

ob_clean();
echo json_encode($result, JSON_FORCE_OBJECT);
