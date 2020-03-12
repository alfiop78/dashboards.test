/*
La classe recupera il local storage ad ogni accesso alla pagina e contiene Metodi per recuperare ad esempio solo i CUBE o solo le PAGE, DIMENSION, ecc...
*/
class Storages {

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
    // console.log(Object.keys(value));
    // console.log(value.title);
    //
    window.localStorage.setItem(value.title, JSON.stringify(value));
    this.dimensionName = value.title;
  }

  // restituisco il nome della dimensione
  get dimension() {return this.dimensionName;}

  JSONFormat(name) {
    // restituisco un object convertito in json, questo mi servirà per ricostruire la struttura
    return JSON.parse(window.localStorage.getItem(name));
  }


}

class CubeStorage extends Storages {
  constructor() {
    super();
    this.id = 0; // default
  }

  set cubeId(value) {
    this.id = value;
  }

  get cubeId() { return this.id; }

  getIdAvailable() {
    // ottengo il primo Id disponibile
    console.log(this.storageKeys);
    this.cubesElement = [];
    this.storageKeys.forEach((key) => {
      let jsonStorage = JSON.parse(this.storage.getItem(key));
      // console.log(jsonStorage);

      if (jsonStorage.type === 'CUBE') {
        // ottengo il numero di elementi CUBE nello storage
        this.cubesElement.push(jsonStorage.id);
      }
    });

    // ordino l'array
    this.cubesElement.sort(function (a, b) {
      // console.log(a);
      // console.log(b);
      // TODO: cosa sono a e b ?
      return a - b;
    })
    // this.pagesElement.sort((a, b) => a - b);

    for (let i = 0; i < this.cubesElement.length; i++) {
      // indice 0
      // se 0 è presente in pagesElement aggiungo una unità
      // console.log(this.pagesElement.includes(i));

      if (this.cubesElement.includes(i)) {
        this.id++;
        // console.log(this.id);
      } else {
        this.id = i;
      }
    }
    return this.id;
  }

  list() {
    // this.storageKeys = Object.keys(this.storage);
    let cubeObj = {};
    // let cubes = [];
    this.storageKeys.forEach((key) => {
      let jsonStorage = JSON.parse(this.storage.getItem(key));
      // console.log(key);
      if (jsonStorage.type === 'CUBE') {
        // console.log("cubo : "+key);
        // let cubeProperties = {key, 'cubeId' : jsonStorage.cubeId};
        // cubes.push(cubeProperties);
        cubeObj[key] = {'id' : jsonStorage['id'], 'FACT' : jsonStorage['FACT'], 'key' : key};
      }
    });
    // return cubes;
    return cubeObj;
  }

  set stringify(value) {this._stringify = value;}

  get stringify() {
    return this._stringify;
  }

  set stringifyObject(value) {
    this._stringify = JSON.stringify(value);
  }

  get stringifyObject() {return this._stringify;}

  json(cubeName) {
    // un object del cube convertito in json, questo mi servirà per ricostruire la struttura (non per ajax request o DB)
    return JSON.parse(window.localStorage.getItem(cubeName));
  }

  getMetrics(cubeName) {
    this._cube = JSON.parse(window.localStorage.getItem(cubeName));
    return this._cube.metrics;
  }

  associatedDimensions(name) {
    let jsonStorage = JSON.parse(this.storage.getItem(name));
    // console.log(jsonStorage);
    if (jsonStorage.type === 'CUBE') {
      return jsonStorage.associatedDimensions;
    }
  }

}

class ReportStorage extends Storages {
  // Metodi per leggere/scrivere Report nello Storage
  constructor() {
    super();
    this.id = 0;
  }

  set reportId(value) {
    this.id = value;
  }

  get reportId() { return this.id; }

  getIdAvailable() {
    // ottengo il primo Id disponibile
    console.log(this.storageKeys);
    this.elements = [];
    this.storageKeys.forEach((key) => {
      let jsonStorage = JSON.parse(this.storage.getItem(key));
      // console.log(jsonStorage);

      if (jsonStorage.type === 'REPORT') {
        // ottengo il numero di elementi PAGE nello storage
        this.elements.push(jsonStorage.id);
      }

    });
    // TODO: cerco il primo id "libero"
    // ordino l'array
    this.elements.sort(function (a, b) {
      // console.log(a);
      // console.log(b);
      // TODO: cosa sono a e b ?
      return a - b;
    })

    // this.pagesElement.sort((a, b) => a - b);
    for (let i = 0; i < this.elements.length; i++) {
      // indice 0
      // se 0 è presente in elements aggiungo una unità
      // console.log(this.pagesElement.includes(i));

      if (this.elements.includes(i)) {
        this.id++;
        // console.log(this.id);
      } else {
        this.id = i;
      }
    }
    return this.id;
  }

