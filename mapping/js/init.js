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
    console.log('handlerTableSelected');
    this.toggleAttribute('selected');
    app.Cube.activeCard = document.querySelector('.card-table[active]');
    // inserisco il nome della tabella selezionata nella card [active]
    app.Cube.table = this.getAttribute('label');

    // let ulContainer = document.getElementById('columns');
    let ulContainer = app.Cube.activeCard.querySelector('#columns');
    // pulisco l'elenco delle colonne in base alla selezione della tabella
    ulContainer.querySelectorAll('.element').forEach((el) => {ulContainer.removeChild(el);});

    var url = "ajax/tableInfo.php";
    let params = "tableName="+app.Cube.table;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          // console.table(response);

          for (let i in response) {
            let tmplList = document.getElementById('template-list-columns');
            let tmplContent = tmplList.content.cloneNode(true);
            let element = tmplContent.querySelector('.element');
            let li = element.querySelector('li');
            let iElement = element.querySelector('i');
            li.innerText = response[i][0];
            li.setAttribute('label', response[i][0]);
            li.id = i;
            ulContainer.appendChild(element);
            li.onclick = app.Cube.handlerColumns.bind(app.Cube);
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

  app.handlerCardSelected = function(e) {
    app.Cube.activeCard = this;
    // rimuovo l'attriubto active dalla card-table attiva
    document.querySelector('.card-table[active]').removeAttribute('active');
    if (this.id === "fact") {
      // è stata selezionata la fact table, coloro la lista delle tabelle dello stesso colore della fact
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
    // console.log(this);
    let tmplCard = document.getElementById('template-card-table');
    let tmplContent = tmplCard.content.cloneNode(true);
    let card = tmplContent.querySelector('.card');
    let parentElement = document.getElementById('containerCards');
    let factTable = document.getElementById('fact-card');
    parentElement.insertBefore(card, factTable);
    // parentElement.appendChild(card);
    // lego evento click sulla card
    card.querySelector('.card-table').onclick = app.handlerCardSelected;
    card.querySelector('.icon-relation > i[add]').onclick = app.handlerAddTable;
    card.querySelector('.icon-relation > i[hierarchies]').onclick = app.handlerAddHierarchy;
    card.querySelector('.icon-relation > i[columns]').onclick = app.handlerAddColumns;
    card.querySelector('.icon-relation > i[filters]').onclick = app.handlerAddFilters;

  };

  app.handlerAddHierarchy = function(e) {
    console.log(this);
    // console.log(e.path);
    // console.log(e.path[3]);
    // aggiungo l'attributo [hierarchies] alle due card (sopra-sotto)
    // recupero le due card dove in mezzo c'è questo tasto
    // elimino prima l'attributo [hierarchies] su eventuali altre card-table selezionate in precedenza
    app.Cube.changeMode();
    let upCard = e.path[3].querySelector('section.card-table');
    let downCard = e.path[3].nextElementSibling.querySelector('section.card-table');
    let arrCards = [upCard, downCard];
    arrCards.forEach((card) => {
      let help = card.querySelector('.help');
      if (card.querySelectorAll('ul li').length === 0) {
        help.setAttribute('alert', true);
        card.removeAttribute('hierarchies');
        help.innerText = "Necessario aggiungere una tabella per creare una relazione";
      } else {
        help.removeAttribute('alert');
        card.setAttribute('hierarchies', true);
        help.innerText = "Seleziona le colonne da mettere in relazione";
      }
    });
    // REVIEW: probabilmente questo non serve più perchè lo faccio in app.Cube.changeMode
    for (let name of upCard.getAttributeNames()) {
      if (name === 'filters' || name === 'columns') {upCard.removeAttribute(name);}
    }
  };

  app.handlerAddColumns = function(e) {
    // console.log(this);

    app.Cube.changeMode();
    let upCard = e.path[3].querySelector('section.card-table');
    app.Cube.activeCard = upCard;
    let help = upCard.querySelector('.help');
    help.innerHTML = "Seleziona le colonne da mettere nel corpo della tabella";
    upCard.setAttribute('columns', true);
    for (let name of upCard.getAttributeNames()) {
      // let value = upCard.getAttribute(name);
      // console.log(name);
      if (name === 'hierarchies' || name === 'filters') {upCard.removeAttribute(name);}
    }
  };

  app.handlerAddFilters = function(e) {
    // console.log(this);
    app.Cube.changeMode();
    let upCard = e.path[3].querySelector('section.card-table');
    app.Cube.activeCard = upCard;
    let help = upCard.querySelector('.help');
    help.innerHTML = "Seleziona le colonne su cui verranno applicati dei filtri";
    upCard.setAttribute('filters', true);
  };

  app.handlerAddGroupBy = function(e) {
    // console.log(this);
    app.Cube.changeMode();
    let upCard = e.path[3].querySelector('section.card-table');
    app.Cube.activeCard = upCard;
    let help = upCard.querySelector('.help');
    help.innerHTML = "Seleziona le colonne su cui applicare il GROUP BY";
    upCard.setAttribute('groupby', true);
  };

  app.handlerAddMetrics = function(e) {
    // console.log(this);
    app.Cube.changeMode();
    let upCard = e.path[3].querySelector('section.card-table');
    app.Cube.activeCard = upCard;
    let help = upCard.querySelector('.help');
    help.innerHTML = "Seleziona le colonne da impostare come Metriche";
    upCard.setAttribute('metrics', true);
  };

  // evento su icona per aggiungere una tabella alla gerarchia
  document.querySelector('.icon-relation > i[add]').onclick = app.handlerAddTable;
  document.querySelector('.icon-relation > i[hierarchies]').onclick = app.handlerAddHierarchy;
  document.querySelector('.icon-relation > i[hierarchies-remove]').onclick = app.handlerRemoveHierarchy;
  // OPTIMIZE: forse questi 2 sotto li devo mettere dopo aver definito la tabella
  document.querySelector('section[options] > i[columns]').onclick = app.handlerAddColumns;
  document.querySelector('section[options] > i[filters]').onclick = app.handlerAddFilters;
  document.querySelector('section[options] > i[groupby]').onclick = app.handlerAddGroupBy;
  document.querySelector('#fact-card section[options] > i[metrics]').onclick = app.handlerAddMetrics;



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

  document.getElementById('tableSearch').oninput = function(e) {
    console.log(this.value);
    let listElement = Array.from(document.querySelectorAll('#tables > li'));

  	for (let i in listElement) {
  	  let li = listElement[i];
  	  // reset eventuali selezioni precedenti
  	  li.removeAttribute('filtered');
  	  if (li.getAttribute('label').indexOf(this.value) === -1 && li.getAttribute('label').toLowerCase().indexOf(this.value) === -1) {
        li.setAttribute('hidden', '');
  	  } else {
        li.removeAttribute('hidden');
  	  }
  	}
  };

  app.getDatabaseTable();



})();
