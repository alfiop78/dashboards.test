/*
  setting delle opzioni

    cols : Definisce le colonne della tabella su cui applicare le opzioni
      {'riferimento_colonna' : numero_colonna, 'elemento_da_impostare': attributo}
      elemento_da_impostare : 'attribute', 'class', ecc....

    filters : Definisce le opzioni per i Filtri da impostare
      {'riferimento_colonna': numero_colonna, 'elemento_da_impostare': attributo}

    metrics : Array di colonne che devono essere impostate come metriche [5,6,3, ecc...] Le stesse avranno una formattazione
      diversa in tbody e verranno nascoste nei Params

    rowsNumber : Numero di righe da mostrare prima dell'overflow-y nella tabella

    title : Imposta il titolo della tabella

    inputSearch (boolean)
      true = viene legato il metodo searchInput all'evento input della input type=search
      false = viene nascosta la input type=search

    -----------------------------------Esempio ----------------------------

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
      'metrics' : [6], // TODO: le metriche vanno nascoste nei filtri
      'title' : 'Free Courtesy',
      'inputSearch' : true // visualizzo e lego evento input alla casella di ricerca, in basso.
      };
*/

class Report {
  options = new Object();


  constructor(table) {
    /*
    * table è il riferimento all'elemento table nel DOM
    */
    this.table = table;
    this.tbody = this.table.querySelector('tbody'); // le righe nella table
    this.thead = this.table.querySelector('thead'); // intestazioni, si può utilizzare per ciclare solo l'intestazione senza il corpo del report
    this.paramsRef = document.querySelector('section[params] > div.params'); // elemento in cui sono i filtri

  }

  set title(value) {
    console.log(value);
    this.titleCaption = value;
    // console.log(this.titleCaption);
    // console.log(this.table.querySelector('caption'));
    this.table.querySelector('caption').innerHTML = this.titleCaption;
  }

  get title() {return this.titleCaption;}

  addColumn(colName, index) {
    this.th = document.createElement('th');
    this.th.setAttribute('col', index);
    this.th.classList.add('dropzone');
    this.th.setAttribute('options', 'cols');
    this.th.setAttribute('draggable', true);
    this.th.id = 'col-header-'+index;
    this.th.innerText = colName;
    this.table.querySelector('thead tr').appendChild(this.th);
  }

  addParams(colName, id) {
    // aggiungo anche il filtro per ogni colonna, deciderò successivamente, nelle opzioni, se visualizzarlo o meno.
    this.tmplParams = document.getElementById('params');
    this.tmplContent = this.tmplParams.content.cloneNode(true);
    this.params = this.tmplContent.querySelector('div[data-param-id]');
    // console.log(this.params);
    this.params.setAttribute('col', id);
    this.params.setAttribute('data-param-id', id);
    this.params.querySelector('ul').id = "datalist-"+id;
    this.params.querySelector('label').setAttribute('for', "param-"+id);
    this.params.querySelector('label').innerText = colName;
    this.params.querySelector('input').id = "param-"+id;
    this.params.querySelector('input').setAttribute('data-param-id', id);
    this.params.querySelector('.elements').setAttribute('col', id);

    this.paramsRef.appendChild(this.params);
  }

  showFilters(e) {
    // verifico prima se ci sono altre dropdown aperte, le chiudo.
    document.querySelectorAll('div.elements[show]').forEach((elementsShow) => {
      elementsShow.removeAttribute('show');
    });
    // apro la dropdown
    e.path[1].querySelector('div.elements').toggleAttribute('show');
    e.target.setAttribute('placeholder', 'Search...');
  }

  handlerSelectMulti() {
    // this = element
    this.parentElement.toggleAttribute('selected');
  }

  handlerMultiBtn(e) {
    // this passato come bind(Draw)
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
    this.search();
    elements.removeAttribute('show');
  }