  set settings(report_id) {
    // TODO: da rivedere e ottimizzare
    this.reportParams = null;
    this.storageKeys.forEach((key) => {
      let jsonStorage = JSON.parse(this.storage.getItem(key));
      // console.log(key);
      if (jsonStorage.type === 'REPORT') {
        // console.log("report : "+key);
        // console.log(jsonStorage.id);
        // console.log(report_id);
        // console.log(jsonStorage);
        if (jsonStorage.id === report_id) {
          this.reportParams = jsonStorage;
          this.reportName = jsonStorage.name;
        }
      }
    });
  }

  set reportName(value) {this.name = value;}

  get reportName() { return this.name;}

  get settings() {return JSON.stringify(this.reportParams);}

  set options(report_id) {
    // TODO: da rivedere e ottimizzare
    this._options = null;
    this.storageKeys.forEach((key) => {
      let jsonStorage = JSON.parse(this.storage.getItem(key));
      // console.log(key);
      if (jsonStorage.type === 'REPORT') {
        // console.log("report : "+key);
        // console.log(jsonStorage.id);
        // console.log(report_id);
        // console.log(jsonStorage.options);
        if (jsonStorage.id === report_id) {
          this._options = jsonStorage.options;
        }
      }
    });
  }

  get options() {return JSON.stringify(this._options);}

  list() {
    // let reports = [];
    let reports = {};
    this.storageKeys.forEach((key) => {
      let jsonStorage = JSON.parse(this.storage.getItem(key));
      // console.log(key);
      if (jsonStorage.type === 'REPORT') {
        // console.log("cubo : "+key);
        let reportProperties = {'name' : key, 'reportId' : jsonStorage.id, 'datamartId' : jsonStorage.datamartId};
        // reports.push(reportProperties);
        reports[key] = reportProperties;
      }
    });
    return reports;
  }
}

class ReportProcessStorage extends Storages {
  constructor() {
    super();
    this.id = 0; // default
  }

  set processId(value) {this.id = value;}

  get processId() {return this.id;}

  list() {
    let processReports = {};
    this.storageKeys.forEach((key) => {
      let jsonStorage = JSON.parse(this.storage.getItem(key));
      // console.log(key);
      if (jsonStorage.type === 'PROCESS') {
        // console.log("cubo : "+key);
        let reportProperties = {'name' : key, 'processId' : jsonStorage.processId};
        // reports.push(reportProperties);
        processReports[key] = reportProperties;
      }
    });
    return processReports;
  }
}

class DimensionStorage extends Storages {
  // Metodi per leggere/scrivere Dimensioni nello Storage
  // TODO: da completare in base alla logica di PageStorage
  constructor() {
    super();
    this.id = 0; // default
    this._name;
  }

  set dimensionId(value) {
    this.id = value;
  }

  get dimensionId() { return this.id; }

  set selected(value) {
    // imposto la dimensione selezionata
    this._name = value;
  }

  get selected() {
    return JSON.parse(this.storage.getItem(this._name));
  }

  list() {
    // let dimensions = [];
    let dimObj = {};
    this.storageKeys.forEach((key) => {
      // console.log(key);
      let jsonStorage = JSON.parse(this.storage.getItem(key));
      // console.log(jsonStorage);
      // console.log(jsonStorage.type);
      if (jsonStorage.type === 'DIMENSION') {
        // console.log(key);
        dimObj[key] = jsonStorage.from;
      }
    });
    // return dimensions;
    return dimObj;
  }

  getIdAvailable() {
    // ottengo il primo Id disponibile
    console.log(this.storageKeys);
    this.dimensionsElement = [];
    this.storageKeys.forEach((key, index) => {
      let jsonStorage = JSON.parse(this.storage.getItem(key));
      // console.log(jsonStorage);

      if (jsonStorage.type === 'DIMENSION') {
        // ottengo il numero di elementi PAGE nello storage
        this.dimensionsElement.push(jsonStorage.id);
      }
    });

    // ordino l'array
    this.dimensionsElement.sort(function (a, b) {
      console.log(a);
      console.log(b);
      // TODO: cosa sono a e b ?
      return a - b;
    })
    // this.dimensionsElement.sort((a, b) => a - b); versione compatta

    for (let i = 0; i < this.dimensionsElement.length; i++) {
      if (this.dimensionsElement.includes(i)) {
        this.id++;
      } else {
        this.id = i;
      }
    }
    return this.id;
  }

  getFields(table) {
    // resituisco un array con il nome delle tabelle incluse in .columns
    this.item = JSON.parse(this.storage.getItem(this._name));
    this.tables = [];
    for (let table in this.item.from) {
      this.tables.push(table);
    }
    return this.tables;
  }

}

class PageStorage extends Storages {
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
        // console.log(jsonStorage.layoutParams);

        let pageProperties = {
          'name': key,
          'id': jsonStorage.id,
          'layoutId': jsonStorage.layoutId,
          'layoutParams': jsonStorage.layoutParams};
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
