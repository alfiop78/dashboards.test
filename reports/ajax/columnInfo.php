<?php
header('Content-Type: application/json');
set_include_path($_SERVER["DOCUMENT_ROOT"].'/include_path');
session_start();
session_regenerate_id();
require_once 'queries.php';
setlocale (LC_TIME, "it_IT");

$table = filter_input(INPUT_POST, 'table');
$field = filter_input(INPUT_POST, 'field');

$q = new Queries();

$result = $q->distinctValues($table, $field);

ob_clean();
echo json_encode($result, JSON_FORCE_OBJECT);
