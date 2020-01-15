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


  constructor(table, data) {
    super(table);
    let objReportStorage = new ReportStorage();
    this.report_id = objReportStorage.id;
    console.log(this.report_id);
    this.data = data;

    console.log(this.data);
    // Aggiungo le intestazioni di colonna e i filtri in pageBy
    Object.keys(this.data[0]).forEach((el, i) => {
      // console.log(el);
      super.addColumn(el, i);

      // aggiungo un filtro per ogni colonna della tabella
      // REVIEW: Filtri in pageBy. In addParams potrei definire se il filtro deve essere single/multi select, in base alle options
      super.addParams(el, i);
    });
    // associo evento drag sulle th
    this.dragDrop();

    for (let i in this.data) {
      super.addRow(Object.values(this.data[i]));
      // TODO: eliminare gli spazi bianchi prima e/o dopo il testo
    }
  }

  dragDrop() {
    // associo gli eventi drag&Drop sulle header
    // console.log(this.table.querySelectorAll('thead th'));
    Array.from(this.table.querySelectorAll('thead th')).forEach((th) => {
      // console.log(th);
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

    this.positioning();
  }

  positioning() {
    // dopo il drag&drop ridefinisco le posizioni delle colonne
    console.log(this.#positioning);

    for (let i = 0; i < this.thead.rows[0].cells.length; i++) {
      console.log(this.thead.rows[0].cells[i]);
      // per ogni cella controllo se è una column o una metrica e la inserisco in this.#positioning
      if (this.thead.rows[0].cells[i].hasAttribute('metrics')) {
        this.#positioning[i] = {'metrics': this.thead.rows[0].cells[i].innerText};
      } else if (this.thead.rows[0].cells[i].hasAttribute('columns')) {
        this.#positioning[i] = {'columns': this.thead.rows[0].cells[i].innerText};
      }
    }
    console.log(this.#positioning);
    this.options.positioning = this.#positioning;

    console.log(this.options);
    // ricontrollo la posizione delle metriche dopo il drag&drop
    this.metricsPositioning();
  }

  // metricsPositioning() {
  //   /* inserisco in #metricsPosition la posizione delle metriche, queste avranno una formattazione diversa nel report (bold, align, ecc...)
  //    ...e non avranno filtri in pageBy
  //    */
  //   this.metricsPosition = [];
  //   this.#positioning.forEach((element, index) => {
  //     // NOTE: utilizzo di for...of con Object.entries
  //     for (let [key, value] of Object.entries(element)) {
  //       // console.log(`${key}: ${value}`);
  //       if (key === "metrics") this.metricsPosition.push(index);
  //       // TODO: definisco gli attributi per le colonne
  //     }
  //   });
  //   console.log(this.metricsPosition);
  //   this.options.metricsPosition = this.metricsPosition;
  //   console.log(this.options);
  //   this.saveReportConfig();

  // }


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

 
}