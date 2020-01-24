/* global Application, Cube, Timeline, Page, DimensionStorage, CubeStorage */
// TODO: Nelle input di ricerca all'interno delle tabelle modificarle in input type='search'
// TODO: aggiungere le popup sulle icone all'interno della tabella
var App = new Application();
var oCube = new Cube();
// TODO: dichiarare qui le altre Classi
(() => {
  var app = {
    TimelineHier : new Timeline('layout-timeline-0'),
    TimelineFact : new Timeline('layout-timeline-1'),
    // passo al Costruttore il contenitore di tutte le page
    Page : new Page(document.getElementById('pages')),
    dialogTableList : document.getElementById('table-list'),
    dialogCubeName : document.getElementById('cube-name'),
    dialogDimensionName : document.getElementById('dimension-name'),
    dialogHierarchyName : document.getElementById('hierarchy-name'),
    dialogReportList : document.getElementById('dialog-report-list'),
    dialogFilters : document.getElementById('filter-setting'),
    btnFact : document.getElementById('mdc-next'),
    btnBack : document.getElementById('mdc-back'),
    btnNewReport: document.getElementById('mdc-new-report'),
    btnPreviewReport : document.getElementById('mdc-preview-report'),
    inputValueSearch : document.getElementById('valuesSearch'),
    btnColumnValues : document.getElementById('btnColumnValues')
  };

  // App.getSessionName();

  App.init();

  app.getDimensionsList = function() {
    // recupero la lista delle dimensioni in localStorage, il Metodo getDimension restituisce un array
    let ul = document.getElementById('dimensionsList');
    const dimension = new DimensionStorage();
    dimension.getDimensionsList().forEach((name) => {
      // console.log(name);
      let element = document.createElement('div');
      element.classList.add('element');
      let li = document.createElement('li');
      li.innerText = name;
      li.setAttribute('label', name);
      ul.appendChild(element);
      element.appendChild(li);
      // TODO: legare evento onclick, alla selezione di una dimensione vado a creare la struttura gerarchica a fianco
    });
  };

  app.getDatamartList = function() {
    let ul = document.getElementById('cubesList');
    const storage = new CubeStorage();
    storage.list.forEach((cube) => {
      // console.log(name);
      let element = document.createElement('div');
      element.classList.add('element');
      let li = document.createElement('li');
      li.innerText = cube.key;
      li.id = cube.cubeId;
      li.setAttribute('label', cube.key);
      ul.appendChild(element);
      element.appendChild(li);
      li.onclick = app.handlerCubeSelected;
    });
  };

  app.handlerCubeSelected = function(e) {
    // TODO: stabilire quale attività far svolgere quando si clicca sul nome del report/cubo
    // ricreo un datamart

    let data = window.localStorage.getItem(this.getAttribute('label'));
    var url = 'ajax/cube.php';
    // let params = "cube="+data+"&dimension="+JSON.stringify(oCube.dimension);
    let params = 'cube='+data;
    console.log(params);
    // return;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          console.table(response);
          // TODO: dovrò personalizzare il report, impostando le colonne da nascondere, quali sono le colonne, quali le metriche, ecc...
          app.dialogReportList.close();
          document.getElementById('mdc-preview-report').disabled = false;
          // TODO: vado sullo step 2

        } else {
          // TODO:
        }
      } else {
        // TODO:

      }
    };

    request.open('POST', url);
    // request.setRequestHeader('Content-Type','application/json');
    request.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    request.send(params);

    // console.log(this.getAttribute('label'));

    // let reportName = this.getAttribute('label');
    //
    // // recupero un datamart FX... già creato e visualizzo l'anteprima
    // var url = "ajax/reports.php";
    // let reportId = this.getAttribute('id');
    // let params = "reportId="+reportId;
    //
    // // console.log(params);
    // var request = new XMLHttpRequest();
    // request.onreadystatechange = function() {
    //   if (request.readyState === XMLHttpRequest.DONE) {
    //     if (request.status === 200) {
    //       var response = JSON.parse(request.response);
    //       console.table(response);
    //       // abilito il tasto btnPreviewReport
    //       app.btnPreviewReport.disabled = false;
    //       // app.createReport(response, oStorage.getJSONCube(reportName));
    //       app.dialogReportList.close();
    //
    //     } else {
    //       // TODO:
    //     }
    //   } else {
    //     // TODO:
    //   }
    // };
    //
    // request.open('POST', url);
    // // request.setRequestHeader('Content-Type','application/json');
    // request.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    // request.send(params);
  };

  app.getDatabaseTable = function() {
    // TODO: utilizzare le promise
    var url = 'ajax/database.php';

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          // console.table(response);

          let ul = document.getElementById('tables');
          // console.log(ulContainer);

          for (let i in response) {
            let element = document.createElement('div');
            element.classList.add('element');
            let li = document.createElement('li');
            li.setAttribute('label', response[i][0]);
            li.innerText = response[i][0];
            li.id = i;
            ul.appendChild(element);
            element.appendChild(li);
            li.onclick = app.handlerTableSelected;
          }

        } else {
          // TODO:
        }
      } else {
        // TODO:

      }
    };

    request.open('POST', url);
    request.setRequestHeader('Content-Type','application/json');
    request.send();
  };

  app.handlerTableSelected = function() {
    // console.log('handlerTableSelected');
    this.toggleAttribute('selected');
    // oCube.activeCard = document.querySelector('.card-table[active]');
    // inserisco il nome della tabella selezionata nella card [active]
    oCube.table = this.getAttribute('label');

    let tmplList = document.getElementById('template-list-columns');

    // let ulContainer = document.getElementById('columns');
    let ulContainer = oCube.activeCard.querySelector('#columns');
    // pulisco l'elenco delle colonne in base alla selezione della tabella
    ulContainer.querySelectorAll('.element').forEach((el) => {ulContainer.removeChild(el);});
    app.dialogTableList.close();

    var url = 'ajax/tableInfo.php';
    let params = 'tableName='+oCube.table;
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
            // let iElement = element.querySelector('i');
            li.innerText = response[i][0];
            li.setAttribute('label', response[i][0]);
            // scrivo il tipo di dato senza specificare la lunghezza int(8) voglio che mi scriva solo int
            let pos = response[i][1].indexOf('(');
            let type = (pos !== -1) ? response[i][1].substring(0, pos) : response[i][1];
            li.setAttribute('data-type', type);
            li.setAttribute('data-table',oCube.table);
            li.id = i;
            ulContainer.appendChild(element);
            li.onclick = oCube.handlerColumns.bind(oCube);
          }
          // se ci sono poche colonne in questa tabella non attivo la input search
          if (Object.keys(response).length > 10) {
            oCube.activeCardRef.querySelector('.md-field > input').oninput = App.searchInList;
            // visualizzo la input per la ricerca delle colonne
            oCube.activeCardRef.querySelector('.md-field > input').parentElement.removeAttribute('hidden');
          }

          // lego eventi ai tasti i[....] nascosti
          oCube.activeCardRef.parentElement.querySelector('i[columns]').onclick = app.handlerAddColumns;
          oCube.activeCardRef.parentElement.querySelector('i[filters]').onclick = app.handlerAddFilters;
          oCube.activeCardRef.parentElement.querySelector('i[groupby]').onclick = app.handlerAddGroupBy;
          oCube.activeCardRef.parentElement.querySelector('i[metrics]').onclick = app.handlerAddMetrics;

        } else {
          // TODO:
        }
      } else {
        // TODO:
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
    if (e.target.localName === 'h6') {
      document.getElementById('tableSearch').value = '';
      app.dialogTableList.querySelectorAll('ul .element').forEach((el) => {el.removeAttribute('hide');});
      app.dialogTableList.showModal();
    }
    oCube.activeCard = this;
    // rimuovo l'attriubto active dalla card-table attiva
    document.querySelector('.card-table[active]').removeAttribute('active');

    this.setAttribute('active', true);
  };

  app.handlerAddTable = function() {
    /* metodo per l'aggiunta di un elemento/card. In questo Metodo imposto this.addedElement per poterlo restituire (sotto).
    ...Una volta restituito posso associare al nuovo elemento aggiungo i vari eventi*/
    app.TimelineHier.add();
    // imposto evento onclick sulla card appena aggiunta
    app.TimelineHier.elementAdded.querySelector('.card-table').onclick = app.handlerCardSelected;
  };

  app.handlerAddHierarchy = function(e) {
    // console.log(this);
    // console.log(e.path);
    // console.log(e.path[3]);
    // aggiungo l'attributo [hierarchies] alle due card (sopra-sotto)
    // recupero le due card dove in mezzo c'è questo tasto
    // elimino prima l'attributo [hierarchies] su eventuali altre card-table selezionate in precedenza

    // BUG: quando si assovia la FACT la timeline attiva non è app.TimelineHier ma app.TimelineFact
    oCube.changeMode();
    // su quale timeline sto operando ?
    // console.log(e.path[4]);
    let objTimeline = new Timeline(e.path[4].id);
    // console.log(Timeline);
    objTimeline.activeElements().forEach((element) => {
      // console.log(element);
      let card = element.querySelector('section.card-table');

      let help = card.querySelector('.help');
      if (element.querySelectorAll('ul li').length === 0) {
        help.setAttribute('alert', true);
        card.removeAttribute('hierarchies');
        help.innerText = 'Necessario aggiungere una tabella per creare una relazione';
      } else {
        help.removeAttribute('alert');
        card.setAttribute('hierarchies', true);
        help.innerText = 'Seleziona le colonne da mettere in relazione';
      }
    });
    // NOTE: Utilizzo di for...of in una Collection
    // for (let name of upCard.getAttributeNames()) {
    //   if (name === 'filters' || name === 'columns') {upCard.removeAttribute(name);}
    // }
  };

  app.handlerAddColumns = function(e) {
    // console.log(this);

    oCube.changeMode();
    let upCard = e.path[3].querySelector('section.card-table');
    oCube.activeCard = upCard;
    let help = upCard.querySelector('.help');
    help.innerHTML = 'Seleziona le colonne da mettere nel corpo della tabella';
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
    oCube.changeMode();
    let upCard = e.path[3].querySelector('section.card-table');
    oCube.activeCard = upCard;
    let help = upCard.querySelector('.help');
    help.innerHTML = 'Seleziona le colonne su cui verranno applicati dei filtri';
    upCard.setAttribute('filters', true);
  };

  app.handlerAddGroupBy = function(e) {
    // console.log(this);
    oCube.changeMode();
    let upCard = e.path[3].querySelector('section.card-table');
    oCube.activeCard = upCard;
    let help = upCard.querySelector('.help');
    help.innerHTML = 'Seleziona le colonne su cui applicare il GROUP BY';
    upCard.setAttribute('groupby', true);
  };

  app.handlerAddMetrics = function(e) {
    // console.log(this);
    oCube.changeMode();
    let upCard = e.path[3].querySelector('section.card-table');
    oCube.activeCard = upCard;
    let help = upCard.querySelector('.help');
    help.innerHTML = 'Seleziona le colonne da impostare come Metriche';
    upCard.setAttribute('metrics', true);
  };

  app.cloneLastTable = function() {
    // BUG: se si torna indietro a fare una modifica alla gerarchia, dopo aver cliccato "Salva dimensione", viene clonata di nuovo la tabella, invece di
    //....modificare quella già clonata
    // prendo l'ultima tabella della gerarchia e la clono per inserirla nella seconda pagina, associazione con la FACT
    // ultima card nella gerarchia
    let lastTableInHierarchy = app.TimelineHier.translateRef.querySelector('div[element]:last-child .card');
    // console.log(lastTableInHierarchy);
    // dove va inserita l'ultima card della gerarchia, prima della fact. La Fact ha data-id =2 perchè sicuramente ce ne sarà una a sinistra, con data-id=1
    let factElement = app.TimelineFact.translateRef.querySelector('div[element][data-id="2"]');
    // console.log(factElement);
    // creo l'elemento div[element] e [sub-element]
    let divElement = document.createElement('div');
    divElement.setAttribute('data-id', 1);
    divElement.setAttribute('element', true);
    divElement.setAttribute('info', true);
    let divSubElement = document.createElement('div');
    divSubElement.setAttribute('sub-element', true);
    // aggiuno l'elemento div[element] prima del div[element] che contiene la fact (ottenuto in factElement)
    app.TimelineFact.translateRef.insertBefore(divElement, factElement);
    // in questo div[element] aggiungo div[sub-element] ...successivamente tutta la card
    divElement.appendChild(divSubElement);
    let newCard = lastTableInHierarchy.cloneNode(true);
    divSubElement.appendChild(newCard);

    newCard.querySelectorAll('li').forEach((li) => {
      li.onclick = oCube.handlerColumns.bind(oCube);
    });
    // evento oninput sulla searchColumns
    newCard.querySelector('.md-field > input').oninput = App.searchInList;
    // elimino la sezione section[options]
    newCard.querySelector('.card-layout').removeChild(newCard.querySelector('section[options]'));
    // aggiungo la timeline circle
    app.TimelineFact.addCircle();
  };

  app.handlerFunctionMetricList = function() {
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
    // TODO: quando inserisco between bisogna far comparire anche la seconda input
    // TODO: Nelle input che verranno mostrate dovrò andare a verificare il type del campo, se date mostro input type="date", se number <input type=number, ecc...
    document.querySelectorAll('#operator-list li').forEach((li) => {li.removeAttribute('selected');});
    this.toggleAttribute('selected');
    console.log(e.target);
    switch (e.target.getAttribute('label')) {
      case 'BETWEEN':
        document.getElementById('between').hidden = false;
        // nascondo la input stanrdard
        app.dialogFilters.querySelector('.md-field[value]').hidden = true;

        break;
      case 'IN':
      case 'NOT IN':
        document.getElementById('in').hidden = false;
        app.dialogFilters.querySelector('.md-field[value]').hidden = true;
        document.getElementById('between').hidden = true;

        break;
      default:
        document.getElementById('in').hidden = true;
        app.dialogFilters.querySelector('.md-field[value]').hidden = false;
        document.getElementById('between').hidden = true;
    }
  };

  app.openReportList = function() {
    app.dialogReportList.showModal();
  };

  /*events */
  document.querySelectorAll('.card-table').forEach((card) => {
    // questo imposta l'evento sulla prima card e sulla fact che sono già presenti nel DOM
    card.onclick = app.handlerCardSelected;
  });
  // evento su icona per aggiungere una tabella alla gerarchia
  document.querySelector('.icon-relation > span > i[add]').onclick = app.handlerAddTable;
  // aggiungo onclick sulle icone [hierachies] per la creazione delle gerarchie
  Array.from(document.querySelectorAll('.icon-relation > span > i[hierarchies]')).forEach((btnHierarchies) => {
    // console.log(btnHierarchies);
    btnHierarchies.onclick = app.handlerAddHierarchy;
  });
  Array.from(document.querySelectorAll('.icon-relation > span > i[hierarchies-remove]')).forEach((btnHierarchiesRemove) => {
    // console.log(btnHierarchiesRemove);
    btnHierarchiesRemove.onclick = app.handlerRemoveHierarchy;
  });
  // OPTIMIZE: forse questi 2 sotto li devo mettere dopo aver definito la tabella
  document.querySelector('section[options] > span > i[columns]').onclick = app.handlerAddColumns;
  document.querySelector('section[options] > span > i[filters]').onclick = app.handlerAddFilters;
  document.querySelector('section[options] > span > i[groupby]').onclick = app.handlerAddGroupBy;
  document.querySelector('#fact-card section[options] > span > i[metrics]').onclick = app.handlerAddMetrics;

  /* tasto OK nella dialog*/
  document.getElementById('btnDimensionSaveName').onclick = function() {
    /*
      Salvo la dimensione, senza il legame con la FACT.
      Clono l'ultima tabella e la inserisco a fianco della FACT per fare l'associazione.
      Salvo in localStorage la dimensione creata
      // TODO: Visualizzo nell'elenco di sinistra la dimensione appena creata
    */
    oCube.dimensionTitle = document.getElementById('dimensionName').value;
    const storage = new DimensionStorage();
    let from = [];
    let objDimension = {};
    document.querySelectorAll('.card-table').forEach((card) => {
      if (card.getAttribute('name')) {
        from.push(card.getAttribute('name'));
        objDimension.from = from;
      }
    });

    // in oCube.cube.hierarchies inserisco solo la/le relazione/i tra l'ultima tabella della gerarchia e la FACT
    oCube.cube['hierarchies'] = oCube.hierarchyFact;
    let hierarchies = {};
    // TODO: da rivedere perchè le gerarchie dovrebbero essere tutte hier_ e non più fact_ e hier_
    Object.keys(oCube.hierarchyTable).forEach((rel) => {if (rel.substring(0, 5) === 'hier_') {hierarchies[rel] = oCube.hierarchyTable[rel];}});
    // ... mentre, nella dimensione inserisco solo le relazioni tra tabelle e non la relazione con la FACT
    objDimension.hierarchies = hierarchies;
    objDimension.type = 'DIMENSION';
    // TODO: fare in modo che type viene inserito nella root del json, quindi eliminare un livello da oCube.dimension

    oCube.dimension[oCube.dimensionTitle] = objDimension;
    console.log(oCube.dimension);

    storage.dimension = oCube.dimension;

    app.cloneLastTable();
    app.dialogDimensionName.close();
  };

  document.getElementById('saveDimension').onclick = function() {app.dialogDimensionName.showModal();};

  /* tasto OK nella dialog per il salvataggio di un Report/Cubo */
  document.getElementById('btnCubeSaveName').onclick = function() {
    oCube.cubeTitle = document.getElementById('cubeName').value;
    oCube.cube.dimensions = oCube.dimension;
    oCube.cube.type = 'CUBE';
    oCube.cube['columns'] = oCube.columns;
    oCube.cube['filters'] = oCube.filters;
    oCube.cube['metrics'] = oCube.metrics;
    oCube.cube['filteredMetrics'] = oCube.filteredMetrics;
    oCube.cube['groupby'] = oCube.groupBy;
    oCube.cube['FACT'] = document.querySelector('#fact').getAttribute('name');
    oCube.cube.name = oCube.cubeTitle;
    let cubeStorage = new CubeStorage();

    // Creo il cubeId basandomi sui cubi già creati in Storage, il cubeId lo associo al cubo che sto per andare a salvare.
    oCube.cube.cubeId = cubeStorage.getIdAvailable();
    console.log(oCube.cube.cubeId);

    // oCube.cube.cube_id = oStorage.cubeId;
    console.log(oCube.cube);

    // salvo il cubo in localStorage
    cubeStorage.save = oCube.cube;
    cubeStorage.stringifyObject = oCube.cube;

    var url = 'ajax/cube.php';
    let params = 'cube='+cubeStorage.stringifyObject;
    console.log(params);

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          console.table(response);
          app.dialogCubeName.close();
          // abilito il tasto REPORT PREVIEW
          document.getElementById('mdc-preview-report').disabled = false;
        } else {
          // TODO:
        }
      } else {
        // TODO:
      }
    };

    request.open('POST', url);
    // request.setRequestHeader('Content-Type','application/json');
    request.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    request.send(params);
  };

  document.getElementById('saveReport').onclick = function() {app.dialogCubeName.showModal();};

  // document.getElementById('saveHierarchy').onclick = function(e) {
  //   // TODO: verifico se sono stati inseriti i parametri obbligatori, gerarchie,titolo del cubo
  //
  // };

  document.querySelectorAll('#operator-list li').forEach((li) => {
    li.onclick = app.handlerFunctionOperatorList;
  });

  app.btnFact.onclick = function(e) {app.Page.next();};

  // vado alla pagina reports/index.html
  app.btnPreviewReport.onclick = function(e) {location.href = '/reports/';};

  app.btnBack.onclick = function(e) {app.Page.previous();};

  // app.btnNewReport.onclick = function(e) {
  //   // TODO: ritorno allo step 1 e pulisco tutto per creare un nuovo report (dimensioni/cubo)
  //   app.Page.restart();
  // };

  /*ricerca dimensioni in elenco di sinistra*/
  // document.getElementById('dimensionSearch').oninput = App.searchInList;
  /* ricerca cubi in elenco di sinitra*/
  // document.getElementById('cubeSearch').oninput = App.searchInList;
  /* ricerca in lista tabelle */
  document.getElementById('tableSearch').oninput = App.searchInList;

  // icona openReport apre la dialog con la lista di reports già creati
  document.querySelector('#openReport').onclick = app.openReportList;

  app.inputValueSearch.oninput = App.searchInList;

  app.btnColumnValues.onclick = function(e) {
    console.log(e.target);
    let tableName = e.target.getAttribute('data-tableName');
    let fieldName = document.getElementById('filter-filedName').value;
    // return;
    // TODO: getDistinctValues
    // ottengo i valori distinti per la colonna selezionata
    // TODO: utilizzare le promise
    var url = 'ajax/columnInfo.php';
    let params = 'table='+tableName+'&field='+fieldName;
    console.log(params);
    // return;
    const ul = document.getElementById('filterValuesList');
    // pulisco la ul
    Array.from(ul.querySelectorAll('li')).forEach((item) => {
      // console.log(item);
      item.remove();
    });

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          // console.table(response);
          for (let i in response) {
            // console.log(i);
            // console.log(response[i][fieldName]);
            let element = document.createElement('div');
            element.className = 'element';
            ul.appendChild(element);
            let li = document.createElement('li');
            li.id = i;
            li.setAttribute('label', response[i][fieldName]);
            li.innerHTML = response[i][fieldName];
            element.appendChild(li);
          }
        } else {
          // TODO:
        }
      } else {
        // TODO:

      }
    };

    request.open('POST', url);
    // request.setRequestHeader('Content-Type','application/json');
    request.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    request.send(params);
  };
  /*events */

  app.getDatabaseTable();

  // app.getDimensionsList();

  app.getDatamartList();
})();
