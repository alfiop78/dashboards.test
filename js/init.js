/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* funzione immediata */
var App = new Application();
(() => {
  var app = {
    Draw : null

  };

  // App.getSessionName();

  // App.init();

  app.getData = function() {
    // TODO: utilizzare le promise
    var url = "/ajax/table.php";

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          // console.log(request.response);

          var response = JSON.parse(request.response);
          // console.table(response);
          // console.log(Object.keys(response[0]).length); // quante colonne ci sono
          // console.log(Object.keys(response[0])); // colonne estratte dalla query

          // console.log(Object.keys(response[0])[0]); // nome colonna
          // console.log(Object.keys(response[0])[1]); // nome colonna
          // aggiungo le colonne
          let table = document.getElementById('table-01');

          let options =
            {
            'cols' : [
              {'col': 3, 'attribute': 'hidden'},
              {'col': 5, 'attribute': 'hidden'}

            ],
            'filters' : [
              {'col': 0, 'attribute': 'multi'},
              {'col': 1, 'attribute': 'multi'},
              {'col': 3, 'attribute': 'hidden'}
            ],
            'metrics' : [6], // TODO: le metriche vanno nascoste nei filtri e formattate in modo diverso nella table
            'title' : 'Free Courtesy',
            'inputSearch' : true // visualizzo e lego evento input alla casella di ricerca, in basso.
            };
          app.Draw = new Draw(table, options);
          console.log(app.Draw);
          // Opzione 1 - aggiungo tutte le colonne della query
          Object.keys(response[0]).forEach((el, i) => {
            // console.log('col:'+el);
            app.Draw.addColumn(el, i);
            // aggiungo un filtro per ogni colonna della tabella
            app.Draw.addParams(el, i);
          });
          // Opzione 2 - aggiungo manualmetne le colonne
          // app.Draw.addColumn('ID');
          // app.Draw.addColumn('Dealer');

          // aggiungo le righe
          let arrParams = [];
          for (let i in response) {
            // console.log(Object.values(response[i]));
            // Opzione 1 - Aggiunta colonne automaticamente (in base alla query)
            app.Draw.addRow(Object.values(response[i]));
            // TODO: eliminare gli spazi bianchi prima e/o dopo il testo
            // Opzione 2 - Aggiunta colonne manualmente
            // app.Draw.addRow([response[i].id, response[i].descrizione, response[i].versioneDMS, response[i].CodDealerCM]);
          }

          app.Draw.createDatalist();
          // imposto, nel metodo draw, anche le options, per cui questa riga deve essere messa prima dell'aggancio degli eventi sulle input (sotto)
          app.Draw.draw();
          App.init();

          document.querySelectorAll('input[type="search"]:not([id="search"])').forEach((el) => {
            el.oninput = app.handlerInput;
            el.onclick = app.showFilters;
            el.onblur = function(e) {
              // console.log(e);
              this.removeAttribute('placeholder');
            };
            let elementsSelected = Array.from(el.parentElement.querySelectorAll('.elements:not([multi]) > ul div.element'));

            el.parentElement.querySelectorAll('.elements:not([multi]) > ul div.element').forEach((liElement) => {liElement.onclick = app.handlerSelect;});
            el.parentElement.querySelectorAll('.elements[multi] > ul div.element').forEach((liElement) => {liElement.onclick = app.handlerSelectMulti;});
          });
        } else {

        }
      } else {

      }
    };

    request.open('POST', url);
    request.setRequestHeader('Content-Type','application/json');
    request.send();
  };


  // TODO: QUESTE FUNZIONI LE DOVRO' AGGIUNGERE ALLA CLASSE COME METODI
  app.handlerInput = function(e) {
    // console.log('input');
    // console.log(this);
    let parentElement = e.path[1];
    let label = parentElement.querySelector('label');
    if (this.value.length > 0) {
      parentElement.setAttribute('activated', true);
      this.setAttribute('activated', true);
      label.classList.add('has-content');
    } else {
      this.removeAttribute('activated');
      parentElement.removeAttribute('activated');
      label.classList.remove('has-content');
      app.Draw.search();
    }

    // mentre digito filtro l'elenco degli elementi <li>
    let liElement = parentElement.querySelectorAll('ul > .elementContent li');
    liElement.forEach((el) => {
      let label = el.getAttribute('label');
      // imposto hidden su elementContent e non su li
      let elementContent = el.parentElement.parentElement;
      (label.indexOf(this.value.toUpperCase()) !== -1) ? elementContent.removeAttribute('hidden') : elementContent.hidden = true;
    });

  };

  app.handlerSelectMulti = function(e) {
    let elements = e.path[4];
    this.parentElement.toggleAttribute('selected');
    // cerco il tasto OK per legare l'evento click
    let btnOk = elements.querySelector('section > button');
    btnOk.onclick = app.handlerMultiBtn;
  };

  app.handlerMultiBtn = function(e) {
    // console.log(this);
    // console.log(e.path);
    // console.log(e.path[2]);
    let parentElement = e.path[3]; // md-field
    let elements = parentElement.querySelector('.elements[show]');
    let input = parentElement.querySelector('input');
    let label = parentElement.querySelector('label');
    let liSelected = Array.from(parentElement.querySelectorAll('.elementContent[selected] > .element > li'));
    if (liSelected.length > 0) {
      parentElement.setAttribute('activated', true);
      input.setAttribute('activated', true);
      label.classList.add('has-content');
      input.value = "[MULTISELECT]";
    } else {
      label.classList.remove('has-content');
    }
    app.Draw.search();
    elements.removeAttribute('show');

  };

  app.handlerSelect = function(e) {
    console.log('handlerSelect');
    console.log(this);
    let parent = e.path[5]; // md-field
    let liElement = e.path[1].querySelector('li');
    let input = parent.querySelector('input');
    let label = parent.querySelector('label');
    input.value = liElement.getAttribute('label');
    if (input.value.length > 0) {
      parent.setAttribute('activated', true);
      input.setAttribute('activated', true);
      label.classList.add('has-content');
    } else {
      label.classList.remove('has-content');
    }

    app.Draw.search();
  };

  app.showFilters = function(e) {
    // verifico prima se ci sono altre dropdown aperte, le chiudo.
    document.querySelectorAll('div.elements[show]').forEach((elementsShow) => {
      elementsShow.removeAttribute('show');
    });
    // apro la dropdown
    e.path[1].querySelector('div.elements').toggleAttribute('show');
    this.setAttribute('placeholder', 'Search...');
  };

  app.getData();

})();
