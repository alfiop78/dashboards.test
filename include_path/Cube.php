<?php
require_once 'ConnectDB.php';

class Cube {
  private $_select, $_columns = array(), $_from, $_and, $_where, $_reportFilters, $_metricFilters, $_reportMetrics, $_metrics, $_groupBy, $_sql, $_reportId, $_metricTable;

  function __construct($fact_table) {
    $this->fact = $fact_table;
    $this->connect = new ConnectDB('automotive_bi_data');
    $this->connect->openConnection();
  }

  function setReportId($reportId) {$this->_reportId = $reportId;}

  function getReportId() {return $this->_reportId;}

  public function dimension($dimension) {
    foreach ($dimension as $key => $value) {
      echo "{$key}\n"; // dimension name

      foreach ($value as $k => $param) {
        // echo "{$k}\n";
        switch ($k) {
          case 'columns':
            // var_dump($param);
            $this->SELECT($param);

            break;
          case 'from':
            var_dump($param);
            $this->FROM($param);
            break;
          case 'hierarchies':
            var_dump($param);
            $this->WHERE($param);
          default:
            // code...
            break;
        }
      }
    }
    var_dump($this->_select);
    var_dump($this->_from);
    var_dump($this->_where);
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
    // return $this->_select;
  }

  public function FROM($from) {
    // per ogni dimensione esistente vado a aggiungere, in this->_from, i FROM che si trovano al suo interno
    $this->_from = " FROM ";
    $this->_from .= implode(", ", $from);

  }
  // public function FROM($dimensions) {
  //   // per ogni dimensione esistente vado a aggiungere, in this->_from, i FROM che si trovano al suo interno
  //   $this->_from = " FROM $this->fact, ";
  //   foreach ($dimensions as $dimension) {
  //     // var_dump($clause);
  //     // var_dump($dimension);
  //     // var_dump($dimension->from);
  //     $this->_from .= implode(", ", $dimension->from);
  //   }
  //   return $this->_from;
  // }

