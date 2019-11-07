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
    Draw : null,
    tableSelected : null,
    columnsSelected : [],
    dialogTableList : document.getElementById('table-list'),
    report_id : 0,
    reports : new Object()

  };

  // App.getSessionName();

  App.init();

  app.handlerReportSelected = function(e) {
    console.log(this);
    console.log(this.id);
    var url = "ajax/reports.php";
    let params = "reportId="+this.id;
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

  app.getReportsList = function() {
    /*recupero lista reports creati dal localStorage*/
    // console.log(window.localStorage);
    let reports = Object.keys(window.localStorage);
    // console.log(reports);
    // console.log(reports.length);
    app.report_id = reports.length+1;
    // console.log(app.report_id);
    let ulReportList = document.getElementById('reportsList');
    reports.forEach((report) => {
      // console.log(JSON.parse(window.localStorage.getItem(report)));
      let cube = JSON.parse(window.localStorage.getItem(report));
      let li = document.createElement('li');
      li.id = cube.report_id;
      li.innerHTML = report;
      ulReportList.appendChild(li);
      li.onclick = app.handlerReportSelected;
    });

    // data = window.localStorage.getItem('cube');

  };

  app.getDatabaseTable = function() {
    // TODO: utilizzare le promise
    var url = "ajax/database.php";

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          // console.table(response);

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
    // app.Cube.activeCard = document.querySelector('.card-table[active]');
    // inserisco il nome della tabella selezionata nella card [active]
    app.Cube.table = this.getAttribute('label');
    let tmplList;
    // se è stata selezionata la fact-table aggiungo il template che ha, al suo interno, anche le metrics
    (app.Cube.activeCardRef.getAttribute('fact-table') !== null) ? tmplList = document.getElementById('template-list-fact-columns') :
      tmplList = document.getElementById('template-list-columns');


    // let ulContainer = document.getElementById('columns');
    let ulContainer = app.Cube.activeCard.querySelector('#columns');
    // pulisco l'elenco delle colonne in base alla selezione della tabella
    ulContainer.querySelectorAll('.element').forEach((el) => {ulContainer.removeChild(el);});
    app.dialogTableList.close();

    var url = "ajax/tableInfo.php";
    let params = "tableName="+app.Cube.table;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          // console.table(response);

          for (let i in response) {
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
          // TODO: lego eventi ai tasti i[....] nascosti

          app.Cube.activeCardRef.parentElement.querySelector('i[columns]').onclick = app.handlerAddColumns;
          app.Cube.activeCardRef.parentElement.querySelector('i[filters]').onclick = app.handlerAddFilters;
          app.Cube.activeCardRef.parentElement.querySelector('i[groupby]').onclick = app.handlerAddGroupBy;

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
    // console.log('handlerCardSelected');
    // se il viene avviene sull'elemento h5 apro la dialog
    if (e.target.localName === "h5") {app.dialogTableList.showModal();}
    app.Cube.activeCard = this;
    // rimuovo l'attriubto active dalla card-table attiva
    document.querySelector('.card-table[active]').removeAttribute('active');

    this.setAttribute('active', true);
  };

  document.querySelectorAll('.card-table').forEach((card) => {
    // console.log(card);
    card.onclick = app.handlerCardSelected;
  });

  app.handlerAddTable = function(e) {
    // console.log(this);
    // aggiungo un'altra tabella alla gerarchia
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
    card.querySelector('.icon-relation > i[hierarchies-left]').onclick = app.handlerAddHierarchiesLeft;
    card.querySelector('.icon-relation > i[hierarchies-right]').onclick = app.handlerAddHierarchiesRight;
    card.querySelector('.icon-relation > i[hierarchies-remove]').onclick = app.handlerAddHierarchiesRemove;

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
    // for (let name of upCard.getAttributeNames()) {
    //   if (name === 'filters' || name === 'columns') {upCard.removeAttribute(name);}
    // }
  };

  app.handlerAddColumns = function(e) {
    // console.log(this);

    app.Cube.changeMode();
    let upCard = e.path[3].querySelector('section.card-table');
    app.Cube.activeCard = upCard;
    let help = upCard.querySelector('.help');
    help.innerHTML = "Seleziona le colonne da mettere nel corpo della tabella";
    upCard.setAttribute('columns', true);
    // NOTE: esempio utilizzo di for...of
    // for (let name of upCard.getAttributeNames()) {
    //   // let value = upCard.getAttribute(name);
    //   // console.log(name);
    //   if (name === 'hierarchies' || name === 'filters') {upCard.removeAttribute(name);}
    // }
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

  document.getElementById('cubeTitle').oninput = function() {
    if (this.value.length > 0) {
      this.parentElement.querySelector('label').classList.add('has-content');
      app.Cube.cubeTitle = this.value;
    } else {
      this.parentElement.querySelector('label').classList.remove('has-content');
    }
  };

  document.getElementById('saveHierarchy').onclick = function(e) {
    // verifico se sono stati inseriti i parametri obbligatori, gerarchie,titolo del cubo
    // if (!app.Cube.title) {return;}
    // if (Object.keys(app.Cube.hierarchy).length === 0) {
    //   console.log('gerarchie non inserite');
    //   return;
    // }

    // app.Cube.cube['title'] = app.Cube.title;
    // recupero le tabelle per la clausola FROM
    // console.log(app.Cube);

    let from = [];
    document.querySelectorAll('.card-table').forEach((card) => {
      console.log(card);
      if (card.getAttribute('name')) {
        from.push(card.getAttribute('name'));
        app.Cube.cube['from'] = from;
      }
    });


    if (Object.keys(app.Cube.hierarchy).length > 0) {
      app.Cube.cube['hierarchy'] = app.Cube.hierarchy;
      // let hierarchies = Object.keys(app.Cube.hierarchy);
      let dimensions = [];

      Object.keys(app.Cube.hierarchy).forEach((rel) => {
        // console.log(rel);
        if (rel.substring(0, 5) === "hier_") {
          // console.log('trovata hier : '+ rel);
          // console.log(app.Cube.hierarchy[rel]);
          app.Cube.dimension['dimName'] = 'NomeDimensione';
          dimensions[rel] = app.Cube.hierarchy[rel];
          // dimensions.push(app.Cube.hierarchy[rel]);
        }
      });
      app.Cube.dimension['hierarchies'] = dimensions;
      // console.log(app.Cube);
    }

    if (Object.keys(app.Cube.columns).length > 0) {
      app.Cube.cube['columns'] = app.Cube.columns;
      app.Cube.dimension['columns'] = app.Cube.columns;
    }

    if (Object.keys(app.Cube.filters).length > 0) {app.Cube.cube['filters'] = app.Cube.filters;}
    if (Object.keys(app.Cube.metrics).length > 0) {app.Cube.cube['metrics'] = app.Cube.metrics;}
    if (Object.keys(app.Cube.groupBy).length > 0) {app.Cube.cube['groupby'] = app.Cube.groupBy;}

    // console.log(app.Cube.cube);



    // console.log(Object.keys(app.Cube.cube).length);
    let data;

    // per il momento, se non ci sono cubi creati, prendo quello in localStorage
    if (Object.keys(app.Cube.cube).length === 0) {
      data = window.localStorage.getItem('esempio classico');
      // console.log(JSON.parse(data));
    } else {
      console.log(app.Cube.cube);
      app.Cube.cube['name'] = app.Cube.cubeTitle;
      app.Cube.cube['report_id'] = app.report_id;
      data = JSON.stringify(app.Cube.cube);
      window.localStorage[app.Cube.cube.name] = data;
    }


    // return;

    // TODO: inserire qui il nome del Cubo da mostrare nella pagina e associare a questo nome, in app.Cube anche il datamart che verrà creato in php

    // console.log(data);

    // var data = JSON.stringify(app.Cube.cube);
    // window.localStorage.cube = data;
    // ...oppure
    // window.localStorage.setItem("cube",data);


    var url = "ajax/cube.php";
    let params = "data="+data;
    // console.log(params);
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          console.table(response);
          // app.createReport(response);

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

  app.handlerFunctionMetricList = function(e) {
    // console.log(this);
    // questo elenco deve avere sempre almeno un elemento selezionato
    if (this.hasAttribute('selected')) {return;}
    document.querySelectorAll('#function-list li').forEach((li) => {li.removeAttribute('selected');});
    this.toggleAttribute('selected');
  };

  document.querySelectorAll('#function-list li').forEach((li) => {
    li.onclick = app.handlerFunctionMetricList;
  });

  app.handlerFunctionOperatorList = function(e) {
    // console.log(this);
    // questo elenco deve avere sempre almeno un elemento selezionato
    if (this.hasAttribute('selected')) {return;}
    document.querySelectorAll('#operator-list li').forEach((li) => {li.removeAttribute('selected');});
    this.toggleAttribute('selected');
  };

  document.querySelectorAll('#operator-list li').forEach((li) => {
    li.onclick = app.handlerFunctionOperatorList;
  });

  /* gestione scorrimento layout orizzontale

    // document.getElementById('mdc-next').onclick = function(e) {
    //   // recupero la left dello step successivo
    //   let structure = document.getElementById('structure-test');
    //   let step = structure.querySelector('.steps');
    //   let steps = Array.from(step.querySelectorAll(':scope > div:not(:last-child)'));
    //   console.log(steps);
    //   let left = [];
    //   let activeStep = +step.getAttribute('active-step');
    //   // inserisco in un array tutte le posizioni degli elementi che dovrò translare
    //   steps.forEach((content) => {
    //     left.push(-content.offsetLeft+"px");
    //   });
    //   // se non ci sono più elementi da translare non faccio il translalte
    //   if (activeStep < left.length-1) {
    //     step.style.transform = "translateX("+left[activeStep+1]+")";
    //     step.setAttribute('active-step', activeStep+1);
    //   }
    // };
    //
    // document.getElementById('mdc-back').onclick = function(e) {
    //   let structure = document.getElementById('structure-test');
    //   let step = structure.querySelector('.steps');
    //   let steps = Array.from(step.querySelectorAll('div:not(:last-child)'));
    //
    //   let left = [];
    //   let activeStep = +step.getAttribute('active-step');
    //
    //   steps.forEach((content) => {
    //     left.push(-content.offsetLeft+"px");
    //   });
    //   // se non ci sono più elementi da translare non faccio il translalte
    //   if (activeStep > 0) {
    //     step.style.transform = "translateX("+left[activeStep-1]+")";
    //     step.setAttribute('active-step', activeStep-1);
    //   }
    // };
  */
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

  document.getElementById('tableSearch').oninput = function(e) {
    // console.log(this.value);
    (this.value.length > 0) ? e.path[1].querySelector('label').classList.add('has-content') : e.path[1].querySelector('label').classList.remove('has-content');
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

  app.getReportsList();

  /**
  funzioni che facevano parte di /js/init.js
  */
  app.createReport = function(response) {
    console.log('create report');

    let table = document.getElementById('table-01');

    let options =
      {
      'cols' : [
        // {'col': 3, 'attribute': 'hidden'},
        {'col': 5, 'attribute': 'hidden'}

      ],
      'filters' : [
        {'col': 0, 'attribute': 'multi'},
        {'col': 1, 'attribute': 'multi'},
        {'col': 3, 'attribute': 'hidden'}
      ],
      'metrics' : [2,3], // TODO: le metriche vanno nascoste nei filtri e formattate in modo diverso nella table
      'title' : app.Cube.cube.name,
      'inputSearch' : true // visualizzo e lego evento input alla casella di ricerca, in basso.
      };
    app.Draw = new Draw(table, options);
    console.log(app.Draw);
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
      el.onblur = function(e) {
        // console.log(e);
        this.removeAttribute('placeholder');
      };
      let elementsSelected = Array.from(el.parentElement.querySelectorAll('.elements:not([multi]) > ul div.element'));

      el.parentElement.querySelectorAll('.elements:not([multi]) > ul div.element').forEach((liElement) => {liElement.onclick = app.handlerSelect;});
      el.parentElement.querySelectorAll('.elements[multi] > ul div.element').forEach((liElement) => {liElement.onclick = app.handlerSelectMulti;});
    });
  };

  app.getData = function() {
    // TODO: utilizzare le promise
    var url = "/ajax/table.php";
    console.log('getData');

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
          let table = document.getElementById('table-01');

          let options =
            {
            'cols' : [
              {'col': 3, 'attribute': 'hidden'},
              {'col': 5, 'attribute': 'hidden'}

            ],
            'filters' : [
              {'col': 0, 'attribute': 'multi'},
              {'col': 1, 'attribute': 'multi'},
              {'col': 3, 'attribute': 'hidden'}
            ],
            'metrics' : [6], // TODO: le metriche vanno nascoste nei filtri e formattate in modo diverso nella table
            'title' : 'Free Courtesy',
            'inputSearch' : true // visualizzo e lego evento input alla casella di ricerca, in basso.
            };
          app.Draw = new Draw(table, options);
          console.log(app.Draw);
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
          App.init();

          document.querySelectorAll('input[type="search"]:not([id="search"])').forEach((el) => {
            el.oninput = app.handlerInput;
            el.onclick = app.showFilters;
            el.onblur = function(e) {
              // console.log(e);
              this.removeAttribute('placeholder');
            };
            let elementsSelected = Array.from(el.parentElement.querySelectorAll('.elements:not([multi]) > ul div.element'));

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

  // TODO: QUESTE FUNZIONI LE DOVRO' AGGIUNGERE ALLA CLASSE COME METODI
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
      app.Draw.search();
    }

    // mentre digito filtro l'elenco degli elementi <li>
    let liElement = parentElement.querySelectorAll('ul > .elementContent li');
    liElement.forEach((el) => {
      let label = el.getAttribute('label');
      // imposto hidden su elementContent e non su li
      let elementContent = el.parentElement.parentElement;
      (label.indexOf(this.value.toUpperCase()) !== -1) ? elementContent.removeAttribute('hidden') : elementContent.hidden = true;
    });

  };

  app.handlerSelectMulti = function(e) {
    let elements = e.path[4];
    this.parentElement.toggleAttribute('selected');
    // cerco il tasto OK per legare l'evento click
    let btnOk = elements.querySelector('section > button');
    btnOk.onclick = app.handlerMultiBtn;
  };

  app.handlerMultiBtn = function(e) {
    // console.log(this);
    // console.log(e.path);
    // console.log(e.path[2]);
    let parentElement = e.path[3]; // md-field
    let elements = parentElement.querySelector('.elements[show]');
    let input = parentElement.querySelector('input');
    let label = parentElement.querySelector('label');
    let liSelected = Array.from(parentElement.querySelectorAll('.elementContent[selected] > .element > li'));
    if (liSelected.length > 0) {
      parentElement.setAttribute('activated', true);
      input.setAttribute('activated', true);
      label.classList.add('has-content');
      input.value = "[MULTISELECT]";
    } else {
      label.classList.remove('has-content');
    }
    app.Draw.search();
    elements.removeAttribute('show');

  };

  app.handlerSelect = function(e) {
    console.log('handlerSelect');
    console.log(this);
    let parent = e.path[5]; // md-field
    let liElement = e.path[1].querySelector('li');
    let input = parent.querySelector('input');
    let label = parent.querySelector('label');
    input.value = liElement.getAttribute('label');
    if (input.value.length > 0) {
      parent.setAttribute('activated', true);
      input.setAttribute('activated', true);
      label.classList.add('has-content');
    } else {
      label.classList.remove('has-content');
    }

    app.Draw.search();
  };

  app.showFilters = function(e) {
    // verifico prima se ci sono altre dropdown aperte, le chiudo.
    document.querySelectorAll('div.elements[show]').forEach((elementsShow) => {
      elementsShow.removeAttribute('show');
    });
    // apro la dropdown
    e.path[1].querySelector('div.elements').toggleAttribute('show');
    this.setAttribute('placeholder', 'Search...');
  };
  /**
  funzioni che facevano parte di /js/init.js
  */



})();
