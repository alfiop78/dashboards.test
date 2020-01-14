/*
La classe recupera il local storage ad ogni accesso alla pagina e contiene Metodi per recuperare ad esempio solo i CUBE o solo le PAGE, DIMENSION, ecc...
*/
class Storage {
  // _cubeId = 0;

  constructor() {
    this.storage = window.localStorage;
    this.storageKeys = Object.keys(window.localStorage);
    // this.cubeId = this._cubeId;
    this.JSONData = null;
  }

  set save(value) {
    // salvo nello storage
    window.localStorage.setItem(value.name, JSON.stringify(value));
  }

  set reportConfig(value) {
    window.localStorage.setItem(Object.keys(value), JSON.stringify(value[Object.keys(value)]));
  }

  set dimension(value) {
    window.localStorage.setItem(Object.keys(value), JSON.stringify(value));
    this.dimensionName = Object.keys(value);
  }

  // restituisco il nome della dimensione
  get dimension() {return this.dimensionName;}

  JSONFormat(name) {
    // restituisco un object convertito in json, questo mi servirà per ricostruire la struttura
    return JSON.parse(window.localStorage.getItem(name));
  }

  getDimensionsList() {
    // this.storageKeys = Object.keys(this.storage);
    let dimensions = [];
    this.storageKeys.forEach((key) => {
      let jsonStorage = JSON.parse(this.storage.getItem(key));
      // console.log(jsonStorage);
      // console.log(jsonStorage[key]);
      if (jsonStorage[key] && jsonStorage[key].type === "DIMENSION") {
        dimensions.push(key);
      }
    });
    return dimensions;
  }

}

class CubeStorage extends Storage {
  _stringify;

  // Metodi per leggere/scrivere Cube nello Storage
  constructor() {
    super();
    this.cubeId = 0;
    // ottengo un cubeId disponibile
    // TODO: ottimizzare secondo la logica di 'getIDAvailable'
    this.storageKeys.forEach((key) => {
      let jsonStorage = JSON.parse(this.storage.getItem(key));
      // console.log(key);
      if (jsonStorage.type === "CUBE") {
        // console.log("cubo : "+key);
        // console.log(jsonStorage.cubeId);
        this.cubeId = jsonStorage.cubeId+1;
      }
    });
    console.log(this.cubeId);
  }

  get id() {
    return this.cubeId;
  }

  get list() {
    // this.storageKeys = Object.keys(this.storage);
    let cubes = [];
    this.storageKeys.forEach((key) => {
      let jsonStorage = JSON.parse(this.storage.getItem(key));
      // console.log(key);
      if (jsonStorage.type === "CUBE") {
        // console.log("cubo : "+key);
        let cubeProperties = {key, 'cubeId' : jsonStorage.cubeId};
        cubes.push(cubeProperties);
      }
    });
    return cubes;

  }

  // set save(value) {
  //   // salvo il cubo nello storage
  //   window.localStorage.setItem(value.name, JSON.stringify(value));
  //   // in stringify posso inviare le richieste ajax oppure scrivere su un record il contenuto del cube
  //   this._stringify = JSON.stringify(value);
  // }

  set stringify(value) {
    this._stringify = JSON.stringify(value);
  }

  get stringify() {return this._stringify;}

  json(cubeName) {
    // un object del cube convertito in json, questo mi servirà per ricostruire la struttura (non per ajax request o DB)
    return JSON.parse(window.localStorage.getItem(cubeName));
  }

}

class ReportStorage extends Storage {
  // Metodi per leggere/scrivere Report nello Storage
  constructor() {
    super();
    // ottengo un reportId disponibile
    this.reportId = 0;
    this.storageKeys.forEach((key) => {
      let jsonStorage = JSON.parse(this.storage.getItem(key));
      if (jsonStorage.type === "REPORT") {
        this.reportId = jsonStorage.id+1;
      }
    });
    console.log(this.reportId);
  }

  set settings(report_id) {
    // TODO: da rivedere e ottimizzare
    this.reportParams = null;
    this.storageKeys.forEach((key) => {
      let jsonStorage = JSON.parse(this.storage.getItem(key));
      // console.log(key);
      if (jsonStorage.type === "REPORT") {
        console.log("report : "+key);
        console.log(jsonStorage.id);
        console.log(report_id);
        console.log(jsonStorage);
        if (jsonStorage.id === report_id) {
          this.reportParams = jsonStorage;
        }
      }
    });
  }

  get settings() {
    return JSON.stringify(this.reportParams);
  }

  list() {
    // this.storageKeys = Object.keys(this.storage);
    let reports = [];
    this.storageKeys.forEach((key) => {
      let jsonStorage = JSON.parse(this.storage.getItem(key));
      // console.log(key);
      if (jsonStorage.type === "REPORT") {
        // console.log("cubo : "+key);
        let reportProperties = {'name' : key, 'reportId' : jsonStorage.id, 'datamartId' : jsonStorage.datamartId};
        reports.push(reportProperties);
      }
    });
    return reports;
  }

  get id() {
    return this.reportId;
  }

}

class DimensionStorage extends Storage {
  // Metodi per leggere/scrivere Dimensioni nello Storage
}

class PageStorage extends Storage {
  constructor() {
    super();
    this.id = 0; // default
  }

  set pageId(value) {
    this.id = value;
  }

  get pageId() { return this.id; }
  
  list() {
    // ottengo la lista delle pagine create
    this.pages = [];
    this.storageKeys.forEach((key) => {
      let jsonStorage = JSON.parse(this.storage.getItem(key));
      // console.log(key);
      if (jsonStorage.type === "PAGE") {
        // console.log("cubo : "+key);
        let pageProperties = { 'name': key, 'id': jsonStorage.id, 'layoutId': jsonStorage.layoutId};
        this.pages.push(pageProperties);
      }
    });
    return this.pages;
  }

  getIdAvailable() {
    // ottengo il primo Id disponibile
    console.log(this.storageKeys);
    this.pagesElement = [];
    this.storageKeys.forEach((key, index) => {
      let jsonStorage = JSON.parse(this.storage.getItem(key));
      // console.log(jsonStorage);
      
      if (jsonStorage.type === "PAGE") {
        // ottengo il numero di elementi PAGE nello storage
        this.pagesElement.push(jsonStorage.id);
      }
      
    });
    // TODO: cerco il primo id "libero"
    // ordino l'array
    this.pagesElement.sort(function (a, b) {
      console.log(a);
      console.log(b);
      // TODO: cosa sono a e b ?
      return a - b;
    })
    
    // this.pagesElement.sort((a, b) => a - b);
    for (let i = 0; i < this.pagesElement.length; i++) {
      // indice 0
      // se 0 è presente in pagesElement aggiungo una unità
      // console.log(this.pagesElement.includes(i));
      
      if (this.pagesElement.includes(i)) {
        this.id++;
        // console.log(this.id);
      } else {
        this.id = i;
      }
      
    }
    
    return this.id;
  }
}