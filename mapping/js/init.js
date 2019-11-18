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
    // recupero i dati dal dataamart finale "FX"+reportId
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

  app.handlerSearchColumns = function(e) {
    console.log(e.path);
    // Ricerca delle colonne in una tabella selezionata
    (this.value.lenth > 0) ? this.parentElement.querySelector('label').classList.add('has-content') : this.parentElement.querySelector('label').classList.remove('has-content');

    let listElement = Array.from(e.path[2].querySelectorAll('#columns > .element > li'));

  	for (let i in listElement) {
  	  let li = listElement[i];
  	  (li.getAttribute('label').indexOf(this.value) === -1 && li.getAttribute('label').toLowerCase().indexOf(this.value) === -1) ?
        li.parentElement.setAttribute('hide', true) : li.parentElement.removeAttribute('hide');

  	}
  };

  app.handlerTableSelected = function(e) {
    // console.log('handlerTableSelected');
    this.toggleAttribute('selected');
    // app.Cube.activeCard = document.querySelector('.card-table[active]');
    // inserisco il nome della tabella selezionata nella card [active]
    app.Cube.table = this.getAttribute('label');

    let tmplList = document.getElementById('template-list-columns');


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
          // se ci sono poche colonne in questa tabella non attiva la input search
          if (Object.keys(response).length > 10) {
            // event #searchColumns
            app.Cube.activeCardRef.querySelector('#searchColumns').oninput = app.handlerSearchColumns;
            // visualizzo la input #searchColumns
            app.Cube.activeCardRef.querySelector('#searchColumns').parentElement.removeAttribute('hidden');
            // lego eventi ai tasti i[....] nascosti
          }

          app.Cube.activeCardRef.parentElement.querySelector('i[columns]').onclick = app.handlerAddColumns;
          app.Cube.activeCardRef.parentElement.querySelector('i[filters]').onclick = app.handlerAddFilters;
          app.Cube.activeCardRef.parentElement.querySelector('i[groupby]').onclick = app.handlerAddGroupBy;
          app.Cube.activeCardRef.parentElement.querySelector('i[metrics]').onclick = app.handlerAddMetrics;

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
    // let factTable = document.getElementById('fact-card');
    // parentElement.insertBefore(card, factTable);
    parentElement.appendChild(card);
    // lego evento click sulla card
    card.querySelector('.card-table').onclick = app.handlerCardSelected;
    card.querySelector('.icon-relation > i[add]').onclick = app.handlerAddTable;
    card.querySelector('.icon-relation > i[hierarchies]').onclick = app.handlerAddHierarchy;
    card.querySelector('.icon-relation > i[hierarchies-left]').onclick = app.handlerAddHierarchiesLeft;
    card.querySelector('.icon-relation > i[hierarchies-right]').onclick = app.handlerAddHierarchiesRight;
    card.querySelector('.icon-relation > i[hierarchies-remove]').onclick = app.handlerAddHierarchiesRemove;

  };

  app.handlerAddHierarchy = function(e) {
    // console.log(this);
    // console.log(e.path);
    // console.log(e.path[3]);
    // aggiungo l'attributo [hierarchies] alle due card (sopra-sotto)
    // recupero le due card dove in mezzo c'è questo tasto
    // elimino prima l'attributo [hierarchies] su eventuali altre card-table selezionate in precedenza
    app.Cube.changeMode();
    let upCard = e.path[3].querySelector('section.card-table');
    let downCard = (e.path[3].id === "factContainerCards") ? document.getElementById('fact') : e.path[3].nextElementSibling.querySelector('section.card-table');
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
    // NOTE: Utilizzo di for...of in una Collection
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
  // aggiungo onclick sulle icone [hierachies] per la creazione delle gerarchie
  Array.from(document.querySelectorAll('.icon-relation > i[hierarchies]')).forEach((btnHierarchies) => {
    // console.log(btnHierarchies);
    btnHierarchies.onclick = app.handlerAddHierarchy;
  });
  Array.from(document.querySelectorAll('.icon-relation > i[hierarchies-remove]')).forEach((btnHierarchiesRemove) => {
    // console.log(btnHierarchiesRemove);
    btnHierarchiesRemove.onclick = app.handlerRemoveHierarchy;
  });
  // OPTIMIZE: forse questi 2 sotto li devo mettere dopo aver definito la tabella
  document.querySelector('section[options] > i[columns]').onclick = app.handlerAddColumns;
  document.querySelector('section[options] > i[filters]').onclick = app.handlerAddFilters;
  document.querySelector('section[options] > i[groupby]').onclick = app.handlerAddGroupBy;
  document.querySelector('#fact-card section[options] > i[metrics]').onclick = app.handlerAddMetrics;

  document.getElementById('cubeName').oninput = function() {
    if (this.value.length > 0) {
      this.parentElement.querySelector('label').classList.add('has-content');
      app.Cube.cubeTitle = this.value;
      document.getElementById('saveCube').disabled = false;
    } else {
      this.parentElement.querySelector('label').classList.remove('has-content');
      document.getElementById('saveCube').disabled = true;
    }
  };

  document.getElementById('dimensionName').oninput = function() {
    if (this.value.length > 0) {
      this.parentElement.querySelector('label').classList.add('has-content');
      app.Cube.dimensionTitle = this.value;
      document.getElementById('saveDimension').disabled = false;
    } else {
      this.parentElement.querySelector('label').classList.remove('has-content');
      document.getElementById('saveDimension').disabled = true;
    }
  };

  app.cloneLastTable = function() {
    // prendo l'ultima tabella della gerarchia e la clono per inserirla nella seconda pagina, associazione con la FACT
    // ultima card nella gerarchia
    let lastTableInHierarchy = document.querySelector('.hierarchies .card:last-child .card-table');
    let lastCardRef = document.getElementById('last-card');

    let card = document.createElement('div');
    let cardLayout = document.createElement('div');
    card.classList.add("card");
    lastCardRef.appendChild(card);
    cardLayout.classList.add("card-layout");
    card.appendChild(cardLayout);
    let newCard = lastTableInHierarchy.cloneNode(true);
    cardLayout.appendChild(newCard);
    // aggiungo eventi per la selezione delle colonne
    newCard.querySelectorAll('li').forEach((li) => {
      li.onclick = app.Cube.handlerColumns.bind(app.Cube);
    });
    // evento oninput sulla searchColumns
    newCard.querySelector('#searchColumns').oninput = app.handlerSearchColumns;

  };

  document.getElementById('saveDimension').onclick = function(e) {
    /*
      Salvo la dimensione, senza il legame con la FACT.
      Clono l'ultima tabella e la inserisco a fianco della FACT per fare l'associazione.
      Salvo in localStorage la dimensione creata
      Il tasto mdc-next si trasforma in FACT TABLE
      // TODO: Visualizzo nell'elenco di sinistra la dimensione appena creata
    */

    let from = [];
    let objDimension = {};
    document.querySelectorAll('.card-table').forEach((card) => {
      if (card.getAttribute('name')) {
        from.push(card.getAttribute('name'));
        objDimension.from = from;
      }
    });

    // in app.Cube.cube.hierarchies inserisco solo la/le relazione/i tra l'ultima tabella della gerarchia e la FACT
    app.Cube.cube['hierarchies'] = app.Cube.hierarchyFact;
    let hierarchies = {};
    Object.keys(app.Cube.hierarchyTable).forEach((rel) => {if (rel.substring(0, 5) === "hier_") {hierarchies[rel] = app.Cube.hierarchyTable[rel];}});
    // ... mentre, nella dimensione inserisco solo le relazioni tra tabelle e non la relazione con la FACT
    objDimension.hierarchies = hierarchies;
    objDimension.type = "DIMENSION";
    app.Cube.dimension[app.Cube.dimensionTitle] = objDimension
    console.log(app.Cube.dimension);

    // console.log(app.Cube.cube);

    window.localStorage[app.Cube.dimensionTitle] = JSON.stringify(app.Cube.dimension)

    app.cloneLastTable();
  };

  document.getElementById('test').onclick = function(e) {
    // test per la creazione del datamart, prendendo un Cubo in localStorage
    let data = window.localStorage.getItem('KPI Sedi GLM');
    var url = "ajax/cube.php";
    // let params = "cube="+data+"&dimension="+JSON.stringify(app.Cube.dimension);
    let params = "cube="+data;
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

  document.getElementById('saveCube').onclick = function() {


    app.Cube.cube.dimensions = app.Cube.dimension;
    app.Cube.cube.type = "CUBE";
    app.Cube.cube['columns'] = app.Cube.columns;
    app.Cube.cube['filters'] = app.Cube.filters;
    app.Cube.cube['metrics'] = app.Cube.metrics;
    app.Cube.cube['filteredMetrics'] = app.Cube.filteredMetrics;
    app.Cube.cube['groupby'] = app.Cube.groupBy;
    let factTable = document.querySelector('#fact').getAttribute('name');
    app.Cube.cube['FACT'] = factTable;
    console.log(app.Cube.cube);

    let data;
    // per il momento, se non ci sono cubi creati, prendo quello in localStorage
    if (Object.keys(app.Cube.cube).length === 0) {
      data = window.localStorage.getItem('ccc');
      console.log(data);
      // data = window.localStorage.getItem('esempio classico');
      // console.log(JSON.parse(data));
    } else {
      // console.log(app.Cube.cube);
      app.Cube.cube['report_id'] = app.report_id;
      data = JSON.stringify(app.Cube.cube);
      window.localStorage[app.Cube.cubeTitle] = data;
    }

    // var data = JSON.stringify(app.Cube.cube);
    // window.localStorage.cube = data;
    // ...oppure
    // window.localStorage.setItem("cube",data);

    var url = "ajax/cube.php";
    // let params = "cube="+data+"&dimension="+JSON.stringify(app.Cube.dimension);
    let params = "cube="+data;
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

  document.getElementById('saveHierarchy').onclick = function(e) {
    // TODO: verifico se sono stati inseriti i parametri obbligatori, gerarchie,titolo del cubo




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
