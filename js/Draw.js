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

class Draw {
  constructor(table, options) {
    /*
    * table è il riferimento all'elemento table nel DOM
    */
    this.options = options;
    this.table = table;
    this.tbody = this.table.querySelector('tbody'); // le righe nella table
    this.paramsParent = document.querySelector('section[params] > div.params');
  }

  set title(value) {
    this.titleCaption = value;
    // console.log(this.titleCaption);
    // console.log(this.table.querySelector('caption'));
    this.table.querySelector('caption').innerHTML = this.titleCaption;
  }
  get title() {return this.titleCaption;}

  addColumn(colName, index) {
    this.th = document.createElement('th');
    this.th.setAttribute('col', index);
    this.th.setAttribute('options', 'cols');
    this.th.innerText = colName;
    this.table.querySelector('thead tr').appendChild(this.th);
  }

  addParams(colName, id) {
    // aggiungo anche il filtro per ogni colonna, deciderò successivamente, nelle opzioni, se visualizzarlo o meno.
    this.tmplParams = document.getElementById('params');
    this.tmplContent = this.tmplParams.content.cloneNode(true);
    this.params = this.tmplContent.querySelector('div[data-param-id]');
    this.params.setAttribute('col', id);
    this.params.setAttribute('data-param-id', id);
    this.params.querySelector('ul').id = "datalist-"+id;
    this.params.querySelector('label').setAttribute('for', "param-"+id);
    this.params.querySelector('label').innerText = colName;
    this.params.querySelector('input').id = "param-"+id;
    this.params.querySelector('input').setAttribute('data-param-id', id);
    this.params.querySelector('.elements').setAttribute('col', id);

    this.paramsParent.appendChild(this.params);
  }

  showFilters(e) {
    // verifico prima se ci sono altre dropdown aperte, le chiudo.
    document.querySelectorAll('div.elements[show]').forEach((elementsShow) => {
      elementsShow.removeAttribute('show');
    });
    // apro la dropdown
    e.path[1].querySelector('div.elements').toggleAttribute('show');
    this.setAttribute('placeholder', 'Search...');
  }

  handlerSelectMulti(e) {
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
    console.log(e.target);
    console.log(this);
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

  draw() {
    // TODO: qui si dovrebbe impostare una class che applica una transition per visualizzare la table
    this.option();
    this.info();
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

  option() {
    // console.log(this.options);
    // console.log(Object.keys(this.options));
    let arrProperties = Object.keys(this.options);
    // console.log(arrProperties);
    if (arrProperties.includes('title')) {this.title = this.options.title;}
    console.log(this.options.metrics);
    if (arrProperties.includes('metrics')) {
      this.options.metrics.forEach((col) => {
        // cerco la colonna, nei filtri, da impostare come metrica e la nascondo
        document.querySelector('.params > .md-field[col="'+col+'"]').hidden = true;
        // cerco le colonne, nella sezione tbody, da impostare come metrics e aggiungo la cass metrics per formattarle
        this.table.querySelectorAll('td[col="'+col+'"], th[col="'+col+'"]').forEach((cols) => {cols.classList.add('metrics');});
      });
    }
    console.log(this.options.inputSearch);
    if (arrProperties.includes('inputSearch') && this.options.inputSearch) {
      // voglio che nel Metodo search il this faccia riferimento sempre alla Classe e non alla input
      document.getElementById('search').oninput = this.searchInput.bind(this);
    } else {
      // nascondo la input search
      document.getElementById('search').parentElement.hidden = true;
    }


    arrProperties.forEach((property) => {
      console.log(property); // cols, filters, ecc...
      if (Array.isArray(this.options[property])) {
        console.log(this.options[property]); // [{col: 1, attribute: "hidden"}]
        this.options[property].forEach((prop) => {
          // console.log(prop); // {col: 1, attribute: "hidden"}
          let propertyRef = Object.keys(prop)[0]; // col
          let propertyRefValue = prop[propertyRef]; // numero di colonna
          let propertyAttributeValue = prop['attribute'];

          // console.log(propertyRef);
          // console.log(propertyRefValue);
          // console.log(propertyAttributeValue);
          // es. : :root [options='cols'][col='1']
          // es. : :root [options='filters'][col='0']

          let elements = Array.from(document.querySelectorAll(":root [options='"+property+"']["+propertyRef+"='"+propertyRefValue+"']"));
          elements.forEach((el) => {
            el.setAttribute(propertyAttributeValue, true);
          });
        });
      }

    });

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
