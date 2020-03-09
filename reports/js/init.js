var App = new Application();
var Pages = new Page();
var Query = new Queries();

(() => {
  var app = {
    report : null,
    
    btnPreviousStep : document.getElementById('stepPrevious'),
    btnNextStep : document.getElementById('stepNext'),
    btnStepDone : document.getElementById('stepDone'),

    // dialog
    dialogFilter : document.getElementById('dialogFilter'),
    dialogColumn : document.getElementById('dialogColumn'),
    dialogMetric : document.getElementById('dialogMetric'),
    btnFilterSave : document.getElementById('btnFilterSave'), //tasto salva nella dialog filter
    btnFilterDone : document.getElementById('btnFilterDone'), //tasto fatto nella dialog filter
    btnColumnDone : document.getElementById('btnColumnDone'), // tasto ok nella dialogColumn
    btnMetricDone : document.getElementById('btnMetricDone'), // tasto Salva nella dialogMetric

    btnOpenCubes: document.getElementById('openCube'),
    dialogReportList : document.getElementById('dialog-reportList'),
    dialogTableList : document.getElementById('table-list'),
    dialogCubeName : document.getElementById('cube-name'),
    dialogDimensionName : document.getElementById('dimension-name'),
    dialogHierarchyName : document.getElementById('hierarchy-name'),
    dialogCubeList: document.getElementById('dialog-cube-list'),
    dialogSaveReport: document.getElementById('dialogSaveReport'),
    dialogColOption : document.getElementById('columnsOption'),
    dialogPagebyOption : document.getElementById('pagebyOptions'),
    btnBack : document.getElementById('mdc-back'),
    btnPreviewReport : document.getElementById('mdc-preview-report'),
    btnDashboardLayout : document.getElementById('mdc-dashboard-layout'),
    btnNewReport: document.getElementById('mdc-new-report'),
    btnSaveReport : document.getElementById('saveReport'),
    btnSaveReportDone: document.getElementById('btnReportSaveName'),
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

    for (let i in reportsObj) {
      // console.log(reportsObj[i]);
      let element = document.createElement('div');
      element.className = 'element';
      element.setAttribute('label', reportsObj[i]['name']);

      let li = document.createElement('li');
      li.innerText = reportsObj[i]['name'];
      li.setAttribute('report-id', reportsObj[i]['reportId']);
      li.setAttribute('label', reportsObj[i]['name']);
      element.appendChild(li);
      ul.appendChild(element);
    }
  };

  // selezione del cubo
  app.handlerCubeSelected = function(e) {
    const cubeId = e.target.getAttribute('data-cube-id');
    const cubeName = e.target.getAttribute('label');
    const storage = new CubeStorage();
    let cube = storage.json(cubeName);
    
    Query.from = cube.FACT;
    Query.factRelation = cube.relations;
    
    app.createListTableMetrics(cube.metrics, cubeName);
    // aggiungo la tabella fact selezionata alla lista dello step 3 - filters
    // OPTIMIZE: Ottimizzare quando verranno aggiunti più cubi, inserendo un data-table-id, index e altre cose che mancano
    let ulTable = document.getElementById('tables-filter');
    let liTable = document.createElement('li');
    let elementTable = document.createElement('div');
    elementTable.className = 'element';
    liTable.innerText = cube.FACT;
    //li.id = 'table-filter-' + index;
    //li.setAttribute('data-table-id', index);
    liTable.setAttribute('label', cube.FACT);
    elementTable.appendChild(liTable);
    ulTable.appendChild(elementTable);
    liTable.onclick = app.handlerTableSelectedFilter;
    
    
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
      li.innerText = dimensions[dimension]['title'];
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
    Query.where = Dim.selected.join
  };

  // creo la lista delle tabelle nella sezione dello step 3 - Filtri
  app.createListTableFilters = function(from) {
    // console.log(from); // array
    let ul = document.getElementById('tables-filter');

    from.forEach((table, index) => {
      Query.from = table;
      let li = document.createElement('li');
      let element = document.createElement('div');
      element.className = 'element';
      li.innerText = table;
      //li.id = 'table-filter-' + index;
      li.setAttribute('data-table-id', index);
      li.setAttribute('label', table);
      element.appendChild(li);
      ul.appendChild(element);
      li.onclick = app.handlerTableSelectedFilter;
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

      let tmplFieldList = document.getElementById('templateListField');

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
    let elementTable = document.createElement('div');  
    elementTable.className = 'element';

    Object.keys(columns).forEach((table, index) => {
      // console.log(table);
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
      const parentElement = document.getElementById('sectionFields-column'); // elemento a cui aggiungere la ul

      let tmplFieldList = document.getElementById('templateListField');

      ulField.setAttribute('data-table-id', index);
      
      for (let i in columns[table]) {
        let field = columns[table][i]; // nome del campo della tabella
        // inserisco i field della tabella, nascondo la lista per poi visualizzarla quando si clicca sul nome della tabella
        let content = tmplFieldList.content.cloneNode(true);
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

  // selezione della tabella nella sezione Filtri (step 3)
  app.handlerTableSelectedFilter = function(e) {
    // TODO: carico elenco field per la tabella selezionata
    Query.table = e.target.getAttribute('label');
    app.getFields();

    // apro la dialog filter
    app.dialogFilter.showModal();
    // event su <li> degli operatori
    document.querySelectorAll('#operatorList').forEach((li) => {
      li.onclick = app.handlerFilterOperatorSelected;
    });
  };

  // selezione della metrica, apro la dialog per impostare la metrica
  app.handlerFieldSelectedMetric = function(e) {app.dialogMetric.showModal();};

  // selezione della tabella nella sezione Column
  app.handlerTableSelected = function(e) {
    // visualizzo la ul nascosta della tabella selezionata, sezione columns
    let fieldType = e.target.getAttribute('data-list-type')
    let tableId = +e.target.getAttribute('data-table-id');
    document.querySelector("ul[data-id='fields-"+fieldType+"'][data-table-id='"+tableId+"']").removeAttribute('hidden');
    e.target.toggleAttribute('selected');
    Query.table = e.target.getAttribute('label');
  };

  // selezione della colonna nella dialogFilter
  app.handlerFilterFieldSelected = function(e) {
    e.target.toggleAttribute('selected');
    Query.field = e.target.getAttribute('label');
    // inserisco il field selezionato nella textarea, la colonna non è editabile
    const textarea = document.getElementById('filterFormula');
    let span = document.createElement('span');
    span.className = 'formulaField';
    span.innerText = Query.field;
    textarea.appendChild(span);
    // TODO: recupero la lista dei valori distinct dalla tabella
    app.getDistinctValues();

  };

  // selezione dell'operatore nella dialogFilter
  app.handlerFilterOperatorSelected = function(e) {
    if (e.target.hasAttribute('selected')) return;

    document.querySelectorAll('#operatorList li').forEach((li) => {li.removeAttribute('selected');});
    e.target.toggleAttribute('selected');
    const textarea = document.getElementById('filterFormula');
    let span = document.createElement('span');
    span.className = 'formulaOperator';
    span.innerText = e.target.getAttribute('label');
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
        formulaValues.setAttribute('contenteditable', true);
        closePar.className = 'closePar';
        openPar.innerText = '( ';
        closePar.innerText = ' )';

        textarea.appendChild(openPar);
        textarea.appendChild(formulaValues);
        textarea.appendChild(closePar);
        formulaValues.focus();
        //  imposto la lista dei valori in multiselezione (una IN può avere un elenco di valori separati da virgola)
        app.dialogFilter.querySelector('#valuesList').setAttribute('multi', true);
        break;
      default:
        // TODO: valutare le operazioni da svolgere per questo blocco
    }
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
          
          let tmplFieldList = document.getElementById('templateListField');
          let ul = document.getElementById('filter-fieldList');

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
            li.id = i;
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
    // console.log(Query.table);
    // event sul tasto ok della dialog
    
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
    //obj[Query.field] = {'SQLFormat': null, alias};
    Query.select = obj;
    // Query.addColumn(Query.field, null, alias);
    app.dialogColumn.close();
    // aggiungo la colonna selezionata a Query.groupBy
    obj = {};
    obj = {'SQLFormat': null};
    Query.groupBy = obj;

    let table = document.getElementById('table-0');
    // aggiungo la colonna alla tabella
    const th = document.createElement('th');
    th.innerText = Query.getAliasColumn();
    table.tHead.rows[0].appendChild(th);
  };

  // salvo la metrica impostata
  app.btnMetricDone.onclick = function(e) {
    console.log('save metric');
    Query.field = e.target.getAttribute('label');
    // TODO: il nome non può contenere spazi ed altri caratteri da definire
    const name = app.dialogMetric.querySelector('#metric-name').value;
    // TODO meglio utilizzare l'attributo label, da inserire se non presente
    const SQLFunction = document.querySelector('#function-list > li[selected]').innerText;
    const distinctOption = document.getElementById('checkbox-distinct').checked;
    const alias = document.getElementById('alias-metric').value;

    let obj = {};
    obj = {SQLFunction, 'field': Query.field, name, 'distinct' : distinctOption, alias}
    Query.metrics = obj;

    app.dialogMetric.close();
  };

  // salvataggio del filtro impostato nella dialog
  app.btnFilterSave.onclick = function(e) {
    // Filter save
    const textarea = document.getElementById('filterFormula');
    const filterName = document.getElementById('filter-name').value;
    let logicalOperator = null; // TODO: qui andrò a memorizzare l'operatore che verrà inserito nella textare, appunti nel Metodo filters della class Query
    Query.filterName = filterName;
    let operator = app.dialogFilter.querySelector('#filterFormula .formulaOperator').innerText;
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

    let obj = {};
    obj = {operator, values};
    Query.filters = obj;
    // pulisco la textarea
    textarea.querySelectorAll('span').forEach((span) => {span.remove();});
    document.getElementById('filter-name').focus();
    document.getElementById('filter-name').value = '';
    // TODO: visualizzo il filtro appena creato nella section #sectionFields-filter
    let ul = document.getElementById('createdFilters');
    let li = document.createElement('li');
    let element = document.createElement('div');
    li.innerText = filterName;
    li.setAttribute('label', filterName);
    element.appendChild(li)
    ul.appendChild(element);


  };

  app.btnFilterDone.onclick = function(e) {app.dialogFilter.close();};

  // recupero valori distinti per inserimento nella dialogFilter
  app.getDistinctValues = function() {

    // let tableName = e.target.getAttribute('data-tableName');
    // let fieldName = document.getElementById('filter-fieldName').innerText;
    // return;
    // TODO: getDistinctValues
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
  };


  /*app.handlerCubeSelected = function() {
    let reportName = this.getAttribute('label');

    // recupero un datamart FX... già creato e visualizzo l'anteprima
    // TEMP: Codice per aprire il report, da utilizzare dopo nella creazione della preview del report
    var url = 'ajax/reports.php';
    let reportId = this.getAttribute('id');
    let params = 'reportId=' + reportId;

    // console.log(params);
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          console.table(response);

          app.createReport(response, reportName);
          document.getElementById('cubeList').toggleAttribute('hidden');


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
  };*/

  app.loadCubes = () => {
    // carico elenco Cubi su cui creare il report
    console.log('loadCubes');
    const cubes = new CubeStorage();
    // console.log(storage.list);
    let ul = document.getElementById('cubes');
    let obj = cubes.list();
    // console.log(obj);
    let element = document.createElement('div');
    element.classList.add('element');
    for (let i in obj) {
      // element.querySelector('span').innerHTML = obj[i]['key'];
      // element.id = 'cubeId_' + obj[i]['cubeId'];
      console.log(obj[i]['key']);
      let li = document.createElement('li');
      li.innerText = obj[i]['key'];
      li.id = 'cube-' + obj[i]['id'];
      li.setAttribute('data-cube-id', obj[i]['id']);
      li.setAttribute('label', obj[i]['key']);
      ul.appendChild(element);
      element.appendChild(li);
      li.onclick = app.handlerCubeSelected;
    }
  };

  app.createReport = function(response, cubeName) {
    console.log('create report');
    // converto il cube in JSON
    const cubeStorage = new CubeStorage();
    let cube = cubeStorage.JSONFormat(cubeName);
    console.log(cube.name);

    // ottengo un reportId per passarlo a costruttore
    const reportStorage = new ReportStorage();

    app.report = new Options(app.table, reportStorage.getIdAvailable());

    app.report.cube = cube;
    // dati estratti dalla query
    app.report.data = response;
    // aggiungo le colonne
    app.report.addColumns();
    // aggiungo le righe del report
    app.report.addRows();
    // aggiungo elementi nelle datalist (page-by)
    app.report.createDatalist();

    app.report.draw();

  };

  app.loadCubes();

  app.getReports();




  /* events */

  app.btnOpenReport.onclick = function(e) {
    // apro la dialog dialog-reportList
    app.dialogReportList.showModal();
  };

  app.btnDashboardLayout.onclick = function(e) {window.location.href = '/dashboards/';};

  app.btnSaveReport.onclick = function (e) {
    // apro dialog report-name
    app.dialogReportName.showModal();
  };

  app.btnSaveReportDone.onclick = function (e) {
    // TODO: salvo il report e l'oggetto Report, contenente tutte le options, in Storage
    app.report.reportName = document.getElementById('reportName').value;
    app.report.saveReport();
    app.dialogReportName.close();
    // abilito il tasto 'crea layout'
    app.btnDashboardLayout.removeAttribute('hidden');
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

  // tasto completato nello step 4
  app.btnStepDone.onclick = function(e) {
    
    console.log(Query);
    // TODO: processa query
    

  };

  /* events */


})();
