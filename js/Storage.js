/*
La classe recupera il local storage ad ogni accesso alla pagina e contiene Metodi per recuperare ad esempio solo i CUBE o solo le PAGE, DIMENSION, ecc...
*/
class Storage {

  constructor() {
    this.storage = window.localStorage;
    this.storageKeys = Object.keys(window.localStorage);
    this.report_id = 0;
    this.reportId = this.report_id;
    this.JSONData = null;
  }

  set reportId(report_id) {
    this.storageKeys.forEach((key) => {
      let jsonStorage = JSON.parse(this.storage.getItem(key));
      // console.log(key);
      if (jsonStorage.type === "CUBE") {
        console.log("cubo : "+key);
        console.log(jsonStorage.report_id);
        this.report_id = jsonStorage.report_id+1;
      }
    });
  }

  get reportId() {return this.report_id;}

  set cube(value) {
    // inserisco il cube creato in localStorage (utilizzare setItem)
    // console.log(cubeObj.name);
    window.localStorage.setItem(value.name, JSON.stringify(value));
    this.cubeStringify = JSON.stringify(value);
  }

  // restituisco il cubo in JSON.stringify per inviarlo alla richiesta ajax
  get cube() {return this.cubeStringify;}

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
        cubes.push(key);
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