  public function AND($dimensions) {
    $this->_and = " AND ";
    foreach ($dimensions as $dimension) {

      foreach ($dimension->hierarchies as $value) {

        $this->_and .= implode(" = ", $value);
      }
    }
    return $this->_and;
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
  // public function WHERE($hierarchy) {
  //   $i = 0;
  //   foreach ($hierarchy as $hierarchies) {
  //     $hier = array();
  //     $hier = implode(" = ", $hierarchies);
  //     ($i === 0) ? $this->_where .= " WHERE ".$hier : $this->_where .= " AND ".$hier;
  //     $i++;
  //   }
  //   return $this->_where;
  // }

  public function FILTERS($filters) {
    /* definisco i filtri del report*/
    $and = " AND ";
    $or = " OR ";
    foreach ($filters as $table => $filter) {
      foreach ($filter as $param) {
        // TODO: aggiungere anche gli altri operatori (IN, NOT IN, ecc...)
        switch ($param->operator) {
          case 'BETWEEN':
            // var_dump($param->values);
            $this->_reportFilters .= $and.$table.".".$param->fieldName." ".$param->operator." ".implode(" AND ", $param->values);
            break;
          case 'IN':
          case 'NOT IN':
            $this->_reportFilters .= $and.$table.".".$param->fieldName." ".$param->operator." (".implode(", ", $param->values).")";
            break;
          default:
            // var_dump($param->values);
            $this->_reportFilters .= $and.$table.".".$param->fieldName." ".$param->operator." ".$param->values[0];
            break;
        }
      }
    }
    // var_dump($this->_reportFilters);

    return $this->_reportFilters;
  }

  public function METRICS($metrics) {
    // metriche non filtrate
    $metricsList = array();
    foreach ($metrics as $table => $metric) {
      foreach ($metric as $param) {
        $metricsList[] = $param->sqlFunction."(".$table.".".$param->fieldName.") AS '".$param->alias."'";
        // CHANGED: imposto un FORMAT per i numeri (16.01.2020)
        // 17.01.2020 Formattazione impostat in JS
        // $metricsList[] = "FORMAT({$param->sqlFunction}(`$table`.`$param->fieldName`), 2, 'de_DE') AS `$param->alias`";
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
    $this->_sql = $this->_select; //.", ".$this->_metrics."\n";
    // se ci sono metriche a livello di report le aggiungo
    if ($this->_metrics) {$this->_sql .= ", $this->_metrics\n";}
    $this->_sql .= $this->_from."\n";
    $this->_sql .= $this->_where."\n";
    $this->_sql .= $this->_and."\n";
    if (isset($this->_reportFilters)) {$this->_sql .= $this->_reportFilters."\n";}

    if (!is_null($this->_groupBy)) {$this->_sql .= $this->_groupBy;}

    $sql = "CREATE TEMPORARY TABLE decisyon_cache.W_AP_base_".$this->_reportId." AS ".$this->_sql.";";
    // return $sql;
    return $this->connect->multiInsert($sql);
  }

  public function createMetricDatamarts($filteredMetrics) {
    /* creo i datamart necessari per le metriche filtrate */
    $i = 1;
    foreach ($filteredMetrics as $table => $metrics) {
      foreach ($metrics as $param) {
        unset($this->_sql);

        $metric = "$param->sqlFunction(`$table`.`$param->fieldName`) AS `$param->alias`";
        echo $this->createMetricTable('W_AP_metric_'.$this->_reportId."_".$i, $metric, $param->filters);
        // a questo punto metto in relazione (left) la query baseTable con la/e metriche contenenti filtri
        $this->_metricTable["W_AP_metric_".$this->_reportId."_".$i] = $param->alias; // memorizzo qui quante tabelle per metriche filtrate sono state create
        $i++;
      }
    }
  }

  private function createMetricTable($tableName, $metric, $filters) {
    // var_dump($filters);

    $this->_sql = $this->_select.", ".$metric."\n";
    $this->_sql .= $this->_from."\n";
    $this->_sql .= $this->_where."\n";
    $this->_sql .= $this->_and."\n";
    $this->_sql .= $this->_reportFilters."\n";

    $and = " AND ";
    $or = " OR ";

    foreach ($filters as $table => $filter) {
      $this->_metricFilters .= $and.$table.".".$filter->fieldName." ".$filter->operator." ".$filter->values;
    }

    $this->_sql .= $this->_metricFilters."\n";
    if (!is_null($this->_groupBy)) {$this->_sql .= $this->_groupBy;}

    $sql = "CREATE TEMPORARY TABLE decisyon_cache.".$tableName." AS ".$this->_sql.";";
    // return $sql;
    return $this->connect->multiInsert($sql);
  }

  public function createDatamart() {
    $baseTableName = "W_AP_base_".$this->_reportId;
    $datamartName = "decisyon_cache.FX".$this->_reportId;
    // se _metricTable ha qualche metrica (sono metriche filtrate) allora procedo con la creazione FX con LEFT JOIN, altrimenti creo una singola FX

    $sql = "CREATE TABLE $datamartName AS ";
    $sql .= "(SELECT $baseTableName.*, ";

    if (isset($this->_metricTable) && count($this->_metricTable) > 0) {
      $table_and_metric = array();
      $leftJoin = null;
      $ONClause = array();
      $ONConditions = NULL;
      // var_dump($this->_columns);
      foreach ($this->_metricTable as $metricTableName => $alias) {
        $table_and_metric[] = "`$metricTableName`.`$alias`";
        $leftJoin .= "\nLEFT JOIN `decisyon_cache`.`$metricTableName` ON ";

        foreach ($this->_columns as $columnAlias) {
          // carattere backtick con ALTGR+'
          $ONClause[] = "`".$baseTableName."`.`".$columnAlias."` = `".$metricTableName."`.`".$columnAlias."`";
        }
        $ONConditions = implode(" AND ", $ONClause);
        unset($ONClause);
        // var_dump($ONConditions);
        $leftJoin .= "$ONConditions";
      }
      // echo $leftJoin;

      /*
      DATAMART DA GENERARE
      select W_AP_base_3.*, `W_AP_metric_3_1`.`Listino`, `W_AP_metric_3_2`.`sconto` FROM W_AP_base_3
                          LEFT JOIN W_AP_metric_3_1 ON `W_AP_base_3`.`Cod.Sede` = `W_AP_metric_3_1`.`Cod.Sede` AND `W_AP_base_3`.`Sede` = `W_AP_metric_3_1`.`Sede`
                          LEFT JOIN W_AP_metric_3_2 ON `W_AP_base_3`.`Cod.Sede` = `W_AP_metric_3_2`.`Cod.Sede` AND `W_AP_base_3`.`Sede` = `W_AP_metric_3_2`.`Sede`
      */

      $tables = implode(", ", $table_and_metric); //`W_AP_metric_3_1`.`sconto`, `W_AP_metric_3_2`.`listino`

      $sql .= $tables;
      $sql .= "\nFROM `decisyon_cache`.`$baseTableName`";
      $sql .= $leftJoin.");";

    } else {
      $sql = "CREATE TABLE $datamartName AS (SELECT * FROM `decisyon_cache`.`$baseTableName`);";
    }
    // return $sql;
    return $this->connect->multiInsert($sql);
  }

} // End Class
