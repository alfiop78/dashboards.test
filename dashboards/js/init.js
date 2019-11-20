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
    activeSection : null, // indica la sezione dove si è cliccato per l'inserimento di un oggetto nella pagina
    layoutId : null,
    pageParams : new Object()

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
      // TODO: type="CUBE"
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
          // app.activeSection.setAttribute('associated-datamart', li.innerText);
          app.activeSection.setAttribute('associated-datamart-id', li.id);

          // definisco le data-section per ogni oggetto inserito nella pagina
          // il data-section identifica la sezione in cui deve esseree inserito il report/chart/indicator
          // ... lo stesso andrà a finire nell'object in localStorage nella function mdc-create-page.onclick
          let arrSections = [{'sectionId' : +app.activeSection.getAttribute('data-section'), 'reportId' : +li.id}];
          let report_section_association = arrSections;
          app.pageParams.layoutParams = report_section_association;
        };
      }


    });


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
    document.querySelectorAll('div[associated-datamart-id]').forEach((datamart) => {
      console.log(datamart);
      // TODO: implementare un'object json con la lista dei datamart da recuperare
      // ... utilizzo un solo reportId per Test
      reportId = +datamart.getAttribute('associated-datamart-id');
    });
    console.log(reportId);
    // TODO: apro la pagina con il layout definito e carico il datamart in quella pagina

    location.href = "../layouts/layout_0.html?reportId="+reportId;

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
    // verifico in quale step sono per svolegere alcune operazioni in un particolare step
    app.checkStep();

  };

  document.getElementById('mdc-create-page').onclick = function(e) {
    /*
    1 - Memorizzo in localStorage un id per la pagina con all'interno i reports in essa contenuti
    */
    let pageTitle = document.getElementById('pageTitle').value;
    let pageId;
    // TODO: verifico quante pagina ci sono in localStorage ed assegno l'id successivo a quest a pagina
    // console.log(window.localStorage);
    // recupero i nomi degli oggetti contenuto nello storage
    let objStorage = Object.keys(window.localStorage);
    objStorage.forEach((item) => {
      // verifico, per ogni oggetto se è presente il type : "PAGE"
      // console.log(item);
      // ottengo un JSON dallo storage
      let storageItem = JSON.parse(window.localStorage.getItem(item));
      // console.log(storageItem.type);
      if (storageItem.page) {pageId = storageItem.pageId+1;}
    });

    app.pageParams.pageId = pageId;
    app.pageParams.layoutId = app.layoutId;
    app.pageParams.type = "PAGE";
    window.localStorage[pageTitle] = JSON.stringify(app.pageParams);
    // apro la pagina del dashboard finale
    window.location.href = "../pages/";

  };

  app.checkStep = function() {
    let page = document.querySelector('.page[selected]');
    let stepActive = +page.getAttribute('data-step');

    switch (stepActive) {
      case 2:
        // nascondo mdc-next e visualizzo mdc-create-page disabilitato
        document.getElementById('mdc-next').hidden = true;
        document.getElementById('mdc-create-page').hidden = false;
        // event su pageTitle e pageSubtitle
        document.getElementById('pageTitle').oninput = function(e) {
          if (this.value.length > 0) {
            this.parentElement.querySelector('label').classList.add('has-content');
            document.getElementById('mdc-create-page').disabled = false;
          } else {
            this.parentElement.querySelector('label').classList.remove('has-content');
            document.getElementById('mdc-create-page').disabled = true;
          }
        };
        document.getElementById('pageSubtitle').oninput = function(e) {
          (this.value.length > 0) ?
            this.parentElement.querySelector('label').classList.add('has-content') :
            this.parentElement.querySelector('label').classList.remove('has-content');
        };
        break;
      default:

    }
    //
    // if (+page.getAttribute('data-step') === 3 && page.hasAttribute('selected')) {
    //   console.log('getDatamart');
    //   // mi sto spostando sulla pagina dell'anteprima dashboard, recupero i datamart per questa pagina
    //   app.getDatamart();
    // }
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
    app.layoutId = +this.getAttribute("data-preview-layout-id");
    console.log(app.layoutId);
    // TODO: visualizzo (dal template), nel secondo step, il layout che è stato scelto in modalità "edit" per poter definire la posizione di ogni report/chart/indicator/ecc...
    let tmplViewLayout = document.getElementById('view-layout-'+app.layoutId);
    console.log(tmplViewLayout);
    let viewLayoutContent = tmplViewLayout.content.cloneNode(true);
    let viewLayout = viewLayoutContent.querySelector("div.view-layout[data-view-layout-id='"+app.layoutId+"']");
    document.querySelector(".page[data-step='2']").appendChild(viewLayout);
  };

  // event click su preview-layout
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
