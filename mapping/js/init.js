/* global Application, Cube, Timeline, Page, DimensionStorage, CubeStorage */
// TODO: Nelle input di ricerca all'interno delle tabelle modificarle in input type='search'
// TODO: aggiungere le popup sulle icone all'interno della tabella
var App = new Application();
var cube = new Cube();
// TODO: dichiarare qui le altre Classi
(() => {
  var app = {
    // TimelineHier : new Timeline('layout-timeline-0'),
    // TimelineFact : new Timeline('layout-timeline-1'),
    // passo al Costruttore il contenitore di tutte le page
    tmplElementMenu : document.getElementById('elementMenu'),
    // Page : new Page(document.getElementById('pages')),
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
    inputFilterValues : document.getElementById('filter-values'),

    tmplCloseTable : document.getElementById('closeTable'), // tasto close table
    tmplInputSearch : document.getElementById('inputSearch'), // input per ricerca fields nelle tabelle
    tmplSectionOption : document.getElementById('sectionOption'), // options laterale per ogni tabella

    // tasto openTableList
    btnTableList : document.getElementById('openTableList'),
    tableList : document.getElementById('tableList'),

    card : null,
    cardTitle : null,
    content : document.getElementById('content'),
    body : document.getElementById('body'),
    // dropzone : document.getElementsByClassName('dropzone')[0],
    currentX : 0,
    currentY : 0,
    initialX : 0,
    initialY : 0,
    active : false,
    xOffset : 0,
    yOffset : 0,
    dragElement : null,
    elementMenu : null
  };

  App.init();

  app.dragStart = function(e) {
    // mousedown da utilizzare per lo spostamento dell'elemento
    if (e.target.localName === 'h6') {
      app.cardTitle = e.target;
      app.card = e.path[4];
      // recupero la posizione attuale della card tramite l'attributo x-y impostato su .cardTable
      app.xOffset = e.path[4].getAttribute('x');
      app.yOffset = e.path[4].getAttribute('y');
    }
    // cardTitle = document.querySelector('.card.table .title > h6');
    if (e.type === 'touchstart') {
        app.initialX = e.touches[0].clientX - app.xOffset;
        app.initialY = e.touches[0].clientY - app.yOffset;
      } else {
        app.initialX = e.clientX - app.xOffset;
        app.initialY = e.clientY - app.yOffset;
      }

      if (e.target === app.cardTitle) {
        app.active = true;
      }
  };

  app.dragEnd = function() {
    // console.log(e.target);
    // mouseup, elemento rilasciato dopo lo spostamento
    app.initialX = app.currentX;
    app.initialY = app.currentY;
    app.active = false;
  };

  app.drag = function(e) {
    // mousemove elemento si sta spostato
    // console.log(e.target);
    // console.log(e);
    if (app.active) {
      e.preventDefault();

      if (e.type === 'touchmove') {
          app.currentX = e.touches[0].clientX - app.initialX;
          app.currentY = e.touches[0].clientY - app.initialY;
        } else {
          app.currentX = e.clientX - app.initialX;
          app.currentY = e.clientY - app.initialY;
        }

        app.xOffset = app.currentX;
        app.yOffset = app.currentY;
        // imposto sulla .cardTable le posizioni dove è 'stato lasciato'  dopo il drag in modo da "riprendere" lo
        // spostamento da dove era rimasto
        app.card.setAttribute('x', app.xOffset);
        app.card.setAttribute('y', app.yOffset);

        app.card.style.transform = 'translate3d(' + app.currentX + 'px, ' + app.currentY + 'px, 0)';
      }
  };

  app.body.onmousedown = app.dragStart;
  app.body.onmouseup = app.dragEnd;
  app.body.onmousemove = app.drag;

  // TODO: aggiungere anhce eventi touch...

  app.handlerDragStart = function(e) {
    // console.log('start');
    // dragStart
    // console.log(e.target.id);
    // return;
    e.dataTransfer.setData('text/plain', e.target.id);
    app.dragElement = document.getElementById(e.target.id);
    // console.log(e.path);
    app.elementMenu = e.path[1]; // elemento da eliminare al termine drl drag&drop
    // console.log(e.dataTransfer);
  };

  app.handlerDragOver = function(e) {
    // console.log('dragOver');
    e.preventDefault();
  };

  app.handlerDragEnter = function(e) {
    // console.log('dragEnter');
    e.preventDefault();
    console.log(e.target);

    if (e.target.className === 'dropzone') {
      console.info('DROPZONE');
      // TODO: css effect
    }
  };

  app.handlerDragLeave = function(e) {
    e.preventDefault();
    // console.log('dragLeave');
  };

  app.handlerDragEnd = function(e) {
    e.preventDefault();
    console.log('dragEnd');
    // console.log(e.target);
    let tmplList = document.getElementById('templateListColumns');
    // elemento dove inserire le colonne della tabella
    let ulContainer = cube.activeCard.querySelector('#columns');
    console.log(ulContainer);

    var url = 'ajax/tableInfo.php';
    let params = 'tableName='+cube.table;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          // console.table(response);
          ulContainer.removeAttribute('hidden');
          for (let i in response) {
            let tmplContent = tmplList.content.cloneNode(true);
            let element = tmplContent.querySelector('.element');
            // element.setAttribute('name', 'columnSearch');
            let li = element.querySelector('li');
            li.className = 'elementSearch';
            // let iElement = element.querySelector('i');
            li.innerText = response[i][0];
            li.setAttribute('label', response[i][0]);
            // scrivo il tipo di dato senza specificare la lunghezza int(8) voglio che mi scriva solo int
            let pos = response[i][1].indexOf('(');
            let type = (pos !== -1) ? response[i][1].substring(0, pos) : response[i][1];
            li.setAttribute('data-type', type);
            li.setAttribute('data-table',cube.table);
            li.id = i;
            ulContainer.appendChild(element);
            li.onclick = cube.handlerColumns.bind(cube);
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

  app.handlerDrop = function(e) {
    e.preventDefault();
    console.log('drop');
    // console.log(e);
    let data = e.dataTransfer.getData('text/plain');
    let card = document.getElementById(data);
    // console.log(e.dataTransfer);
    // console.log(e.target);
    // nuova tabella droppata
    console.log(card);
    console.log(app.dragElement);
    // TODO: dopo il drop elimino l'elemento <li> e imposto il template #cardLayout
    // TODO: la .card .draggable diventa .card .table
    card.className = 'card table';
    card.removeAttribute('draggable');
    card.removeAttribute('name');
    // elimino lo span all'interno della card
    card.querySelector('span[label]').remove();
    // associo gli eventi mouse
    card.onmousedown = app.dragStart;
    card.onmouseup = app.dragEnd;
    card.onmousemove = app.drag;
    // TODO: prendo il template cardLayout e lo inserisco nella card table
    let tmpl = document.getElementById('cardLayout');
    let content = tmpl.content.cloneNode(true);
    let cardLayout = content.querySelector('.cardLayout');

    // imposto il titolo in h6
    cardLayout.querySelector('h6').innerHTML = card.getAttribute('label');
    card.appendChild(cardLayout);

    app.body.appendChild(card);

    // imposto la card draggata nella posizione dove si trova il mouse
    card.style.transform = 'translate3d(' + e.offsetX + 'px, ' + e.offsetY + 'px, 0)';
    card.setAttribute('x', e.offsetX);
    card.setAttribute('y', e.offsetY);
    // chiudo la list openTableList
    app.btnTableList.removeAttribute('open');
    app.tableList.toggleAttribute('hidden');

    // evento sul tasto close della card
    card.querySelector('i[data-id="closeTable"]').onclick = app.handlerCloseCard;
    // evento sulla input di ricerca nella card
    card.querySelector('input').oninput = App.searchInList;
    card.querySelector('input').oninput = App.searchInList;

    cube.activeCard = card.querySelector('.cardTable');
    // inserisco il nome della tabella selezionata nella card [active]
    cube.table = card.getAttribute('label');

    // lego eventi ai tasti i[....] nascosti
    cube.activeCardRef.parentElement.querySelector('i[columns]').onclick = app.handlerAddColumns;
    cube.activeCardRef.parentElement.querySelector('i[filters]').onclick = app.handlerAddFilters;
    cube.activeCardRef.parentElement.querySelector('i[groupby]').onclick = app.handlerAddGroupBy;
    cube.activeCardRef.parentElement.querySelector('i[metrics]').onclick = app.handlerAddMetrics;
    // inserisco il nome della tabella nella struttura gerarchica sulla destra
    const hierarchies = document.getElementById('hierarchies');
    let id = hierarchies.childElementCount;
    let dropzone = document.createElement('div');
    dropzone.classList = 'dropzone';
    hierarchies.appendChild(dropzone);
    let div = document.createElement('div');
    div.className = 'hier table';
    div.id = 'hier_' + id;
    div.setAttribute('draggable', true);
    div.setAttribute('label', cube.table);
    div.innerHTML = cube.table;

    dropzone.appendChild(div);

    // event sui tasti section[options]
    card.querySelector('i[hierarchies]').onclick = app.handlerAddHierarchy;



  };

  app.content.ondragover = app.handlerDragOver;
  app.content.ondragenter = app.handlerDragEnter;
  app.content.ondragleave = app.handlerDragLeave;
  app.content.ondrop = app.handlerDrop;
  app.content.ondragend = app.handlerDragEnd;

  // App.getSessionName();

  app.handlerCloseCard = function(e) {
    // elimino la card e la rivisualizzo nel drawer (spostata durante il drag&drop)
    console.log(e.target);
    console.log(e.path);
    // TODO: rimettere la card chiusa al suo posto originario, nel drawer
    e.path[5].remove();
    // TODO: eliminare anche dal flusso delle gerarchie sulla destra
  };

  app.getDimensions = function() {
    // recupero la lista delle dimensioni in localStorage, il Metodo getDimension restituisce un array
    // const tmplDimension = document.getElementById('dimension');
    const dimension = new DimensionStorage();
    let obj = dimension.list();
    // console.log(obj);
    const tmplDimension = document.getElementById('dimension');
    Array.from(Object.keys(obj)).forEach((dimName) => {
      // console.log(dimName);
      let tmplContent = tmplDimension.content.cloneNode(true);
      let section = tmplContent.querySelector('.dimensions');
      section.querySelector('h5').innerHTML = dimName;
      document.querySelector('#dimensions').appendChild(section);
      // aggiungo anche le tabelle all'interno ella dimensione
      // console.log(obj[dimName]); // valore/i
      const tmplMiniCard = document.getElementById('miniCard');

      obj[dimName].forEach((table) => {
        let contentMiniCard = tmplMiniCard.content.cloneNode(true);
        let miniCard = contentMiniCard.querySelector('.miniCard');
        miniCard.querySelector('h6').innerHTML = table;
        // console.log(table);
        section.appendChild(miniCard);
      });

    });
  };

  app.getCubes = function() {
    // recupero la lista dei Cubi in localStorage
    const cubes = new CubeStorage();
    let obj = cubes.list();
    const nav = document.getElementsByTagName('nav')[0];
    const tmplCubeList = document.getElementById('cubeList');
    let tmplContent = tmplCubeList.content.cloneNode(true);
    let element = tmplContent.querySelector('a');
    nav.appendChild(element);
    for (let i in obj) {
      element.querySelector('span').innerHTML = obj[i]['key'];
      element.id = 'cubeId_' + obj[i]['cubeId'];
    }
  };
  // app.getDimensionsList = function() {
  //   // recupero la lista delle dimensioni in localStorage, il Metodo getDimension restituisce un array
  //   let ul = document.getElementById('dimensionsList');
  //   const dimension = new DimensionStorage();
  //   dimension.getDimensionsList().forEach((name) => {
  //     // console.log(name);
  //     let element = document.createElement('div');
  //     element.classList.add('element');
  //     let li = document.createElement('li');
  //     li.innerText = name;
  //     li.setAttribute('label', name);
  //     ul.appendChild(element);
  //     element.appendChild(li);
  //     // TODO: legare evento onclick, alla selezione di una dimensione vado a creare la struttura gerarchica a fianco
  //   });
  // };

  // app.getDatamartList = function() {
  //   let ul = document.getElementById('cubesList');
  //   const storage = new CubeStorage();
  //   storage.list.forEach((cube) => {
  //     // console.log(name);
  //     let element = document.createElement('div');
  //     element.classList.add('element');
  //     let li = document.createElement('li');
  //     li.innerText = cube.key;
  //     li.id = cube.cubeId;
  //     li.setAttribute('label', cube.key);
  //     ul.appendChild(element);
  //     element.appendChild(li);
  //     li.onclick = app.handlerCubeSelected;
  //   });
  // };

  app.handlerCubeSelected = function() {
    // TODO: stabilire quale attività far svolgere quando si clicca sul nome del report/cubo
    // ricreo un datamart

    let data = window.localStorage.getItem(this.getAttribute('label'));
    var url = 'ajax/cube.php';
    // let params = "cube="+data+"&dimension="+JSON.stringify(cube.dimension);
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
          for (let i in response) {
            let tmpl = document.getElementById('el');
            let tmplContent = tmpl.content.cloneNode(true);
            let element = tmplContent.querySelector('.element.card');
            element.ondragstart = app.handlerDragStart;
            element.id = 'table-' + i;
            element.setAttribute('label', response[i][0]);
            ul.appendChild(element);
            let span = document.createElement('span');
            span.classList = 'elementSearch';
            span.setAttribute('label', response[i][0]);
            span.innerHTML = response[i][0];
            element.appendChild(span);

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
    cube.currentFieldSetting = e.target;
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
    app.dialogFilters.querySelector('#btnFilterDone').onclick = cube.handlerBtnFilterDone.bind(cube);

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

  // app.handlerAddTable = function() {
  //   /* metodo per l'aggiunta di un elemento/card. In questo Metodo imposto this.addedElement per poterlo restituire (sotto).
  //   ...Una volta restituito posso associare al nuovo elemento aggiungo i vari eventi*/
  //   app.TimelineHier.add();
  //   // imposto evento onclick sulla card appena aggiunta
  //   app.TimelineHier.elementAdded.querySelector('.card-table').onclick = app.handlerCardSelected;
  // };

  app.handlerSelectCard = function(e) {
    console.log(e.target);
    // console.log(e.path);

    const cardLayout = e.path[4]; // cardLayout
    const cardTable = e.path[3]; // cardTable
    cardLayout.setAttribute('selected', true);
    cardTable.setAttribute('mode', 'hierarchies');
    cardTable.querySelector('span[data-id="popupSelectedTable"]').removeAttribute('hide');
    cardTable.querySelector('span[data-id="popupSelectTable"]').setAttribute('hide', true);
  };

  app.handlerDeselectCard = function(e) {
    console.log(e.target);
    // console.log(e.path);
    console.log(e.path[4]); // cardLayout
    const cardLayout = e.path[4];
    const cardTable = e.path[3];
    cardLayout.removeAttribute('selected');
    cardTable.removeAttribute('mode');
    cardTable.querySelector('span[data-id="popupSelectedTable"]').setAttribute('hide', true);
    cardTable.querySelector('span[data-id="popupSelectTable"]').removeAttribute('hide');
  };

  app.handlerAddHierarchy = function(e) {
    let cardTable = e.path[3].querySelector('.cardTable');
    cube.activeCard = cardTable;
    console.log(cardTable);
    cube.changeMode('hierarchies', 'Selezionare le colonne di questa e dell\'altra tabella da mettere in relazione');
  };

  app.handlerAddColumns = function(e) {
    // console.log(e.target);
    console.log(e.path);

    let cardTable = e.path[3].querySelector('.cardTable');
    cube.activeCard = cardTable;
    console.log(cardTable);
    cube.changeMode('columns', 'Seleziona le colonne da mettere nel corpo della tabella');
  };

  app.handlerColumnFilterSelected = function(e) {
    // selezione della colonna nella dialogFilters
    console.log(e.target);
    if (e.target.hasAttribute('selected')) {return;}

    // TODO: Nelle input che verranno mostrate dovrò andare a verificare il type del campo, se date mostro input type="date", se number <input type=number, ecc...
    document.querySelectorAll('#fieldsList li').forEach((li) => {li.removeAttribute('selected');});
    e.target.toggleAttribute('selected');
    // inserisco la colonna selezionata nella textarea, la colonna non è editabile
    const textarea = document.getElementById('filterFormula');
    let span = document.createElement('span');
    span.className = 'formulaField';
    span.innerText = e.target.getAttribute('label');
    textarea.appendChild(span);
    app.getDistinctValues(e.target.getAttribute('data-table'), e.target.getAttribute('label'));
  };

  app.handlerAddFilters = function(e) {
    cube.activeCard = e.path[3].querySelector('.cardTable');
    // console.log(cube.activeCard);
    // console.log(cube.activeCard.querySelectorAll('#columns > .element'));
    let ulFieldsList = document.getElementById('fieldsList');
    // pulisco la ul per non duplicare la lista delle colonne
    Array.from(ulFieldsList.querySelectorAll('li')).forEach((item) => {item.remove();});
    // popolo la ul con la lista delle colonne
    Array.from(cube.activeCard.querySelectorAll('#columns > .element')).forEach((item, i) => {
      // console.log(item);
      let liElement = item.querySelector('li');
      let li = liElement.cloneNode(true);
      ulFieldsList.appendChild(li);
      li.onclick = app.handlerColumnFilterSelected;
    });

    app.dialogFilters.showModal();
    app.dialogFilters.querySelector('#btnFilterDone').onclick = cube.handlerBtnFilterDone.bind(cube);
  };

  app.handlerAddGroupBy = function(e) {
    // imposto il groupby mode
    let cardTable = e.path[3].querySelector('.cardTable');
    cube.activeCard = cardTable;
    cube.changeMode('groupby', 'Seleziona le colonne su cui applicare il GROUP BY');
  };

  app.handlerAddMetrics = function(e) {
    // imposto il metrics mode
    let cardTable = e.path[3].querySelector('.cardTable');
    cube.activeCard = cardTable;
    cube.changeMode('metrics', 'Seleziona le colonne da impostare come Metriche');
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
    if (e.target.hasAttribute('selected')) {return;}

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
        // TODO: valutare le operazioni da svolgere per questo blocco
    }
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
  // document.querySelector('.icon-relation > span > i[add]').onclick = app.handlerAddTable;
  // aggiungo onclick sulle icone [hierachies] per la creazione delle gerarchie
  Array.from(document.querySelectorAll('.icon-relation > span > i[hierarchies]')).forEach((btnHierarchies) => {
    // console.log(btnHierarchies);
    btnHierarchies.onclick = app.handlerAddHierarchy;
  });

  app.testONLOAD = function(e) {console.log(e.target);};

  Array.from(document.querySelectorAll('.icon-relation > span > i[hierarchies-remove]')).forEach((btnHierarchiesRemove) => {
    // console.log(btnHierarchiesRemove);
    btnHierarchiesRemove.onclick = app.handlerRemoveHierarchy;
  });

  /* tasto OK nella dialog*/
  document.getElementById('btnDimensionSaveName').onclick = function() {
    /*
      Salvo la dimensione, senza il legame con la FACT.
      Salvo in localStorage la dimensione creata
      // TODO: Visualizzo nell'elenco di sinistra la dimensione appena creata
      // TODO: creo un contenitorre per le dimensioni salvate, con dentro le tabelle che ne fanno parte.
    */
    cube.dimensionTitle = document.getElementById('dimensionName').value;
    const storage = new DimensionStorage();
    let from = [];
    let objDimension = {};
    document.querySelectorAll('.cardTable').forEach((card) => {
      if (card.getAttribute('name')) {
        from.push(card.getAttribute('name'));
        objDimension.from = from;
      }
    });

    // in cube.cube.hierarchies inserisco solo la/le relazione/i tra l'ultima tabella della gerarchia e la FACT
    cube.cube['hierarchies'] = cube.hierarchyFact;
    let hierarchies = {};
    // TODO: da rivedere perchè le gerarchie dovrebbero essere tutte hier_ e non più fact_ e hier_
    Object.keys(cube.hierarchyTable).forEach((rel) => {if (rel.substring(0, 5) === 'hier_') {hierarchies[rel] = cube.hierarchyTable[rel];}});
    // ... mentre, nella dimensione inserisco solo le relazioni tra tabelle e non la relazione con la FACT
    objDimension.hierarchies = hierarchies;
    objDimension.type = 'DIMENSION';
    // TODO: fare in modo che type viene inserito nella root del json, quindi eliminare un livello da cube.dimension

    cube.dimension[cube.dimensionTitle] = objDimension;
    console.log(cube.dimension);

    storage.dimension = cube.dimension;

    // app.cloneLastTable();
    app.dialogDimensionName.close();
  };

  document.getElementById('saveDimension').onclick = function() {app.dialogDimensionName.showModal();};

  /* tasto OK nella dialog per il salvataggio di un Report/Cubo */
  // document.getElementById('btnCubeSaveName').onclick = function() {
  //   cube.cubeTitle = document.getElementById('cubeName').value;
  //   cube.cube.dimensions = cube.dimension;
  //   cube.cube.type = 'CUBE';
  //   cube.cube['columns'] = cube.columns;
  //   cube.cube['filters'] = cube.filters;
  //   cube.cube['metrics'] = cube.metrics;
  //   cube.cube['filteredMetrics'] = cube.filteredMetrics;
  //   cube.cube['groupby'] = cube.groupBy;
  //   cube.cube['FACT'] = document.querySelector('#fact').getAttribute('name');
  //   cube.cube.name = cube.cubeTitle;
  //   let cubeStorage = new CubeStorage();
  //
  //   // Creo il cubeId basandomi sui cubi già creati in Storage, il cubeId lo associo al cubo che sto per andare a salvare.
  //   cube.cube.cubeId = cubeStorage.getIdAvailable();
  //   console.log(cube.cube.cubeId);
  //
  //   // cube.cube.cube_id = oStorage.cubeId;
  //   console.log(cube.cube);
  //
  //   // salvo il cubo in localStorage
  //   cubeStorage.save = cube.cube;
  //   cubeStorage.stringifyObject = cube.cube;
  //
  //   var url = 'ajax/cube.php';
  //   let params = 'cube='+cubeStorage.stringifyObject;
  //   console.log(params);
  //
  //   var request = new XMLHttpRequest();
  //   request.onreadystatechange = function() {
  //     if (request.readyState === XMLHttpRequest.DONE) {
  //       if (request.status === 200) {
  //         var response = JSON.parse(request.response);
  //         console.table(response);
  //         app.dialogCubeName.close();
  //         // abilito il tasto REPORT PREVIEW
  //         document.getElementById('mdc-preview-report').disabled = false;
  //       } else {
  //         // TODO:
  //       }
  //     } else {
  //       // TODO:
  //     }
  //   };
  //
  //   request.open('POST', url);
  //   // request.setRequestHeader('Content-Type','application/json');
  //   request.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
  //   request.send(params);
  // };

  // document.getElementById('saveReport').onclick = function() {app.dialogCubeName.showModal();};

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
  // document.querySelector('#openReport').onclick = app.openReportList;

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

  // document.getElementById('addTable').onclick = function(e) {
  //   console.log(e.target);
  //   // visualizzo l'elenco di sinistra per aggiungere la FACT
  //   // visualizzo la lista 'tableList'
  //   app.tableList.toggleAttribute('hidden');
  //   // imposto il tasto 'openTableList' su open
  //   app.btnTableList.toggleAttribute('open');
  //   // focus sulla input di ricerca della lista tabelle
  //   let inputSearch = document.getElementById('tableSearch');
  //   inputSearch.focus();
  //
  // };

  document.getElementById('openTableList').onclick = function(e) {
    // visualizzo la lista delle tabelle
    const tableList = document.getElementById('tableList');
    tableList.toggleAttribute('hidden');
    e.target.toggleAttribute('open');
    document.getElementById('tableSearch').focus();
  };

  /*events */

  app.getDatabaseTable();

  // app.getDimensions();

  app.getCubes();

  // app.getDatamartList();
})();
