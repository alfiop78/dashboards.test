<?php
header('Content-Type: application/json');
set_include_path($_SERVER["DOCUMENT_ROOT"].'/include_path');
session_start();
session_regenerate_id();
require_once 'Cube.php';
setlocale (LC_TIME, "it_IT");
// TODO: queste le posso spostaare tutte nella Classe Cube passando al Costruttore tutto il JSON
$cube = json_decode($_POST['cube']); // object
// $dimension = json_decode($_POST['dimension']); // object
// var_dump($cube);
// var_dump($dimension);
// $arrData = json_decode($_POST['data'], true); // array

$q = new Cube();
$q->setReportId($cube->{'processId'});
$q->n_select($cube->{'select'});
$q->n_metrics($cube->{'metrics'});
$q->n_from($cube->{'from'});
$q->n_where($cube->{'where'});
$q->joinFact($cube->{'factJoin'});
$q->filters($cube->{'filters'});
$q->n_groupBy($cube->{'groupBy'});

$baseTable = $q->baseTable();
//var_dump($baseTable);

if ($baseTable > 0) {

  $metricTable = $q->createMetricDatamarts($cube->{'filteredMetrics'});
  var_dump($metricTable);

  echo 'elaborazione createDatamart';

  $result = $q->createDatamart();
  var_dump($result);
}
// return;
ob_clean();
echo json_encode($result, JSON_FORCE_OBJECT);