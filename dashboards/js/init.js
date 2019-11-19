/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* funzione immediata */
var App = new Application();
(() => {
  var app = {
    Cube : new Cube(),
    Draw : null,
    report_id : 0,
    reports : new Object()

  };

  // App.getSessionName();

  App.init();


  document.getElementById('mdc-next').onclick = function(e) {
    // pagina attiva in questo momento
    let selectedPage = document.querySelector('.page[selected]');
    selectedPage.removeAttribute('selected');
    // pagina da attivare
    let page = selectedPage.nextElementSibling;
    page.setAttribute('selected', true);
    let pages = document.getElementById('pages');
    pages.setAttribute('data-step', page.getAttribute('data-step'));
    // app.getData();
  };

  document.getElementById('mdc-back').onclick = function(e) {
    // pagina attiva in questo momento
    let selectedPage = document.querySelector('.page[selected]');
    selectedPage.removeAttribute('selected');
    // pagina da attivare
    let page = selectedPage.previousElementSibling;
    page.setAttribute('selected', true);
    let pages = document.getElementById('pages');
    pages.setAttribute('data-step', page.getAttribute('data-step'));
  };

  app.handlerPreviewLayoutSelected = function(e) {
    console.log(e.target);
    console.log(this);
  };

  // event click supreview-layout
  document.querySelectorAll('.preview-layout').forEach((layout) => {layout.onclick = app.handlerPreviewLayoutSelected;});

})();
