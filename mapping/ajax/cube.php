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
// echo $q->FILTERS($objData->{'filters'}, $objData->{'metrics'});
// echo $q->GROUPBY($objData->{'groupby'});
// echo $q->completeQuery();
// return;
// TODO: ciclare, per ogni metrica creare una query diversa, se all'interno della metrica, è presente un filtro
// return;
$q->SELECT($objData->{'columns'});
$q->METRICS($objData->{'metrics'});
$q->FROM($objData->{'from'});
$q->WHERE($objData->{'hierarchy'});
$q->FILTERS($objData->{'filters'}, $objData->{'metrics'});
$q->GROUPBY($objData->{'groupby'});

// echo $q->completeQuery();
// TODO: creo la tabella base, comprensivo di metriche che non hanno filtri
echo $q->baseTable();
// return;
// $result = $q->baseTable();
// var_dump($result);
// if ($result) {
  // la metrica contiene dei filtri ?
  foreach ($objData->{'metrics'} as $table => $metrics) {
    foreach ($metrics as $id => $param) {
      // echo 'id_metric :'.$id;
      // echo 'numero filtri della metrica : '. count($param->filters);
      if (count($param->filters) >= 1) {
        // ci sono dei filtri su qeusta metrica
        // TODO: qui dovrei ciclare anche i filtri impostati su questa metrica
        $metric = $param->sqlFunction."(".$table.".".$param->fieldName.") AS '".$param->aliasMetric."'";
        // echo $metric;
        echo $q->createMetricTable('TEST_AP_metric_'.$id, $metric); // TODO: da ciclare per ogni metrica
      }
    }
  }

// }
// $result = $q->completeQuery();

// ob_clean();
// echo json_encode($result, JSON_FORCE_OBJECT);
