<?php
require_once 'ConnectDB.php';

class Queries {

  function __construct() {}

  public function q_1() {
    $l = new ConnectDB("automotive_bi_data"); // TODO: si potrebbe mettere come Proprietà della Classe
    // deadlineStatus indica se la scadenza è passata, rispetto alla data odierna, oppure mancano x giorni alla scadenza (remainigDays)
    $query = "SELECT id, descrizione FROM Azienda WHERE id IN (43);";

    $this->_result = $l->getResultAssoc($query);
    return $this->_result;
  }


} // End Class
