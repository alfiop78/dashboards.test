/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* funzione immediata */
var App = new Application();
(() => {
  var app = {
    Cube : new Cube(),
    tableSelected : [],
    columnsSelected : []

  };

  // App.getSessionName();

  App.init();

  app.getDatabaseTable = function() {
    // TODO: utilizzare le promise
    var url = "ajax/database.php";

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);

          let datalistTable = document.getElementById('datalistTables');

          for (let i in response) {
            let opt = document.createElement('option');
            opt.label = response[i][0];
            opt.value = response[i][0];
            opt.id = i;
            datalistTable.appendChild(opt);
          }

        } else {

        }
      } else {

      }
    };

    request.open('POST', url);
    request.setRequestHeader('Content-Type','application/json');
    request.send();
  };

  document.getElementById('tableListId').onchange = function(e) {
    console.log('change');
    // TODO: carico l'elenco delle colonne della tabella selezionata
    console.log(this.value);
    app.tableSelected.push(this.value);


    var url = "ajax/tableInfo.php";
    let params = "tableName="+this.value;

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);


          let selectMultiple = document.getElementById('columns');

          for (let i in response) {
            let opt = document.createElement('option');
            opt.value = response[i][0];
            opt.innerText = response[i][0];
            opt.id = i;
            selectMultiple.appendChild(opt);
          }

        } else {

        }
      } else {

      }
    };

    request.open('POST', url);
    // request.setRequestHeader('Content-Type','application/json');
    request.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    request.send(params);

  };

  document.getElementById('save').onclick = function() {
    let columns = document.getElementById('columns');
    // console.log(columns.selectedOptions);
    let collection = columns.selectedOptions;
    let cols = [];
    // console.log(this.selectedOptions[0].value); // si può ciclare la collection
    for (let i = 0; i < collection.length; i++) {
      cols.push(columns.selectedOptions[i].value);
    }
    console.log(cols);

    app.Cube.tables = app.tableSelected;
    app.Cube.columns = cols;
  };

  app.getDatabaseTable();

})();
