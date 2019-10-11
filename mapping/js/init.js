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

          let ulContainer = document.getElementById('tables');
          // console.log(ulContainer);

          for (let i in response) {
            let li = document.createElement('li');
            li.setAttribute('label', response[i][0]);
            li.innerText = response[i][0];
            li.id = i;
            ulContainer.appendChild(li);
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
    // inserisco il nome della tabella selezionata nella card [active]
    // let activeCard = document.querySelector('.card-table[active]');
    app.Cube.activeCard = document.querySelector('.card-table[active]');

    let ulContainer = document.getElementById('columns');
    // pulisco l'elenco delle colonne in base alla selezione della tabella
    ulContainer.querySelectorAll('li').forEach((el) => {ulContainer.removeChild(el);});

    var url = "ajax/tableInfo.php";
    let params = "tableName="+app.Cube.table;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          // console.table(response);

          for (let i in response) {
            li = document.createElement('li');
            li.innerText = response[i][0];
            li.setAttribute('label', response[i][0]);
            li.id = i;
            ulContainer.appendChild(li);
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
    // ogni click sulla colonna selezionata la passo al metodo columns che le inserisce in un array di colonne es.:
    // [Azienda: ['id','descrizione', ecc...]]
    app.Cube.columns = this.getAttribute('label');
    // nell'impostare le colonne selezionate, da aggiungere alla gerarchia nelle tabelle, imposto anche l'evento click

  };

  document.getElementById('relation').onclick = function(e) {
    app.Cube.createHierarchy();
  }

  app.handlerCardSelected = function(e) {
    // console.log(this);
    // rimuovo l'attriubto active dalla card-table aattiva
    document.querySelector('.card-table[active]').removeAttribute('active');
    if (this.id === "fact") {
      // è stata selezionata la fact table
      document.getElementById('tables').setAttribute('fact', true);

    } else {
      // tabella
      document.getElementById('tables').removeAttribute('fact');
    }

    this.setAttribute('active', true);
  };

  document.querySelectorAll('.card-table').forEach((card) => {
    // console.log(card);
    card.onclick = app.handlerCardSelected;
  });

  app.handlerAddTable = function(e) {
    console.log(this);
    let tmplCard = document.getElementById('template-card-table');
    let tmplContent = tmplCard.content.cloneNode(true);
    let card = tmplContent.querySelector('.card');
    let parentElement = document.getElementById('containerCards');
    parentElement.appendChild(card);
    // lego evento click sulla card
    card.querySelector('.card-table').onclick = app.handlerCardSelected;
    card.querySelector('.icon-relation > i[add]').onclick = app.handlerAddTable;
    card.querySelector('.icon-relation > i[hierarchies]').onclick = app.handlerAddHierarchy;
    card.querySelector('.icon-relation > i[columns]').onclick = app.handlerAddColumns;
    card.querySelector('.icon-relation > i[filters]').onclick = app.handlerAddFilters;

  };

  app.handlerAddHierarchy = function(e) {
    console.log(this);
  };

  app.handlerAddColumns = function(e) {
    console.log(this);
  };

  app.handlerAddFilters = function(e) {
    console.log(this);
  };

  // evento su icona per aggiungere una tabella alla gerarchia
  document.querySelector('.icon-relation > i[add]').onclick = app.handlerAddTable;
  document.querySelector('.icon-relation > i[hierarchies]').onclick = app.handlerAddHierarchy;
  document.querySelector('.icon-relation > i[columns]').onclick = app.handlerAddColumns;
  document.querySelector('.icon-relation > i[filters]').onclick = app.handlerAddFilters;



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