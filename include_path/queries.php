<?php
require_once 'ConnectDB.php';

class Queries {
  private $_select, $_columns = array(), $_from, $_where, $_reportFilters, $_metricFilters, $_reportMetrics, $_metrics, $_groupBy, $_sql, $_reportId, $_metricTable;

  function __construct() {

  }

  function setReportId($reportId) {$this->_reportId = $reportId;}

  function getReportId() {return $this->_reportId;}

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

  public function SELECT($columns) {
    $fieldList = array();
    $this->_select = "SELECT ";

    foreach ($columns as $table => $col) {
      // var_dump($table);
      // print_r($col);
      foreach ($col as $param) {
        // echo $param->sqlFORMAT; // TODO : completare
        // echo $param->fieldName;
        // echo $param->alias;
        $fieldList[] = $table.".".$param->fieldName." AS '".$param->alias."'";
        $this->_columns[] = $param->alias;
      }

    }
    // print_r($fieldList);

    $this->_select .= implode(", ", $fieldList);
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

  public function FILTERS($filters) {
    /* definisco i filtri del report*/
    $and = " AND ";
    $or = " OR ";
    foreach ($filters as $table => $filter) {
      foreach ($filter as $param) {
        $this->_reportFilters .= $and.$table.".".$param->fieldName." ".$param->operator." ".$param->values;
      }
    }

    return $this->_reportFilters;
  }

  public function METRICS($metrics) {
    // metriche non filtrate
    $metricsList = array();
    foreach ($metrics as $table => $metric) {
      foreach ($metric as $param) {
        $metricsList[] = $param->sqlFunction."(".$table.".".$param->fieldName.") AS '".$param->aliasMetric."'";
      }
    }
    return $this->_metrics = implode(", ", $metricsList);
  }

  public function GROUPBY($groups) {
    $fieldList = array();
    $this->_groupBy = "GROUP BY ";

    foreach ($groups as $table => $col) {
      foreach ($col as $param) {
        // TODO: aggiungere il format della colonna (es.: GROUP BY DATE_FORMAT(curdate(), '%Y%m'))
        $fieldList[] = $table.".".$param->fieldName;
      }
    }
    $this->_groupBy .= implode(", ", $fieldList);
    return $this->_groupBy;
  }

  public function baseTable() {
    // TODO: creo una VIEW/TABLE senza metriche su cui, dopo, andrò a fare una left join con le VIEW/TABLE che contengono le metriche
    $this->_sql = $this->_select.", ".$this->_metrics."\n";
    $this->_sql .= $this->_from."\n";
    $this->_sql .= $this->_where."\n";
    $this->_sql .= $this->_reportFilters."\n";
    if (!is_null($this->_groupBy)) {$this->_sql .= $this->_groupBy;}

    $l = new ConnectDB("automotive_bi_data");

    $sql_createTable = "CREATE TABLE decisyon_cache.W_AP_base_".$this->_reportId." AS ".$this->_sql.";";
    // return $sql_createTable;
    // return $l->insert($sql_createTable);
  }

  public function createMetricDatamarts($filteredMetrics) {
    /* creo i datamart necessari per le metriche filtrate */
    $i = 1;
    foreach ($filteredMetrics as $table => $metrics) {
      foreach ($metrics as $param) {
        unset($this->_sql);

        $metric = $param->sqlFunction."(".$table.".".$param->fieldName.") AS '".str_replace(" ", "_", $param->aliasMetric)."'"; // TODO: provare con backtick
        echo $this->createMetricTable('W_AP_metric_'.$this->_reportId."_".$i, $metric, $param->filters);
        // a questo punto metto in relazione (left) la query baseTable con la/e metriche contenenti filtri
        $this->_metricTable["W_AP_metric_".$this->_reportId."_".$i] = $param->aliasMetric; // memorizzo qui quante tabelle per metriche filtrate sono state create
        $i++;
      }
    }
  }

  private function createMetricTable($tableName, $metric, $filters) {
    // var_dump($filters);

    $this->_sql = $this->_select.", ".$metric."\n";
    $this->_sql .= $this->_from."\n";
    $this->_sql .= $this->_where."\n";
    $this->_sql .= $this->_reportFilters."\n";

    $and = " AND ";
    $or = " OR ";

    foreach ($filters as $table => $filter) {
      $this->_metricFilters .= $and.$table.".".$filter->fieldName." ".$filter->operator." ".$filter->values;
    }

    $this->_sql .= $this->_metricFilters."\n";
    if (!is_null($this->_groupBy)) {$this->_sql .= $this->_groupBy;}

    $l = new ConnectDB("automotive_bi_data");
    $lCache = new ConnectDB("decisyon_cache");

    $sql_createTable = "CREATE TABLE decisyon_cache.".$tableName." AS ".$this->_sql.";";
    // return $sql_createTable;
    // return $l->insert($sql_createTable);
  }

  public function createDatamart() {
    $baseTableName = "W_AP_base_".$this->_reportId;
    $datamartName = "FX".$this->_reportId;
    $ONClause = array();
    $ONConditions = NULL;
    $l = new ConnectDB("decisyon_cache");
    // se _metricTable ha qualche metrica (sono metriche filtrate) allora procedo con la creazione FX con LEFT JOIN, altrimenti creo una singola FX
    // var_dump($this->_metricTable);

    if (count($this->_metricTable) > 0) {

      foreach ($this->_metricTable as $metricTableName => $aliasMetric) {
        $sql = NULL;

        unset($ONClause);
        echo "\n{TABELLA :  $metricTableName}\n";
        echo "{METRICA : $aliasMetric}\n";
        foreach ($this->_columns as $columnAlias) {
          // carattere backtick con ALTGR+'
          $ONClause[] = "`".$baseTableName."`.`".$columnAlias."` = `".$metricTableName."`.`".$columnAlias."`";
        }
        $ONConditions = implode(" AND ", $ONClause);

        /* DATAMART DA GENERARE */
        /*
        select W_AP_base_3.*, `W_AP_metric_3_1`.`Listino`, `W_AP_metric_3_2`.`sconto` FROM W_AP_base_3
                            LEFT JOIN W_AP_metric_3_1 ON `W_AP_base_3`.`Cod.Sede` = `W_AP_metric_3_1`.`Cod.Sede` AND `W_AP_base_3`.`Sede` = `W_AP_metric_3_1`.`Sede`
                            LEFT JOIN W_AP_metric_3_2 ON `W_AP_base_3`.`Cod.Sede` = `W_AP_metric_3_2`.`Cod.Sede` AND `W_AP_base_3`.`Sede` = `W_AP_metric_3_2`.`Sede`
        */

        $sql = "CREATE TABLE $datamartName AS
          (select $baseTableName.*, `$metricTableName`.`$aliasMetric` FROM $baseTableName
            LEFT JOIN $metricTableName ON $ONConditions );";
        var_dump($sql);

      }


    } else {
      $sql = "CREATE TABLE $datamartName AS (SELECT * FROM $baseTableName);";
    }

    // return $sql;

    // return $l->insert($sql);
  }
  // private function createDatamart($aliasMetric) {
  //   // TODO: creazione datamart con tutte le metriche che hanno ReportFilters e non MetricFilters
  //   $alias = str_replace(" ", "_", $aliasMetric); // TODO: provare ad utilizzare il backtick al posto di fare il replace
  //   $baseTableName = "AP_base_".$this->_reportId;
  //   $datamartName = "FX".$this->_reportId;
  //   $ONClause = array();
  //   $ONConditions = NULL;
  //   $l = new ConnectDB("decisyon_cache");
  //   // se _metricTable ha qualche metrica (sono metriche filtrate) allora procedo con la creazione FX con LEFT JOIN, altrimenti creo una singola FX
  //   if (count($this->_metricTable) > 0) {
  //     $metricTableName = "AP_metric_".$this->_reportId;
  //     // TODO: devo selezionare i campi in comune per fare la LEFT JOIN
  //
  //     foreach ($this->_columns as $columnAlias) {
  //       // carattere backtick con ALTGR+'
  //       $ONClause[] = "`".$baseTableName."`.`".$columnAlias."` = `".$metricTableName."`.`".$columnAlias."`";
  //     }
  //     $ONConditions = implode(" AND ", $ONClause);
  //
  //     $sql = "CREATE TABLE $datamartName AS
  //       (select $baseTableName.*, $metricTableName.".$alias." AS '".$aliasMetric."' from $baseTableName
  //         LEFT JOIN $metricTableName ON $ONConditions );";
  //   } else {
  //     $sql = "CREATE TABLE $datamartName AS (SELECT * FROM $baseTableName);";
  //   }
  //
  //   return $sql;
  //
  //   return $l->insert($sql);
  // }

  public function getDatamartData($reportId) {
    $l = new ConnectDB("decisyon_cache");
    $datamartName = "FX".$reportId;
    return $l->getResultAssoc("SELECT * FROM $datamartName;");
  }



} // End Class
