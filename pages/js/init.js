var App = new Application();
(() => {
  var app = {
    Draw : null,
    pageParams : Object.keys(window.localStorage),
    pageSelectedTitle : null
  };
  // console.log(app.pageParams);

  app.getPages = function () {
    // visualizzo elenco delle pagine sulla sinistra
    // let ulPages = document.getElementById('pages');
    let storage = new PageStorage();
    storage.list().forEach((page) => {
      // inserisco le pages nel drawer
      let tmplMenuElement = document.getElementById('menuElement');
      let menuElement = tmplMenuElement.content.cloneNode(true);
      let element = menuElement.querySelector('a');
      let nav = document.getElementsByTagName('nav')[0];
      let span = element.querySelector('span');
      span.innerHTML = page.name;
      element.setAttribute('label', page.name);
      element.setAttribute('data-layout-id', page.layoutId);
      element.setAttribute('data-id', page.id);
      console.log(page.layoutParams);
      page.layoutParams.forEach((sections, index) => {
        // ogni layoutParams può avere più section e quindi più reports al suo interno per creare la pagina
        // TODO: probabilmente dovrò utilizzare index inserendolo come attributo [data-report-id-index]=reportid
        element.setAttribute('data-report-id', sections.reportId);
      });
      nav.appendChild(element);
      element.onclick = app.handlerPageSelect;

    });

  };

  app.handlerPageSelect = function(e) {
    e.preventDefault(); // è un elemento <a> quindi impedisco il comportamento di default
    // recupero il layout con id dell'elemento selezionato
    console.log(this); // elemento <a>
    console.log(e.target); // elemento <span>
    let layout = app.loadLayoutTemplate(this.getAttribute('data-layout-id'));
    layout.querySelector('h3').innerText = this.getAttribute('label');
    app.pageSelectedTitle = this.getAttribute('label');

    
    let reportId = +this.getAttribute('data-report-id');
    let storage = new ReportStorage();
    console.log(reportId);

    storage.settings = reportId;

    console.log(storage.settings);
    var url = "ajax/reports.php";
    let params = "datamart="+storage.settings;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          console.table(response);
          app.createReport(response, reportId, storage.name);

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

  app.loadLayoutTemplate = function(layoutId) {
    console.log('load Template');
    // visualizzo il template con layout-id = layoutId
    console.log(layoutId);
    let tmplLayout = document.getElementById('layout-'+layoutId);
    let layoutContent = tmplLayout.content.cloneNode(true);
    let layout = layoutContent.querySelector("div.layout[data-layout-id='"+layoutId+"']");
    document.getElementById('page').appendChild(layout);
    // document.getElementById('body').appendChild(layout);
    return layout;
  };

  app.createReport = function(response, reportId, caption) {
    console.log('create report');

    let table = document.getElementById('table-01');
    let report = new Report(table, reportId);

    report.data = response;
    // imposto le options recuperate dallo storage tramite il reportId
     // TODO: da rivedere, utilizzare lo stesso procedimento di OpenReport, le options posso prenderle anche dallo storage di questo report
    report.settings = reportId;

    report.addColumns();

    report.addRows();

    report.caption = caption;

    report.createDatalist();

    report.draw();
  };

  App.init();

  app.getPages();

})();
