/*
La classe recupera il local storage ad ogni accesso alla pagina e contiene Metodi per recuperare ad esempio solo i CUBE o solo le PAGE, DIMENSION, ecc...
*/
class Storage {

  constructor() {
    this.storage = window.localStorage;
    this.storageKeys = Object.keys(window.localStorage);
    console.log(this.storage);
    this.report_id = 0;
    this.reportId = this.report_id;
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

  getCube() {
    // this.storageKeys = Object.keys(this.storage);
    this.storageKeys.forEach((key) => {
      let jsonStorage = JSON.parse(this.storage.getItem(key));
      // console.log(key);
      if (jsonStorage.type === "CUBE") {
        console.log("cubo : "+key);

      }
    });

  }

  getDimension() {
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

  getReportId() {
    // TODO: verifico il reportId inserito nello storage ed assegno un nuovo reportID al prossimo Cube/report
  }
}
