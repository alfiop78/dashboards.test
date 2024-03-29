<?php
	require_once 'ConnectDB.php';

	class Queries {
		private $_SELECT = array();

		function __construct() {}

		public function dealers() {
			$l = new ConnectDB("automotive_bi_data");
			$query = "SELECT versioneDMS as Versione, id, descrizione as Dealer, CodDealerCM as 'Cod.Ford', CodAziendaSId as sID, VAT FROM Azienda a WHERE a.id_CasaMadre = 1 AND a.isDealer = 1 AND a.attiva = 1 AND a.CodMercato = 'IT';";

			$this->_result = $l->getResultAssoc($query);
			return $this->_result;
		}

		public function showTable() {
			$l = new ConnectDB('automotive_bi_data');
			// $l = new ConnectDB('Sql1073234_1');
			// $this->_result = $l->getResultArray("SELECT descrizione FROM automotive_bi_data.Azienda LIMIT 10;");
			$this->_result = $l->getResultArray("SELECT table_name FROM all_tables WHERE schema_name = 'automotive_bi_data';");
			// $this->_result = $l->getResultArray("SHOW TABLES;");
			// $this->_result = $l->getResultAssoc("SHOW TABLES;");
			return $this->_result;
		}

		public function describe($table) {
			// NOTE: altre opzioni per DESCRIBE oppure SHOW COLUMNS
			// https://dev.mysql.com/doc/refman/8.0/en/show-columns.html
			$l = new ConnectDB('automotive_bi_data');
			// $l = new ConnectDB('Sql1073234_1');
			/* $query = "DESCRIBE $table;"; */
            $query = "SELECT C.COLUMN_NAME, C.DATA_TYPE, C.IS_NULLABLE, CC.CONSTRAINT_NAME
                FROM COLUMNS C LEFT JOIN CONSTRAINT_COLUMNS CC ON C.TABLE_ID=CC.TABLE_ID AND C.COLUMN_NAME=CC.COLUMN_NAME AND CC.CONSTRAINT_TYPE='p' WHERE C.TABLE_NAME = '$table' ORDER BY c.ordinal_position ASC;";
			/* $this->_result = $l->getResultArray($query); */
			// $this->_result = $l->getResultAssoc("SHOW TABLES;");
			/* return $this->_result; */
            return $l->getResultArray($query);
		}

		public function distinctValues($table, $field) {
			$l = new ConnectDB('automotive_bi_data');
			// $l = new ConnectDB('Sql1073234_1');
			$query = "SELECT DISTINCT($field) FROM $table ORDER BY $field ASC LIMIT 500;";
			// return $query;
			$this->_result = $l->getResultAssoc($query);
			// $this->_result = $l->getResultAssoc("SHOW TABLES;");
			return $this->_result;
		}

		// public function getDataType() {
		//   /*
		//   SELECT COLUMN_NAME, DATA_TYPE
		//     FROM `COLUMNS`
		//     WHERE `TABLE_SCHEMA` = 'automotive_bi_data'
		//     AND `TABLE_NAME` = 'AggiornamentoDati'
		//     AND COLUMN_NAME = 'id_Azienda'*/
		// }

		public function getDatamartDefault($datamartId) {
			$l = new ConnectDB("decisyon_cache");
			$datamartName = "FX".$datamartId;
			var_dump($datamartName);
			return $l->getResultAssoc("SELECT * FROM $datamartName;");
		}

		public function getDatamartData($datamart) {
			$l = new ConnectDB("decisyon_cache");

			$datamartName = "FX".$datamart->{'id'};
			$options = $datamart->{'options'};
			var_dump($options);

			// return $options->{'positioning'};
			foreach ($options->{'positioning'} as $key => $value) {
			  // echo $key;
			  foreach ($value as $column) {
				$this->_SELECT[] = "`".$column."`";
			  }
			}
			var_dump($this->_SELECT);

			$fields = implode(', ', $this->_SELECT);
			// var_dump($fields);

			$sql = "SELECT $fields FROM $datamartName";
			// echo $sql;
			// return;

			// var_dump($datamartName);
			return $l->getResultAssoc($sql);
		}
	} // End Class