  handlerInput(e) {
    // this = Draw
    // console.log(e.target);
    // console.log(this);
    let parentElement = e.path[1];
    let label = parentElement.querySelector('label');
    if (e.target.value.length > 0) {
      parentElement.setAttribute('activated', true);
      e.target.setAttribute('activated', true);
      label.classList.add('has-content');
    } else {
      e.target.removeAttribute('activated');
      parentElement.removeAttribute('activated');
      label.classList.remove('has-content');
      this.search();
    }

    // mentre digito filtro l'elenco degli elementi <li>
    let liElement = parentElement.querySelectorAll('ul > .elementContent li');
    liElement.forEach((el) => {
      let label = el.getAttribute('label');
      // imposto hidden su elementContent e non su li
      let elementContent = el.parentElement.parentElement;
      (label.indexOf(e.target.value.toUpperCase()) !== -1) ? elementContent.removeAttribute('hidden') : elementContent.hidden = true;
    });
  }

  handlerSelect(e) {
    // console.log(this);
    // // this = Draw
    // console.log('handlerSelect');

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
    this.search();
  }

  createDatalist() {
    // console.log(this.table.cols.length);
    // creo le option nella datalist in base a quello che 'vedo' nella table
    // console.log(this.table.rows.length);

    let arrColumns = [];

    for (let c = 0; c < this.tbody.rows[0].cells.length; c++) {
      // per ogni colonna ciclo tutte le righe ed aggiungo gli elementi della colonna in un array
      // console.log(this.tbody.rows[i].cells[c]);
      // let arr = [c, this.tbody.rows[i].cells[c].innerHTML];
      let arrCols = [];

      for (let r = 0; r < this.tbody.rows.length; r++) {
        arrCols.push(this.tbody.rows[r].cells[c].innerHTML);
      }
      // ottengo gli elementi che vedo nella table
      arrColumns.push(arrCols);
      // console.log(arrColumns);

      // NOTE:  rimuovo elementi duplicati nell'array con l'utilizzo di array.filter
      /*
      callback
        Function is a predicate, to test each element of the array. Return true to keep the element, false otherwise. It accepts three arguments:
      element
        The current element being processed in the array.
      index Optional
        The index of the current element being processed in the array.
      array Optional
        The array filter was called upon.
      thisArg Optional
        Value to use as this when executing callback.
      */
      let arrayUnique = arrColumns[c].filter((value, index, self) => self.indexOf(value) === index);
      // console.log(arrayUnique);
      this.datalist = document.getElementById('datalist-'+c);
      arrayUnique.forEach((el, i) => {
        let elContent = document.createElement('div');
        elContent.classList.add('elementContent');
        this.datalist.appendChild(elContent);
        let element = document.createElement('div');
        element.classList.add('element');
        elContent.appendChild(element);
        let iconDone = document.createElement('i');
        iconDone.innerText = 'done';
        // iconDone.hidden = true; // default non è multiselezione
        iconDone.classList.add("material-icons", "md-18");

        this.li = document.createElement('li');
        this.li.id = i;
        this.li.innerHTML = el.toUpperCase().trim();
        this.li.setAttribute('label', el.toUpperCase().trim());
        element.appendChild(this.li);
        element.appendChild(iconDone);
      });
    }

  }

  eventParams() {
    this.paramsRef.querySelectorAll('input[type="search"]:not([id="search"])').forEach((el) => {
      // console.log(this); // Draw
      el.oninput = this.handlerInput.bind(this);
      el.onclick = this.showFilters.bind(this);
      el.onblur = function(e) {e.target.removeAttribute('placeholder');};
      // elementi presenti nei Filtri standard
      el.parentElement.querySelectorAll('.elements:not([multi]) > ul div.element').forEach((liElement) => {liElement.onclick = this.handlerSelect.bind(this);});
      // elementi presenti nei Filtri Multiselect
      el.parentElement.querySelectorAll('.elements[multi] > ul div.element').forEach((liElement) => {liElement.onclick = this.handlerSelectMulti.bind(liElement);});
      // tasto OK all'interno dei params in multiselect
      el.parentElement.querySelector('section > button').onclick = this.handlerMultiBtn.bind(this);
    });
  }

