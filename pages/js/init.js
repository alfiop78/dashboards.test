/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* funzione immediata */
var App = new Application();
(() => {
  var app = {
    Draw : null,
    pageParams : Object.keys(window.localStorage)
  };
  // console.log(app.pageParams);

  app.handlerPageSelect = function(e) {
    var url = "ajax/reports.php";
    console.log(this.getAttribute('data-layout-reportid-id'));
    let reportId = this.getAttribute('data-layout-reportid-id');
    let params = "reportId="+reportId;
    // visualizzo il template relativo al layout selezionato
    console.log(this);
    app.loadLayoutTemplate(this.getAttribute('data-layout-id'));
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
    // request.setRequestHeader('Content-Type','application/json');
    request.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    request.send(params);
  };

  // visualizzo elenco delle pagine sulla sinistra
  let ulPages = document.getElementById('pages');
  app.pageParams.forEach((item) => {
    // console.log(item);
    let storageObject = JSON.parse(window.localStorage.getItem(item));
    // console.log(storageObject.type);
    if (storageObject.type === "PAGE") {
      let tmplMenuElement = document.getElementById('menuElement');
      let menuElement = tmplMenuElement.content.cloneNode(true);
      let element = menuElement.querySelector('a');
      let nav = document.getElementsByTagName('nav')[0];
      let span = element.querySelector('span');
      span.innerText = item;
      element.setAttribute('data-layout-id', storageObject.layoutId);
      element.id = storageObject.pageId;

      storageObject.layoutParams.forEach((params) => {
        for (let i in Object.keys(params)) {
          let propertyName = Object.keys(params)[i];
          let propertyValue = Object.values(params)[i];
          element.setAttribute("data-layout-"+propertyName+"-id", propertyValue);
        }
      });
      nav.appendChild(element);
      element.onclick = app.handlerPageSelect;




      // let li = document.createElement('li');
      // li.innerText = item;
      // li.id = storageObject.pageId;
      // li.setAttribute('data-layout-id', storageObject.layoutId);
      // storageObject.layoutParams.forEach((params) => {
      //   for (let i in Object.keys(params)) {
      //     let propertyName = Object.keys(params)[i];
      //     let propertyValue = Object.values(params)[i];
      //     li.setAttribute("data-layout-"+propertyName+"-id", propertyValue);
      //   }
      //
      // });
      //
      // ulPages.appendChild(li);
      // li.onclick = app.handlerPageSelect;
    }

  });

  app.loadLayoutTemplate = function(layoutId) {
    console.log('load Template');
    // visualizzo il template con layout-id = layoutId
    let tmplLayout = document.getElementById('layout-'+layoutId);
    let layoutContent = tmplLayout.content.cloneNode(true);
    let layout = layoutContent.querySelector("div.layout[data-layout-id='"+layoutId+"']");
    document.getElementById('body').appendChild(layout);
  };

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



  // App.getSessionName();

  App.init();

})();
