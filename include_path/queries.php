<?php
require_once 'ConnectDB.php';

class Queries {
  private $_SELECT = array();

  function __construct() {}

  public function dealers() {
    $l = new ConnectDB("automotive_bi_data"); // TODO: si potrebbe mettere come Proprietà della Classe
    $query = "SELECT versioneDMS as Versione, id, descrizione as Dealer, CodDealerCM as 'Cod.Ford', CodAziendaSId as sID, VAT FROM Azienda a WHERE a.id_CasaMadre = 1 AND a.isDealer = 1 AND a.attiva = 1 AND a.CodMercato = 'IT';";

    $this->_result = $l->getResultAssoc($query);
    return $this->_result;
  }

  public function showTable() {
    $l = new ConnectDB('automotive_bi_data');
    // $l = new ConnectDB('Sql1073234_1');
    $this->_result = $l->getResultArray("SHOW TABLES;");
    // $this->_result = $l->getResultAssoc("SHOW TABLES;");
    return $this->_result;
  }

  public function describe($table) {
    $l = new ConnectDB('automotive_bi_data');
    // $l = new ConnectDB('Sql1073234_1');
    $query = "DESCRIBE $table;";
    $this->_result = $l->getResultArray($query);
    // $this->_result = $l->getResultAssoc("SHOW TABLES;");
    return $this->_result;
  }

  public function getDatamartDefault($reportId) {
    $l = new ConnectDB("decisyon_cache");
    $datamartName = "FX".$reportId;
    var_dump($datamartName);
    return $l->getResultAssoc("SELECT * FROM $datamartName;");
  }

  public function getDatamartData($datamart) {
    $l = new ConnectDB("decisyon_cache");

    $datamartName = "FX".$datamart->{'id'};
    foreach ($datamart->{'positioning'} as $key => $value) {
      // echo $key;
      foreach ($value as $column) {
        $this->_SELECT[] = "`".$column."`";
      }
    }
    // var_dump($this->_SELECT);
    $fields = implode(', ', $this->_SELECT);
    $query = "SELECT $fields FROM $datamartName";
    // echo $sql;

    // var_dump($datamartName);
    return $l->getResultAssoc($query);
  }




} // End Class