  addRow(rowValues) {
    // console.log(rowValues);
    this.tr = document.createElement('tr');
    this.tr.setAttribute('row', 'body');
    this.tbody.appendChild(this.tr);

    // NOTE: Utilizzando le arrowFunction posso referenziare, con this, l'oggetto esterno alla function
    rowValues.forEach((el, i) => {
      // el contiene il valore della cella
      this.td = document.createElement('td');
      this.td.setAttribute('col', i);
      this.td.setAttribute('options', 'cols');
      (!el) ? console.log('NULL'): this.td.innerHTML = el.toUpperCase().trim();
      this.tr.appendChild(this.td);
    });
  }

  search() {
    /*Ricerca in base alla selezione dei filtri*/
    console.log('search');
    let cols = [], multiSelectElements = [];
    // recupero i filtri che sono stati impostati
    let filters = Array.from(document.querySelectorAll("input[type='search'][activated]"));
    // console.log(filters);
    filters.forEach(function(item) {
      // per ogni filtro impostato, inserisco nell'array cols i valori selezionati nei filtri
      // verifico se questo filtro è multiple
      if (item.parentElement.querySelector('.elements').getAttribute('multi')) {
        // multi
        let liSelected = Array.from(item.parentElement.querySelectorAll('.elementContent[selected] > .element > li'));
        // console.log(liSelected);
        liSelected.forEach((selected) => {
          // console.log(selected.getAttribute('label'));
          multiSelectElements.push(selected.getAttribute('label'));
        });
        cols[+item.getAttribute('data-param-id')] = multiSelectElements;
      } else {
        cols[+item.getAttribute('data-param-id')] = item.value;
      }
    });
    // console.log(cols);

    // console.log('search');
    let rows = [];
    /* per ogni colonna (filtro) impostato, inserisco in un array le righe trovate per il filtro impostato
    * es.: rows = [3, 44, 54, ecc..] le righe che hanno il valore del filtro
    */

    cols.forEach((value, index) => {
      let row = [];
      for (let i = 0; i < this.tbody.rows.length; i++) {
        // per ogni riga verifico la presenza del valore per ogni filtro selezionato
        // nel caso della multiselect verifico la presenza nell'array di valori selezionati
        if ( (this.tbody.rows[i].cells[index].innerText === value) || (value.includes(this.tbody.rows[i].cells[index].innerText)) ) {
          //... esamino le celle di ogni colonna appartente alla riga
          // il valore ricercare è presente in questa riga, la aggiungo all'array rows
          row.push(i);
        }

      }
      rows[index] = row;
      // console.log(rows);
    });

    /* esamino ogni riga della table e verifico se la riga esaminata è presente nell'array precedente (rows).
    * se è presente imposto true per ogni colonna (quindi per ogni filtro impostato)
    * infine, se tutte le colonne hanno true (rowsArray = [true, true, ecc...]) la riga corrispondente è mostrata altrimenti...
    * rowsArray = [true, false, true, ecc...] è nascosta
    */

    for (let i = 0; i < this.tbody.rows.length; i++) {
      // console.log(i);
      let rowsArray = [];
      cols.forEach((value, colIndex) => {
        // se la riga in esame è presente nell'array, seleziono questa colonna come true
        rowsArray.push(rows[colIndex].includes(i));
      });
      // se nell'array rowsObj è presente una colonna con 'false' NON seleziono la riga
      if (rowsArray.includes(false)) {
        // console.log('not matched');
        this.tbody.rows[i].removeAttribute('found');
        this.tbody.rows[i].hidden = true;
      } else {
        // console.log('matched');
        this.tbody.rows[i].setAttribute('found', true);
        this.tbody.rows[i].removeAttribute('hidden');
      }
    }
    this.rebuildDatalists();
    this.info();
  }

