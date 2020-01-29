/* global Application, Cube, Timeline, Page, DimensionStorage, CubeStorage */
// TODO: Nelle input di ricerca all'interno delle tabelle modificarle in input type='search'
// TODO: aggiungere le popup sulle icone all'interno della tabella
var App = new Application();
var oCube = new Cube();
// TODO: dichiarare qui le altre Classi
(() => {
  var app = {
    TimelineHier : new Timeline('layout-timeline-0'),
    TimelineFact : new Timeline('layout-timeline-1'),
    // passo al Costruttore il contenitore di tutte le page
    Page : new Page(document.getElementById('pages')),
    dialogTableList : document.getElementById('table-list'),
    dialogCubeName : document.getElementById('cube-name'),
    dialogDimensionName : document.getElementById('dimension-name'),
    dialogHierarchyName : document.getElementById('hierarchy-name'),
    dialogReportList : document.getElementById('dialog-report-list'),
    dialogFilters : document.getElementById('filter-setting'),
    btnFact : document.getElementById('mdc-next'),
    btnBack : document.getElementById('mdc-back'),
    btnNewReport: document.getElementById('mdc-new-report'),
    btnPreviewReport : document.getElementById('mdc-preview-report'),
    inputValueSearch : document.getElementById('valuesSearch'),
    btnColumnValues : document.getElementById('btnColumnValues'),
    btnFilterIcon : document.getElementById('filters-icon'),
    inputFilterName : document.getElementById('filter-name'),
    btnFilterDone : document.getElementById('btnFilterDone'),
    inputFilterValues : document.getElementById('filter-values')
  };

  // App.getSessionName();

  App.init();

  app.getDimensionsList = function() {
    // recupero la lista delle dimensioni in localStorage, il Metodo getDimension restituisce un array
    let ul = document.getElementById('dimensionsList');
    const dimension = new DimensionStorage();
    dimension.getDimensionsList().forEach((name) => {
      // console.log(name);
      let element = document.createElement('div');
      element.classList.add('element');
      let li = document.createElement('li');
      li.innerText = name;
      li.setAttribute('label', name);
      ul.appendChild(element);
      element.appendChild(li);
      // TODO: legare evento onclick, alla selezione di una dimensione vado a creare la struttura gerarchica a fianco
    });
  };

  app.getDatamartList = function() {
    let ul = document.getElementById('cubesList');
    const storage = new CubeStorage();
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

  app.handlerCubeSelected = function(e) {
    // TODO: stabilire quale attività far svolgere quando si clicca sul nome del report/cubo
    // ricreo un datamart

    let data = window.localStorage.getItem(this.getAttribute('label'));
    var url = 'ajax/cube.php';
    // let params = "cube="+data+"&dimension="+JSON.stringify(oCube.dimension);
    let params = 'cube='+data;
    console.log(params);
    // return;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          console.table(response);
          // TODO: dovrò personalizzare il report, impostando le colonne da nascondere, quali sono le colonne, quali le metriche, ecc...
          app.dialogReportList.close();
          document.getElementById('mdc-preview-report').disabled = false;
          // TODO: vado sullo step 2

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

    // console.log(this.getAttribute('label'));

    // let reportName = this.getAttribute('label');
    //
    // // recupero un datamart FX... già creato e visualizzo l'anteprima
    // var url = "ajax/reports.php";
    // let reportId = this.getAttribute('id');
    // let params = "reportId="+reportId;
    //
    // // console.log(params);
    // var request = new XMLHttpRequest();
    // request.onreadystatechange = function() {
    //   if (request.readyState === XMLHttpRequest.DONE) {
    //     if (request.status === 200) {
    //       var response = JSON.parse(request.response);
    //       console.table(response);
    //       // abilito il tasto btnPreviewReport
    //       app.btnPreviewReport.disabled = false;
    //       // app.createReport(response, oStorage.getJSONCube(reportName));
    //       app.dialogReportList.close();
    //
    //     } else {
    //       // TODO:
    //     }
    //   } else {
    //     // TODO:
    //   }
    // };
    //
    // request.open('POST', url);
    // // request.setRequestHeader('Content-Type','application/json');
    // request.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    // request.send(params);
  };

  app.getDatabaseTable = function() {
    // TODO: utilizzare le promise
    var url = 'ajax/database.php';

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          // console.table(response);

          let ul = document.getElementById('tables');
          // console.log(ulContainer);

          for (let i in response) {
            let element = document.createElement('div');
            element.classList.add('element');
            let li = document.createElement('li');
            li.setAttribute('label', response[i][0]);
            li.innerText = response[i][0];
            li.id = i;
            ul.appendChild(element);
            element.appendChild(li);
            li.onclick = app.handlerTableSelected;
          }

        } else {
          // TODO:
        }
      } else {
        // TODO:

      }
    };

    request.open('POST', url);
    request.setRequestHeader('Content-Type','application/json');
    request.send();
  };

  app.handlerTableSelected = function() {
    // console.log('handlerTableSelected');
    this.toggleAttribute('selected');
    // oCube.activeCard = document.querySelector('.card-table[active]');
    // inserisco il nome della tabella selezionata nella card [active]
    oCube.table = this.getAttribute('label');
    // inserisco il nome della tabella anche sull'icona i[filters]
    // console.log(oCube.sectionOption);
    // console.log(oCube.sectionOption.querySelector('i[filters]'));
    let iconFilter = oCube.sectionOption.querySelector('i[filters]');
    iconFilter.setAttribute('data-table', this.getAttribute('label'));

    let tmplList = document.getElementById('template-list-columns');

    // let ulContainer = document.getElementById('columns');
    let ulContainer = oCube.activeCard.querySelector('#columns');
    // pulisco l'elenco delle colonne in base alla selezione della tabella
    ulContainer.querySelectorAll('.element').forEach((el) => {ulContainer.removeChild(el);});
    app.dialogTableList.close();

    var url = 'ajax/tableInfo.php';
    let params = 'tableName='+oCube.table;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          // console.table(response);

          for (let i in response) {
            let tmplContent = tmplList.content.cloneNode(true);
            let element = tmplContent.querySelector('.element');
            let li = element.querySelector('li');
            // let iElement = element.querySelector('i');
            li.innerText = response[i][0];
            li.setAttribute('label', response[i][0]);
            // scrivo il tipo di dato senza specificare la lunghezza int(8) voglio che mi scriva solo int
            let pos = response[i][1].indexOf('(');
            let type = (pos !== -1) ? response[i][1].substring(0, pos) : response[i][1];
            li.setAttribute('data-type', type);
            li.setAttribute('data-table',oCube.table);
            li.id = i;
            ulContainer.appendChild(element);
            li.onclick = oCube.handlerColumns.bind(oCube);
            element.querySelector('#filters-icon').onclick = app.handlerFilterSetting;
          }
          // se ci sono poche colonne in questa tabella non attivo la input search
          if (Object.keys(response).length > 10) {
            oCube.activeCardRef.querySelector('.md-field > input').oninput = App.searchInList;
            // visualizzo la input per la ricerca delle colonne
            oCube.activeCardRef.querySelector('.md-field > input').parentElement.removeAttribute('hidden');
          }

          // lego eventi ai tasti i[....] nascosti
          oCube.activeCardRef.parentElement.querySelector('i[columns]').onclick = app.handlerAddColumns;
          oCube.activeCardRef.parentElement.querySelector('i[filters]').onclick = app.handlerAddFilters;
          oCube.activeCardRef.parentElement.querySelector('i[groupby]').onclick = app.handlerAddGroupBy;
          oCube.activeCardRef.parentElement.querySelector('i[metrics]').onclick = app.handlerAddMetrics;

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

  app.handlerFilterSetting = function(e) {
    console.log('apro la dialog Filter');
    // l'elemento nel DOM dove verrà inserito il nome del campo selezionato
    const fieldName = app.dialogFilters.querySelector('#filter-fieldName');
    // ... e il datatype del campo selezionato
    const fieldType = app.dialogFilters.querySelector('#fieldType');
    // nome del campo selezionato
    const field = e.path[1].querySelector('li').getAttribute('label');
    // ... e della tabella
    let operator = app.dialogFilters.querySelector('#operator-list > li[selected]').getAttribute('label');
    // imposto il nome del campo selezionato in currentFieldSetting (questo servirà per impostare l'icon colorata, tramite l'attr defined)
    oCube.currentFieldSetting = e.target;
    // recupero il datatype della colonna selezionata, questo mi servirà per impostare i valori nella between oppure nella IN/NOT IN...
    // ...Se il datatype è una stringa inserisco degli apici (nella IN ad esempio) oppure se il datatype = date nel between mostro le input type=date ...
    // ... invece delle input type text, ecc..
    // imposto l datatype sul fieldName
    fieldType.innerHTML = e.path[1].querySelector('li').getAttribute('data-type');
    // TODO: applicare dei controlli sul datatype che si sta inserendo, si potrebbe agire sull'evento oninput della input
    fieldName.innerHTML = field;
    // creo un'anteprima della formula
    app.dialogFilters.querySelector('#formula > span.field').innerText = e.path[1].querySelector('li').getAttribute('label');
    app.dialogFilters.querySelector('#formula > span.operator').innerText = operator;
    app.dialogFilters.showModal();
    // aggiungo evento al tasto ok per memorizzare il filtro e chiudere la dialog
    app.dialogFilters.querySelector('#btnFilterDone').onclick = oCube.handlerBtnFilterDone.bind(oCube);

  };

  app.handlerValueFilterSelected = function(e) {
    // selezione di un valore dall'elenco nella dialog filters
    // inserisco il valore nella textarea
    // console.log(e.target);
    // inserisco la colonna selezionata nella textarea
    const ul = app.dialogFilters.querySelector('ul#valuesList');
    const textarea = document.getElementById('filterFormula');
    let span;
    let valuesArr = [];

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

  app.getDistinctValues = function(table, field) {

    // let tableName = e.target.getAttribute('data-tableName');
    // let fieldName = document.getElementById('filter-fieldName').innerText;
    // return;
    // TODO: getDistinctValues
    // ottengo i valori distinti per la colonna selezionata
    // TODO: utilizzare le promise
    var url = 'ajax/columnInfo.php';
    let params = 'table='+table+'&field='+field;
    console.log(params);
    const ul = document.getElementById('valuesList');
    // pulisco la ul
    Array.from(ul.querySelectorAll('.element')).forEach((item) => {
      // console.log(item);
      item.remove();
    });

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
            li.setAttribute('label', response[i][field]);
            li.innerHTML = response[i][field];
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

  app.handlerCardSelected = function(e) {
    // console.log('handlerCardSelected');
    // se il viene avviene sull'elemento h5 apro la dialog
    if (e.target.localName === 'h6') {
      document.getElementById('tableSearch').value = '';
      app.dialogTableList.querySelectorAll('ul .element').forEach((el) => {el.removeAttribute('hide');});
      app.dialogTableList.showModal();
    }
    oCube.activeCard = this;

  };

  app.handlerAddTable = function() {
    /* metodo per l'aggiunta di un elemento/card. In questo Metodo imposto this.addedElement per poterlo restituire (sotto).
    ...Una volta restituito posso associare al nuovo elemento aggiungo i vari eventi*/
    app.TimelineHier.add();
    // imposto evento onclick sulla card appena aggiunta
    app.TimelineHier.elementAdded.querySelector('.card-table').onclick = app.handlerCardSelected;
  };

  app.handlerAddHierarchy = function(e) {
    // console.log(this);
    // console.log(e.path);
    // console.log(e.path[3]);
    // aggiungo l'attributo [hierarchies] alle due card (sopra-sotto)
    // recupero le due card dove in mezzo c'è questo tasto
    // elimino prima l'attributo [hierarchies] su eventuali altre card-table selezionate in precedenza

    // BUG: quando si assovia la FACT la timeline attiva non è app.TimelineHier ma app.TimelineFact
    oCube.changeMode();
    // su quale timeline sto operando ?
    // console.log(e.path[4]);
    let objTimeline = new Timeline(e.path[4].id);
    // console.log(Timeline);
    objTimeline.activeElements().forEach((element) => {
      // console.log(element);
      let card = element.querySelector('section.card-table');

      let help = card.querySelector('.help');
      if (element.querySelectorAll('ul li').length === 0) {
        help.setAttribute('alert', true);
        card.removeAttribute('hierarchies');
        help.innerText = 'Necessario aggiungere una tabella per creare una relazione';
      } else {
        help.removeAttribute('alert');
        card.setAttribute('hierarchies', true);
        help.innerText = 'Seleziona le colonne da mettere in relazione';
      }
    });
    // NOTE: Utilizzo di for...of in una Collection
    // for (let name of upCard.getAttributeNames()) {
    //   if (name === 'filters' || name === 'columns') {upCard.removeAttribute(name);}
    // }
  };

  app.handlerAddColumns = function(e) {
    // console.log(this);

    oCube.changeMode();
    let upCard = e.path[3].querySelector('section.card-table');
    oCube.activeCard = upCard;
    let help = upCard.querySelector('.help');
    help.innerHTML = 'Seleziona le colonne da mettere nel corpo della tabella';
    upCard.setAttribute('columns', true);
    // NOTE: esempio utilizzo di for...of
    // for (let name of upCard.getAttributeNames()) {
    //   // let value = upCard.getAttribute(name);
    //   // console.log(name);
    //   if (name === 'hierarchies' || name === 'filters') {upCard.removeAttribute(name);}
    // }
  };

  app.handlerColumnFilterSelected = function(e) {
    // selezione della colonna nella dialogFilters
    console.log(e.target);
    // inserisco la colonna selezionata nella textarea, la colonna non è editabile
    const textarea = document.getElementById('filterFormula');
    let span = document.createElement('span');
    span.className = 'formulaField';
    span.innerText = e.target.getAttribute('label');
    textarea.appendChild(span);
    app.getDistinctValues(e.target.getAttribute('data-table'), e.target.getAttribute('label'));
  };

  app.handlerAddFilters = function(e) {
    oCube.activeCard = e.path[3].querySelector('section.card-table');
    // TODO: recupero gli elementi in <ul id='columns'> per metterli nella dialogFilters
    // console.log(oCube.activeCard);
    // console.log(oCube.activeCard.querySelectorAll('#columns > .element'));
    let ulFieldsList = document.getElementById('fieldsList');
    // pulisco la ul per non duplicare la lista delle colonne
    Array.from(ulFieldsList.querySelectorAll('li')).forEach((item) => {item.remove();});
    // popolo la ul con la lista delle colonne
    Array.from(oCube.activeCard.querySelectorAll('#columns > .element')).forEach((item, i) => {
      // console.log(item);
      let liElement = item.querySelector('li');
      let li = liElement.cloneNode(true);
      ulFieldsList.appendChild(li);
      li.onclick = app.handlerColumnFilterSelected;
    });

    app.dialogFilters.showModal();
    app.dialogFilters.querySelector('#btnFilterDone').onclick = oCube.handlerBtnFilterDone.bind(oCube);
  };

  app.handlerAddGroupBy = function(e) {
    // console.log(this);
    oCube.changeMode();
    let upCard = e.path[3].querySelector('section.card-table');
    oCube.activeCard = upCard;
    let help = upCard.querySelector('.help');
    help.innerHTML = 'Seleziona le colonne su cui applicare il GROUP BY';
    upCard.setAttribute('groupby', true);
  };

  app.handlerAddMetrics = function(e) {
    // console.log(this);
    oCube.changeMode();
    let upCard = e.path[3].querySelector('section.card-table');
    oCube.activeCard = upCard;
    let help = upCard.querySelector('.help');
    help.innerHTML = 'Seleziona le colonne da impostare come Metriche';
    upCard.setAttribute('metrics', true);
  };

  app.cloneLastTable = function() {
    // BUG: se si torna indietro a fare una modifica alla gerarchia, dopo aver cliccato "Salva dimensione", viene clonata di nuovo la tabella, invece di
    //....modificare quella già clonata
    // prendo l'ultima tabella della gerarchia e la clono per inserirla nella seconda pagina, associazione con la FACT
    // ultima card nella gerarchia
    let lastTableInHierarchy = app.TimelineHier.translateRef.querySelector('div[element]:last-child .card');
    // console.log(lastTableInHierarchy);
    // dove va inserita l'ultima card della gerarchia, prima della fact. La Fact ha data-id =2 perchè sicuramente ce ne sarà una a sinistra, con data-id=1
    let factElement = app.TimelineFact.translateRef.querySelector('div[element][data-id="2"]');
    // console.log(factElement);
    // creo l'elemento div[element] e [sub-element]
    let divElement = document.createElement('div');
    divElement.setAttribute('data-id', 1);
    divElement.setAttribute('element', true);
    divElement.setAttribute('info', true);
    let divSubElement = document.createElement('div');
    divSubElement.setAttribute('sub-element', true);
    // aggiuno l'elemento div[element] prima del div[element] che contiene la fact (ottenuto in factElement)
    app.TimelineFact.translateRef.insertBefore(divElement, factElement);
    // in questo div[element] aggiungo div[sub-element] ...successivamente tutta la card
    divElement.appendChild(divSubElement);
    let newCard = lastTableInHierarchy.cloneNode(true);
    divSubElement.appendChild(newCard);

    newCard.querySelectorAll('li').forEach((li) => {
      li.onclick = oCube.handlerColumns.bind(oCube);
    });
    // evento oninput sulla searchColumns
    newCard.querySelector('.md-field > input').oninput = App.searchInList;
    // elimino la sezione section[options]
    newCard.querySelector('.card-layout').removeChild(newCard.querySelector('section[options]'));
    // aggiungo la timeline circle
    app.TimelineFact.addCircle();
  };

  app.handlerFunctionMetricList = function() {
    // console.log(this);
    // questo elenco deve avere sempre almeno un elemento selezionato
    if (this.hasAttribute('selected')) {return;}
    document.querySelectorAll('#function-list li').forEach((li) => {li.removeAttribute('selected');});
    this.toggleAttribute('selected');
  };

  document.querySelectorAll('#function-list li').forEach((li) => {
    li.onclick = app.handlerFunctionMetricList;
  });

  app.handlerFunctionOperatorList = function(e) {
    // console.log(this);
    // questo elenco deve avere sempre almeno un elemento selezionato
    if (this.hasAttribute('selected')) {return;}

    // TODO: Nelle input che verranno mostrate dovrò andare a verificare il type del campo, se date mostro input type="date", se number <input type=number, ecc...
    document.querySelectorAll('#operator-list li').forEach((li) => {li.removeAttribute('selected');});
    this.toggleAttribute('selected');
    console.log(e.target);
    const textarea = document.getElementById('filterFormula');
    let span = document.createElement('span');
    span.className = 'formulaOperator';
    span.innerText = e.target.getAttribute('label');
    textarea.appendChild(span);
    // debugger;
    let openPar, closePar, formulaValues;
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
        app.dialogFilters.querySelector('#valuesList').setAttribute('multi', true);
        break;
      default:


    }



    // TODO: ottenere la posizione dell'operatore e posizionare il cursore nella posizione apposita


    // switch (e.target.getAttribute('label')) {
    //   case 'BETWEEN':
    //     document.getElementById('between').hidden = false;
    //     // nascondo la input stanrdard
    //     app.dialogFilters.querySelector('.md-field[value]').hidden = true;
    //
    //     break;
    //   case 'IN':
    //   case 'NOT IN':
    //     document.getElementById('in').hidden = false;
    //     app.dialogFilters.querySelector('.md-field[value]').hidden = true;
    //     document.getElementById('between').hidden = true;
    //
    //     break;
    //   default:
    //     document.getElementById('in').hidden = true;
    //     app.dialogFilters.querySelector('.md-field[value]').hidden = false;
    //     document.getElementById('between').hidden = true;
    // }
  };

  app.openReportList = function() {
    app.dialogReportList.showModal();
  };

  /*events */
  document.querySelectorAll('.card-table').forEach((card) => {
    // questo imposta l'evento sulla prima card e sulla fact che sono già presenti nel DOM
    card.onclick = app.handlerCardSelected;
  });
  // evento su icona per aggiungere una tabella alla gerarchia
  document.querySelector('.icon-relation > span > i[add]').onclick = app.handlerAddTable;
  // aggiungo onclick sulle icone [hierachies] per la creazione delle gerarchie
  Array.from(document.querySelectorAll('.icon-relation > span > i[hierarchies]')).forEach((btnHierarchies) => {
    // console.log(btnHierarchies);
    btnHierarchies.onclick = app.handlerAddHierarchy;
  });

  Array.from(document.querySelectorAll('.icon-relation > span > i[hierarchies-remove]')).forEach((btnHierarchiesRemove) => {
    // console.log(btnHierarchiesRemove);
    btnHierarchiesRemove.onclick = app.handlerRemoveHierarchy;
  });
  // OPTIMIZE: forse questi 2 sotto li devo mettere dopo aver definito la tabella
  document.querySelector('section[options] > span > i[columns]').onclick = app.handlerAddColumns;
  document.querySelector('section[options] > span > i[filters]').onclick = app.handlerAddFilters;
  document.querySelector('section[options] > span > i[groupby]').onclick = app.handlerAddGroupBy;
  document.querySelector('#fact-card section[options] > span > i[metrics]').onclick = app.handlerAddMetrics;

  /* tasto OK nella dialog*/
  document.getElementById('btnDimensionSaveName').onclick = function() {
    /*
      Salvo la dimensione, senza il legame con la FACT.
      Clono l'ultima tabella e la inserisco a fianco della FACT per fare l'associazione.
      Salvo in localStorage la dimensione creata
      // TODO: Visualizzo nell'elenco di sinistra la dimensione appena creata
    */
    oCube.dimensionTitle = document.getElementById('dimensionName').value;
    const storage = new DimensionStorage();
    let from = [];
    let objDimension = {};
    document.querySelectorAll('.card-table').forEach((card) => {
      if (card.getAttribute('name')) {
        from.push(card.getAttribute('name'));
        objDimension.from = from;
      }
    });

    // in oCube.cube.hierarchies inserisco solo la/le relazione/i tra l'ultima tabella della gerarchia e la FACT
    oCube.cube['hierarchies'] = oCube.hierarchyFact;
    let hierarchies = {};
    // TODO: da rivedere perchè le gerarchie dovrebbero essere tutte hier_ e non più fact_ e hier_
    Object.keys(oCube.hierarchyTable).forEach((rel) => {if (rel.substring(0, 5) === 'hier_') {hierarchies[rel] = oCube.hierarchyTable[rel];}});
    // ... mentre, nella dimensione inserisco solo le relazioni tra tabelle e non la relazione con la FACT
    objDimension.hierarchies = hierarchies;
    objDimension.type = 'DIMENSION';
    // TODO: fare in modo che type viene inserito nella root del json, quindi eliminare un livello da oCube.dimension

    oCube.dimension[oCube.dimensionTitle] = objDimension;
    console.log(oCube.dimension);

    storage.dimension = oCube.dimension;

    app.cloneLastTable();
    app.dialogDimensionName.close();
  };

  document.getElementById('saveDimension').onclick = function() {app.dialogDimensionName.showModal();};

  /* tasto OK nella dialog per il salvataggio di un Report/Cubo */
  document.getElementById('btnCubeSaveName').onclick = function() {
    oCube.cubeTitle = document.getElementById('cubeName').value;
    oCube.cube.dimensions = oCube.dimension;
    oCube.cube.type = 'CUBE';
    oCube.cube['columns'] = oCube.columns;
    oCube.cube['filters'] = oCube.filters;
    oCube.cube['metrics'] = oCube.metrics;
    oCube.cube['filteredMetrics'] = oCube.filteredMetrics;
    oCube.cube['groupby'] = oCube.groupBy;
    oCube.cube['FACT'] = document.querySelector('#fact').getAttribute('name');
    oCube.cube.name = oCube.cubeTitle;
    let cubeStorage = new CubeStorage();

    // Creo il cubeId basandomi sui cubi già creati in Storage, il cubeId lo associo al cubo che sto per andare a salvare.
    oCube.cube.cubeId = cubeStorage.getIdAvailable();
    console.log(oCube.cube.cubeId);

    // oCube.cube.cube_id = oStorage.cubeId;
    console.log(oCube.cube);

    // salvo il cubo in localStorage
    cubeStorage.save = oCube.cube;
    cubeStorage.stringifyObject = oCube.cube;

    var url = 'ajax/cube.php';
    let params = 'cube='+cubeStorage.stringifyObject;
    console.log(params);

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          console.table(response);
          app.dialogCubeName.close();
          // abilito il tasto REPORT PREVIEW
          document.getElementById('mdc-preview-report').disabled = false;
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

  document.getElementById('saveReport').onclick = function() {app.dialogCubeName.showModal();};

  // document.getElementById('saveHierarchy').onclick = function(e) {
  //   // TODO: verifico se sono stati inseriti i parametri obbligatori, gerarchie,titolo del cubo
  //
  // };

  document.querySelectorAll('#operator-list li').forEach((li) => {
    li.onclick = app.handlerFunctionOperatorList;
  });

  app.btnFact.onclick = function() {app.Page.next();};

  // vado alla pagina reports/index.html
  app.btnPreviewReport.onclick = function() {location.href = '/reports/';};

  app.btnBack.onclick = function() {app.Page.previous();};

  // app.btnNewReport.onclick = function(e) {
  //   // TODO: ritorno allo step 1 e pulisco tutto per creare un nuovo report (dimensioni/cubo)
  //   app.Page.restart();
  // };

  /*ricerca dimensioni in elenco di sinistra*/
  // document.getElementById('dimensionSearch').oninput = App.searchInList;
  /* ricerca cubi in elenco di sinitra*/
  // document.getElementById('cubeSearch').oninput = App.searchInList;
  /* ricerca in lista tabelle */
  document.getElementById('tableSearch').oninput = App.searchInList;

  // icona openReport apre la dialog con la lista di reports già creati
  document.querySelector('#openReport').onclick = app.openReportList;

  app.inputValueSearch.oninput = App.searchInList;

  app.inputFilterName.oninput = function(e) {
    // console.log(e.target.value);
    (e.target.value.length > 0) ? app.btnFilterDone.disabled = false : app.btnFilterDone.disabled = true;
  };

  // app.inputFilterValues.oninput = function(e) {
  //   // console.log(e.target.value);
  //   // copio il valore che sto inserendo nella input, in #formula > span.value
  //   // TODO: verifico anche il datatype per poter impostare una stringa/ numero/ ecc...
  //   // se datatype = varchar imposto gli apici
  //   let datatype = document.getElementById('fieldType').innerHTML;
  //   console.log(datatype);
  //   switch (datatype) {
  //     case 'varchar':
  //       app.dialogFilters.querySelector('#formula > span.value').innerHTML = `'${e.target.value}'`;
  //       break;
  //     default:
  //       app.dialogFilters.querySelector('#formula > span.value').innerHTML = e.target.value;
  //
  //   }
  // };

  /*events */

  app.getDatabaseTable();

  // app.getDimensionsList();

  app.getDatamartList();
})();
