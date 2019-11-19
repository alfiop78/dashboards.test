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
    Draw : null,
    report_id : 0,
    reports : new Object(),
    dialog : document.getElementsByTagName('dialog')[0],
    activeSection : null // indica la sezione dove si è cliccato per l'inserimento di un oggetto nella pagina

  };

  // App.getSessionName();

  App.init();

  app.getDatamarts = function() {
    /*recupero lista reports creati dal localStorage*/
    // console.log(window.localStorage);
    let reports = Object.keys(window.localStorage);
    // console.log(reports);
    // console.log(reports.length);
    app.report_id = reports.length+1;
    // console.log(app.report_id);
    let ulDatamartList = document.getElementById('datamartList');
    reports.forEach((report) => {
      // console.log(JSON.parse(window.localStorage.getItem(report)));
      let cube = JSON.parse(window.localStorage.getItem(report));
      let li = document.createElement('li');
      console.log(cube.type);
      if (cube.type) {
        li.id = cube.report_id;
        li.innerHTML = report;
        ulDatamartList.appendChild(li);
        li.onclick = function(e) {
          /*
          1- Inserisco il nome del datamart(Report) selezionato in lyt-report
          */
          app.activeSection.querySelector('h5').innerText = li.innerHTML;
          app.dialog.close();
          // sezione già occupata dall'oggetto (report, chart, indicator, ecc...) appena selezionato
          app.activeSection.setAttribute('associated-datamart', li.innerText);
          app.activeSection.setAttribute('associated-datamart-id', li.id);
        };
      }


    });

    // data = window.localStorage.getItem('cube');

  };

  app.handlerAddObject = function(e) {
    /*
    Apro la dialog per selezionare l'oggetto (report o grafico, indicatori, ecc...) da incorporare nella pagina
    */
    console.log(this);
    app.activeSection = e.path[2];
    app.dialog.showModal();
  };

  app.getDatamart = function() {
    /* Lista dei reportId (FXn) da recuperare*/
    let reportId;
    document.querySelectorAll('div[associated-datamart]').forEach((datamart) => {
      console.log(datamart);
      // TODO: implementare un'object json con la lista dei datamart da recuperare
      // ... utilizzo un solo reportId per Test
      reportId = +datamart.getAttribute('associated-datamart-id');
    });
    console.log(reportId);


    var url = "ajax/reports.php";
    let params = "reportId="+reportId;
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

  document.getElementById('mdc-next').onclick = function(e) {
    // pagina attiva in questo momento
    let selectedPage = document.querySelector('.page[selected]');
    selectedPage.removeAttribute('selected');
    // pagina da attivare
    let page = selectedPage.nextElementSibling;
    page.setAttribute('selected', true);
    let pages = document.getElementById('pages');
    pages.setAttribute('data-step', page.getAttribute('data-step'));
    // app.getData();
    // event su addObjectIcon nelle preview del dashboard
    document.querySelectorAll('.page[selected] .addObjectIcon > i').forEach((btnAdd) => {btnAdd.onclick = app.handlerAddObject;});

    if (+page.getAttribute('data-step') === 3 && page.hasAttribute('selected')) {
      console.log('getDatamart');
      // mi sto spostando sulla pagina dell'anteprima dashboard, recupero i datamart per questa pagina
      app.getDatamart();
    }

  };

  document.getElementById('mdc-back').onclick = function(e) {
    // pagina attiva in questo momento
    let selectedPage = document.querySelector('.page[selected]');
    selectedPage.removeAttribute('selected');
    // pagina da attivare
    let page = selectedPage.previousElementSibling;
    page.setAttribute('selected', true);
    let pages = document.getElementById('pages');
    pages.setAttribute('data-step', page.getAttribute('data-step'));
  };

  app.handlerPreviewLayoutSelected = function(e) {
    /* Layout selezionato (1 pagina) */
    console.log(e.target);
    console.log(this);
    let layoutId = +this.getAttribute("data-preview-layout-id");
    console.log(layoutId);
    // TODO: visualizzo (dal template), nel secondo step, il layout che è stato scelto in modalità "edit" per poter definire la posizione di ogni report/chart/indicator/ecc...
    let tmplViewLayout = document.getElementById('view-'+layoutId);
    console.log(tmplViewLayout);
    let viewLayoutContent = tmplViewLayout.content.cloneNode(true);
    let viewLayout = viewLayoutContent.querySelector("div.view-layout[data-id='"+layoutId+"']");
    document.querySelector(".page[data-step='2']").appendChild(viewLayout);


  };

  // event click supreview-layout
  document.querySelectorAll('.preview-layout').forEach((layout) => {layout.onclick = app.handlerPreviewLayoutSelected;});

  app.getDatamarts();

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
