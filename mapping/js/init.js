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
    tableSelected : null,
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
    let label = this.parentElement.querySelector('label');
    (this.value.length > 0) ? label.classList.add('has-content') : label.classList.remove('has-content');
    // TODO: carico l'elenco delle colonne della tabella selezionata
    console.log(this.value);
    app.tableSelected = this.value;


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

  document.getElementById('add').onclick = function() {
    let columns = document.getElementById('columns');
    // console.log(columns.selectedOptions);
    let collection = columns.selectedOptions;
    let cols = [];
    // console.log(this.selectedOptions[0].value); // si può ciclare la collection
    for (let i = 0; i < collection.length; i++) {
      cols.push(columns.selectedOptions[i].value);
    }
    console.log(cols);
    console.log(app.tableSelected);

    app.Cube.tables = app.tableSelected;
    app.Cube.columns = cols;
    app.Cube.createTable();

    document.querySelectorAll('#columns > option').forEach((opt) => {
      // console.log(opt);
      columns.removeChild(opt);
    });
    document.getElementById('tableListId').value = "";
  };

  document.getElementById('relation').onclick = function(e) {
    app.Cube.createHierarchy();
  }

  app.getDatabaseTable();

})();
