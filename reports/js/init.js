var App = new Application();

(() => {
  var app = {
    btnOpenCubes: document.getElementById('openCube'),
    dialogTableList : document.getElementById('table-list'),
    dialogCubeName : document.getElementById('cube-name'),
    dialogDimensionName : document.getElementById('dimension-name'),
    dialogHierarchyName : document.getElementById('hierarchy-name'),
    dialogCubeList : document.getElementById('dialog-cube-list'),
    btnFact : document.getElementById('mdc-next'),
    btnBack : document.getElementById('mdc-back'),
    btnPreviewReport : document.getElementById('mdc-preview-report'),
    btnDashboardLayout : document.getElementById('mdc-dashboard-layout'),
    btnNewReport : document.getElementById('mdc-new-report')
  };
  
  App.init();

  app.handlerCubeSelected = function(e) {
    let reportName = this.getAttribute('label');

    // recupero un datamart FX... già creato e visualizzo l'anteprima
    var url = "ajax/reports.php";
    let reportId = this.getAttribute('id');
    let params = "reportId="+reportId;

    // console.log(params);
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          console.table(response);
          
          app.createReport(response, reportName);
          app.dialogCubeList.close();

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
  
  app.loadCubes = () => {
    // carico elenco Cubi su cui creare il report
    console.log('loadCubes');
    const storage = new CubeStorage();
    // console.log(storage.list);
    let ul = document.getElementById('cubesList');
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

  app.createReport = function(response, cubeName) {
    console.log('create report');
    // converto il cube in JSON
    const cubeStorage = new CubeStorage();
    let cube = cubeStorage.JSONFormat(cubeName);
    console.log(cube.name);
    
    let table = document.getElementById('table-01');
    /**Operazioni da fare in ReportConfig:
     * 1-tramite il json di cube posso andare a definire, per prima cosa, quali sono le metriche del report
     *    ...una volta stabilite le posizioni delle metriche, posso creare il pageBy escludendo quelli delle metriche
     * TODO: da definire
     */
    let report = new ReportConfig(table, response, cube);
    
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

  app.loadCubes();


  /* events */
  app.btnDashboardLayout.onclick = (e) => {window.location.href = "/dashboards/";};
  
  app.btnOpenCubes.onclick = (e) => {app.dialogCubeList.showModal();};
  /* events */
  

})();
