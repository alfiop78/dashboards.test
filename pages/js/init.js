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
    pageSelectedTitle : null,
    Storage : new Storage()
  };
  // console.log(app.pageParams);

  app.handlerPageSelect = function(e) {
    e.preventDefault();
    let layout = app.loadLayoutTemplate(this.getAttribute('data-layout-id'));
    layout.querySelector('h3').innerText = this.querySelector('span').innerText;
    app.pageSelectedTitle = this.querySelector('span').innerText;

    var url = "ajax/reports.php";
    let reportId = +this.getAttribute('data-layout-reportid-id');
    // TODO: cerco il report, in storage corrispondente (id) nello storage, questo mi servirà per inviare alla request i
    // ---parametri del positioning (e altro da aggiungere)
    app.Storage.reportSetting = reportId;
    console.log(app.Storage.reportSetting);
    // return;
    let params = "datamart="+app.Storage.reportSetting;
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
          app.createReport(response);

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

  // visualizzo elenco delle pagine sulla sinistra
  let ulPages = document.getElementById('pages');
  app.pageParams.forEach((item) => {
    // console.log(item);
    // TODO: aggiungere un metodo nella Class Storage per recuperare questi dati
    let storageObject = JSON.parse(window.localStorage.getItem(item));
    // console.log(storageObject.type);
    if (storageObject.type === "PAGE") {
      /* inserimento pages nel drawer */
      let tmplMenuElement = document.getElementById('menuElement');
      let menuElement = tmplMenuElement.content.cloneNode(true);
      let element = menuElement.querySelector('a');
      let nav = document.getElementsByTagName('nav')[0];
      let span = element.querySelector('span');
      span.innerText = item;
      element.setAttribute('data-layout-id', storageObject.layoutId);
      element.id = storageObject.pageId;

      storageObject.layoutParams.forEach((params) => {
        for (let i in Object.keys(params)) {
          let propertyName = Object.keys(params)[i];
          let propertyValue = Object.values(params)[i];
          element.setAttribute("data-layout-"+propertyName+"-id", propertyValue);
        }
      });
      nav.appendChild(element);
      element.onclick = app.handlerPageSelect;

      /* inserimento pages nel drawer */

      /* inserimento al fianco del layout */
      // let li = document.createElement('li');
      // li.innerText = item;
      // li.id = storageObject.pageId;
      // li.setAttribute('data-layout-id', storageObject.layoutId);
      // storageObject.layoutParams.forEach((params) => {
      //   for (let i in Object.keys(params)) {
      //     let propertyName = Object.keys(params)[i];
      //     let propertyValue = Object.values(params)[i];
      //     li.setAttribute("data-layout-"+propertyName+"-id", propertyValue);
      //   }
      //
      // });
      //
      // ulPages.appendChild(li);
      // li.onclick = app.handlerPageSelect;
      /* inserimento al fianco del layout */
    }

  });

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

  app.createReport = function(response) {
    console.log('create report');

    let table = document.getElementById('table-01');
    let report = new Report(table, response);

    console.log(response);


  };



  // App.getSessionName();

  App.init();

})();