  rebuildDatalists() {
    // console.log(this.table.rows.length);

    let arrColumns = [];

    // console.log(this.tbody.rows[i]);
    // console.log(this.tbody.rows[i].cells[0]);
    // console.log(this.tbody.rows[i].cells);
    // console.log(this.tbody.rows[0].cells.length);

    for (let c = 0; c < this.tbody.rows[0].cells.length; c++) {
      // per ogni colonna ciclo tutte le righe ed aggiungo gli elementi della colonna in un array
      // console.log(this.tbody.rows[i].cells[c]);
      // let arr = [c, this.tbody.rows[i].cells[c].innerHTML];
      let arrCols = [];

      for (let r = 0; r < this.tbody.rows.length; r++) {
        // console.log(this.tbody.rows[r]);
        if (this.tbody.rows[r].getAttribute('found')) {
          arrCols.push(this.tbody.rows[r].cells[c].innerHTML.toUpperCase());
        }
      }
      arrColumns.push(arrCols);
      // console.log(arrColumns);

      let arrayUnique = arrColumns[c].filter((value, index, self) => self.indexOf(value) === index);
      // console.log(arrayUnique);
      // recupero le datalist tranne quelle con activated

      this.datalist = document.querySelector('.params .md-field:not([activated]) ul.filters[id="datalist-'+c+'"]');
      if (this.datalist) {
        // console.log(this.datalist.querySelectorAll('li'));
        this.datalist.querySelectorAll('li').forEach((el, index) => {
          let label = el.getAttribute('label');
          let elementContent = el.parentElement.parentElement;
          (!arrayUnique.includes(label)) ? elementContent.hidden = true : elementContent.removeAttribute('hidden');
        });
      }
    }
  }

  info() {
    this.infoRef = this.table.querySelector('tfoot div[info]');
    this.rowCounter = this.infoRef.querySelector('span[row-number]');
    for (let i = 0, count = 1; i < this.tbody.rows.length; i++) {
      if (this.tbody.rows[i].getAttribute('hidden') === null) {
        this.rowCounter.innerText = count++;
      }
    }
  }

  searchInput(event) {
    // ricerca dalla input in basso
    console.log('search input');
    // console.log(this);
    // console.log(event);
    // console.log(event.target.value.length);


    (event.target.value.length > 0) ? event.target.parentElement.querySelector('label').classList.add('has-content') : event.target.parentElement.querySelector('label').classList.remove('has-content');
    // recupero, dalla table, le righe e le celle, successivamente inserisco le celle in un array per poter utilizzare indexOf su ogni singolo carattere contenuto nella row
    // NOTE: se si vuole far in modo da ricercare l'esatta occorrenza (inserendo tutta la parola) bisogna eliminare [n] da cells[n] nell'indexOf
    // console.log(document.querySelectorAll('table tr[row="body"]'));

    for (let i = 0; i < this.tbody.rows.length; i++) {
      let founded = false;
      // console.log(table.rows[i]);
      // console.log(table.rows[i].cells[1]);
      this.tbody.rows[i].style.backgroundColor = "initial"; // reimposto il colore iniziale dopo ogni carattere inserito
      this.tbody.rows[i].removeAttribute('found');
      this.tbody.rows[i].removeAttribute('hidden');

      let cells = [];
      for (let n = 0; n < this.tbody.rows[i].cells.length; n++) {
        // console.log(table.rows[i].cells[n].innerText);
        // ... oppure ...
        // console.log(table.rows[i].cells.item(n).innerText);
        cells.push(this.tbody.rows[i].cells[n].innerText);

        // arrayTableContent.push(table.rows[i].cells[n].innerText);
        if (cells[n].indexOf(event.target.value.toUpperCase()) !== -1) {
          // console.log(table.rows[i]);
          // console.log(i);
          // console.log('trovata');
          founded = true;
        }
      }
      (founded) ? this.tbody.rows[i].setAttribute('found', true) : this.tbody.rows[i].hidden = true;
    }
  }

}

class ReportConfig extends Report {

