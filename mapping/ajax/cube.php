<?php
header('Content-Type: application/json');
set_include_path($_SERVER["DOCUMENT_ROOT"].'/include_path');
session_start();
session_regenerate_id();
require_once 'queries.php';
setlocale (LC_TIME, "it_IT");

// var_dump($_POST['data']);
// var_dump(json_decode($_POST['data']));
$objData = json_decode($_POST['data']);
$arrData = json_decode($_POST['data'], true);
// var_dump($objData);


// print_r($objData->{'hierarchy'}) ;
print_r($objData->{'columns'}) ;
print_r($objData->{'hierarchy'}) ;
// print_r($objData->{'hierarchy'}->{'hier'}) ;
// print_r($arrData['hierarchy']['hier']);

return;
foreach ($objData->{'hierarchy'} as $key => $value) {
  // var_dump($key);
  echo $key;

  // echo $value;
  print_r($value);

  // foreach ($key as $kRel => $vRel) {
  //   var_dump($kRel);
  //   var_dump($vRel);
  // }
  // var_dump($value);
}
// print_r($objData->{'hierarchy["hier"]'});
// print $objData->{'hierarchy.hier'};

// $q = new Queries();

// $result = $q->describe($table);

// ob_clean();
// echo json_encode($result, JSON_FORCE_OBJECT);
