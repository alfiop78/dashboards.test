<?php
require_once 'ConnectDB.php';

class Queries {

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

  public function FreeCourtesy() {
    $l = new ConnectDB("automotive_bi_data"); // TODO: si potrebbe mettere come Proprietà della Classe

    $query = "SELECT detail.Distretto, detail.Zona, detail.CodFord, detail.DealerId, detail.DealerDs, detail.MONTH, SUM(detail.FREECOURTESY) as FreeCOURTESY FROM (
            SELECT
               zv.Descrizione as Distretto, zv.Codice as Zona,
               a.CodDealerCM as CodFord, a.id as DealerId, a.descrizione as DealerDs, i.VIN as VIN, LK_DATE.ID_MONTH as MONTH, d.DataDocumento as DAY_ID,
                IFNULL(COUNT( Distinct (   i.VIN   )),0)  AS FREECOURTESY
            FROM
               Azienda a, CodSedeDealer s, DocVenditaDettaglio d, DocVenditaIntestazione i, LK_DATE LK_DATE, ZonaVenditaCM zv, CodOperatoreOfficina op, TipoMovimento tm
             WHERE d.CancellatStampa = 'S'
               AND d.CodiceManoOpera = '540900MUA'
               AND d.Reparto = 'OFF'
               AND i.FlagAnnullata = 'A'
               AND (case when  d.Addebito IN ( '---' , 'CLI' ) then 1 when d.Addebito IN ( 'INT' , 'Lav' ) then 3 end /*= '1' */)
               AND a.Attiva = 1 AND a.CodMercato = 'IT'  AND a.Id_CasaMadre = 1  AND a.IsDealer = 1
               AND i.id_CasaMadre_Veicolo = 1
               AND op.id=i.id_CodOperatoreOfficina AND i.id_Azienda=op.id_Azienda
               AND tm.id=d.id_TipoMovimento AND tm.id_Azienda=d.id_Azienda AND tm.IsCarrozzeria = 0
               AND LK_DATE.ID_MONTH = 201904
               AND a.id=s.id_Azienda
               AND s.id=i.id_CodSedeDealer
               AND s.id_Azienda=i.id_Azienda
               AND d.DataDocumento=LK_DATE.ID_DAY
               AND d.NumRifInt=i.NumRifInt
               AND d.id_Azienda=a.id
               AND d.id_Azienda=i.id_Azienda
               AND i.NumRifInt=d.NumRifInt
               AND zv.id=a.id_ZonaVenditaCM
                GROUP BY
               i.VIN, d.DataDocumento) detail
            GROUP BY detail.DISTRETTO, detail.ZONA, detail.DealerId;";

    $this->_result = $l->getResultAssoc($query);
    return $this->_result;
  }




} // End Class