  /*
  qui vengono definite le options del report, queste options andranno a scrivere in storage ...
  // ... le opzioni definite per ogni singolo report. Le opzioni, invece di definirle in init.js, le definisce l'utente, ad esempio, con il
  // drag&drop, la selezione dei colori delle colonne, la formatazione delle colonne, ecc....
  In storage si avrà il report con all'interno l'object 'options':
  'nomeReport' :
    {
    report_id : 239,
    'options' : {
    definisco gli attributi/personalizzazione delle colonne
    'cols' : [0 :
              {'bgColor': 'red'},
              {'fgColor': 'white'},
              {'attribute', ['hidden', 'order', 'ecc...']}, attributi da inserire sulla colonna, i quali verranno personalizzati da css/js
              {'altro (es. gestione del drillthrought, ecc...)'}
            ]
    definisco l'ordinamento e posizionamento delle colonne del report (fatte con il drag&drop)
    posistioning : {
        [0: {columns: 'Cod.Sede'}]
        [1: {columns: 'Sede'}]
        [2: {metrics: 'Venduto'}]
        ecc...
      }
    'filtersType' : [{'col': 0, 'attribute': 'multi'}] multiselezione in pageBy
    'title' : Titolo del Report visualizzato in localStorage,
    'inputSearch' : true visualizzo e lego evento input alla casella di ricerca, in basso.
    metricsPosition : [2,3] definisco la posizione delle metriche nel report, le stesse saranno nascoste nel pageBy
    }

    }
  */
  // proprietà private
  #cube;
  #metricsPosition = [];
  // #options;
  #dragged;
  #dragStartCol = 0;
  #dragTargetCol = 0;
  report_id = null;
  report = new Object();
  // #_options;

  constructor(table, data) {
    super(table);
    this.data = data;
    this.positioning = [];
    console.log(this.data);
    // Aggiungo le intestazioni di colonna e i filtri in pageBy
    Object.keys(this.data[0]).forEach((el, i) => {
      // console.log(el);
      super.addColumn(el, i);
      // aggiungo un filtro per ogni colonna della tabella
      // REVIEW: Filtri in pageBy. In addParams potrei definire se il filtro deve essere single/multi select, in base alle options
      super.addParams(el, i);
    });
    // TODO: associo evento drag sulle th
    this.dragDrop();

    for (let i in this.data) {
      // console.log(Object.values(response[i]));
      // Opzione 1 - Aggiunta colonne automaticamente (in base alla query)
      super.addRow(Object.values(this.data[i]));
      // TODO: eliminare gli spazi bianchi prima e/o dopo il testo
      // Opzione 2 - Aggiunta colonne manualmente
      // DrawReport.addRow([data[i].id, data[i].descrizione, data[i].versioneDMS, data[i].CodDealerCM]);
    }
  }

  dragDrop() {
    // associo gli eventi drag&Drop sulle header
    // console.log(this.table.querySelectorAll('thead th'));
    Array.from(this.table.querySelectorAll('thead th')).forEach((th) => {
      console.log(th);
      th.ondragstart = this.dragStart.bind(this);
      th.ondragover = this.dragOver.bind(this);
      th.ondrop = this.drop.bind(this);
      th.ondragend = this.end.bind(this);
      th.ondragenter = this.enter.bind(this);
      th.ondragleave = this.leave.bind(this);
    });

  }

  dragStart(e) {
    e.dataTransfer.setData("text/plain", e.target.id);
    // console.log(e.dataTransfer);
    this.#dragStartCol = +e.target.getAttribute('col');
  }

  dragOver(e) {
    e.preventDefault();
    // Set the dropEffect to move
    e.dataTransfer.dropEffect = "move";

  }

