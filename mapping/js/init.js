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

          let tableListContainer = document.querySelector('div[tablelist] ul');

          for (let i in response) {
            let li = document.createElement('li');
            li.setAttribute('label', response[i][0]);
            li.innerText = response[i][0];
            li.id = i;
            tableListContainer.appendChild(li);
            li.onclick = app.handlerTableSelected;
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

  app.handlerTableSelected = function(e) {
    this.toggleAttribute('selected');
    app.Cube.table = this.getAttribute('label');

    let columnListContainer = document.querySelector('div[columnList] ul');
    columnListContainer.querySelectorAll('li').forEach((el) => {columnListContainer.removeChild(el);});


    var url = "ajax/tableInfo.php";
    let params = "tableName="+app.Cube.table;

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          console.table(response);

          for (let i in response) {
            li = document.createElement('li');
            li.innerText = response[i][0];
            li.setAttribute('label', response[i][0]);
            li.id = i;
            columnListContainer.appendChild(li);
            li.onclick = app.handlerColumnsSelected;
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

  app.handlerColumnsSelected = function(e) {
    this.toggleAttribute('selected');
    // almeno una colonna deve essere selezionata per attivare il tasto ADD
    let colsSelectedCount = this.parentElement.querySelectorAll('li[selected]').length;

    (colsSelectedCount > 0) ? document.getElementById('add').removeAttribute('hidden') : document.getElementById('add').hidden = true;
  };

  document.getElementById('add').onclick = function() {
    // let columns = document.getElementById('columns');
    let columnListContainer = document.querySelector('div[columnList] ul');
    let cols = [];
    columnListContainer.querySelectorAll('li[selected]').forEach((el) => {
      cols.push(el.getAttribute('label'));
    });

    console.log(cols);
    // console.log(app.tableSelected);

    // app.Cube.table = app.tableSelected;
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

  document.getElementById('mdc-next').onclick = function(e) {
    // pagina attiva in questo momento
    let activePage = document.querySelector('.page[selected]');
    activePage.removeAttribute('selected');
    // pagina da attivare
    let page = activePage.nextElementSibling;
    page.setAttribute('selected', true);
    let overflow = document.getElementById('overflowX');
    overflow.setAttribute('data-step-active', page.getAttribute('data-step'));
  };
  document.getElementById('mdc-back').onclick = function(e) {
    // pagina attiva in questo momento
    let activePage = document.querySelector('.page[selected]');
    activePage.removeAttribute('selected');
    // pagina da attivare
    let page = activePage.previousElementSibling;
    page.setAttribute('selected', true);
    let overflow = document.getElementById('overflowX');
    overflow.setAttribute('data-step-active', page.getAttribute('data-step'));
  };

  app.getDatabaseTable();

})();
