/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* funzione immediata */
var App = new Application();
(() => {
  var app = {
    Draw : null

  };

  // App.getSessionName();

  App.init();

  app.getData = function() {
    // TODO: utilizzare le promise
    var url = "/ajax/chart.php";

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          // console.log(request.response);

          var response = JSON.parse(request.response);
          // console.table(response);
          // console.log(Object.keys(response[0]).length); // quante colonne ci sono
          // console.log(Object.keys(response[0])); // colonne estratte dalla query

          // console.log(Object.keys(response[0])[0]); // nome colonna
          // console.log(Object.keys(response[0])[1]); // nome colonna
          // aggiungo le colonne
          let table = document.getElementById('table-layout-1');
          let options =
            {
            'cols' : [
              {'col': 1, 'attribute': 'hidden'}
            ],
            'filters' : [
              {'col': 0, 'attribute': 'multi'},
              {'col': 1, 'attribute': 'hidden'}
            ],
            'inputSearch' : true // visualizzo e lego evento input alla casella di ricerca, in basso.
            };
          app.Draw = new Draw(table, options);
          // Opzione 1 - aggiungo tutte le colonne della query
          Object.keys(response[0]).forEach((el, i) => {
            // console.log('col:'+el);
            app.Draw.addColumn(el, i);
            // aggiungo un filtro per ogni colonna della tabella
            app.Draw.addParams(el, i);
          });
          // Opzione 2 - aggiungo manualmetne le colonne
          // app.Draw.addColumn('ID');
          // app.Draw.addColumn('Dealer');

          // aggiungo le righe
          let arrParams = [];
          for (let i in response) {
            // console.log(Object.values(response[i]));
            // Opzione 1 - Aggiunta colonne automaticamente (in base alla query)
            app.Draw.addRow(Object.values(response[i]));
            // TODO: eliminare gli spazi bianchi prima e/o dopo il testo
            // Opzione 2 - Aggiunta colonne manualmente
            // app.Draw.addRow([response[i].id, response[i].descrizione, response[i].versioneDMS, response[i].CodDealerCM]);
          }

          app.Draw.createDatalist();
          // imposto, nel metodo draw, anche le options, per cui questa riga deve essere messa prima dell'aggancio degli eventi sulle input (sotto)
          app.Draw.draw();

          document.querySelectorAll('input[type="search"]:not([id="search"])').forEach((el) => {
            el.oninput = app.handlerInput;
            el.onclick = app.showFilters;
            el.onblur = function(e) {this.removeAttribute('placeholder');};

            el.parentElement.querySelectorAll('.elements:not([multi]) > ul div.element').forEach((liElement) => {liElement.onclick = app.handlerSelect;});
            el.parentElement.querySelectorAll('.elements[multi] > ul div.element').forEach((liElement) => {liElement.onclick = app.handlerSelectMulti;});
          });



        } else {

        }
      } else {

      }
    };

    request.open('POST', url);
    request.setRequestHeader('Content-Type','application/json');
    request.send();
  };

  app.handlerInput = function(e) {
    // console.log('input');
    // console.log(this);
    let parentElement = e.path[1];
    let label = parentElement.querySelector('label');
    if (this.value.length > 0) {
      parentElement.setAttribute('activated', true);
      this.setAttribute('activated', true);
      label.classList.add('has-content');
    } else {
      this.removeAttribute('activated');
      parentElement.removeAttribute('activated');
      label.classList.remove('has-content');
    }
    let cols = [];
    let filters = Array.from(document.querySelectorAll("input[type='search'][activated]"));
    filters.forEach(function(item) {
      cols[+item.getAttribute('data-param-id')] = item.value;
    });
    // mentre digito filtro l'elenco degli elementi <li>
    let liElement = parentElement.querySelectorAll('ul > li:not([hidden])');
    // console.log(liElement);
    liElement.forEach((el) => {
      let label = el.getAttribute('label');
      (label.indexOf(this.value.toUpperCase()) !== -1) ? el.removeAttribute('hidden') : el.hidden = true;
    });
    app.Draw.search(cols);

  };

  app.handlerSelectMulti = function(e) {
    let elements = e.path[4];
    this.parentElement.setAttribute('selected', true);
    // cerco il tasto OK per legare l'evento click
    let btnOk = elements.querySelector('section > button');
    btnOk.onclick = app.handlerMultiBtn;
  };

  app.handlerMultiBtn = function(e) {
    console.log(this);
  };

  app.handlerSelect = function(e) {
    console.log(this);
    let parentElement = e.path[5];
    let liElement = e.path[1].querySelector('li');
    let input = parentElement.querySelector('input');
    let label = parentElement.querySelector('label');
    input.value = liElement.getAttribute('label');
    if (input.value.length > 0) {
      parentElement.setAttribute('activated', true);
      input.setAttribute('activated', true);
      label.classList.add('has-content');
    } else {
      label.classList.remove('has-content');
    }

    let cols = [];
    let filters = Array.from(document.querySelectorAll("input[type='search'][activated]"));
    filters.forEach(function(item) {
      cols[+item.getAttribute('data-param-id')] = item.value;
    });
    app.Draw.search(cols);
  };

  app.showFilters = function(e) {
    e.path[1].querySelector('div.elements').toggleAttribute('show');
    this.setAttribute('placeholder', 'Search...');
  };

  app.getData();

  document.getElementById('search').oninput = function(e) {
    (this.value.length > 0) ? this.parentElement.querySelector('label').classList.add('has-content') : this.parentElement.querySelector('label').classList.remove('has-content');
    // console.log(this.value.toUpperCase());
    // recupero, dalla table, le righe e le celle, successivamente inserisco le celle in un array per poter utilizzare indexOf su ogni singolo carattere contenuto nella row
    // NOTE: se si vuole far in modo da ricercare l'esatta occorrenza (inserendo tutta la parola) bisogna eliminare [n] da cells[n] nell'indexOf
    // console.log(document.querySelectorAll('table tr[row="body"]'));
    // var table = document.getElementById('table-layout-1');
    let table = document.querySelector('table > tbody');
    // console.log(table.rows.length);
    // console.log(table.rows);
    for (let i = 0; i < table.rows.length; i++) {
      let founded = false;
      // console.log(table.rows[i]);
      // console.log(table.rows[i].cells[1]);
      table.rows[i].style.backgroundColor = "initial"; // reimposto il colore iniziale dopo ogni carattere inserito
      table.rows[i].removeAttribute('found');
      table.rows[i].removeAttribute('hidden');

      let cells = [];
      for (let n = 0; n < table.rows[i].cells.length; n++) {
        // console.log(table.rows[i].cells[n].innerText);
        // ... oppure ...
        // console.log(table.rows[i].cells.item(n).innerText);
        cells.push(table.rows[i].cells[n].innerText);

        // arrayTableContent.push(table.rows[i].cells[n].innerText);
        if (cells[n].indexOf(this.value.toUpperCase()) !== -1) {
          // console.log(table.rows[i]);
          // console.log(i);
          // console.log('trovata');
          founded = true;
        }
      }
      (founded) ? table.rows[i].setAttribute('found', true) : table.rows[i].hidden = true;
    }

  };

})();
