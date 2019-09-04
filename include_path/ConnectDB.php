<?php

class ConnectDB {
	// proprietà della Classe

	private $_host, $_u, $_p, $_schema, $_document_root;
    protected $link;
    // db_1 Sql644100_1  - db_2 Sql644100_2
    protected $_db_1; // questa viene usata nella subClass

	function __construct($schema){
      // $this->_host = $_SERVER['SERVER_NAME'];
      // $this->_document_root = $_SERVER['DOCUMENT_ROOT'];
      $this->_schema = $schema;

			$this->_u='apietrantuono';
			$this->_host="192.168.2.13";
			$this->_p="4lfi0";
	}

	// Metodo Connect
	protected function connect() {
      $this->link = new mysqli($this->_host, $this->_u, $this->_p, $this->_schema) or die("Errore nella connessione al DB {$this->link->error}");
      return $this->link;
	}

  function getResultRow($query) {
    $this->link = $this->connect();
    try {
      if (!$result = $this->link->query($query)) {
        //throw new Exception("Errore nella query");
        throw new DBError("Errore : ",$this->link->errno);
      } elseif ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $this->link->close();
        return $row;
      } else {
        //throw new Exception("Nessun risultato dalla query");
        throw new Exception(0);
      }
    } catch (DBError $exc) {
      //echo $exc->getTraceAsString();
      echo $exc->getDetailError();
    } catch (Exception $e) {
      echo $e->getMessage();
    }
  }

  function insert($query) {
    $this->link = $this->connect();
    $affectedRow = 0;
    $stmt = $this->link->stmt_init(); // se non si usa questo e la query è errata non posso ottenere l'errore perchè l'oggetto stmt non viene istanziato
    //TODO ottimizzare la gestione degli errori
    try {
      if ($stmt->prepare($query)){
        if (!$stmt->execute()) {
          //throw new Exception("Errore nell'esecuzione della query");
		  throw new DBError("Err.",$this->link->errno);
        }
        $affectedRow = $stmt->affected_rows;
        $stmt->close();
        $this->link->close();
        return $affectedRow;
      } else {
        throw new DBError("Error : ",$this->link->errno);
        //return FALSE;
      }
    } catch (DBError $exc) {
      echo $exc->getDetailError();
    } catch (Exception $e) {
	  echo $e->getMessage();
	}

  }

  function delete($query) {
    $this->link = $this->connect();

    $stmt = $this->link->stmt_init(); // se non si usa questo e la query è errata non posso ottenere l'errore perchè l'oggetto stmt non viene istanziato
    //TODO ottimizzare la gestione degli errori
    try {
      if ($stmt->prepare($query)){
        if (!$stmt->execute()) {
          //throw new Exception("Errore nell'esecuzione della query");
		  throw new DBError("Err.",$this->link->errno);
        }

        return $stmt->execute();
      } else {
        throw new DBError("Error : ",$this->link->errno);
        //return FALSE;
      }
    } catch (DBError $exc) {
      echo $exc->getDetailError();
    } catch (Exception $e) {
	  echo $e->getMessage();
	}

  }

  function getResultArray($query) {
    $this->link = $this->connect();
    try {
      if (!$result = $this->link->query($query)) {
        //throw new Exception("Errore nella query");
        throw new DBError("Errore : ",$this->link->errno);
      } elseif ($result->num_rows > 0) {
        while ($row = $result->fetch_row()) {$arr[] = $row;}
        $this->link->close();
        return $arr;
      } else {
        return FALSE;
        //throw new Exception("Nessun risultato dalla query");
      }
    } catch (DBError $exc) {
      //echo $exc->getTraceAsString();
      echo $exc->getDetailError();
    } catch (Exception $e) {
      echo $e->getMessage();
    }
  }

  function getResultField($query) {
    $this->link = $this->connect();
    try {
      if (!$result = $this->link->query($query)) {
        //throw new Exception("Errore nella query");
        throw new DBError("Errore : ",$this->link->errno);
      } elseif ($result->num_rows > 0) {
        //$row = $result->fetch_row();
        $field = $result->fetch_array(MYSQLI_BOTH);
        $this->link->close();
        return $field[0];
      } else {
				return FALSE;
				//        throw new Exception("Nessun risultato dalla query");
      }
    } catch (DBError $exc) {
      //echo $exc->getTraceAsString();
      echo $exc->getDetailError();
    } catch (Exception $e) {
      echo $e->getMessage();
    }
  }

  function getResultAssoc($query) {
    $this->link = $this->connect();
    try {
      if (!$result = $this->link->query($query)) {
        //throw new Exception("Errore nella query");
        throw new DBError("Errore : ",$this->link->errno);
      } elseif ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {$arr[] = $row;}
        $this->link->close();
        return $arr;
      } else {
        return FALSE;
        //throw new Exception("Nessun risultato dalla query");
      }
    } catch (DBError $exc) {
      //echo $exc->getTraceAsString();
      echo $exc->getDetailError();
    } catch (Exception $e) {
      echo $e->getMessage();
    }
  }



}

// gestire gli errori più specifici
// TODO: da ottimizzare
class DBError extends Exception {

  function getDetailError() {
    //var_dump($this->code);
    $msg = NULL;
    switch ($this->code) {
      case 1054:
        // nome di colonna sconosciuto
        //return "Nome di colonna sconosciuto";
        $msg = "Nome di colonna sconosciuto ($this->code)";
        break;
      case 1064:
        // sintassi errata
        $msg = "Sintassi della query errata ($this->code)";
        break;
      case 1146:
        $msg = "Errore nella sintassi del nome campo ($this->code)";
        break;
	  case 1136:
		// in una insert le colonne non corrispondono ((1136, "Column count doesn't match value count at row 1")
		$msg = "Il conteggio delle colonne non corrisponde al conteggio dei valori alla riga 1 ($this->code)";
		break;
	  case 1364:
		$msg = "Il campo non ha un valore di default ($this->code)"; // (Field doesn't have a default value)
		break;
      default:
        $msg = "Errore generico: $this->code";
        break;
    }
    return $msg;
  }
}
