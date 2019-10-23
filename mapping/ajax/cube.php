<?php
header('Content-Type: application/json');
set_include_path($_SERVER["DOCUMENT_ROOT"].'/include_path');
session_start();
session_regenerate_id();
require_once 'queries.php';
setlocale (LC_TIME, "it_IT");

// var_dump($_POST['data']);
// var_dump(json_decode($_POST['data']));
$objData = json_decode($_POST['data']); // object
// $arrData = json_decode($_POST['data'], true); // array

// echo 'columns';
// print_r($objData->{'columns'}) ;
// echo 'filters';
// print_r($objData->{'filters'}) ;
// echo 'from';
// print_r($objData->{'from'});
// echo 'groupby';
// print_r($objData->{'groupby'});
// echo 'hierarchy';
print_r($objData->{'hierarchy'});
// echo 'metrics';
// print_r($objData->{'metrics'});
$q = new Queries();

// echo $q->SELECT($objData->{'columns'});
// echo $q->FROM($objData->{'from'});
echo $q->WHERE($objData->{'hierarchy'});

// $q = new Queries();

// $result = $q->describe($table);

// ob_clean();
// echo json_encode($result, JSON_FORCE_OBJECT);
