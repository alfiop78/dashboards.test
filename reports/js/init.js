var App = new Application();
var Pages = new Page();
var Query = new Queries();

(() => {
  var app = {
    report : null,
    
    btnPreviousStep : document.getElementById('stepPrevious'),
    btnNextStep : document.getElementById('stepNext'),

    btnOpenCubes: document.getElementById('openCube'),
    dialogReportList : document.getElementById('dialog-reportList'),
    dialogTableList : document.getElementById('table-list'),
    dialogCubeName : document.getElementById('cube-name'),
    dialogDimensionName : document.getElementById('dimension-name'),
    dialogHierarchyName : document.getElementById('hierarchy-name'),
    dialogCubeList: document.getElementById('dialog-cube-list'),
    dialogReportName: document.getElementById('report-name'),
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

  app.handlerCubeSelected = function(e) {
    const cubeId = e.target.getAttribute('data-cube-id');
    const cubeName = e.target.getAttribute('label');
    const storage = new CubeStorage();
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

  app.handlerDimensionSelected = function(e) {
    // selezione della/e dimensione su cui lavorare per la creazione del report
    // imposto attributo selected sulle dimensioni selezionate
    e.target.toggleAttribute('selected');
    //  popolo la sezione step 2, colonne e field
    // popolo anche lo step 3 che riguarda l'inserimento dei filtri, quindi deve essere popolato con le tabelle, compresa la fact, alla selezione della quale saranno visualizzati i campi da selezionare
    // ... i cmapi per impostare i filtri.
    const dimName = e.target.getAttribute('label');
    const Dim = new DimensionStorage();
    Dim.selected = dimName;
    console.log(Dim.selected);/*
    console.log(Dim.selected.columns);
    console.log(Dim.selected.from);*/
    let columns = Dim.selected.columns;

    app.createListTableColumns(Dim.selected.columns);

    app.createListTableFilters(Dim.selected.from);
  };

  app.createListTableFilters = function(from) {
    // console.log(from); // array
    let ul = document.getElementById('tables-filter');
    from.forEach((table, index) => {
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
      li.setAttribute('label', table);
      elementTable.appendChild(li);
      ulTable.appendChild(elementTable);
      li.onclick = app.handlerTableSelected;
      // tabella inserita in lista
      debugger; // ok

      // TODO: inserisco le ul come fatto con fieldList-filter
      let tmpl_ulList = document.getElementById('tmpl_ulList');
      let ulContent = tmpl_ulList.content.cloneNode(true);
      let ulField = ulContent.querySelector('ul[data-id="fields-column"]');
      const parentElement = document.getElementById('sectionFields-column'); // elemento a cui aggiungere la ul

      console.log(parentElement);

      let tmplFieldList = document.getElementById('templateListField');

      ulField.setAttribute('data-table-id', index);
      
      for (let i in columns[table]) {
        let field = columns[table][i]; // nome del campo della tabella
        // inserisco i field della tabella, nascondo la lista per poi visualizzarla quando si clicca sul nome della tabella
        let content = tmplFieldList.content.cloneNode(true);
        let element = content.querySelector('.element');
        let li = element.querySelector('li');
        li.innerText = field;
        element.appendChild(li);
        ulField.appendChild(element);
        
        // liField.onclick = app.handlerFieldSelected;
      }
      parentElement.appendChild(ulField);
    });
  };

  app.handlerTableSelected = function(e) {
    // visualizzo la ul nascosta della tabella selezionata, sezione columns
    let tableId = +e.target.getAttribute('data-table-id');
    console.log(tableId);
    
    document.querySelector("ul[data-id='fields-column'][data-table-id='"+tableId+"']").removeAttribute('hidden');
    e.target.toggleAttribute('selected');
  };

  app.handlerTableSelectedFilter = function(e) {
    // carico elenco field dal DB
    let table = e.target.getAttribute('label');
    let tableId = +e.target.getAttribute('data-table-id');
    let tmpl_ulList = document.getElementById('tmpl_ulList');
    let ulContent = tmpl_ulList.content.cloneNode(true);
    let ul = ulContent.querySelector('ul[data-id="fields-filter"]');
    const parentElement = document.getElementById('sectionFields-filter'); // elemento a cui aggiungere la ul

    console.log(table);
    var url = '/ajax/tableInfo.php';
    let params = 'tableName='+table;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          
          let tmplFieldList = document.getElementById('templateListField');
          // let listField = document.getElementById('sectionFields-filter');
          // let fieldListFilter = listField.querySelector("div[data-id='fieldList-filter']");
          //let ul = listField.querySelector('ul');
          ul.setAttribute('data-table-id', tableId);
          for (let i in response) {
            let content = tmplFieldList.content.cloneNode(true);
            let element = content.querySelector('.element');
            let li = element.querySelector('li');
            // li.className = 'elementSearch';
            li.innerText = response[i][0];
            // scrivo il tipo di dato senza specificare la lunghezza int(8) voglio che mi scriva solo int
            let pos = response[i][1].indexOf('(');
            let type = (pos !== -1) ? response[i][1].substring(0, pos) : response[i][1];
            li.setAttribute('data-type', type);
            li.id = i;
            ul.appendChild(element);
            
            // li.onclick = app.handlerColumns;
          }
          parentElement.appendChild(ul);
          
          console.log(document.querySelector("ul[data-id='fields-filter']:not([hidden])"));
          // nascondo la ul 'attiva' in questo momento e visualizzo quella su cui si è cliccato adesso
          if (document.querySelector("ul[data-id='fields-filter']:not([hidden])")) {document.querySelector("ul[data-id='fields-filter']:not([hidden])").setAttribute('hidden', true);}
          ul.removeAttribute('hidden');

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

  app.handlerFieldSelected = function(e) {
    // seleziono la colonna da inserire nel report e la inserisco nel reportSection
    let field = e.target.getAttribute('label');
    
    let table = document.getElementById('table-0');
    // console.log(table);
    console.log(table.tHead);
    const th = document.createElement('th');
    th.innerText = field;
    table.tHead.rows[0].appendChild(th);
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

  /* events */


})();
