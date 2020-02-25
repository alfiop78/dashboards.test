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


$q = new Cube($cube->{'FACT'});
$q->setReportId($cube->{'cubeId'});
$q->dimension($cube->{'associatedDimensions'}, $cube->{'FACT'});
$q->factRelation($cube->{'hierarchies'});
$q->metrics($cube->{'metrics'});

// creo la tabella base, comprensivo di metriche che non hanno filtri
$baseTable = $q->baseTable();
var_dump($baseTable);
return;

if ($baseTable > 0) {

  $metricTable = $q->createMetricDatamarts($cube->{'filteredMetrics'});
  var_dump($metricTable);
  return;

  $result = $q->createDatamart();
  var_dump($result);
}
// return;
ob_clean();
echo json_encode($result, JSON_FORCE_OBJECT);
