<?php
require_once 'ConnectDB.php';

class Queries {

  function __construct() {}

  public function q_1() {
    $l = new ConnectDB("automotive_bi_data"); // TODO: si potrebbe mettere come Proprietà della Classe
    // deadlineStatus indica se la scadenza è passata, rispetto alla data odierna, oppure mancano x giorni alla scadenza (remainigDays)
    $query = "SELECT  versioneDMS as Versione, id, descrizione as Dealer, CodDealerCM as 'Cod.Ford', CodAziendaSId as sID, VAT FROM Azienda a WHERE a.id_CasaMadre = 1 AND a.isDealer = 1 AND a.attiva = 1 AND a.CodMercato = 'IT';";

    $this->_result = $l->getResultAssoc($query);
    return $this->_result;
  }


} // End Class
