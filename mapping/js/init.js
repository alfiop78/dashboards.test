/* global Application, Cube, Timeline, Page, DimensionStorage, CubeStorage */
// TODO: Nelle input di ricerca all'interno delle tabelle modificarle in input type='search'
// TODO: aggiungere le popup sulle icone all'interno della tabella
var App = new Application();
var cube = new Cube();
// TODO: dichiarare qui le altre Classi
(() => {
  var app = {

    tmplElementMenu : document.getElementById('elementMenu'),
    dialogCubeName : document.getElementById('cube-name'),
    dialogDimensionName : document.getElementById('dimension-name'),
    dialogHierarchyName : document.getElementById('hierarchy-name'),
    dialogReportList : document.getElementById('dialog-report-list'),
    dialogFilters : document.getElementById('filter-setting'),
    dialogMetrics : document.getElementById('metric-setting'),

    btnBack : document.getElementById('mdc-back'),
    btnNewReport: document.getElementById('mdc-new-report'),

    inputValueSearch : document.getElementById('valuesSearch'),
    btnColumnValues : document.getElementById('btnColumnValues'),
    btnFilterIcon : document.getElementById('filters-icon'),
    inputFilterName : document.getElementById('filter-name'),
    btnFilterDone : document.getElementById('btnFilterDone'),
    inputFilterValues : document.getElementById('filter-values'),

    btnSaveDimension : document.getElementById('saveDimension'),
    btnSaveCube : document.getElementById('saveCube'),
    btnSaveCubeName : document.getElementById('btnCubeSaveName'),


    tmplCloseTable : document.getElementById('closeTable'), // tasto close table
    tmplInputSearch : document.getElementById('inputSearch'), // input per ricerca fields nelle tabelle
    tmplSectionOption : document.getElementById('sectionOption'), // options laterale per ogni tabella

    // tasto openTableList
    btnTableList : document.getElementById('openTableList'),
    tableList : document.getElementById('tableList'),
    // tasto openDimensionList per l'apertura dell'elenco delle dimensioni
    btnDimensionList : document.getElementById('openDimensionList'),
    dimensionList : document.getElementById('dimensionList'),

    btnNewFact : document.getElementById('mdc-newFact'),

    card : null,
    cardTitle : null,
    content : document.getElementById('content'),
    body : document.getElementById('body'),
    // dropzone : document.getElementsByClassName('dropzone')[0],
    currentX : 0,
    currentY : 0,
    initialX : 0,
    initialY : 0,
    active : false,
    xOffset : 0,
    yOffset : 0,
    dragElement : null,
    elementMenu : null
  };

  App.init();

  app.dragStart = function(e) {
    // mousedown da utilizzare per lo spostamento dell'elemento
    if (e.target.localName === 'h6') {
      app.cardTitle = e.target;
      app.card = e.path[4];
      // recupero la posizione attuale della card tramite l'attributo x-y impostato su .cardTable
      app.xOffset = e.path[4].getAttribute('x');
      app.yOffset = e.path[4].getAttribute('y');
    }
    // cardTitle = document.querySelector('.card.table .title > h6');
    if (e.type === 'touchstart') {
        app.initialX = e.touches[0].clientX - app.xOffset;
        app.initialY = e.touches[0].clientY - app.yOffset;
      } else {
        app.initialX = e.clientX - app.xOffset;
        app.initialY = e.clientY - app.yOffset;
      }

      if (e.target === app.cardTitle) {
        app.active = true;
      }
  };

  app.dragEnd = function() {
    // console.log(e.target);
    // mouseup, elemento rilasciato dopo lo spostamento
    app.initialX = app.currentX;
    app.initialY = app.currentY;
    app.active = false;
  };

  app.drag = function(e) {
    // mousemove elemento si sta spostato
    // console.log(e.target);
    // console.log(e);
    if (app.active) {
      e.preventDefault();

      if (e.type === 'touchmove') {
          app.currentX = e.touches[0].clientX - app.initialX;
          app.currentY = e.touches[0].clientY - app.initialY;
        } else {
          app.currentX = e.clientX - app.initialX;
          app.currentY = e.clientY - app.initialY;
        }

        app.xOffset = app.currentX;
        app.yOffset = app.currentY;
        // imposto sulla .cardTable le posizioni dove è 'stato lasciato'  dopo il drag in modo da "riprendere" lo
        // spostamento da dove era rimasto
        app.card.setAttribute('x', app.xOffset);
        app.card.setAttribute('y', app.yOffset);

        app.card.style.transform = 'translate3d(' + app.currentX + 'px, ' + app.currentY + 'px, 0)';
      }
  };

  app.body.onmousedown = app.dragStart;
  app.body.onmouseup = app.dragEnd;
  app.body.onmousemove = app.drag;

  // TODO: aggiungere anhce eventi touch...

  app.handlerDragStart = function(e) {
    // console.log('start');
    // dragStart
    // console.log(e.target.id);
    // return;
    e.dataTransfer.setData('text/plain', e.target.id);
    app.dragElement = document.getElementById(e.target.id);
    // console.log(e.path);
    app.elementMenu = e.path[1]; // elemento da eliminare al termine drl drag&drop
    // console.log(e.dataTransfer);
  };

  app.handlerDragOver = function(e) {
    // console.log('dragOver');
    e.preventDefault();
  };

  app.handlerDragEnter = function(e) {
    // console.log('dragEnter');
    e.preventDefault();
    // console.log(e.target);

    if (e.target.className === 'dropzone') {
      console.info('DROPZONE');
      // TODO: css effect
    }
  };

  app.handlerDragLeave = function(e) {
    e.preventDefault();
    // console.log('dragLeave');
  };

  app.handlerDragEnd = function(e) {
    e.preventDefault();
    // console.log('dragEnd');
    // console.log(e.target);
    app.getTable(cube.table);
  };

  app.handlerDrop = function(e) {
    e.preventDefault();
    // console.log('drop');
    // console.log(e.target);
    let data = e.dataTransfer.getData('text/plain');
    let card = document.getElementById(data);
    // console.log(e.dataTransfer);
    // console.log(e.target);
    // nuova tabella droppata
    // console.log(card);
    // console.log(app.dragElement);
    // TODO: dopo il drop elimino l'elemento <li> e imposto il template #cardLayout
    // TODO: la .card .draggable diventa .card .table
    card.className = 'card table';
    card.removeAttribute('draggable');
    card.removeAttribute('name');
    // elimino lo span all'interno della card
    card.querySelector('span[label]').remove();
    // associo gli eventi mouse
    card.onmousedown = app.dragStart;
    card.onmouseup = app.dragEnd;
    card.onmousemove = app.drag;
    // TODO: prendo il template cardLayout e lo inserisco nella card table
    let tmpl = document.getElementById('cardLayout');
    let content = tmpl.content.cloneNode(true);
    let cardLayout = content.querySelector('.cardLayout');

    // imposto il titolo in h6
    cardLayout.querySelector('h6').innerHTML = card.getAttribute('label');
    card.appendChild(cardLayout);

    app.body.appendChild(card);
    // tabella fact viene colorata in modo diverso, imposto attributo fact sia sulla .card.table che sulla .cardTable
    if (app.btnTableList.hasAttribute('fact')) {
      card.setAttribute('fact', true);
      card.querySelector('.cardTable').setAttribute('fact', true);
    }

    // imposto la card draggata nella posizione dove si trova il mouse
    card.style.transform = 'translate3d(' + e.offsetX + 'px, ' + e.offsetY + 'px, 0)';
    card.setAttribute('x', e.offsetX);
    card.setAttribute('y', e.offsetY);
    // chiudo la list openTableList
    app.btnTableList.removeAttribute('open');
    app.tableList.toggleAttribute('hidden');

    // evento sul tasto close della card
    card.querySelector('i[data-id="closeTable"]').onclick = app.handlerCloseCard;
    // evento sulla input di ricerca nella card
    card.querySelector('input').oninput = App.searchInList;
    // card.querySelector('input').oninput = App.searchInList;

    cube.activeCard = card.querySelector('.cardTable');
    // inserisco il nome della tabella selezionata nella card [active]
    cube.table = card.getAttribute('label');

    // lego eventi ai tasti i[....] nascosti
    cube.activeCardRef.parentElement.querySelector('i[columns]').onclick = app.handlerAddColumns;
    cube.activeCardRef.parentElement.querySelector('i[filters]').onclick = app.handlerAddFilters;
    cube.activeCardRef.parentElement.querySelector('i[groupby]').onclick = app.handlerAddGroupBy;
    cube.activeCardRef.parentElement.querySelector('i[metrics]').onclick = app.handlerAddMetrics;
    // inserisco il nome della tabella nella struttura gerarchica sulla destra
    const hierarchiesTables = document.getElementById('hierTables');
    let id = hierarchiesTables.childElementCount;
    // let dropzone = document.createElement('div');
    let hierTables = document.getElementById('hierTables');
    // dropzone.classList = 'dropzoneHier';
    // hierarchiesTables.appendChild(dropzone);
    let div = document.createElement('div');
    div.className = 'hier table dropzoneHier';
    div.id = 'hier_' + id;
    div.setAttribute('draggable', true);
    div.setAttribute('label', cube.table);
    div.innerHTML = cube.table;

    hierTables.appendChild(div);
    // imposto sul div l'evento drag&drop
    div.ondragstart = app.hierDragStart;
    div.ondragover = app.hierDragOver;
    div.ondragenter = app.hierDragEnter;
    div.ondragleave = app.hierDragLeave;
    div.ondragend = app.hierDragEnd;
    div.ondrop = app.hierDrop;

    // event sui tasti section[options]
    card.querySelector('i[hierarchies]').onclick = app.handlerAddHierarchy;

  };

  app.hierDragStart = function(e) {
    console.log('hier drag start');
    e.dataTransfer.setData('text/plain', e.target.id);
    // disattivo temporaneamente gli eventi drop e dragend su app.content
    // OPTIMIZE:
    app.content.removeEventListener('dragend', app.handlerDragEnd, true);
    app.content.removeEventListener('drop', app.handlerDrop, true);
  };

  app.hierDragOver = function(e) {
    console.log('dragover');
    e.preventDefault();
    // console.log(e.target);
  };

  app.hierDragEnter = function(e) {
    e.preventDefault();
    console.log(e.target);

    if (e.target.className === 'dropzoneHier') {
      console.info('DROPZONE');
      // TODO: css effect
    }
  };

  app.hierDragLeave = function(e) {e.preventDefault();};

  app.hierDragEnd = function(e) {
    e.preventDefault();
    // reimposto gli eventi drop e dragend su app.content
    app.content.addEventListener('dragend', app.handlerDragEnd, true);
    app.content.addEventListener('drop', app.handlerDrop, true);
  };

  app.hierDrop = function(e) {
    e.preventDefault();
    let data = e.dataTransfer.getData('text/plain');
    console.log(data);
    const draggedCard = document.getElementById(data);
    const nextCard = draggedCard.nextElementSibling;
    // e.target.before(document.getElementById(data));
    // verifico se il target è l'elemento successivo o precedente, se successivo effettuo un after() altrimenti un before()
    (e.target === nextCard) ? e.target.after(document.getElementById(data)) : e.target.before(document.getElementById(data));

    // let parent = document.getElementById('hierTables');
    // parent.replaceChild(document.getElementById(data), e.target);
  };

  app.content.ondragover = app.handlerDragOver;
  app.content.ondragenter = app.handlerDragEnter;
  app.content.ondragleave = app.handlerDragLeave;
  // app.content.ondrop = app.handlerDrop;
  app.content.addEventListener('drop', app.handlerDrop, true);
  // app.content.ondragend = app.handlerDragEnd;
  app.content.addEventListener('dragend', app.handlerDragEnd, true);

  app.handlerColumns = function(e) {
    // selezione della colonna nella card table
    // console.log(e.target);
    cube.activeCard = e.path[3];
    // console.log(cube.activeCard);

    let tableName = cube.activeCard.getAttribute('name');
    // console.log(tableName);
    let fieldName = e.target.getAttribute('label');
    // console.log(fieldName);

    let attrs = cube.activeCard.getAttribute('mode');
    // console.log(attrs);
    switch (attrs) {
      case 'hierarchies':
        console.log('hier');
        // se è presente un altro elemento con attributo hierarchy ma NON data-relation-id, "deseleziono" quello con hierarchy per mettere ...
        // ...[hierarchy] a quello appena selezionato. In questo modo posso selezionare solo una colonna per volta ad ogni relazione da creare
        // se però, viene cliccato una colonna con già una relazione impostata (quindi ha [data-relationn-id]) elimino la relazione da
        // ...entrambe le tabelle tramite un identificatifo di relazione

        if (e.target.hasAttribute('data-relation-id')) {
          // debugger;
          /* oltre a fare il toggle dell'attributo, se questa colonna era stata già messa in
          relazione con un altra tabella (quindi attributo [data-relation-id] presente) elimino anche la relazione tra i due campi.
          Bisogna eliminarla sia dal DOM, eliminando [data-relation-id] che dall'array this.hierarchy
          */
          e.target.toggleAttribute('selected');
          // TODO: recupero tutti gli attributi di e.target e vado a ciclare this.removeHierarchy(relationId) per verificare uno alla volta quale posso eliminare
          for (let name of e.target.getAttributeNames()) {
            // console.log(name);
            let relationId, value;
            if (name.substring(0, 9) === 'data-rel-') {
              relationId = name;
              value = e.target.getAttribute(name);
              // debugger;
              app.removeHierarchy(relationId, value);
              // this.removeHierarchy(relationId, value);
            }

          }

        } else {
          let liRelationSelected = cube.activeCard.querySelector('li[hierarchy]:not([data-relation-id])');
          // console.log(liRelationSelected);
          e.target.toggleAttribute('hierarchy');
          e.target.toggleAttribute('selected');
          // se ho selezionato una colonna diversa da quella già selezionata, rimuovo la selezione corrente e imposto quella nuova
          // se è stata selezionata una colonna già selezionata la deseleziono
          if (liRelationSelected && (liRelationSelected.id !== e.target.id)) {
            liRelationSelected.toggleAttribute('hierarchy');
            liRelationSelected.toggleAttribute('selected');
          }
        }
        // debugger;
        app.createHierarchy();
        // this.createHierarchy();

        break;
      case 'columns':
        // console.log(e.target);
        e.target.toggleAttribute('columns');
        e.target.parentElement.querySelector('#columns-icon').onclick = app.handlerColumnSetting;
        // e.target.parentElement.querySelector('#columns-icon').onclick = this.handlerColumnSetting.bind(this);
        if (!e.target.hasAttribute('columns') && Object.keys(this.columns).length > 0) {
          delete cube.columns[tableName][fieldName];
          // elimino l'attributo defined utile a colorare l'icona
          e.target.parentElement.querySelector('#columns-icon').removeAttribute('defined');
          if (Object.keys(cube.columns[tableName]).length === 0) {delete cube.columns[tableName];}
        }
        console.log(cube.columns);
        break;
      case 'filters':
        console.log('filters');
        e.target.toggleAttribute('filters');
        if (!e.target.hasAttribute('filters')) {
          // elimino il filtro impostato
          delete cube.filters[tableName][fieldName];
          // elimino l'attributo defined utile a colorare l'icona
          e.target.parentElement.querySelector('#filters-icon').removeAttribute('defined');
          // TODO: aggiungere il controllo per eliminare l'object se non contiene nulla
        }
        console.log(cube.filters);
        break;
      case 'groupby':
        console.log('groupby');
        e.target.toggleAttribute('groupby');
        e.target.parentElement.querySelector('#groupby-icon').onclick = app.handlerGroupBySetting;
        // e.target.parentElement.querySelector('#groupby-icon').onclick = this.handlerGroupBySetting.bind(this);
        if (!e.target.hasAttribute('groupby')) {
          // elimino la colonna selezionata per il groupby
          delete cube.groupBy[tableName][fieldName];
          // elimino l'attributo defined utile a colorare l'icona
          e.target.parentElement.querySelector('#groupby-icon').removeAttribute('defined');
          if (Object.keys(cube.groupBy[tableName]).length === 0) {delete cube.groupBy[tableName];}
        }
        console.log(cube.groupBy);
        break;
      case 'metrics':
        console.log('metrics');
        e.target.toggleAttribute('metrics');
        e.target.parentElement.querySelector('#metrics-icon').onclick = app.handlerMetricSetting;
        // e.target.parentElement.querySelector('#metrics-icon').onclick = this.handlerMetricSetting.bind(this);
        if (!e.target.hasAttribute('metrics')) {
          // elimino l'attributo defined utile a colorare l'icona
          e.target.parentElement.querySelector('#metrics-icon').removeAttribute('defined');
          delete cube.metrics[tableName][fieldName];
          // TODO: aggiungere il controllo per eliminare l'object se non contiene nulla
        }
        console.log(cube.metrics);
        break;
      default:

    }
  };

  app.handlerColumnSetting = function(e) {
    // apro la dialog column-setting
    // console.log(e.target);
    cube.currentFieldSetting = e.target;
    let fieldName = cube.dialogColumns.querySelector('#fieldName');
    fieldName.innerHTML = e.path[1].querySelector('li').getAttribute('label');
    // reset della dialog
    document.getElementById('alias-column').value = '';

    cube.dialogColumns.showModal();
    // aggiungo evento al tasto ok per memorizzare il filtro e chiudere la dialog
    cube.dialogColumns.querySelector('#btnColumnDone').onclick = app.handlerBtnColumnDone;
    // this.dialogColumns.querySelector('#btnColumnDone').onclick = this.handlerBtnColumnDone.bind(this);
  };

  app.handlerGroupBySetting = function(e) {
    // apro la dialog groupby-setting
    // TODO: le dialog le posso anche impostare qui, invece di impostarle nella classe
    let fieldName = cube.dialogGroupBy.querySelector('#fieldName');
    cube.currentFieldSetting = e.target;
    fieldName.innerHTML = e.path[1].querySelector('li').getAttribute('label');

    cube.dialogGroupBy.showModal();
    // aggiungo evento al tasto ok per memorizzare il filtro e chiudere la dialog
    cube.dialogGroupBy.querySelector('#btnGroupByDone').onclick = app.handlerBtnGroupByDone;
  };

  app.handlerMetricSetting = function(e) {
    // appro la dialog per metrics
    // console.log(e);
    // visualizzo la lista dei filtri creati, per poterli associare alla metrica
    app.createFiltersList();
    cube.currentFieldSetting = e.target;
    let fieldName = app.dialogMetrics.querySelector('#fieldName');
    fieldName.innerHTML = e.path[1].querySelector('li').getAttribute('label');

    app.dialogMetrics.showModal();
    // resetto i campi della dialog
    // TODO: dovrò vedere se ho cliccato su una metrica già impostata, se già impostata, presente in this.metrics,
    // ...ripropongo i dati precedentemente salvati, altrimenti azzero la dialog
    document.getElementById('alias-metric').value = '';
    document.getElementById('checkbox-distinct').checked = false;

    document.querySelectorAll('#metric-filters > li').forEach((filter) => {
      filter.removeAttribute('selected');
    });
    // aggiungo evento al tasto ok per memorizzare il filtro e chiudere la dialog
    app.dialogMetrics.querySelector('#btnMetricDone').onclick = app.handlerBtnMetricDone;
    // this.dialogMetrics.querySelector('#btnMetricDone').onclick = this.handlerBtnMetricDone.bind(this);
  };

  app.createFiltersList = function() {
    // aggiungo il filtro creato alla dialog metric-setting in modo da poter associare i filtri a una determinata metrica
    // recupero l'elenco dei filtri già presenti in metric-filters, lo inserisco in un array per confrontarlo con this.filters
    let metricFiltersList = Array.from(app.dialogMetrics.querySelectorAll('#metric-filters > li'));
    // console.log(metricFiltersList);
    let arrMetricFilters = [];
    metricFiltersList.forEach((filter) => {arrMetricFilters.push(filter.getAttribute('filter-name'));});
    console.log(arrMetricFilters);

    if (Object.keys(cube.filters).length > 0) {
      let metricFiltersUl = document.getElementById('metric-filters');
      console.log(cube.filters);

      Array.from(Object.keys(cube.filters)).forEach((table) => {
        console.log(table);
        // console.log(this.filters[table]);
        // per ogni tabella recupero i propri filtri per inserirli in un elenco
        Array.from(Object.keys(cube.filters[table])).forEach((filterName) => {
          console.log(filterName);
          // debugger;
          // verifico ogni filtro...
          // ...se questo filtro è già presente nell'elenco non lo inserisco
          if (!arrMetricFilters.includes(filterName) ) {
            let li = document.createElement('li');
            li.innerText = filterName;
            li.setAttribute('filter-name', filterName);
            li.setAttribute('table-name', table);
            li.setAttribute('field-name', cube.filters[table][filterName].fieldName);
            li.setAttribute('operator', cube.filters[table][filterName].operator);
            li.setAttribute('values', cube.filters[table][filterName].values);
            metricFiltersUl.appendChild(li);
            li.onclick = app.handlerFilterMetric;
          }
        });
      });
    }

  };

  app.handlerFilterMetric = function(e) {
    // selezione filtro da associare alla metrica
    // console.log(this);
    e.target.toggleAttribute('selected');
  };

  app.handlerBtnColumnDone = function() {
    // TODO: salvo l'alias per la colonna
    let tableName = cube.activeCard.getAttribute('name');
    let fieldName = cube.dialogColumns.querySelector('#fieldName').innerText;
    let alias = document.getElementById('alias-column').value;

    // quando viene selezionata un'altra tabella, rispetto a quella che è stata già inserita nell'Object, deve resettare this.cols
    // ...altrimenti le colonne contentute in this.cols vengono aggiunte anche alla nuova tabella
    // TODO: verifico se la tabella su cui si sta operando è già inserita nell'object
    // console.log(this.columns[tableName]);
    // console.log(this.columns.hasOwnProperty(tableName));
    if (!cube.columns.hasOwnProperty(tableName)) {cube.cols = [];}

    cube.cols.push({fieldName, 'sqlFORMAT': null, alias}); // OK 1
    // console.log(this.cols);
    let objColumnsParam = {}; // qui inserisco i parametri della colonna (es.: formattazione, alias, ecc...)
    cube.cols.forEach((col) => {
      // col è un object contenente {fieldName, 'sqlFORMAT': null, alias}
      // console.log(col);
      // Inserisco come key il nome del campo, in modo da poter fare il delete this.columns[tablenName][fieldName] quando la colonna viene deselezionata
      objColumnsParam[col.fieldName] = col;
    });
    // console.log(objColumnsParam);

    // this.columns[tableName] = {'campo1': {'sqlFormat': 'DATE_FORMAT', alias}, 'campo2': {'sqlFormat': 'DATE_FORMAT', alias}}; // TEST

    cube.columns[tableName] = objColumnsParam;
    console.log(cube.columns);
    // salvo nella dimensione
    cube.dimension.columns = cube.columns;
    console.log(cube.dimension);
    // TODO: faccio un check su cube.dimension per vedere se ho completato il primo step (dall'elenco di sinistra)
    app.checkStepGuide(2);
    cube.currentFieldSetting.setAttribute('defined', true);
    cube.dialogColumns.close();
  };

  app.handlerBtnGroupByDone = function() {
    // TODO: salvo l'alias per il GroupBy
    let tableName = cube.activeCard.getAttribute('name');
    let fieldName = cube.dialogGroupBy.querySelector('#fieldName').innerText;

    console.log(cube.groupBy.hasOwnProperty(tableName));
    if (!cube.groupBy.hasOwnProperty(tableName)) {cube.colsGroupBy = [];}

    cube.colsGroupBy.push({fieldName, 'sqlFORMAT': null});

    let objParam = {}; // qui inserisco i parametri della colonna (es.: formattazione, alias, ecc...)
    cube.colsGroupBy.forEach((col) => {
      objParam[col.fieldName] = col;
    });

    cube.groupBy[tableName] = objParam;
    console.log(cube.groupBy);
    // salvo nella dimensione
    cube.dimension.groupBy = cube.groupBy;
    console.log(cube.dimension);
    cube.currentFieldSetting.setAttribute('defined', true);
    cube.dialogGroupBy.close();
  };

  app.handlerBtnMetricDone = function(e) {

    let tableName = cube.activeCard.getAttribute('name');
    let metricName = app.dialogMetrics.querySelector('#metric-name').value; // TODO: il nome non può contenere spazi ed altri caratteri da definire
    let fieldName = app.dialogMetrics.querySelector('#fieldName').innerText;
    let sqlFunction = document.querySelector('#function-list > li[selected]').innerText;
    let distinctOption = document.getElementById('checkbox-distinct').checked;
    let alias = document.getElementById('alias-metric').value;
    let arrFilters = [];
    let filters = {};
    // TODO: recupero i filtri impostati per questa metrica e li inserisco nell'array
    // document.querySelectorAll('#metric-filters > li[selected]').forEach((li) => {filters.push(li.getAttribute('filter-name'));});
    document.querySelectorAll('#metric-filters > li[selected]').forEach((li) => {
      // inserisco in filters l'object del filtro selezionato (e non solo il nome), successivamente elimino questo filtro dall'object filters di origine
      // quindi il filtro sarà applicato a livello metrica e non Report
      // recupero da this.filters il filtro selezionato
      // console.log(li);
      // debugger;
      console.log(cube.filters[li.getAttribute('table-name')][li.getAttribute('filter-name')]);
      debugger;

      arrFilters.push(cube.filters[li.getAttribute('table-name')][li.getAttribute('filter-name')]);
      console.log(arrFilters);

      arrFilters.forEach((filter) => {
        console.log(filter);
        filters[li.getAttribute('table-name')] = filter;
      });
      console.log(filters);
      return;

      // se l'object this.filters[nometabella] non ha più nessun filtro al suo interno elimino anche this.filters[nometabella]
      if (Object.keys(cube.filters[li.getAttribute('table-name')]).length === 0) {
        delete cube.filters[li.getAttribute('table-name')];
      } else {
        delete cube.filters[li.getAttribute('table-name')][li.getAttribute('filter-name')];
      }
    });
    console.log(cube.filters);
    debugger;

    // aggiungo i filtri da associare a questa metrica
    if (!cube.metrics.hasOwnProperty(tableName)) {cube.colsMetrics = [];}
    let objParam = {};
    if (Object.keys(filters).length > 0) {
      // debugger;
      // questa è una metrica filtrata
      cube.colsFilteredMetrics.push({sqlFunction, fieldName, metricName, 'distinct' : distinctOption, 'alias' : alias, filters});
      cube.colsFilteredMetrics.forEach((metric) => {objParam[metric.fieldName] = metric;});
      cube.filteredMetrics[tableName] = objParam;
    } else {
      cube.colsMetrics.push({sqlFunction, fieldName, metricName, 'distinct' : distinctOption, 'alias' : alias});
      cube.colsMetrics.forEach((metric) => {objParam[metric.fieldName] = metric;});
      cube.metrics[tableName] = objParam;
    }


    console.log(cube.metrics);
    console.log(cube.filteredMetrics);
    cube.currentFieldSetting.setAttribute('defined', true);
    app.dialogMetrics.close();
  };

  app.createHierarchy = function(e) {
    console.log('createHierarchy');
    let hier = [];
    let colSelected = [];
    document.querySelectorAll('.cardTable[mode="hierarchies"]').forEach((card) => {
      // debugger;
      let tableName = card.getAttribute('name');
      // let liRef = card.querySelector('li[hierarchy]:not([data-relation-id])');
      let liRef = card.querySelector('li[hierarchy][selected]');
      if (liRef) {
        // metto in un array gli elementi selezionati per la creazione della gerarchia
        colSelected.push(liRef);
        hier.push(tableName+'.'+liRef.innerText);
      }
      console.log(hier);
      // per creare correttamente la relazione è necessario avere due elementi selezionati
      if (hier.length === 2) {
        cube.relationId++;
        // se, in questa relazione è presente anche la tabella FACT rinomino hier_n in fact_n in modo da poter separare le gerarchie
        // e capire quali sono quelle con la fact (quindi legate al Cubo) e quali no (posso salvare la Dimensione, senza il legame con il Cubo)
        if (card.hasAttribute('fact')) {
          cube.hierarchyFact['hier_'+cube.relationId] = hier;
          console.log(cube.hierarchyFact);
        } else {
          cube.hierarchyTable['hier_'+cube.relationId] = hier;
          cube.dimension.hierarchies = cube.hierarchyTable;
          console.log(cube.dimension);
          // ordine gerarchico (per stabilire quale tabella è da associare al cubo) questo dato viene preso dalla struttura di destra
          Array.from(document.querySelectorAll('#hierarchies .hier.table')).forEach((table, i) => {
            cube.hierarchyOrder[i] = table.getAttribute('label');
          });
          console.log(cube.hierarchyOrder);
          cube.dimension.hierarchyOrder = cube.hierarchyOrder;
          console.log(cube.dimension);
          app.checkStepGuide(2);
          console.log(cube.hierarchyTable);
        }
        // (card.hasAttribute('fact-table')) ? this.hierarchyFact['fact_'+this.relationId] = hier : this.hierarchyTable['hier_'+this.relationId] = hier;

        // visualizzo l'icona per capire che c'è una relazione tra le due colonne
        colSelected.forEach((el) => {
          el.setAttribute('data-rel-'+cube.relationId, cube.relationId);
          // el.setAttribute('data-relation-id', 'rel_'+this.relationId);
          el.setAttribute('data-relation-id', true);
          // la relazione è stata creata, posso eliminare [selected]
          el.removeAttribute('selected');
        });
      }
    });
  };

  app.removeHierarchy = function(relationId, value) {
    console.log(relationId);
    console.log(value);
    debugger;
    console.log('delete hierarchy');
    /* prima di eliminare la gerarchia devo stabilire se le due card, in questo momento, sono in modalità hierarchies
    // ...(questo lo vedo dall'attributo presente su card-table)
    // elimino la gerarchia solo se la relazione tra le due tabelle riguarda le due tabelle attualmente impostate in modalità [hierarchies]
    // se la relazione riguarda le tabelle A e B e attualmente la modalità impostata è A e B allora elimino la gerarchia
    // altrimenti se la relazione riguarda A e B e attualmente la modalità impostata [hierarchies] riguarda B e C aggiungo la relazione e non la elimino
    */
    // elementi li che hanno la relazione relationId
    let liElementsRelated = document.querySelectorAll('.cardTable[hierarchies] li[data-relation-id]['+relationId+']').length;

    if (liElementsRelated === 2) {
      // tra le due tabelle .card-table[hiearachies] non esiste questa relazione, per cui si sta creando una nuova relazione
      // ci sono due colonne che fanno parte di "questa relazione" (cioè delle due tabelle attualmente in modalità [hierarchies]) quindi possono essere eliminate
      document.querySelectorAll('.cardTable[hierarchies] ul > .element > li[data-relation-id]['+relationId+']').forEach((li) => {
        console.log('elimino li :'+li.innerText);
        // TODO: se è presente un'altra relazione, quindi un altro attributo data-rel, NON elimino [hierarchy] e [data-relation-id]
        //... (per non eliminare l'icona) che fa riferimento ad un'altra relazione sulla stessa colonna (doppia chiave)
        li.removeAttribute(relationId);
        li.removeAttribute('selected');
        let relationFound = false; // altra relazione trovata ?
        // console.log(li.getAttributeNames());
        // console.log(li.getAttributeNames().indexOf('data-rel-'));
        li.getAttributeNames().forEach((attr) => {
          // console.log(attr.indexOf('data-rel-'));
          if (attr.indexOf('data-rel-') !== -1) {
            console.log('trovata altra relazione : '+attr);
            relationFound = true;
          }

        });
        if (!relationFound) {
          li.removeAttribute('data-relation-id');
          li.removeAttribute('hierarchy');
        }
      });
      delete cube.hierarchyFact['hier_'+value];
      delete cube.hierarchyTable['hier_'+value];
      console.log(cube.hierarchyTable);
    }
  };

  app.checkStepGuide = function(step) {
    // per passare allo step successivo l'oggetto cube.dimension deve avere, al proprio interno, almeno un oggetto columns
    // se invece sono presenti più tabelle deve essere presente non solo cube.dimension.columns ma anche cube.dimension.hierarchies
    console.log(cube.dimension);
    const guide = document.getElementsByClassName('guide')[0];
    console.log(guide);
    const stepActive = guide.querySelector('.steps[active]');
    const stepToActivate = document.getElementById('step-'+step); // step da attivare
    console.log(stepActive);
    let toActivate = false; // flag di controllo
    //verificare prima se è valorizzato cube.dimension.columns e anche cube.hierarchies
    if (Object.keys(cube.dimension).length > 0) {

      // TODO: se ci sono due tabelle e nessuna relazione creata NON abilito saveDimension
      // tabelle trovate
      let tableFounded = app.body.querySelectorAll('.card.table').length;
      // console.log((cube.dimension.hasOwnProperty('hierarchies')));
      switch (tableFounded) {
        case 1:
          // console.log('una tabella');
          // controllo solo se ci sono le colonne
          if (cube.dimension.hasOwnProperty('columns')) {
            // console.log('abilito btnSaveDimension');
            app.btnSaveDimension.classList.remove('md-dark','md-inactive'); // NOTE: classList.remove rimuovere più elementi con classList
            toActivate = true;
          }
          break;
        default:
          // console.log('due tabelle');
          if (cube.dimension.hasOwnProperty('hierarchies') && cube.dimension.hasOwnProperty('columns')) {
            // console.log('abilito btnSaveDimension');
            app.btnSaveDimension.classList.remove('md-dark','md-inactive'); // NOTE: classList.remove rimuovere più elementi con classList
            toActivate = true;
          }

      }
      if (toActivate) {
        stepActive.removeAttribute('active');
        stepToActivate.setAttribute('active', true);
        // stepActive.nextElementSibling.setAttribute('active', true);
        // visualizzo anche hierarchiesContainer inizialmente nascosto
        document.getElementById('hierarchiesContainer').removeAttribute('hidden');
      }

    }

  };

  app.handlerCloseCard = function(e) {
    // elimino la card e la rivisualizzo nel drawer (spostata durante il drag&drop)
    console.log(e.target);
    console.log(e.path);
    // TODO: rimettere la card chiusa al suo posto originario, nel drawer
    e.path[5].remove();
    // TODO: eliminare anche dal flusso delle gerarchie sulla destra

    // TODO: controllo struttura gerarchiiccaaa app.checkStepGuide
  };

  app.getDimensions = function() {
    // recupero la lista delle dimensioni in localStorage, il Metodo getDimension restituisce un array
    // const tmplDimension = document.getElementById('dimension');
    const dimension = new DimensionStorage();
    let obj = dimension.list();
    // console.log(obj);
    const tmplDimension = document.getElementById('dimension');
    Array.from(Object.keys(obj)).forEach((dimName) => {
      // console.log(dimName);
      let tmplContent = tmplDimension.content.cloneNode(true);
      let div = tmplContent.querySelector('.dimensions');
      div.querySelector('h5').innerHTML = dimName;
      div.querySelector('h5').setAttribute('label', dimName);
      document.querySelector('#dimensions').appendChild(div);
      div.querySelector('h5').onclick = app.handlerDimensionSelected;

      // aggiungo anche le tabelle all'interno ella dimensione
      // console.log(obj[dimName]); // valore/i
      const tmplMiniCard = document.getElementById('miniCard');

      obj[dimName].forEach((table) => {
        let contentMiniCard = tmplMiniCard.content.cloneNode(true);
        let miniCard = contentMiniCard.querySelector('.miniCard');
        miniCard.querySelector('h6').innerHTML = table;
        // console.log(table);
        div.appendChild(miniCard);
      });

    });
  };

  app.getCubes = function() {
    // recupero la lista dei Cubi in localStorage
    const cubes = new CubeStorage();
    let obj = cubes.list();
    const ul = document.getElementById('cubes');

    for (let i in obj) {
      let element = document.createElement('div');
      element.className = 'element';
      element.setAttribute('label', obj[i]['key']);
      let li = document.createElement('li');
      li.innerText = obj[i]['key'];
      li.setAttribute('label', obj[i]['key']);
      li.id = 'cubeId_' + obj[i]['cubeId'];
      ul.appendChild(element);
      element.appendChild(li);
      li.onclick = app.handlerCubeSelected;
    }
  };

  app.handlerCubeSelected = function(e) {
    // TODO: stabilire quale attività far svolgere quando si clicca sul nome del report/cubo
    // ricreo un datamart

    let data = window.localStorage.getItem(e.target.getAttribute('label'));
    // console.log(data);
    var url = 'ajax/cube.php';
    let params = 'cube='+data;
    console.log(params);
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          console.table(response);

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
    // return;


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
          for (let i in response) {
            let tmpl = document.getElementById('el');
            let tmplContent = tmpl.content.cloneNode(true);
            let element = tmplContent.querySelector('.element.card');
            element.ondragstart = app.handlerDragStart;
            element.id = 'table-' + i;
            element.setAttribute('label', response[i][0]);
            ul.appendChild(element);
            let span = document.createElement('span');
            span.classList = 'elementSearch';
            span.setAttribute('label', response[i][0]);
            span.innerHTML = response[i][0];
            element.appendChild(span);

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

  app.handlerValueFilterSelected = function(e) {
    // selezione di un valore dall'elenco nella dialog filters
    // inserisco il valore nella textarea
    // console.log(e.target);
    // inserisco la colonna selezionata nella textarea
    const ul = app.dialogFilters.querySelector('ul#valuesList');
    const textarea = document.getElementById('filterFormula');
    let span;
    let valuesArr = [];

    if (!ul.hasAttribute('multi')) {
      // selezione singola
      // se l'elemento target è già selezionato faccio il return
      if (e.target.hasAttribute('selected')) return;
      // ...altrimenti elimino tutte le selezioni fatte (single) e imposto il target selezionato
      document.querySelectorAll('#valuesList li').forEach((li) => {li.removeAttribute('selected');});
      e.target.toggleAttribute('selected');

      // se il formulaValues già esiste (perchè inserito con IN/NOT IN non ricreo qui lo span)
      if (textarea.querySelector('.formulaValues')) {
        // console.log('esiste');
        span = textarea.querySelector('.formulaValues');
        span.innerText = e.target.getAttribute('label');
      } else {
        // console.log('non eiste');
        span = document.createElement('span');
        span.className = 'formulaValues';
        span.setAttribute('contenteditable', true);
        span.innerText = e.target.getAttribute('label');
        textarea.appendChild(span);
      }

    } else {
      // selezione multipla, quindi seleziono tutti gli elementi su cui si attiva il click
      e.target.toggleAttribute('selected');
      span = textarea.querySelector('.formulaValues');
      // TODO: recupero l'elenco dei valori selezionati nella multi
      let liSelected = app.dialogFilters.querySelectorAll('#valuesList li[selected]');
      // console.log(liSelected);
      liSelected.forEach((item) => {valuesArr.push(item.getAttribute('label'));});
      span.innerText = valuesArr;
    }
    span.focus();
    app.validityFilterDialog();
  };

  app.getDistinctValues = function(table, field) {

    // let tableName = e.target.getAttribute('data-tableName');
    // let fieldName = document.getElementById('filter-fieldName').innerText;
    // return;
    // TODO: getDistinctValues
    // ottengo i valori distinti per la colonna selezionata
    // TODO: utilizzare le promise
    var url = 'ajax/columnInfo.php';
    let params = 'table='+table+'&field='+field;
    // console.log(params);
    const ul = document.getElementById('valuesList');
    // pulisco la ul
    Array.from(ul.querySelectorAll('.element')).forEach((item) => {item.remove();});

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
            li.className = 'elementSearch';
            li.setAttribute('label', response[i][field]);
            li.innerHTML = response[i][field];
            element.appendChild(li);
            li.onclick = app.handlerValueFilterSelected;
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

  app.handlerAddHierarchy = function(e) {
    let cardTable = e.path[3].querySelector('.cardTable');
    cube.activeCard = cardTable;
    console.log(cardTable);
    cube.changeMode('hierarchies', 'Selezionare le colonne che saranno messe in relazione');
  };

  app.handlerAddColumns = function(e) {
    // console.log(e.target);
    // console.log(e.path);
    console.log('add columns');

    let cardTable = e.path[3].querySelector('.cardTable');
    cube.activeCard = cardTable;
    // console.log(cardTable);
    cube.changeMode('columns', 'Seleziona le colonne da mettere nel corpo della tabella');
  };

  app.handlerColumnFilterSelected = function(e) {
    // selezione della colonna nella dialogFilters
    // console.log(e.target);
    if (e.target.hasAttribute('selected')) {return;}

    // TODO: Nelle input che verranno mostrate dovrò andare a verificare il type del campo, se date mostro input type="date", se number <input type=number, ecc...
    document.querySelectorAll('#fieldsList li').forEach((li) => {li.removeAttribute('selected');});
    e.target.toggleAttribute('selected');
    // inserisco la colonna selezionata nella textarea, la colonna non è editabile
    const textarea = document.getElementById('filterFormula');
    let span = document.createElement('span');
    span.className = 'formulaField';
    span.innerText = e.target.getAttribute('label');
    textarea.appendChild(span);
    app.getDistinctValues(e.target.getAttribute('data-table'), e.target.getAttribute('label'));
    app.validityFilterDialog();
  };

  app.handlerAddFilters = function(e) {
    // apro la dialog filter
    // pulisco la input filter-name
    app.dialogFilters.querySelector('#filter-name').value = '';
    // ripulisco valuesList
    app.dialogFilters.querySelectorAll('#valuesList > .element').forEach((item) => {item.remove();});
    // ripulisco la textarea
    app.dialogFilters.querySelectorAll('#filterFormula span').forEach((item) => {item.remove();});
    // reset della lista operatori, nessun elemento deve essere già selezionato
    app.dialogFilters.querySelectorAll('#operator-list li').forEach((item) => {item.removeAttribute('selected');});
    // tasto ok disabilitato
    app.dialogFilters.querySelector('#btnFilterDone').disabled = true;

    cube.activeCard = e.path[3].querySelector('.cardTable');
    // console.log(cube.activeCard);
    // console.log(cube.activeCard.querySelectorAll('#columns > .element'));
    let ulFieldsList = document.getElementById('fieldsList');
    // pulisco la ul per non duplicare la lista delle colonne
    Array.from(ulFieldsList.querySelectorAll('.element')).forEach((item) => {item.remove();});
    // popolo la ul con la lista delle colonne
    Array.from(cube.activeCard.querySelectorAll('#columns > .element')).forEach((item) => {
      // console.log(item);
      let element = document.createElement('div');
      element.className = 'element';
      let liElement = item.querySelector('li');
      let li = liElement.cloneNode(true);
      element.appendChild(li);
      ulFieldsList.appendChild(element);
      li.onclick = app.handlerColumnFilterSelected;
    });

    app.dialogFilters.showModal();

    app.dialogFilters.querySelector('#btnFilterDone').onclick = cube.handlerBtnFilterDone.bind(cube);
  };

  app.handlerAddGroupBy = function(e) {
    // imposto il groupby mode
    let cardTable = e.path[3].querySelector('.cardTable');
    cube.activeCard = cardTable;
    cube.changeMode('groupby', 'Seleziona le colonne su cui applicare il GROUP BY');
  };

  app.handlerAddMetrics = function(e) {
    // imposto il metrics mode
    let cardTable = e.path[3].querySelector('.cardTable');
    cube.activeCard = cardTable;
    cube.changeMode('metrics', 'Seleziona le colonne da impostare come Metriche');
  };

  app.handlerFunctionMetricList = function() {
    // console.log(this);
    // questo elenco deve avere sempre almeno un elemento selezionato
    if (this.hasAttribute('selected')) {return;}
    document.querySelectorAll('#function-list li').forEach((li) => {li.removeAttribute('selected');});
    this.toggleAttribute('selected');
  };

  document.querySelectorAll('#function-list li').forEach((li) => {li.onclick = app.handlerFunctionMetricList;});

  app.handlerFunctionOperatorList = function(e) {
    // console.log(this);
    // questo elenco deve avere sempre almeno un elemento selezionato
    if (e.target.hasAttribute('selected')) {return;}

    // TODO: Nelle input che verranno mostrate dovrò andare a verificare il type del campo, se date mostro input type="date", se number <input type=number, ecc...
    document.querySelectorAll('#operator-list li').forEach((li) => {li.removeAttribute('selected');});
    this.toggleAttribute('selected');
    // console.log(e.target);
    const textarea = document.getElementById('filterFormula');
    let span = document.createElement('span');
    span.className = 'formulaOperator';
    span.innerText = e.target.getAttribute('label');
    textarea.appendChild(span);
    // debugger;
    let openPar, closePar, formulaValues;
    switch (e.target.getAttribute('label')) {
      case 'IN':
      case 'NOT IN':
        openPar = document.createElement('span');
        closePar = document.createElement('span');
        formulaValues = document.createElement('span');
        // inserisco anche formulaValues tra le parentesi della IN/NOT IN
        openPar.className = 'openPar';
        formulaValues.className = 'formulaValues';
        formulaValues.setAttribute('contenteditable', true);
        closePar.className = 'closePar';
        openPar.innerText = '( ';
        closePar.innerText = ' )';

        textarea.appendChild(openPar);
        textarea.appendChild(formulaValues);
        textarea.appendChild(closePar);
        formulaValues.focus();
        //  imposto la lista dei valori in multiselezione (una IN può avere un elenco di valori separati da virgola)
        app.dialogFilters.querySelector('#valuesList').setAttribute('multi', true);
        break;
      default:
        // TODO: valutare le operazioni da svolgere per questo blocco
    }
  };

  app.openReportList = function() {app.dialogReportList.showModal();};

  app.getTable = function(table) {
    let tmplList = document.getElementById('templateListColumns');
    // elemento dove inserire le colonne della tabella
    let ulContainer = cube.activeCard.querySelector('#columns');

    var url = 'ajax/tableInfo.php';
    let params = 'tableName='+table;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          // console.table(response);
          ulContainer.removeAttribute('hidden');
          for (let i in response) {
            let tmplContent = tmplList.content.cloneNode(true);
            let element = tmplContent.querySelector('.element');
            // element.setAttribute('name', 'columnSearch');
            let li = element.querySelector('li');
            li.className = 'elementSearch';
            // let iElement = element.querySelector('i');
            li.innerText = response[i][0];
            li.setAttribute('label', response[i][0]);
            // scrivo il tipo di dato senza specificare la lunghezza int(8) voglio che mi scriva solo int
            let pos = response[i][1].indexOf('(');
            let type = (pos !== -1) ? response[i][1].substring(0, pos) : response[i][1];
            li.setAttribute('data-type', type);
            li.setAttribute('data-table',cube.table);
            li.id = i;
            ulContainer.appendChild(element);
            // li.onclick = cube.handlerColumns.bind(cube);
            li.onclick = app.handlerColumns;
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

  /* tasto OK nella dialog dimension name*/
  document.getElementById('btnDimensionSaveName').onclick = function() {
    /*
      Salvo la dimensione, senza il legame con la FACT.
      Salvo in localStorage la dimensione creata
      // Visualizzo nell'elenco di sinistra la dimensione appena creata
      // creo un contenitorre per le dimensioni salvate, con dentro le tabelle che ne fanno parte.
    */

    cube.dimensionTitle = document.getElementById('dimensionName').value;
    // cube.dimension
    const storage = new DimensionStorage();
    // debugger;
    let from = [];
    // let fromObj = {};
    document.querySelectorAll('.cardTable').forEach((card) => {
      if (card.getAttribute('name')) {
        from.push(card.getAttribute('name'));
        cube.dimension.from = from;
      }
    });
    cube.dimension.type = 'DIMENSION';
    cube.dimension.filters = cube.filters;
    // console.log(obj);
    // debugger;
    // console.log(cube.dimension);
    cube.dimension.title = cube.dimensionTitle;
    // console.log(cube.dimension);
    // debugger;
    storage.dimension = cube.dimension;

    app.dialogDimensionName.close();
    app.checkStepGuide(3);
    // chiudo le card presenti
    app.closeCards();
    // visualizzo le dimensioni create
    // imposto, sulla icona openTableList, il colore della fact
    app.btnTableList.setAttribute('fact', true);
    app.getDimensions(); // TODO: qui andrò ad aggiornare solo la dimensione appena salvata/modificata

    delete cube.dimension;

  };

  app.closeCards = function() {
    document.querySelectorAll('.card.table').forEach((item) => {
      console.log(item);
      item.remove();
    });

  };

  app.btnSaveDimension.onclick = function() {app.dialogDimensionName.showModal();};

  app.btnSaveCube.onclick = function() {app.dialogCubeName.showModal();};

  app.btnSaveCubeName.onclick = function() {
    console.log('cube save');
    cube.cubeTitle = document.getElementById('cubeName').value;
    // recupero le dimensioni che sono state associate a queto cubo
    const storage = new DimensionStorage();
    console.log(cube.dimensionsSelected);
    let dimensionObject = {};
    cube.dimensionsSelected.forEach((dimensionName) => {
      console.log(dimensionName);
      storage.selected = dimensionName;
      console.log(storage.selected);
      dimensionObject[dimensionName] = storage.selected;
      // salvo la/le dimenioni scelte nell'object cube
      // REVIEW: da verificare
      cube.cube.associatedDimensions = dimensionObject;
    });
    console.log(cube.cube);
    console.log(cube.cube.associatedDimensions);
    cube.cube.type = 'CUBE';
    console.log(cube.hierarchyFact);
    cube.cube.hierarchies = cube.hierarchyFact;


    cube.cube.metrics = cube.metrics;
    cube.cube.filteredMetrics = cube.filteredMetrics;
    cube.cube.FACT = document.querySelector('.card.table[fact]').getAttribute('label');
    cube.cube.name = cube.cubeTitle;
    let cubeStorage = new CubeStorage();

    // Creo il cubeId basandomi sui cubi già creati in Storage, il cubeId lo associo al cubo che sto per andare a salvare.
    cube.cube.cubeId = cubeStorage.getIdAvailable();
    // debugger;
    console.log(cube.cube.cubeId);
    console.log(cube.cube);
    // salvo il cubo in localStorage
    cubeStorage.save = cube.cube;
    cubeStorage.stringifyObject = cube.cube;
    console.log('ajaxReq');
    app.dialogCubeName.close();
    // TODO: visualizzo il tasto crea report che rimanda alla pagina /reports
    app.btnNewReport.removeAttribute('hidden');

  };

  document.querySelectorAll('#operator-list li').forEach((li) => {
    li.onclick = app.handlerFunctionOperatorList;
  });

  app.btnNewFact.onclick = function() {
    app.btnTableList.setAttribute('fact', true);
    // nascondo .guide
    document.getElementById('guide').setAttribute('hidden', true);
  };


  // vado alla pagina reports/index.html
  app.btnNewReport.onclick = function() {location.href = '/reports/';};

  app.btnBack.onclick = function() {};

  /* ricerca cubi in elenco di sinitra*/
  // document.getElementById('cubeSearch').oninput = App.searchInList;
  /* ricerca in lista tabelle */
  document.getElementById('tableSearch').oninput = App.searchInList;

  app.inputValueSearch.oninput = App.searchInList;

  app.inputFilterName.oninput = function() {
    app.validityFilterDialog();
  };

  app.validityFilterDialog = function() {
    // TODO: verifico inserimento della formula per abilitare il tasto ok
    // iil nome del filtro è stato inserito ?
    let check = false;
    if (app.inputFilterName.value.length > 0) {
      // verifico se presente la formula
      if (app.dialogFilters.querySelector('#filterFormula').childElementCount >= 3) {
        check = true;
      }
    }
    (check) ? app.dialogFilters.querySelector('#btnFilterDone').disabled = false : app.dialogFilters.querySelector('#btnFilterDone').disabled = true;

  };

  document.getElementById('openTableList').onclick = function(e) {
    // visualizzo la lista delle tabelle
    const tableList = document.getElementById('tableList');
    tableList.toggleAttribute('hidden');
    e.target.toggleAttribute('open');
    document.getElementById('tableSearch').focus();
  };

  document.getElementById('processCube').onclick = function(e) {
    // visualizzo la lista delle tabelle
    const cubeList = document.getElementById('cubesList');
    cubeList.toggleAttribute('hidden');
    e.target.toggleAttribute('open');
    document.getElementById('cubeSearch').focus();
  };

  app.btnDimensionList.onclick = function(e) {
    const dimensionList = document.getElementById('dimensionList');
    dimensionList.toggleAttribute('hidden');
    e.target.toggleAttribute('open');
    document.getElementById('dimensionSearch').focus();
  };

  app.handlerDimensionSelected = function(e) {
    // selezione di una dimensione da inserire nel body
    console.log(e.target);

    const storage = new DimensionStorage();
    let lastTableInHierarchy;
    storage.selected = e.target.getAttribute('label');
    // memorizzo la dimensione selezionata per recuperarla nel salvataggio del cubo
    cube.dimensionsSelected = e.target.getAttribute('label');
    // recupero tutta la dimensione selezionata, dallo storage
    console.log(storage.selected);
    // TODO: tramite questa dimensione vado a ricreare l'ultima tabella della relazione, reimpostando le colonne/filtri/groupBy impostati su questa tabella
    if (storage.selected.hasOwnProperty('hierarchyOrder')) {
      // recupero l'ultima tabella da hierarchyOrder
      lastTableInHierarchy = storage.selected.hierarchyOrder[Object.keys(storage.selected.hierarchyOrder).length-1];
    } else {
      // recupero l'ultima tabella dalla unica presente, quindi nella from dell'oggetto
      lastTableInHierarchy = storage.selected.from;
    }
    // TODO: creo la card (lastTableInHierarchy)
    let card = document.createElement('div');
    card.className = 'card table';
    card.setAttribute('label',lastTableInHierarchy);
    card.onmousedown = app.dragStart;
    card.onmouseup = app.dragEnd;
    card.onmousemove = app.drag;
    // prendo il template cardLayout e lo inserisco nella .card.table
    let tmpl = document.getElementById('cardLayoutLastTable');
    let content = tmpl.content.cloneNode(true);
    let cardLayout = content.querySelector('.cardLayout');
    cardLayout.querySelector('.cardTable').setAttribute('fact', true);
    // imposto il titolo in h6

    cardLayout.querySelector('h6').innerHTML = lastTableInHierarchy;
    card.appendChild(cardLayout);
    console.log(card);
    app.body.appendChild(card);

    // evento sul tasto close della card
    card.querySelector('i[data-id="closeTable"]').onclick = app.handlerCloseCard;
    // evento sulla input di ricerca nella card
    card.querySelector('input').oninput = App.searchInList;

    cube.activeCard = card.querySelector('.cardTable');
    // inserisco il nome della tabella selezionata nella card [active]
    cube.table = card.getAttribute('label');

    // event sui tasti section[options]
    card.querySelector('i[hierarchies]').onclick = app.handlerAddHierarchy;

    app.getTable(lastTableInHierarchy);

  };

  // input su fieldSearch in dialogFilter
  app.dialogFilters.querySelector('#fieldSearch').oninput = App.searchInList;

  app.handlerLogicalOperator = function(e) {
    // selezione di un operatore logico da inserire nella formula
    const textarea = document.getElementById('filterFormula');
    let span = document.createElement('span');
    span.className = 'formulaLogicalOperator';

    span.innerText = e.target.getAttribute('label');
    textarea.appendChild(span);
  };

  // operatori logici nella dialogFilters
  app.dialogFilters.querySelectorAll('.logicalOperator > span').forEach((item) => {
    item.onclick = app.handlerLogicalOperator;
  });



  /*events */

  app.getDatabaseTable();

  app.getDimensions();

  app.getCubes();

  // app.getDatamartList();
})();
