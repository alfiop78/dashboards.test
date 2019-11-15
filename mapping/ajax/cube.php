<?php
header('Content-Type: application/json');
set_include_path($_SERVER["DOCUMENT_ROOT"].'/include_path');
session_start();
session_regenerate_id();
require_once 'queries.php';
setlocale (LC_TIME, "it_IT");

$cube = json_decode($_POST['cube']); // object
// $dimension = json_decode($_POST['dimension']); // object
// var_dump($cube);
// var_dump($dimension);
// $arrData = json_decode($_POST['data'], true); // array

$q = new Queries();
$q->setReportId($cube->{'report_id'});

$q->SELECT($cube->{'columns'});
$q->METRICS($cube->{'metrics'});
echo $q->FROM($cube->{'dimensions'});
$q->WHERE($cube->{'hierarchy'});
$q->FILTERS($cube->{'filters'});
$q->GROUPBY($cube->{'groupby'});
return;
// creo la tabella base, comprensivo di metriche che non hanno filtri
echo $q->baseTable();

echo $q->createMetricDatamarts($cube->{'filteredMetrics'});

echo $q->createDatamart();

// ob_clean();
// echo json_encode($result, JSON_FORCE_OBJECT);
