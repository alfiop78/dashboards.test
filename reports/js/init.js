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


})();
