<?php
header('Content-Type: application/json');
set_include_path($_SERVER["DOCUMENT_ROOT"].'/include_path');
session_start();
session_regenerate_id();
require_once 'queries.php';
setlocale (LC_TIME, "it_IT");

$objData = json_decode($_POST['data']); // object
// var_dump($objData);
// return;
// $arrData = json_decode($_POST['data'], true); // array
// var_dump($objData->{'report_id'});

$q = new Queries();
$q->setReportId($objData->{'report_id'});


// echo $q->SELECT($objData->{'columns'});
// echo $q->FROM($objData->{'from'});
// echo $q->WHERE($objData->{'hierarchy'});
// echo $q->FILTERS_METRICS($objData->{'filters'}, $objData->{'metrics'});
// echo $q->GROUPBY($objData->{'groupby'});


$q->SELECT($objData->{'columns'});
// $q->METRICS($objData->{'metrics'});
$q->FROM($objData->{'from'});
$q->WHERE($objData->{'hierarchy'});
$q->FILTERS_METRICS($objData->{'filters'}, $objData->{'metrics'});
$q->GROUPBY($objData->{'groupby'});

// creo la tabella base, comprensivo di metriche che non hanno filtri
echo $q->baseTable();
// return;
// return;
// if ($result) {
echo $q->createMetricDatamarts($objData->{'metrics'});


// $result = $q->getDatamartData();
// TODO: in result restituisco il nome del datamart creato, in modo da poterlo associare al report

// }
// $result = $q->completeQuery();

// ob_clean();
// echo json_encode($result, JSON_FORCE_OBJECT);
