<?php
require_once 'ConnectDB.php';

class Queries {
  private $_select, $_from, $_where, $_reportFilters, $_metricFilters, $_reportMetrics, $_metrics, $_groupBy, $_sql;

  function __construct() {}

  public function dealers() {
    $l = new ConnectDB("automotive_bi_data"); // TODO: si potrebbe mettere come Proprietà della Classe
    $query = "SELECT versioneDMS as Versione, id, descrizione as Dealer, CodDealerCM as 'Cod.Ford', CodAziendaSId as sID, VAT FROM Azienda a WHERE a.id_CasaMadre = 1 AND a.isDealer = 1 AND a.attiva = 1 AND a.CodMercato = 'IT';";

    $this->_result = $l->getResultAssoc($query);
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

  public function SELECT($cols) {
    // TODO: verificare se sono presenti altrimenti inserire (*) che sta per SELECT *
    $fieldList = array();
    $fieldList = implode(", ", $cols); // aggiungo uno spazio, ogni elemento viene separato da una virgola
    $this->_select = "SELECT ".$fieldList;
    return $this->_select;
  }

  public function FROM($fields) {
    $fieldList = array();
    $fieldList = implode(", ", $fields);
    $this->_from = " FROM ".$fieldList;
    return $this->_from;
  }

  public function WHERE($hierarchy) {
    $i = 0;
    foreach ($hierarchy as $hierarchies) {
      $hier = array();
      $hier = implode(" = ", $hierarchies);
      ($i === 0) ? $this->_where .= " WHERE ".$hier : $this->_where .= " AND ".$hier;
      $i++;
    }
    return $this->_where;
  }

  public function FILTERS_METRICS($filters, $metrics) {
    /*es.: object(stdClass)#4 (1) {
    ["AggiornamentoDatiNote"]=>
        array(1) {
          [0]=>
          object(stdClass)#3 (3) {
            ["fieldName"]=>
            string(10) "id_Azienda"
            ["filterName"] =>
            string(4) "test"
            ["operator"]=>
            string(1) "="
            ["values"]=>
            string(2) "12"
          }
        }
    }*/

    // $conditions = array();
    // $condition = null;
    $and = " AND ";
    $or = " OR ";
    // TODO: aggiungere gli altri operatori
    $metricsList = array();

    foreach ($metrics as $table => $metric) {
      foreach ($metric as $param) {
        // var_dump(isset($param->filters));
        // var_dump(empty($param->filters));
        if (!empty($param->filters) ) {
          // echo "filtered : ". $param->fieldName."\n";
          foreach ($param->filters as $filterName) {
            // i filtri trovati qui, all'interno della metrica non vanno a finire in _reportFilters
            // TODO: questo controllo potrei farlo anche in cube.php
            foreach ($filters as $table => $filter) {
              foreach ($filter as $param) {
                if ($filterName != $param->filterName) {
                  // questo filtro non è presente nella metrica, quindi lo posso inserire in _reportFilters
                  $this->_reportFilters .= $and.$table.".".$param->fieldName." ".$param->operator." ".$param->values;
                } else {
                  $this->_metricFilters .= $and.$table.".".$param->fieldName." ".$param->operator." ".$param->values;
                }

              }
            }
          }
        } else {
          // echo "no filtered : ". $param->fieldName."\n";
          $metricsList[] = $param->sqlFunction."(".$table.".".$param->fieldName.") AS '".$param->aliasMetric."'";
        }
      }
    }

    $this->_reportMetrics = implode(", ", $metricsList);
    // var_dump($this->_reportMetrics);
    // foreach ($filters as $table => $filter) {
    //   foreach ($filter as $param) {
    //     $this->_reportFilters .= $and.$table.".".$param->fieldName." ".$param->operator." ".$param->values."\n";
    //   }
    // }

    return $this->_reportFilters;
  }

  // public function METRICS($metrics) {
  //   /*es.:
  //   metrics:
  //     DocVenditaDettaglio: Array(1)
  //     0:
  //     aliasMetric: "costo"
  //     distinct: false
  //     fieldName: "PrzListino"
  //     filters: []
  //     sqlFunction: "SUM"
  //   */
  //   $metricsList = array();
  //   foreach ($metrics as $table => $metric) {
  //     foreach ($metric as $param) {
  //       $metricsList[] = $param->sqlFunction."(".$table.".".$param->fieldName.") AS '".$param->aliasMetric."'";
  //     }
  //   }
  //   return $this->_metrics = implode(", ", $metricsList);
  // }

  public function GROUPBY($groups) {
    // var_dump(is_array($groups));
    if (is_array($groups)) {
      $fieldList = array();
      $fieldList = implode(", ", $groups);
      $this->_groupBy = "GROUP BY ".$fieldList;
    } else {$this->_groupBy = null;}
    return $this->_groupBy;
  }

  public function baseTable() {
    // TODO: creo una VIEW/TABLE senza metriche su cui, dopo, andrò a fare una left join con le VIEW/TABLE che contengono le metriche
    $this->_sql = $this->_select.", ".$this->_reportMetrics."\n";
    $this->_sql .= $this->_from."\n";
    $this->_sql .= $this->_where."\n";
    $this->_sql .= $this->_reportFilters."\n";
    if (!is_null($this->_groupBy)) {$this->_sql .= $this->_groupBy;}

    return $this->_sql;

    $l = new ConnectDB("automotive_bi_data");
    $lCache = new ConnectDB("decisyon_cache");

    $sql_createTable = "CREATE TABLE decisyon_cache.TEST_AP_base_01 AS ".$this->_sql.";";


    return $l->insert($sql_createTable);
  }

  public function createMetricTable($tableName, $metric) {
    $this->_sql = $this->_select.", ".$metric."\n";
    $this->_sql .= $this->_from."\n";
    $this->_sql .= $this->_where."\n";
    $this->_sql .= $this->_reportFilters."\n";
    $this->_sql .= $this->_metricFilters."\n";
    if (!is_null($this->_groupBy)) {$this->_sql .= $this->_groupBy;}

    return $this->_sql;

    $l = new ConnectDB("automotive_bi_data");
    $lCache = new ConnectDB("decisyon_cache");

    $sql_createTable = "CREATE TABLE decisyon_cache.".$tableName." AS ".$this->_sql.";";

    return $l->insert($sql_createTable);
  }

  public function createDatamart($aliasMetric) {
    $alias = str_replace(" ", "_", $aliasMetric);
    $l = new ConnectDB("decisyon_cache");
    $sql = "CREATE TABLE TEST_AP_DATAMART AS
      (select base.*, metric.".$alias." AS '".$aliasMetric."' from TEST_AP_base_01 base
        LEFT JOIN TEST_AP_metric_1 metric
        ON base.codice=metric.codice);";
    return $sql;

    // return $l->insert($sql);

  }

  public function getDatamartData() {
    $l = new ConnectDB("decisyon_cache");
    return $l->getResultAssoc("SELECT * FROM TEST_AP_DATAMART;");
  }



} // End Class
