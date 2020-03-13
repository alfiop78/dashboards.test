<?php
header('Content-Type: application/json');
set_include_path($_SERVER["DOCUMENT_ROOT"].'/include_path');
session_start();
session_regenerate_id();
require_once 'queries.php';
setlocale (LC_TIME, "it_IT");

$q = new Queries();

$datamart = json_decode($_POST['datamart']); // object

//var_dump($datamart);
var_dump($datamart->{'id'});

$result = $q->getDatamartData($datamart);
// var_dump($result);
// return;

ob_clean();
echo json_encode($result, JSON_FORCE_OBJECT);
