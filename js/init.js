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
              {'col': 0, 'hidden': true},
              {'col': 1, 'hidden': false}
            ],
            'inputSearch' : true // visualizzo e lego evento input alla casella di ricerca, in basso.
            };
          app.Draw = new Draw(table, options, response);
          // Opzione 1 - aggiungo tutte le colonne della query
          Object.keys(response[0]).forEach((el, i) => {
            // console.log('col:'+el);
            app.Draw.addColumn(el);
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

          document.querySelectorAll('input[list]').forEach((el) => {
            // console.log(el);
            // NOTE: è possibile utilizzare entrambe le sintassi, con addEventListener o senza
            el.onchange = app.handlerParams;
            // el.addEventListener('change', app.handlerParams, true);
            // el.addEventListener('mousedown', e => {
            //   e.target.value = '';
            //   e.target.removeAttribute('activated');
            // });
            // evento click su icona cancel
            el.parentElement.querySelector('span > i').onclick = app.handlerCancel;
          });

          app.Draw.draw();

        } else {

        }
      } else {

      }
    };

    request.open('POST', url);
    request.setRequestHeader('Content-Type','application/json');
    request.send();
  };

  app.handlerCancel = function(e) {
    // console.log(this);
    // console.log(e.path[2].querySelector('input'));
    e.path[2].querySelector('input').value = '';
    e.path[2].querySelector('label').classList.remove('has-content');
    e.path[2].querySelector('input').removeAttribute('activated');

    let cols = [];
    let filters = Array.from(document.querySelectorAll("input[list][activated]"));

    filters.forEach(function(item) {
      cols[+item.getAttribute('data-param-id')] = item.value;
    });

    app.Draw.search(cols);
  };

  app.handlerParams = function(e) {
    if (this.value.length > 0) {
      e.path[1].querySelector('label').classList.add('has-content');
      this.setAttribute('activated', true);
    } else {
      e.path[1].querySelector('label').classList.remove('has-content');
    }

    // recupero tutte le datalist impostate e le passo alla function search per cercare in base a TUTTI i filtri impostati
    console.log(this.id);
    let cols = [];
    let filters = Array.from(document.querySelectorAll("input[list][activated]"));

    filters.forEach(function(item) {
      cols[+item.getAttribute('data-param-id')] = item.value;
    });

    app.Draw.search(cols);
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
