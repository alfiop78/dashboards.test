/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* funzione immediata */
var App = new Application();
(() => {
  var app = {
    Draw : null,
    pageParams : Object.keys(window.localStorage),
    pageSelectedTitle : null
    // Storage : new Storage()
  };
  // console.log(app.pageParams);

  app.getPages = function () { 
    // visualizzo elenco delle pagine sulla sinistra
    let ulPages = document.getElementById('pages');
    let storage = new PageStorage();
    console.log(storage.list());
    storage.list().forEach((page) => {
      // inserisco le pages nel drawer
      let tmplMenuElement = document.getElementById('menuElement');
      let menuElement = tmplMenuElement.content.cloneNode(true);
      let element = menuElement.querySelector('a');
      let nav = document.getElementsByTagName('nav')[0];
      let span = element.querySelector('span');
      span.innerHTML = page.name;
      element.setAttribute('data-layout-id', page.layoutId);
      element.setAttribute('data-id', page.id);
      
      
      // storage.layoutParams.forEach((params) => {
      //   // TODO: utilizzare for...of
      //   for (let i in Object.keys(params)) {
      //     let propertyName = Object.keys(params)[i];
      //     let propertyValue = Object.values(params)[i];
      //     element.setAttribute("data-layout-"+propertyName+"-id", propertyValue);
      //   }
      // });
      nav.appendChild(element);
      element.onclick = app.handlerPageSelect;

    });
    
  };

  app.handlerPageSelect = function(e) {
    e.preventDefault(); // è un elemento <a> quindi impedisco il comportamento di default
    // recupero il layout con id dell'elemento selezionato
    let layout = app.loadLayoutTemplate(this.getAttribute('data-layout-id'));
    layout.querySelector('h3').innerText = this.querySelector('span').innerText;
    app.pageSelectedTitle = this.querySelector('span').innerText;
    
    var url = "ajax/reports.php";
    let reportId = +this.getAttribute('data-id');
    let report = new ReportStorage();
    
    report.settings = reportId;
    console.log(report.settings);
    // return;
    let params = "datamart="+report.settings;
    console.log(params);
    // let params = "reportId="+reportId;

    // visualizzo il template relativo al layout selezionato
    console.log(this);

    // console.log(params);
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          console.table(response);
          app.createReport(response, reportId);

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

  app.loadLayoutTemplate = function(layoutId) {
    console.log('load Template');
    // visualizzo il template con layout-id = layoutId
    let tmplLayout = document.getElementById('layout-'+layoutId);
    let layoutContent = tmplLayout.content.cloneNode(true);
    let layout = layoutContent.querySelector("div.layout[data-layout-id='"+layoutId+"']");
    document.getElementById('page').appendChild(layout);
    // document.getElementById('body').appendChild(layout);
    return layout;
  };

  app.createReport = function(response, reportId) {
    console.log('create report');

    let table = document.getElementById('table-01');
    let report = new Report(table, reportId);

    report.data = response;
    console.log(report.data);

    report.addColumns();

    // report.addPageBy();

    report.addRows();
  };

  App.init();

  app.getPages();

})();
