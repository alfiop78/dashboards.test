var App = new Application();
var Pages = new Page();
var Query = new Queries();

(() => {
  var app = {
    report : null,
    // templates
    tmplListField : document.getElementById('templateListField'),
    
    btnPreviousStep : document.getElementById('stepPrevious'),
    btnNextStep : document.getElementById('stepNext'),
    btnStepDone : document.getElementById('stepDone'),
    btnSaveAndProcess : document.getElementById('saveAndProcess'),

    btnProcessReport : document.getElementById('btnProcessReport'),

    // dialog
    dialogSaveReport: document.getElementById('dialogSaveReport'),
    dialogFilter : document.getElementById('dialogFilter'),
    dialogColumn : document.getElementById('dialogColumn'),
    dialogMetric : document.getElementById('dialogMetric'),
    btnFilterSave : document.getElementById('btnFilterSave'), //tasto salva nella dialog filter
    btnFilterDone : document.getElementById('btnFilterDone'), //tasto fatto nella dialog filter
    btnColumnDone : document.getElementById('btnColumnDone'), // tasto ok nella dialogColumn
    btnMetricDone : document.getElementById('btnMetricDone'), // tasto Salva nella dialogMetric
    btnSaveReport : document.getElementById('saveReport'),
    btnSaveReportDone: document.getElementById('btnReportSaveName'),
    // end dialog

    btnOpenCubes: document.getElementById('openCube'),
    dialogReportList : document.getElementById('dialog-reportList'),
    dialogTableList : document.getElementById('table-list'),
    dialogCubeName : document.getElementById('cube-name'),
    dialogDimensionName : document.getElementById('dimension-name'),
    dialogHierarchyName : document.getElementById('hierarchy-name'),
    dialogCubeList: document.getElementById('dialog-cube-list'),
    
    dialogColOption : document.getElementById('columnsOption'),
    dialogPagebyOption : document.getElementById('pagebyOptions'),
    btnBack : document.getElementById('mdc-back'),
    btnPreviewReport : document.getElementById('mdc-preview-report'),
    btnDashboardLayout : document.getElementById('mdc-dashboard-layout'),
    btnNewReport: document.getElementById('mdc-new-report'),
    btnReportSave : document.getElementById('mdcReportSave'),
    
    btnNextPage : document.getElementById('mdcNextPage'),
    btnBackPage : document.getElementById('mdcBack'),
    btnSaveColOption: document.getElementById('btnSaveColOption'),
    table: document.getElementById('table-01'),
    // btn in actions
    btnOpenReport : document.getElementById('openReport'),
    // TODO: valutare se questi elementi, con i suoi eventi, bisogna inserirli nella classe Options
    propertyColHidden: document.getElementById('chkbox-hide-col'),
    fgColorInput : document.getElementById('fgColor'),
    bgColorInput: document.getElementById('bgColor'),
    alignLeft: document.getElementById('align-left'),
    alignCenter: document.getElementById('align-center'),
    alignRight: document.getElementById('align-right'),
    formatBold: document.getElementById('format-bold'),
    formatItalic: document.getElementById('format-italic'),
    radioSingleSelection: document.getElementsByName('selection-type'),
    numberFormat : document.getElementById('numberFormat'),
    openCubeList : document.getElementById('openCubeList'),

    reportSection : document.getElementById('reportSection')

  };

  App.init();

  // la Classe Steps deve impostare alcune proprietà DOPO che viene visualizzato il body, non può essere posizionato prima di App.init();
  var Step = new Steps('stepTranslate');
  // TODO: penso si possano spostare anche le altre Classi qui

  app.getReports = function() {
    // recupero la lista dei report già presenti
    const reports = new ReportStorage();
    // console.log(reports.list());
    let reportsObj = reports.list();
    const ul = document.getElementById('reports');
    // TODO: recuperare element dal template che già contiene la class li.elementSearch

    for (let i in reportsObj) {
      // console.log(reportsObj[i]);
      let element = document.createElement('div');
      element.className = 'element';
      element.setAttribute('label', reportsObj[i]['name']);

      let li = document.createElement('li');
      li.innerText = reportsObj[i]['name'];
      li.setAttribute('data-report-id', reportsObj[i]['reportId']);
      li.setAttribute('label', reportsObj[i]['name']);
      element.appendChild(li);
      ul.appendChild(element);
      li.onclick = app.handlerReportSelected;
    }
  };

  // selezione del report con datamart già presente
  // recupero un datamart FX... già creato e visualizzo l'anteprima
  app.handlerReportSelected = function(e) {
    const report = new ReportStorage();
    const JSONReportData = report.getJSON(e.target.getAttribute('label'));
    // console.log(JSONReportData);

    var url = 'ajax/reports.php';
    let params = 'datamartId=' + JSONReportData.id;

    // console.log(params);
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          console.table(response);
          app.openReport(response, JSONReportData);
          // app.createReport(response, dataJSON);
          // TODO: va impostato l'attribute mode='report' sul tasto saveReport, questo tasto avrà un comportamento condizionato dall'attribute mode
          app.btnSaveReport.setAttribute('mode', 'report');
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

  // click sul report da processare/elaborare
  app.handlerReportToBeProcessed = function(e) {
    const label = e.target.getAttribute('label');
    console.log(label);
    const reportId = +e.target.getAttribute('data-id');
    console.log('reportId : ',reportId);
    let data = window.localStorage.getItem(label);
    let dataJSON = JSON.parse(window.localStorage.getItem(label));
    console.log(dataJSON);
    var url = 'ajax/cube.php';
    let params = 'cube='+data;
    console.log(params);
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          console.table(response);
          if (response === 0) {
            console.log('NON CI SONO DATI');
          } else {
            // lo salvo in dialog-reportList
            app.getDatamart(reportId, dataJSON);
            // TODO: va impostato l'attribute mode='process' sul tasto saveReport, questo tasto avrà un comportamento condizionato dall'attribute mode
            app.btnSaveReport.setAttribute('mode', 'process');
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

  app.getDatamart = function(datamartId, dataJSON) {
    var url = 'ajax/reports.php';
    let params = 'datamartId=' + datamartId;

    // console.log(params);
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          console.table(response);
          app.createReport(response, dataJSON);
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

  // report da processare
  app.datamartToBeProcessed = function(e) {
    const storage = new ReportProcessStorage();

    const toBeProcessed = storage.list();

    const ul = document.getElementById('reportsProcess');
    let content = app.tmplListField.content.cloneNode(true);
    let element = content.querySelector('.element');
  
    for (let proc in toBeProcessed) {
      console.log(proc);
      console.log(toBeProcessed[proc]);
      let li = element.querySelector('li');
      li.innerText = proc;
      li.setAttribute('label', proc);
      li.setAttribute('data-id', toBeProcessed[proc]['processId']);
      ul.appendChild(element);
      li.onclick = app.handlerReportToBeProcessed;
    }
  };

  // selezione del cubo
  app.handlerCubeSelected = function(e) {
    const cubeId = e.target.getAttribute('data-cube-id');
    const cubeName = e.target.getAttribute('label');
    const storage = new CubeStorage();
    let cube = storage.json(cubeName);
    e.target.toggleAttribute('selected');
    
    Query.from = cube.FACT;
    Query.factRelation = cube.relations;
    
    app.createListTableMetrics(cube.metrics, cubeName);
    // aggiungo la tabella fact selezionata alla lista dello step 3 - filters
    // OPTIMIZE: Ottimizzare quando verranno aggiunti più cubi, inserendo un data-table-id, index e altre cose che mancano
    let ulTable = document.getElementById('tables-filter');
    let liTable = document.createElement('li');
    let elementTable = document.createElement('div');
    let i = document.createElement('i');
    i.className = 'material-icons md-18';
    i.innerText = 'add';
    i.setAttribute('label', cube.FACT);
    elementTable.className = 'element';

    liTable.innerText = cube.FACT;
    //li.id = 'table-filter-' + index;
    //li.setAttribute('data-table-id', index);
    liTable.setAttribute('label', cube.FACT);
    elementTable.appendChild(liTable);
    elementTable.appendChild(i);
    ulTable.appendChild(elementTable);

    liTable.onclick = app.handlerTableSelectedFilter;
    i.onclick = app.handlerAddFilter; // apro la dialog
    
    // recupero l'object Cube dallo storage, con questo object recupero le dimensioni associate al cubo in 'associatedDimensions'
    // console.log(storage.associatedDimensions(cubeName));
    let ul = document.getElementById('dimensions');
    const dimensions = storage.associatedDimensions(cubeName);
    let element = document.createElement('div');
    element.classList.add('element');
    for (dimension in dimensions) {
      // console.log(dimension);
      // console.log(dimensions);
      let li = document.createElement('li');
      li.innerText = dimension;
      li.setAttribute('label', dimension);
      ul.appendChild(element);
      element.appendChild(li);
      li.onclick = app.handlerDimensionSelected;
    }
  };

  // selezione delle dimensioni da utilizzare per la creazione del report
  app.handlerDimensionSelected = function(e) {
    // imposto attributo selected sulle dimensioni selezionate
    e.target.toggleAttribute('selected');
    //  popolo la sezione step 2, colonne e field
    // popolo anche lo step 3 che riguarda l'inserimento dei filtri, quindi deve essere popolato con le tabelle, compresa la fact, alla selezione della quale saranno visualizzati i campi da selezionare
    // ... i cmapi per impostare i filtri.
    const dimName = e.target.getAttribute('label');
    const Dim = new DimensionStorage();
    Dim.selected = dimName;

    let columns = Dim.selected.columns;

    app.createListTableColumns(Dim.selected.columns);
    
    app.createListTableFilters(Dim.selected.from);

    // TODO: salvo l'object _where. Recupero, dalla dimensione, la key hierarchies (da rinominare in relations)
    Query.where = Dim.selected.join;
  };

  // creo la lista delle tabelle nella sezione dello step 3 - Filtri
  app.createListTableFilters = function(from) {
    // console.log(from); // array
    let ul = document.getElementById('tables-filter');

    from.forEach((table, index) => {
      Query.from = table;
      let li = document.createElement('li');
      let element = document.createElement('div');
      let i = document.createElement('i');
      element.className = 'element';
      li.innerText = table;
      i.className = 'material-icons md-18';
      i.innerText = 'add';
      i.setAttribute('label', table);
      li.setAttribute('data-table-id', index);
      li.setAttribute('label', table);
      element.appendChild(li);
      element.appendChild(i);
      ul.appendChild(element);
      li.onclick = app.handlerTableSelectedFilter;
      i.onclick = app.handlerAddFilter; // apro la dialog
    });
  };

  app.createListTableMetrics = function(metrics, cubeName) {

    let ulTable = document.getElementById('tables-metric');

    Object.keys(metrics).forEach((table, index) => {
      console.log(table);
      console.log(metrics[table]);

      let liTable = document.createElement('li');
      let elementTable = document.createElement('div');
      elementTable.className = 'element';
      liTable.innerText = table;
      liTable.setAttribute('data-table-id', index);
      liTable.setAttribute('data-list-type', 'metric');
      liTable.setAttribute('label', table);
      elementTable.appendChild(liTable);
      ulTable.appendChild(elementTable);
      liTable.onclick = app.handlerTableSelected;

      let tmpl_ulList = document.getElementById('tmpl_ulList');
      let ulContent = tmpl_ulList.content.cloneNode(true);
      let ulField = ulContent.querySelector('ul[data-id="fields-metric"]');
      const parentElement = document.getElementById('sectionFields-metric'); // elemento a cui aggiungere la ul

      let tmplFieldList = document.getElementById('templateListField'); // TODO: da modificare con app.tmplListField

      ulField.setAttribute('data-table-id', index);
      metrics[table].forEach((metric) => {
        // console.log(metric);
        let content = tmplFieldList.content.cloneNode(true);
        let element = content.querySelector('.element');
        let li = element.querySelector('li');
      
        li.innerText = metric;
        // li.innerText = metrics[name].alias;
        li.setAttribute('label', metric);
        li.setAttribute('data-field', metric);
        li.setAttribute('data-cube-name', cubeName);
        element.appendChild(li);
        ulField.appendChild(element);
        li.onclick = app.handlerFieldSelectedMetric;
      });

      parentElement.appendChild(ulField);
    });
  };

  // creo la lista delle tabelle nella sezione dello step 2 - Colonne
  app.createListTableColumns = function(columns) {
    // console.log(columns); // object
    let ulTable = document.getElementById('tables-column');
    
    Object.keys(columns).forEach((table, index) => {
      // console.log(table);
      let elementTable = document.createElement('div');  
      elementTable.className = 'element';
      let li = document.createElement('li');
      li.innerText = table;
      li.setAttribute('data-table-id', index);
      li.setAttribute('data-list-type', 'column');
      li.setAttribute('label', table);
      elementTable.appendChild(li);
      ulTable.appendChild(elementTable);
      li.onclick = app.handlerTableSelected;
      // tabella inserita in lista
     
      // inserisco le ul come fatto con fieldList-filter
      let tmpl_ulList = document.getElementById('tmpl_ulList');
      let ulContent = tmpl_ulList.content.cloneNode(true);
      let ulField = ulContent.querySelector('ul[data-id="fields-column"]');
      const parentElement = document.getElementById('fieldList-column'); // elemento a cui aggiungere la ul

      //let tmplFieldList = document.getElementById('templateListField'); // TODO: da modificare con app.tmplListField

      ulField.setAttribute('data-table-id', index);
      
      for (let i in columns[table]) {
        let field = columns[table][i]; // nome del campo della tabella
        // inserisco i field della tabella, nascondo la lista per poi visualizzarla quando si clicca sul nome della tabella
        let content = app.tmplListField.content.cloneNode(true);
        let element = content.querySelector('.element');
        let li = element.querySelector('li');
        li.innerText = field;
        li.setAttribute('label', field);
        element.appendChild(li);
        ulField.appendChild(element);
        li.onclick = app.handlerFieldSelectedColumn;
      }
      parentElement.appendChild(ulField);
    });
  };

  // tasto add nella sezione Filtri (step 3)
  app.handlerAddFilter = function(e) {
    // carico elenco field per la tabella selezionata
    Query.table = e.target.getAttribute('label');
    app.getFields();
    // apro la dialog filter
    app.dialogFilter.showModal();
    // event su <li> degli operatori
    document.querySelectorAll('#operatorList').forEach((li) => {
      li.onclick = app.handlerFilterOperatorSelected;
    });
  };

  // selezione della tabella nello step Filter, visualizzo i filtri creati su questa tabella, recuperandoli dallo storage
  app.handlerTableSelectedFilter = function(e) {
    const table = e.target.getAttribute('label');
    const storage = new FilterStorage();
    const filters = storage.list(table);
    const ul = document.getElementById('exists-filter');
    // pulisco la ul prima di visualizzare i filtri relativi alla tabella selezionata
    ul.querySelectorAll('.element').forEach((el) => {el.remove();});
    
    for (let filter in filters) {
      // console.log(filter); // nome del filtro
      // console.log(filters[filter]); // formula
      let content = app.tmplListField.content.cloneNode(true);
      let element = content.querySelector('.element');
      let li = element.querySelector('li');
      li.innerText = filter;
      li.setAttribute('label', filter);
      ul.appendChild(element);
      li.onclick = app.handlerFilterSelected;
    }
  };

  // selezione di un filtro già esistente, lo salvo nell'oggetto Query, come quando si salva un nuovo filtro dalla dialog
  app.handlerFilterSelected = function(e) {
    const storage = new FilterStorage();
    storage.filter = e.target.getAttribute('label');
    // TODO: recupero dallo storage il filtro selezionato
    // console.log(storage.filter);
    // console.log(storage.filter.formula);
    Query.filterName = storage.filter.name;
    Query.filters = storage.filter.formula;
  };

  // selezione di una metrica già esistente, lo salvo nell'oggetto Query, come quando si salva un nuovo filtro dalla dialog
  app.handlerMetricSelected = function(e) {
    const storage = new MetricStorage();
    storage.metric = e.target.getAttribute('label');
    // TODO: recupero dallo storage la metrica selezionata
    console.log(storage.metric);
    console.log(storage.metric.name);
    console.log(storage.metric.formula);
    Query.metricName = storage.metric.name;
    // TODO: se la metrica contiene un filtro bisogna aggiungerla a Query.filteredMetrics e non a Query.metrics
    if (storage.metric.formula[storage.metric.name].hasOwnProperty('filters')) {
      Query.filteredMetrics = storage.metric.formula[storage.metric.name];
    } else {
      Query.metrics = storage.metric.formula[storage.metric.name];
    }
  };

  // selezione della metrica, apro la dialog per impostare la metrica
  app.handlerFieldSelectedMetric = function(e) {
    Query.field = e.target.getAttribute('label');
    // carico elenco filtri presenti su tutte le tabelle che fanno parte di tutte le dimensioni selezionate
    // 1 - recupero le tabelle presenti nel terzo step ul #tables-filter
    const storage = new FilterStorage();
    let filters = [];
    document.querySelectorAll('#tables-filter > .element >li').forEach((table) => {filters.push(storage.list(table.getAttribute('label')));});
    console.log(filters);
    // 2 - per ogni tabella recupero i filtri impostati dallo storage e li visualizzo in ul-existsFilter_Metric
    const ul = document.getElementById('ul-existsFilter_Metric');
    // pulisco la lista dei filtri
    ul.querySelectorAll('.element').forEach((el) => {el.remove();});
    
    //console.log(ulContent);
    //let element = ulContent.querySelector('.element');
    filters.forEach((object) => {
      //console.log(object);
      if (Object.keys(object).length > 0) {
        
        for (let filter in object) {
          let ulContent = app.tmplListField.content.cloneNode(true);
          let element = ulContent.querySelector('.element');
          let li = element.querySelector('li');
          console.log(filter); // il nome del filtro
          li.innerText = filter;
          li.setAttribute('label', filter);
          //console.log(object[filter]); // la formula
          ul.appendChild(element);
          li.onclick = function(e) {e.target.toggleAttribute('selected');};
        }
      }
      

    });

    app.dialogMetric.showModal();
  };

  // selezione della tabella nella sezione Column o metric
  app.handlerTableSelected = function(e) {
    // visualizzo la ul nascosta della tabella selezionata, sezione columns
    let fieldType = e.target.getAttribute('data-list-type');
    let tableId = +e.target.getAttribute('data-table-id');
    document.querySelector("ul[data-id='fields-"+fieldType+"'][data-table-id='"+tableId+"']").removeAttribute('hidden');
    // rimuovo eventuali altri ul aperti in precedenza
    Array.from(document.querySelectorAll("ul[data-id='fields-"+fieldType+"']:not([data-table-id='"+tableId+"'])")).forEach((ul) => {ul.setAttribute('hidden', true);});
    
    e.target.toggleAttribute('selected');
    Query.table = e.target.getAttribute('label');
    // in base alla tabella selezionata, recupero le metriche già esistenti, nello storage, per questa tabella
    const storage = new MetricStorage()
    const metrics = storage.list(Query.table);
    console.log(metrics);
   
    const ul = document.getElementById('exists-metric');
    for (let metric in metrics) {
      let content = app.tmplListField.content.cloneNode(true);
      let element = content.querySelector('.element');
      let li = element.querySelector('li');
      li.innerText = metric;
      li.setAttribute('label', metric);
      ul.appendChild(element);
      li.onclick = app.handlerMetricSelected;
    }
  };

  // selezione della colonna nella dialogFilter
  app.handlerFilterFieldSelected = function(e) {
    e.target.toggleAttribute('selected');
    Query.field = e.target.getAttribute('label');
    Query.fieldType = e.target.getAttribute('data-type');
    // inserisco il field selezionato nella textarea, la colonna non è editabile
    const textarea = document.getElementById('filterFormula');
    let span = document.createElement('span');
    span.className = 'formulaField';
    span.innerText = Query.field;
    textarea.appendChild(span);
    // TODO: recupero la lista dei valori distinct dalla tabella
    app.getDistinctValues();
    app.checkFilterForm();

  };

  // selezione dell'operatore nella dialogFilter
  app.handlerFilterOperatorSelected = function(e) {
    
    document.querySelectorAll('#operatorList li').forEach((li) => {li.removeAttribute('selected');});
    e.target.toggleAttribute('selected');
    const textarea = document.getElementById('filterFormula');
    let span = document.createElement('span');
    span.className = 'formulaOperator';
    span.innerText = e.target.getAttribute('label');
    span.setAttribute('label', e.target.getAttribute('label'));
    textarea.appendChild(span);
    let openPar, closePar, formulaValues;
    // OPTIMIZE: da ottimizzare
    switch (e.target.getAttribute('label')) {
      case 'IN':
      case 'NOT IN':
        openPar = document.createElement('span');
        closePar = document.createElement('span');
        formulaValues = document.createElement('span');
        // inserisco anche formulaValues tra le parentesi della IN/NOT IN
        openPar.className = 'openPar';
        formulaValues.className = 'formulaValues';
        // formulaValues.setAttribute('contenteditable', true);
        closePar.className = 'closePar';
        openPar.innerText = '( ';
        closePar.innerText = ' )';

        textarea.appendChild(openPar);
        textarea.appendChild(formulaValues);
        textarea.appendChild(closePar);
        formulaValues.focus();
        //  imposto la lista dei valori in multiselezione (una IN può avere un elenco di valori separati da virgola)
        app.dialogFilter.querySelector('#filterValueList').setAttribute('multi', true);
        break;

      default:
        // TODO: valutare le operazioni da svolgere per questo blocco
    }
    app.checkFilterForm();
  };

  // carico elenco colonne dal DB per visualizzare nella dialogFilter
  app.getFields = function() {
    console.log(Query.table);
    const url = '/ajax/tableInfo.php';
    let params = 'tableName='+Query.table;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          // TODO: pulisco l'elenco dei campi
          let ul = document.getElementById('filter-fieldList');
          ul.querySelectorAll('div.element').forEach((el) => {el.remove();});
          let tmplFieldList = document.getElementById('templateListField'); // TODO: da modificare con app.tmplListField
          

          for (let i in response) {
            let content = tmplFieldList.content.cloneNode(true);
            let element = content.querySelector('.element');
            let li = element.querySelector('li');
            li.setAttribute('label', response[i][0]);
            li.innerText = response[i][0];
            // scrivo il tipo di dato senza specificare la lunghezza int(8) voglio che mi scriva solo int
            let pos = response[i][1].indexOf('(');
            let type = (pos !== -1) ? response[i][1].substring(0, pos) : response[i][1];
            li.setAttribute('data-type', type);
            // li.id = i; al momento non mi serve
            ul.appendChild(element);
            li.onclick = app.handlerFilterFieldSelected;
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

  // selezione della colonna da inserire nel report
  app.handlerFieldSelectedColumn = function(e) {
    // seleziono la colonna da inserire nel report e la inserisco nel reportSection
    Query.field = e.target.getAttribute('label');
    app.dialogColumn.showModal();
    
    app.btnColumnDone.onclick = app.handlerBtnColumnDone;
  };

  // Salvataggio dell'alias di colonna
  app.handlerBtnColumnDone = function() {
    // Confermo il nome dell'alias per la colonna
    // TODO: da inserire anche SQL formula (es.: date_format()) in un textarea oppure un contenteditable
    const alias = document.getElementById('inputColumnName').value;
    //console.log(alias);
    //let obj = {'SQLFormat': null, alias};
    let obj = {};
    obj = {'SQLFormat': null, alias};
    
    Query.select = obj;
    
    // aggiungo la colonna selezionata a Query.groupBy
    obj = {};
    obj = {'SQLFormat': null};
    Query.groupBy = obj;

    let table = document.getElementById('tablePreview');
    // aggiungo la colonna alla tabella
    const th = document.createElement('th');
    th.innerText = Query.getAliasColumn();
    table.tHead.rows[0].appendChild(th);

    app.dialogColumn.close();
  };

  // salvo la metrica impostata
  app.btnMetricDone.onclick = function(e) {
    const name = app.dialogMetric.querySelector('#metric-name').value;
    const SQLFunction = document.querySelector('#function-list > li[selected]').innerText;
    const distinctOption = document.getElementById('checkbox-distinct').checked;
    const alias = document.getElementById('alias-metric').value;
    Query.metricName = name;
    console.log(Query.metricName);
    //console.log(Query.table);
    // verifico se ci sono filtri da associare a questa metrica
    const ul = document.getElementById('ul-existsFilter_Metric');
    let filtersAssociated = {};
    const filterStorage = new FilterStorage()
    ul.querySelectorAll('.element > li[selected]').forEach((filter) => {
      // filtersAssociated.push(filter.getAttribute('label'));
      // set il nome del filtro
      filterStorage.filter = filter.getAttribute('label');
      // recupero dallo storage il contenuto del filtro per inserirlo in un object (quest'ultimo verrà inserito nella metrica)
      filtersAssociated[filter.getAttribute('label')] = filterStorage.filter;
    });

    let metricObj = {};
    // se filtersAssociated > 0 sarà una metrica filtrata, altrimenti una metrica a livello di report (senza nessun filtro all'interno della metrica)
    if (Object.keys(filtersAssociated).length > 0) {
      // metrica filtrata
      console.log('metrica filtrata');
      Query.filteredMetrics = {SQLFunction, 'table': Query.table, 'field': Query.field, name, 'distinct' : distinctOption, alias, 'filters': filtersAssociated};
      
      console.log(Query.filteredMetrics);
      metricObj = {'type': 'METRIC', name, 'formula' : Query.filteredMetrics};
    } else {
      // metrica
      Query.metrics = {SQLFunction, 'table': Query.table, 'field': Query.field, name, 'distinct' : distinctOption, alias};
      // all'interno di 'formula' devo vedere se ci posso mettere l'object appena salvato in Query.metrics
      metricObj = {'type': 'METRIC', name, 'formula' : Query.metrics};
      //console.log(metricObj);
    }

    const storage = new MetricStorage();
    // salvo la nuova metrica nello storage
    console.log(metricObj)
    
    storage.save = metricObj;

    // aggiungo la metrica appena creata nella preview della tabella
    let table = document.getElementById('tablePreview');
    const th = document.createElement('th');
    th.innerText = alias;
    table.tHead.rows[0].appendChild(th);

    app.dialogMetric.close();
  };

  // salvataggio del filtro impostato nella dialog
  app.btnFilterSave.onclick = function(e) {
    // Filter save
    const textarea = document.getElementById('filterFormula');
    let filterName = document.getElementById('filter-name');
    
    console.log(filterName.value);
    Query.filterName = filterName.value;
    let operator = app.dialogFilter.querySelector('#filterFormula .formulaOperator').innerText;
    // FIXME: In futuro dovrò modificare la gestione dei filtri perchè al momento non posso inserire filtri (es.: in AND o OR) appartenenti a due tabelle diverse

    let values = [], value;

    switch (operator) {
      case 'IN':
      case 'NOT IN':
        value = app.dialogFilter.querySelector('#filterFormula .formulaValues').innerHTML;
        // console.log(value);
        // console.log('IN / NOT IN');
        values = value.split(',');

        break;
      default:
        value = app.dialogFilter.querySelector('#filterFormula .formulaValues').innerHTML;
        values.push(value);
    }

    let formula = '';
    // ciclo gli elementi nella formula per creare il filtro
    Array.from(document.querySelectorAll('#filterFormula > span')).forEach((span) => {
      //console.log(span);
      formula += (span.classList.contains('formulaField')) ? `${Query.table}.${span.innerText} `: `${span.innerText} `;

    });
    
    console.log(formula);
    console.log(Query.table);

    Query.filters = formula.trimEnd();
    // Quando creo un filtro su una determinata tabella posso riutilizzarlo elencando la lista dei filtri già creati, successivamnete...
    // ...cliccando una determinata tabella mostro l'elenco dei filtri già creati per questa tabella, in modo da non duplicarli e/o non doverli ricreare
    const storage = new FilterStorage();
    let = filterObj = {'type': 'FILTER', 'name': filterName.value, 'table': Query.table, 'formula': formula.trimEnd()};
    storage.save = filterObj;
    
    // visualizzo il filtro appena creato nella section #sectionFields-filter
    // TODO: e anche nella lista dei filtri esistenti all'interno della metrica, se si vuole utilizzarlo nella metrica 
    const ulFilterMetric = document.getElementById('ul-existsFilter_Metric');
    let ulContent = app.tmplListField.content.cloneNode(true);
    let elementFilterMetric = ulContent.querySelector('.element');
    let liFilterMetric = elementFilterMetric.querySelector('li');
    liFilterMetric.setAttribute('label', filterName.value);
    liFilterMetric.innerText = filterName.value;
    elementFilterMetric.appendChild(liFilterMetric);
    ulFilterMetric.appendChild(elementFilterMetric);


    let ul = document.getElementById('createdFilters');
    let li = document.createElement('li');
    let element = document.createElement('div');
    li.innerText = filterName.value;
    li.setAttribute('label', filterName.value);
    element.className = 'element';
    element.appendChild(li)
    ul.appendChild(element);
    // reset del form
    filterName.value = '';
    filterName.focus();
    // pulisco la textarea
    textarea.querySelectorAll('span').forEach((span) => {span.remove();});
  };

  app.btnFilterDone.onclick = function(e) {app.dialogFilter.close();};

  // recupero valori distinti per inserimento nella dialogFilter
  app.getDistinctValues = function() {

    // let tableName = e.target.getAttribute('data-tableName');
    // let fieldName = document.getElementById('filter-fieldName').innerText;
    // return;
    // getDistinctValues
    // ottengo i valori distinti per la colonna selezionata
    // TODO: utilizzare le promise
    var url = 'ajax/columnInfo.php';
    let params = 'table='+Query.table+'&field='+Query.field;
    console.log(params);
    const ul = document.getElementById('filter-valueList');
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
            li.setAttribute('label', response[i][Query.field]);
            li.innerHTML = response[i][Query.field];
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

  // selezione di uno o più valori dalla lista dei valori della colonna in dialogFilter
  app.handlerValueFilterSelected = function(e) {
    const textarea = document.getElementById('filterFormula');
    const ul = app.dialogFilter.querySelector('#filter-valueList');
    let span;
    let values = [];
    
    if (!ul.hasAttribute('multi')) {
      // selezione singola
      // se l'elemento target è già selezionato faccio il return
      if (e.target.hasAttribute('selected')) return;
      // ...altrimenti elimino tutte le selezioni fatte (single) e imposto il target selezionato
      document.querySelectorAll('#valuesList li').forEach((li) => {li.removeAttribute('selected');});
      e.target.toggleAttribute('selected');

      span = document.createElement('span');
      span.className = 'formulaValues';
      
      switch (Query.fieldType) {
        case 'varchar':
          // TODO: definire altri datatype
          span.innerText = `"${e.target.getAttribute("label")}"`;
          break;
        default:
          // int o decimal
          span.innerText = `${e.target.getAttribute("label")}`;
      }
      textarea.appendChild(span);
      // TODO: verifico, dopo aver inserito il valore selezionato, se l'elemento precedente è un BETWEEN
      const operator = span.previousElementSibling.getAttribute('label');
      if (operator === 'BETWEEN') {
        let and = document.createElement('span');
        and.className = 'formulaOperator';
        and.innerText = 'AND';
        textarea.appendChild(and);
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
    app.checkFilterForm();
  };

  app.loadCubes = function(e) {
    // carico elenco Cubi su cui creare il report
    // console.log('loadCubes');
    const cubes = new CubeStorage();
    // console.log(storage.list);
    let ul = document.getElementById('cubes');
    let obj = cubes.list();
    // console.log(obj);
    
    for (let i in obj) {
      // console.log(obj[i]['key']);
      let element = document.createElement('div');
      element.classList.add('element');
      let li = document.createElement('li');
      li.innerText = obj[i]['key'];
      li.id = 'cube-' + obj[i]['id'];
      li.setAttribute('data-cube-id', obj[i]['id']);
      li.setAttribute('label', obj[i]['key']);
      element.appendChild(li);
      ul.appendChild(element);
      
      li.onclick = app.handlerCubeSelected;
    }
  };

  app.createReport = function(response, dataJSON) {
    console.log('create report');
    
    // ottengo un reportId per passarlo a costruttore
    const storage = new ReportStorage();
    const reportId = storage.getIdAvailable();
    console.log(reportId);

    console.log(dataJSON);
    
    app.report = new Options(app.table, reportId);
    console.log(app.report);
    
    app.report.cube = dataJSON;
    // dati estratti dalla query
    app.report.data = response;
    // aggiungo le colonne
    app.report.addColumns();
    // aggiungo le righe del report
    app.report.addRows();
    // aggiungo elementi nelle datalist (page-by)
    app.report.createDatalist();

    app.report.draw();
    // salvo nella Classe Reports il nome in modo da ritrovarmelo anche dopo quando, dopo le modifiche al layout del report andrò a salvare il report

    app.report.reportName = dataJSON.name;
    
  };

  app.openReport = function(response, JSONReportData) {
    
    app.report = new OpenReport(app.table, JSONReportData.id, JSONReportData);

    app.report.data = response;
    app.report.reportName = JSONReportData.name;

  };

  app.loadCubes();

  app.getReports();

  app.datamartToBeProcessed();

  // abilito il tasto btnFilterSave se il form per la creazione del filtro è corretto
  app.checkFilterForm = function() {
    const filterName = document.getElementById('filter-name');
    // textarea della formula, devo verifica se ci sono almento i 3 elementi della formula
    const filterFormula = document.getElementById('filterFormula');
    //console.log(filterFormula.childElementCount);
    // TODO: verifica se il nome del filtro è stato inserito
    // TODO: verifica se la formula è stata inserita
    let flag = ( (filterName.value.length !== 0) && (filterFormula.childElementCount >= 3) ) ? true : false;
    (flag) ? app.btnFilterSave.disabled = false: app.btnFilterSave.disabled = true;
  };

  // selezione di un operatore logica da inserire nella formula (AND, OR, NOT, ecc...)
  app.handlerLogicalOperatorSelected = function(e) {
    console.log(e.target);
    e.target.toggleAttribute('selected');
    const textarea = document.getElementById('filterFormula');
    let span = document.createElement('span');
    span.className = 'formulaLogicalOperator';
    span.innerText = e.target.getAttribute('label');
    textarea.appendChild(span);
  };


  /* events */

  app.btnOpenReport.onclick = function(e) {
    // apro la dialog dialog-reportList
    app.dialogReportList.showModal();
  };

  app.btnDashboardLayout.onclick = function(e) {window.location.href = '/dashboards/';};

  app.btnSaveReport.onclick = function (e) {
    // salvo il report e l'oggetto Report, contenente tutte le options, in Storage
    // salvo in Report queste informazioni riguardanti il report
    /*
    id: 3
        type: "REPORT"
        datamartId: 3
        name: "ass"
        options: {inputSearch: true, positioning: [{select: "area"}, {select: "deal"}, {metrics: "aas"}],…}
          inputSearch: true
          positioning: [{select: "area"}, {select: "deal"}, {metrics: "aas"}]
          0: {select: "area"}
          select: "area"
          1: {select: "deal"}
          select: "deal"
          2: {metrics: "aas"}
          metrics: "aas"
          cols: {0: {columnId: 0, styles: {backgroundColor: "#3e3838"}, attributes: {}}}
          0: {columnId: 0, styles: {backgroundColor: "#3e3838"}, attributes: {}}
          columnId: 0
          styles: {backgroundColor: "#3e3838"}
          backgroundColor: "#3e3838"
          attributes: {}
        process: {select: {ZonaVenditaCM: {Codice: {SQLFormat: null, alias: "area"}},…},…}
                  select: {ZonaVenditaCM: {Codice: {SQLFormat: null, alias: "area"}},…}
                  ZonaVenditaCM: {Codice: {SQLFormat: null, alias: "area"}}
                  Codice: {SQLFormat: null, alias: "area"}
                  SQLFormat: null
                  alias: "area"
                  Azienda: {descrizione: {SQLFormat: null, alias: "deal"}}
                  descrizione: {SQLFormat: null, alias: "deal"}
                  SQLFormat: null
                  alias: "deal"
                  from: ["DocVenditaDettaglio", "ZonaVenditaCM", "Azienda", "CodSedeDealer", "DocVenditaIntestazione"]
                  0: "DocVenditaDettaglio"
                  1: "ZonaVenditaCM"
                  2: "Azienda"
                  3: "CodSedeDealer"
                  4: "DocVenditaIntestazione"
                  where: {dimensionJoin_1: ["ZonaVenditaCM.id", "Azienda.id_ZonaVenditaCM"],…}
                  dimensionJoin_1: ["ZonaVenditaCM.id", "Azienda.id_ZonaVenditaCM"]
                  0: "ZonaVenditaCM.id"
                  1: "Azienda.id_ZonaVenditaCM"
                  dimensionJoin_2: ["Azienda.id", "CodSedeDealer.id_Azienda"]
                  0: "Azienda.id"
                  1: "CodSedeDealer.id_Azienda"
                  dimensionJoin_3: ["CodSedeDealer.id", "DocVenditaIntestazione.id_CodSedeDealer"]
                  0: "CodSedeDealer.id"
                  1: "DocVenditaIntestazione.id_CodSedeDealer"
                  factJoin: {cubeJoin_1: ["DocVenditaDettaglio.NumRifInt", "DocVenditaIntestazione.NumRifInt"],…}
                  cubeJoin_1: ["DocVenditaDettaglio.NumRifInt", "DocVenditaIntestazione.NumRifInt"]
                  0: "DocVenditaDettaglio.NumRifInt"
                  1: "DocVenditaIntestazione.NumRifInt"
                  cubeJoin_2: ["DocVenditaDettaglio.id_Azienda", "DocVenditaIntestazione.id_Azienda"]
                  0: "DocVenditaDettaglio.id_Azienda"
                  1: "DocVenditaIntestazione.id_Azienda"
                  filters: {dref: {id: {table: "Azienda", operator: "=", values: ["443"]}}}
                  dref: {id: {table: "Azienda", operator: "=", values: ["443"]}}
                  id: {table: "Azienda", operator: "=", values: ["443"]}
                  table: "Azienda"
                  operator: "="
                  values: ["443"]
                  0: "443"
                  groupBy: {ZonaVenditaCM: {Codice: {SQLFormat: null}}, Azienda: {descrizione: {SQLFormat: null}}}
                  ZonaVenditaCM: {Codice: {SQLFormat: null}}
                  Codice: {SQLFormat: null}
                  SQLFormat: null
                  Azienda: {descrizione: {SQLFormat: null}}
                  descrizione: {SQLFormat: null}
                  SQLFormat: null
                  metrics: {,…}
                  DocVenditaDettaglio: {NettoRiga: {SQLFunction: "SUM", field: "NettoRiga", name: "aas", distinct: false, alias: "aas"}}
                  NettoRiga: {SQLFunction: "SUM", field: "NettoRiga", name: "aas", distinct: false, alias: "aas"}
                  SQLFunction: "SUM"
                  field: "NettoRiga"
                  name: "aas"
                  distinct: false
                  alias: "aas"
                  filteredMetrics: {}
                  processId: 3
                  name: "ass"
                  type: "PROCESS"
    */
    /* attribute : mode = 'process'/'report'
    * con l'attribute 'process' il report viene elaborato e creato il datamart, quindi dispongo, nella Classe Query, dell'obj process
    * con l'attribute 'report' devo recuperare da Storage, il process per questo report in modo da salvarlo in app.report.saveReport e sovrascrivere quindi, l'elemento già presente in localStorage
    */
    if (e.target.getAttribute('mode') === 'process') {
      app.report.saveReport(Query.getJSONProcess(app.report.reportName));
    } else {
      app.report.saveReport();
    }
    // abilito il tasto 'crea layout'
    app.btnDashboardLayout.removeAttribute('hidden');
    // TODO: disabilito il tasto salvaReport, lo riattivo non appena si modifica di nuovo il report

  };

  app.propertyColHidden.onclick = function (e) {
    console.log('checkbox click');

    // TODO: propertyValue conterrà il valore di questa proprietà selezionata (es.: in questo caso true/false)
    // console.log(propertyName);

    app.report.attribute = { 'hidden': true };
  };

  app.handlerColorInput = function (e) {
    // console.log(e.target.value);
    let propName = e.target.getAttribute('property');
    let propValue = e.target.value;
    // Se non utilizzo le [] in propName l'oggetto sarà {propName: 'red'} invece di {color: 'red'}
    app.report.style = { [propName]: propValue };
  };

  app.fgColorInput.oninput = app.handlerColorInput;
  // app.fgColorInput.onchange = app.handlerColorInput;
  app.bgColorInput.oninput = app.handlerColorInput;
  // app.bgColorInput.onchange = app.handlerColorInput;

  app.handlerOption = function (e) {
    let propName = e.target.getAttribute('property');
    let propValue = e.target.getAttribute('value');
    // imposto di un colore lo stile dell'allineamneto applicato (per questa colonna)
    e.target.style.color = "indianred";
    // TODO: Quando riapro questa colonna devo riprendere le impostazioni salvate e "riscriverle" qui nella dialog
    console.log(propName);
    console.log(propValue);
    app.report.style = { [propName]: propValue };

  };

  // align
  app.alignLeft.onclick = app.handlerOption;
  app.alignCenter.onclick = app.handlerOption;
  app.alignRight.onclick = app.handlerOption;

  // format e style
  app.formatBold.onclick = app.handlerOption;
  app.formatItalic.onclick = app.handlerOption;

  // console.log(app.radioSingleSelection);

  app.handlerRadioSelectionType = function(e) {
    console.log('radio : ', e.target);
    let propName = e.target.getAttribute('property');
    let propValue = e.target.value;

    app.report.pageByOption = { [propName]: propValue };
  };

  app.radioSingleSelection.forEach((item, i) => {
    // console.log(item);
    item.onchange = app.handlerRadioSelectionType;
  });

  app.numberFormat.onchange = function(e) {

    let propName = e.target.getAttribute('property');
    console.log(this.selectedIndex);
    // NOTE: Esempio utilizzo select per recuperare l'elemento selezionato (value oppure id della option)
    // console.log(this.options[this.selectedIndex].value);
    let propValue = this.options[this.selectedIndex].value;
    // console.log(this.options[this.selectedIndex].label);
    // value dell'elemento selezionato nella select
    app.report.attribute = { [propName]: propValue};
  };

  app.btnNextPage.onclick = function() {Pages.next();};

  app.btnBackPage.onclick = function() {Pages.previous();};

  app.btnPreviousStep.onclick = function() {Step.previous();}

  app.btnNextStep.onclick = function() {Step.next();};

  // tasto completato nello step 4, // dialog per il salvataggio del nome del report
  app.btnStepDone.onclick = function(e) {
    app.dialogSaveReport.showModal();
    // sulla dialog imposto la modalità di salvataggio tra process/report, se impostato su process salvo, dal tasto OK, il process del report, altrimenti salvo il report con tutte le sue opzioni
    app.dialogSaveReport.setAttribute('mode', 'process');
  };

  // salvo il report da processare
  app.btnSaveReportDone.onclick = function(e) {
    console.log(Query);
    // salvo temporaneamente la query da processare nello storage

    // ottengo un reportId per passarlo a costruttore
    const storage = new ReportStorage();
    const reportId = storage.getIdAvailable();
    const name = document.getElementById('reportName').value;

    // il datamart sarà creato come FXreportId
    Query.save(reportId, name);
    // TODO: aggiungo il report da processare nella list 'reportProcessList'
    const ulReportsProcess = document.getElementById('reportsProcess');
    let tmplContent = app.tmplListField.content.cloneNode(true);
    let element = tmplContent.querySelector('.element');
    let li = element.querySelector('li');
    li.innerText = name;
    li.setAttribute('label', 'process_' + name);
    li.setAttribute('data-id', reportId);
    ulReportsProcess.appendChild(element);
    li.onclick = app.handlerReportToBeProcessed;
    // abilito il tasto NEXT della pagina
    app.btnNextPage.removeAttribute('disabled');
    app.dialogSaveReport.close();
  };

  // visualizzo la lista dei report da processare
  app.btnProcessReport.onclick = function(e) {
    const listReportProcess = document.getElementById('reportProcessList');
    listReportProcess.toggleAttribute('hidden');
  };

  // input di ricerca nella dialogFilter, ricerca nell'elenco dei fields
  document.getElementById('fieldSearch').oninput = App.searchInList;

  // input di ricerca nella dialogFilter, ricerca nell'elenco dei valori
  document.getElementById('valuesSearch').oninput = App.searchInList;

  // input per filter-name, controllo se il form per la creazione del filtro è convalidato
  document.getElementById('filter-name').oninput = function(e) {
    // TODO: controllo se il form è completato
    app.checkFilterForm();
  };

  // operatori logici nella dialog Filter (AND, OR, NOT, ecc...)
  document.querySelectorAll('#logicalOperator > span').forEach((span) => {
    span.onclick = app.handlerLogicalOperatorSelected;
  });



  /* events */


})();

/* oggetto report in localStoraga*//*
{id: 2, type: "REPORT", name: "report_KPI", options: {inputSearch: true,…}}
id: 2
type: "REPORT"
datamartId: 2
name: "report_KPI"
options: {inputSearch: true,…}
inputSearch: true
positioning: [{columns: "zona"}, {columns: "area"}, {columns: "dealer"}, {columns: "cod.ford"},…]
0: {columns: "zona"}
columns: "zona"
1: {columns: "area"}
columns: "area"
2: {columns: "dealer"}
columns: "dealer"
3: {columns: "cod.ford"}
columns: "cod.ford"
4: {metrics: "venduto"}
metrics: "venduto"
cols: {0: {columnId: 0, styles: {backgroundColor: "#8db6a5"}, attributes: {}},…}
0: {columnId: 0, styles: {backgroundColor: "#8db6a5"}, attributes: {}}
columnId: 0
styles: {backgroundColor: "#8db6a5"}
backgroundColor: "#8db6a5"
attributes: {}
1: {columnId: 1, styles: {backgroundColor: "#8db6a5"}, attributes: {}}
columnId: 1
styles: {backgroundColor: "#8db6a5"}
backgroundColor: "#8db6a5"
attributes: {}
2: {columnId: 2, styles: {backgroundColor: "#8db6a5"}, attributes: {}}
columnId: 2
styles: {backgroundColor: "#8db6a5"}
backgroundColor: "#8db6a5"
attributes: {}
3: {columnId: 3, styles: {backgroundColor: "#8db6a5"}, attributes: {}}
columnId: 3
styles: {backgroundColor: "#8db6a5"}
backgroundColor: "#8db6a5"
attributes: {}
4: {columnId: 4, styles: {backgroundColor: "#285c47", color: "#ffffff"}, attributes: {}}
columnId: 4
styles: {backgroundColor: "#285c47", color: "#ffffff"}
backgroundColor: "#285c47"
color: "#ffffff"
attributes: {}


*/