  enter(e) {
    this.#dragTargetCol = +e.target.getAttribute('col');
    if (e.target.className === "dropzone") {
      (this.#dragStartCol > this.#dragTargetCol) ? e.target.classList.add('move-before') : e.target.classList.add('move-after');
    }
  }

  leave(e) {
    this.#dragTargetCol = +e.target.getAttribute('col');
    (this.#dragStartCol > this.#dragTargetCol) ? e.target.classList.remove('move-before') : e.target.classList.remove('move-after');
  }

  drop(e) {
    e.preventDefault();
    console.log('drop');
    let data = e.dataTransfer.getData("text/plain");
    // console.log(e.dataTransfer);
    // let parent = e.target.parentElement;
    // console.log(e.target.id);
    this.#dragged = document.getElementById(data);
    // console.log(this.dragged);
    // recupero l'id colonna dell'elemento spostato, per poter spostare tutta la colonna (righe relative alla colonna)
    let colSelected = +this.#dragged.getAttribute('col');
    // console.log(colSelected);
    // console.log(e.target);
    let colTarget = +e.target.getAttribute('col');
    // console.log(colSelected);
    // console.log(colTarget);
    (colSelected > colTarget) ? e.target.before(this.#dragged) : e.target.after(this.#dragged);
    e.target.classList.remove('move-before', 'move-after');

    // ho la colonna da spostare e la colonna target, con queste posso spostare tutte le righe appartenenti alla colonna
    // recupero le righe della tabella
    for (let i = 0; i < this.tbody.rows.length; i++) {
      // console.log(app.table.rows[i]);
      // recupero tutta la colonna da spostare
      // console.log(colSelected);
      // console.log(colTarget);
      let elementSelected = this.tbody.rows[i].cells[colSelected];
      // colonna dove fare il before, colTarget
      let colTargetElement = this.tbody.rows[i].cells[colTarget];
      // console.log(this.table.rows[i]);
      if (this.tbody.rows[i].hasAttribute('row') || this.tbody.rows[i].hasAttribute('head')) {
        (colSelected > colTarget) ? colTargetElement.before(elementSelected) : colTargetElement.after(elementSelected);
      }

    }
  }

  end(e) {
    e.preventDefault();
    console.log('end');
    // ristabilisco le position tramite l'attributo col
    for (let i = 0; i < this.table.rows.length; i++) {
      // riposizioni l'attributo [col] solo sulle head e sulle row (body)
      if (this.table.rows[i].hasAttribute("row") || this.table.rows[i].hasAttribute('head')) {
        for (let c = 0; c < this.table.rows[i].cells.length; c++) {
          this.table.rows[i].cells[c].setAttribute('col', c);
        }
      }
    }
    // TODO: Salvataggio delle impostazioni in localStorage
    console.log('save draag');

    this.definePositioning();
  }

  definePositioning() {
    // dopo il drag&drop ridefinisco le posizioni delle colonne
    console.log(this.positioning);

    for (let i = 0; i < this.table.rows[0].cells.length; i++) {
      console.log(this.table.rows[0].cells[i]);
      // per ogni cella controllo se è una column o una metrica e la inserisco in this.positioning
      if (!this.table.rows[0].cells[i].hasAttribute('metrics')) {
        // è una column
        this.positioning[i].columns = this.table.rows[0].cells[i].innerText;
      }
    }
    console.log(this.positioning);
    this.options = this.positioning;

    console.log(this.options);

    // this.saveReportConfig();
  }

  saveReportConfig() {
    this.report.type = "REPORT"; // TODO: questa si può impostare nel Metodo Storage.save()
    this.report.id = this.report_id;
    this.report['nomeReport'] = this.options;
    return;
    // da definire
    // let objStorage = new Storage();
    // console.log(this.report);
    // objStorage.reportConfig = this.report;
  }

  set defaultPositioning(cube) {
    /*
    Definisco un array di oggetti contenenti la dispossizione delle colonne, nello stato iniziale del datamart
    0: {columns: "Cod. Sede"}
    1: {columns: "Sede"}
    2: {metrics: "Venduto"}
    */
    console.log('positioning');
    this.#cube = cube;
    console.log(this.#cube);
    this.report_id = this.#cube.report_id;
    console.log(this.report_id);
    // TODO: in definePositioning dovrò aggiungere altri parametri, ad esempio quale colonna deve essere hidden, quale colonna avrà il filtro in
       //. ..single o multi selecton, ecc...
       /* definePositioning = [0=> {'col': 'Cod.Sede'},
                               1=> {'col': 'Sede'},
                               2=> {'metric': 'venduto'},
                               3=> {'metric': 'quantita'}
                               ....
                             ]*/
     Array.from(Object.keys(this.#cube)).forEach((element) => {
       if (element === "columns" || element === "metrics") {
         // console.log(element);
         Array.from(Object.keys(this.#cube[element])).forEach((table) => {
           // console.log(table);
           // console.log(cube.columns[table]);
           Array.from(Object.keys(this.#cube[element][table])).forEach((value) => {
             // recupero l'alias per questo object
             let obj = {};
             obj[element] = this.#cube[element][table][value]['alias'];
             this.positioning.push(obj);
           });
         });
       }
     });
     console.log(this.positioning);
     this.options = this.positioning;
     this.saveReportConfig();
  }

  get defaultPositioning() {return this.positioning;}

  get metricsPosition() {
    // inserisco in #metricsPosition la posizione delle metriche, queste avranno una formattazione diversa nel report (bold, align, ecc...)
    // ...e non avranno filtri in pageBy
    // this.#metricsPosition = [];
    // this.positioning.forEach((element, index) => {
    //   // NOTE: utilizzo di for...of con Object.entries
    //   for (let [key, value] of Object.entries(element)) {
    //     // console.log(`${key}: ${value}`);
    //     if (key === "metrics") this.#metricsPosition.push(index);
    //     // TODO: definisco gli attributi per le colonne
    //   }
    // });
    // // console.log(this.#metricsPosition);
    // return this.#metricsPosition;
  }

  // set option(value) {this.#options = value;}
  //
  // get option() {return this.#options;}

  // optionsApply() {
  //   // applico le option impostate
  //   console.log(this.#options);
  //   // console.log(Object.keys(this.#options));
  //   let arrProperties = Object.keys(this.#options);
  //   // console.log(arrProperties);
  //   if (arrProperties.includes('title')) {super.title = this.#options.title;}
  //   // console.log(this.#options.metrics);
  //   // return;
  //   if (arrProperties.includes('metrics')) {
  //     this.#options.metrics.forEach((col) => {
  //       // console.log(col);
  //       // console.log(document.querySelector('.params > .md-field'));
  //       // return;
  //       // cerco la colonna, nei filtri, da impostare come metrica e la nascondo
  //       document.querySelector('.params > .md-field[col="'+col+'"]').hidden = true;
  //       // cerco le colonne, nella sezione tbody, da impostare come metrics e aggiungo la cass metrics per formattarle
  //       this.table.querySelectorAll('td[col="'+col+'"], th[col="'+col+'"]').forEach((cols) => {
  //         cols.classList.add('metrics');
  //         cols.setAttribute('metrics', true);
  //       });
  //     });
  //   }
  //   // console.log(this._optthis.#options.inputSearch);
  //   if (arrProperties.includes('inputSearch') && this.#options.inputSearch) {
  //     // voglio che nel Metodo search il this faccia riferimento sempre alla Classe e non alla input
  //     document.getElementById('search').oninput = this.searchInput.bind(this);
  //   } else {
  //     // nascondo la input search
  //     document.getElementById('search').parentElement.hidden = true;
  //   }
  //
  //
  //   arrProperties.forEach((property) => {
  //     // console.log(property); // cols, filters, ecc...
  //     if (Array.isArray(this.#options[property])) {
  //       // console.log(this.#options[property]); // [{col: 1, attribute: "hidden"}]
  //       this.#options[property].forEach((prop) => {
  //         // console.log(prop); // {col: 1, attribute: "hidden"}
  //         let propertyRef = Object.keys(prop)[0]; // col
  //         let propertyRefValue = prop[propertyRef]; // numero di colonna
  //         let propertyAttributeValue = prop['attribute'];
  //
  //         // console.log(propertyRef);
  //         // console.log(propertyRefValue);
  //         // console.log(propertyAttributeValue);
  //         // es. : :root [options='cols'][col='1']
  //         // es. : :root [options='filters'][col='0']
  //
  //         let elements = Array.from(document.querySelectorAll(":root [options='"+property+"']["+propertyRef+"='"+propertyRefValue+"']"));
  //         elements.forEach((el) => {
  //           el.setAttribute(propertyAttributeValue, true);
  //         });
  //       });
  //     }
  //
  //   });
  // }

  draw() {
    // TODO: qui si potrebbe impostare una class che applica una transition per visualizzare la table
    this.optionsApply();
    // aggiungo event sugli elementi dei filtri, sia filtri semplici che multiselezione
    // l'associazione degli eventi va messa dopo l'applicazione delle option, solo nelle option vengono definiti i filtri multi e non
    super.eventParams();
    super.info();
  }
}
