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

  // let obDraw = new Draw();
  // console.log(obDraw);
  // obDraw.addColumn('Dealer');
  // obDraw.addColumn('id');
  //
  // obDraw.addRow('GLM');
  // obDraw.addRow('43');


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
          app.Draw = new Draw(table, options);
          // Opzione 1 - aggiungo tutte le colonne della query
          Object.keys(response[0]).forEach((el) => {
            // console.log('col:'+el);
            app.Draw.addColumn(el);
          });
          // Opzione 2 - aggiungo manualmetne le colonne
          // app.Draw.addColumn('ID');
          // app.Draw.addColumn('Dealer');

          // aggiungo le righe
          for (let i in response) {
            // console.log(Object.values(response[i]));
            // Opzione 1 - Aggiunta colonne automaticamente (in base alla query)
            app.Draw.addRow(Object.values(response[i]));

            // Opzione 2 - Aggiunta colonne manualmente
            // app.Draw.addRow([response[i].id, response[i].descrizione, response[i].versioneDMS, response[i].CodDealerCM]);
          }

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

  app.getData();

  document.getElementById('search').oninput = function(e) {
    console.log(this.value);
    // TODO: recupero, dalla table, le righe e le inserisco in un array per poter utilizzare indexOf
    // console.log(document.querySelectorAll('table tr[row="body"]'));
    // var table = document.getElementById('table-layout-1');
    let table = document.querySelector('table > tbody');
    // console.log(table.rows.length);
    // console.log(table.rows);
    for (let i = 0; i < table.rows.length; i++) {
      console.log(table.rows[i]);
      console.log(table.rows[i].cells[1]);
    }

    // let arr = [];
    // for (var r = 0, n = table.rows.length; r < n; r++) {
    //   for (var c = 0, m = table.rows[r].cells.length; c < m; c++) {
    //     console.log(table.rows[r].cells[c].innerHTML);
    //     // console.log(table.rows[r].cells[c]);
    //     let value = table.rows[r].cells[c].innerHTML;
    //     arr.push(value);
    //   }
    // }
    // console.log(arr);
  }


})();
