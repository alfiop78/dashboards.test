/*
La classe recupera il local storage ad ogni accesso alla pagina e contiene Metodi per recuperare ad esempio solo i CUBE o solo le PAGE, DIMENSION, ecc...
*/
class Storage {

  constructor() {
    this.storage = window.localStorage;
    this.storageKeys = Object.keys(window.localStorage);
    console.log(this.storage);

  }

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
    this.storageKeys.forEach((key) => {
      let jsonStorage = JSON.parse(this.storage.getItem(key));
      // console.log(key);
      if (jsonStorage.type === "DIMENSION") {
        console.log("Dimensione : "+key);

      }
    });

  }

  getReportId() {
    // TODO: verifico il reportId inserito nello storage ed assegno un nuovo reportID al prossimo Cube/report
  }
}
