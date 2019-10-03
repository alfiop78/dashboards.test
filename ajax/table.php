<?php
header('Content-Type: application/json');
set_include_path($_SERVER["DOCUMENT_ROOT"].'/include_path');
session_start();
session_regenerate_id();
require_once 'queries.php';
setlocale (LC_TIME, "it_IT");

$a = new Queries();

// $result = $a->dealers();
$result = $a->FreeCourtesy();


ob_clean();
echo json_encode($result, JSON_FORCE_OBJECT);
