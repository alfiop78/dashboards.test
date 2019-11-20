/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* funzione immediata */
var App = new Application();
(() => {
  var app = {
    // Cube : new Cube(),
    Draw : null
  };

  // App.getSessionName();

  App.init();

  app.getDatamart = function() {
    var url = "ajax/reports.php";
    // let params = "reportId="+reportId;
    // console.log(params);
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          console.table(response);
          app.createReport(response);

        } else {

        }
      } else {

      }
    };

    request.open('POST', url);
    request.setRequestHeader('Content-Type','application/json');
    // request.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    request.send();
  };

  app.loadLayoutTemplate = function() {

  };

  app.loadLayoutTemplate();


  app.getDatamart();

  app.createReport = function(response) {
    console.log('create report');

    let table = document.getElementById('table-01');

    console.log(response);
    // return;

    let options =
      {
      'cols' : [
        // {'col': 3, 'attribute': 'hidden'},
        // {'col': 5, 'attribute': 'hidden'}

      ],
      'filters' : [
        {'col': 0, 'attribute': 'multi'},
        // {'col': 1, 'attribute': 'multi'},
        {'col': 3, 'attribute': 'hidden'}
      ],
      'metrics' : [2,3], // TODO: le metriche vanno nascoste nei filtri e formattate in modo diverso nella table
      // 'title' : app.Cube.cube.name,
      'inputSearch' : true // visualizzo e lego evento input alla casella di ricerca, in basso.
      };
    app.Draw = new Draw(table, options);
    // console.log(app.Draw);
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
    // in draw vengono impostate le option e gli eventi sui filtri semplici e multi selezione
    app.Draw.draw();

  };

})();
