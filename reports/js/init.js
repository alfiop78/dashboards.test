var App = new Application();
var oStorage = new Storage();

(() => {
  var app = {
    
    dialogTableList : document.getElementById('table-list'),
    dialogCubeName : document.getElementById('cube-name'),
    dialogDimensionName : document.getElementById('dimension-name'),
    dialogHierarchyName : document.getElementById('hierarchy-name'),
    dialogReportList : document.getElementById('dialog-report-list'),
    btnFact : document.getElementById('mdc-next'),
    btnBack : document.getElementById('mdc-back'),
    btnPreviewReport : document.getElementById('mdc-preview-report'),
    btnDashboardLayout : document.getElementById('mdc-dashboard-layout'),
    btnNewReport : document.getElementById('mdc-new-report')
  };
  

  // App.getSessionName();

  App.init();

  app.createReport = function(response, cube) {
    console.log('create report');
    console.log(cube);
    console.log(cube.name);
    let table = document.getElementById('table-01');
    let report = new ReportConfig(table, response);
    report.datamartId = cube.cubeId;
    report.defaultOptions = cube;

    return;

    let options =
      {
        'cols' : [
          // {'col': 3, 'attribute': 'hidden'},
          // {'col': 5, 'attribute': 'hidden'}

        ],
        'filters' : [
          {'col': 0, 'attribute': 'multi'}
          // {'col': 1, 'attribute': 'multi'}
          // {'col': 3, 'attribute': 'hidden'}
        ],
        // metrics : [2] = la terza colonna è una metrica e nella Classe Draw quessta viene automaticamente nascosta nei filtri e formattata in modo diverso dalle colonne
        'metrics' : report.metricsPosition, // le metriche vanno nascoste nei filtri e formattate in modo diverso nella table
        // 'metrics' : [2], // test
        'title' : cube.name,
        'inputSearch' : true // visualizzo e lego evento input alla casella di ricerca, in basso.
      };

    report.createDatalist();
    report.option = options;

    // in draw vengono impostate le option e gli eventi sui filtri semplici e multi selezione
    report.draw();

  };


  /* events */
  app.btnDashboardLayout.onclick = function(e) {window.location.href = "/dashboards/";};
  /* events */
  

})();
