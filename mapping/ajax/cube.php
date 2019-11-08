<?php
header('Content-Type: application/json');
set_include_path($_SERVER["DOCUMENT_ROOT"].'/include_path');
session_start();
session_regenerate_id();
require_once 'queries.php';
setlocale (LC_TIME, "it_IT");

$objData = json_decode($_POST['data']); // object
// var_dump($objData);
// $arrData = json_decode($_POST['data'], true); // array
// var_dump($objData->{'report_id'});

$q = new Queries();
// $q->setReportId($objData->{'report_id'});
print_r($objData->{'columns'});

foreach ($objData->{'columns'} as $key => $value) {
  var_dump($key);
  var_dump($value);

}
return;


echo $q->SELECT($objData->{'columns'});
return;
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
return;

echo $q->createMetricDatamarts($objData->{'metrics'});

// ob_clean();
// echo json_encode($result, JSON_FORCE_OBJECT);
