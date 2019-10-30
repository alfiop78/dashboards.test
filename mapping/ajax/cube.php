<?php
header('Content-Type: application/json');
set_include_path($_SERVER["DOCUMENT_ROOT"].'/include_path');
session_start();
session_regenerate_id();
require_once 'queries.php';
setlocale (LC_TIME, "it_IT");

$objData = json_decode($_POST['data']); // object
// $arrData = json_decode($_POST['data'], true); // array

$q = new Queries();


// echo $q->SELECT($objData->{'columns'});
// echo $q->METRICS($objData->{'metrics'});
// echo $q->FROM($objData->{'from'});
// echo $q->WHERE($objData->{'hierarchy'});
// echo $q->FILTERS($objData->{'filters'});
$q->SELECT($objData->{'columns'});
$q->METRICS($objData->{'metrics'});
$q->FROM($objData->{'from'});
$q->WHERE($objData->{'hierarchy'});
$q->FILTERS($objData->{'filters'});
$q->GROUPBY($objData->{'groupby'});

//
// $select = $q->SELECT($objData->{'columns'});
// $from = $q->FROM($objData->{'from'});
// $hierarchy = $q->WHERE($objData->{'hierarchy'});
// $filters = $q->FILTERS($objData->{'filters'});
// $metrics = $q->METRICS($objData->{'metrics'});
// $groupBy = $q->GROUPBY($objData->{'groupby'});

// echo $q->completeQuery();
$result = $q->completeQuery();

ob_clean();
echo json_encode($result, JSON_FORCE_OBJECT);
