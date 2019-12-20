/*
La classe recupera il local storage ad ogni accesso alla pagina e contiene Metodi per recuperare ad esempio solo i CUBE o solo le PAGE, DIMENSION, ecc...
*/
class Storage {
  // #_cubeId = 0;

  constructor() {
    this.storage = window.localStorage;
    this.storageKeys = Object.keys(window.localStorage);
    // this.cubeId = this.#_cubeId;
    this.JSONData = null;
  }

  // set cubeId(cubeId) {
  //   // verifico, nello storage gli elementi CUBE presenti, creo un nuovo cubeId in base a quanti trovati
  //   this.storageKeys.forEach((key) => {
  //     let jsonStorage = JSON.parse(this.storage.getItem(key));
  //     // console.log(key);
  //     if (jsonStorage.type === "CUBE") {
  //       console.log("cubo : "+key);
  //       console.log(jsonStorage.cubeId);
  //       this.#_cubeId = jsonStorage.cubeId+1;
  //     }
  //   });
  // }

  // get cubeId() {return this.#_cubeId;}

  set reportSetting(report_id) {
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

  get reportSetting() {
    return JSON.stringify(this.reportParams);
  }

  // set save(value) {
  //   // inserisco il cube creato in localStorage (utilizzare setItem)
  //   // console.log(cubeObj.name);
  //   window.localStorage.setItem(value.name, JSON.stringify(value));
  //   this.cubeStringify = JSON.stringify(value);
  // }
  //
  // // restituisco il cubo in JSON.stringify per inviarlo alla richiesta ajax
  // get open() {return this.cubeStringify;}

  set reportConfig(value) {
    window.localStorage.setItem(Object.keys(value), JSON.stringify(value[Object.keys(value)]));
  }

  set dimension(value) {
    window.localStorage.setItem(Object.keys(value), JSON.stringify(value));
    this.dimensionName = Object.keys(value);
  }

  // restituisco il nome della dimensione
  get dimension() {return this.dimensionName;}

  getJSONCube(name) {
    // restituisco un object del cube convertito in json, questo mi servirà per ricostruire la struttura
    return JSON.parse(window.localStorage.getItem(name));
  }

  getCubesList() {
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
  #_stringify;

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

  set save(value) {
    // salvo il cubo nello storage
    window.localStorage.setItem(value.name, JSON.stringify(value));
    // in stringify posso inviare le richieste ajax oppure scrivere su un record il contenuto del cube
    this.#_stringify = JSON.stringify(value);
  }

  get stringify() {return this.#_stringify;}

  json(cubeName) {
    // un object del cube convertito in json, questo mi servirà per ricostruire la struttura (non per ajax request o DB)
    return JSON.parse(window.localStorage.getItem(cubeName));
  }

}

class ReportStorage extends Storage {
  // Metodi per leggere/scrivere Report nello Storage
}

class DimensionStorage extends Storage {
  // Metodi per leggere/scrivere Dimensioni nello Storage
}
