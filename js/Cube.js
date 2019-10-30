class Cube {

  constructor() {
    this.cube = new Object();
    this.name = null;
    this.title = null;
    this.hierarchy = new Object(); // Oggetto che contiene un'array di gerarchie (memorizzato in this.hierarchies)
    this.columns = new Array();
    this.cols = [];
    this.filters = new Object(); // contiene l'array di colonne che andranno nella WHERE come condizioni
    this.conditionsColName = [];
    this.metrics = new Object();
    this.colsMetrics = [];
    this.groupBy = new Object();
    this.colsGroupBy = [];
    this.relationId = 0;
    this.dialogFilters = document.getElementById('filter-setting');
    this.dialogMetrics = document.getElementById('metric-setting');

  }

  set cubeName(value) {
    this.name = value;
  }

  get cubeName() {return this.name;}

  set table(value) {
    this.tableSelected = value;
    // console.log(this.tableSelected);
    this.activeCardRef.setAttribute('name', this.tableSelected);
    this.activeCardRef.querySelector('h5').innerText = this.tableSelected;
  }

  get table() {return this.tableSelected;}

  set activeCard(cardRef) {this.activeCardRef = cardRef;}

  get activeCard() {return this.activeCardRef;}

  handlerColumns(e) {
    // console.log(e.path);
    this.activeCard = e.path[3];
    // console.log(e.target);
    let tableName = this.activeCardRef.getAttribute('name');
    // se la card/table [active] non ha gli attributi [hierarchies] oppure [filters] oppure [columns] disabilito la selezione delle righe
    // questo perchè, se non si specifica prima cosa si vuol fare con le colonne selezionate, non abilito la selezione
    // [hierarchies] : consente di inserire una relazione tra le due tabelle, selezionando una colonna per ciascuna tabella
    // [filter] : consente di impostare le colonne che saranno utilizzate come filtri nella query
    // [columns] : consente di selezionare le colonne che verranno mostrate nella SELECT della query (quindi nel corpo della table, sul dashboard)
    // console.log(this.activeCardRef.attributes);
    let attributes = this.activeCardRef.attributes;
    // console.log(this.activeCardRef);
    for (let i = 1; i < attributes.length; i++) {
      // i = 1 perchè il primo attributo è certamente [class]
      // console.log(attributes[i].name);
      let fieldName = e.target.getAttribute('label');
      switch (attributes[i].name) {
        case 'hierarchies':
          // se è presente un altro elemento coon attributo hierarchy ma NON data-relation-id, "deseleziono" quello con hierarchy per mettere [hierarchy]
          // ...a quello appena selezionato, in questo modo posso selezionare solo una colonna per volta ad ogni relazione da creare
          // se però, viene cliccato una colonna con già una relazione impostata (quindi ha [data-relationn-id]) elimino la relazione da
          // ...entrambe le tabelle tramite un identificatifo di relazione

          if (e.target.hasAttribute('data-relation-id')) {
            /* oltre a fare il toggle dell'attributo, se questa colonna era stata già messa in
            relazione con un altra tabella (quindi attributo [data-relation-id] presente) elimino anche la relazione tra i due campi.
            Bisogna eliminarla sia dal DOM, eliminando [data-relation-id] che dall'array this.hierarchy
            */
            e.target.toggleAttribute('selected');
            // TODO: recupero tutti gli attributi di e.target e vado a ciclare this.removeHierarchy(relationId) per verificare uno alla volta quale posso eliminare
            for (let name of e.target.getAttributeNames()) {
              // console.log(name);
              let relationId, value;
              if (name.substring(0, 9) === "data-rel-") {
                relationId = name;
                value = e.target.getAttribute(name);
                this.removeHierarchy(relationId, value);
              }

            }

          } else {
            let liRelationSelected = this.activeCardRef.querySelector('li[hierarchy]:not([data-relation-id])');
            // console.log(liRelationSelected);
            e.target.toggleAttribute('hierarchy');
            e.target.toggleAttribute('selected');
            // se ho selezionato una colonna diversa da quella già selezionata, rimuovo la selezione corrente e imposto quella nuova
            // se è stata selezionata una colonna già selezionata la deseleziono
            if (liRelationSelected && (liRelationSelected.id !== e.target.id)) {
              liRelationSelected.toggleAttribute('hierarchy');
              liRelationSelected.toggleAttribute('selected');
            }

          }
          this.createHierarchy();
          break;
        case 'columns':
          console.log('columns');
          e.target.toggleAttribute('columns');
          // let fieldName = e.target.getAttribute('label');
          if (e.target.hasAttribute('columns')) {
            // console.log(this.cols);
            if (this.cols.includes(tableName+"."+fieldName)) {
              // console.log('presente');
            } else {
              // console.log('non presente');
              this.cols.push(tableName+"."+fieldName);
            }
          } else {
            // ho deselezionato un elemento
            // TODO: completare la parte dove elimino un elemento dall'array, se deselezionato
          }

          this.columns = this.cols;
          break;
        case 'filters':
          console.log('filters');
          e.target.toggleAttribute('filters');
          if (e.target.hasAttribute('filters')) {
            // verifico se questa tabellaè presente in this.filters
            let tableFound = false;
            Array.from(Object.keys(this.filters)).forEach((table) => {
              if (table === tableName) {
                tableFound = true;
              }
            });
            if (!tableFound) {this.conditionsColName = [];}
            // riferimento all'icona filters-icon per poter aprire la dialog con textarea
            let btnFilter = e.target.parentElement.querySelector('#filters-icon');

            // imposto evento click sul tasto id="filters-icon"
            btnFilter.onclick = this.handlerFilterSetting.bind(this);
          } else {
            // elimino questo campo dall'oggetto this.filters
            delete this.filters[tableName][e.target.getAttribute('label')];
            // se this.filters[nometabella] ora non continee nessun campo elimino anche this.filters[nometabella]
            if (Object.keys(this.filters[tableName]).length === 0) {delete this.filters[tableName];}
            // console.log(this.filters);
          }
          break;
        case 'groupby':
          console.log('groupby');
          e.target.toggleAttribute('groupby');
          // let fieldName = e.target.getAttribute('label');
          if (e.target.hasAttribute('groupby')) {
            if (this.colsGroupBy.includes(tableName+"."+fieldName)) {
            } else {
              this.colsGroupBy.push(tableName+"."+fieldName);
            }
          } else {
            // ho deselezionato un elemento
            // TODO: completare la parte dove elimino un elemento dall'array, se deselezionato
          }

          this.groupBy = this.colsGroupBy;
          //--------------------
          // // if (!this.columns[tableName]) {this.cols = [];}
          // this.colsGroupBy = [];
          //
          // this.activeCardRef.querySelectorAll('li[groupby]').forEach((li) => {
          //   // console.log(li);
          //   this.colsGroupBy.push(li.getAttribute('label'));
          // });
          // // console.log(this.cols);
          // this.groupBy[tableName] = this.colsGroupBy;
          // // console.log(this.groupBy);
          // -----------------
          break;
        case 'metrics':
          console.log('metrics');
          e.target.toggleAttribute('metrics');
          if (e.target.hasAttribute('metrics')) {
            // verifico se questa tabellaè presente in this.metrics
            let tableFound = false;
            Array.from(Object.keys(this.metrics)).forEach((table) => {
              if (table === tableName) {
                tableFound = true;
              }
            });
            if (!tableFound) {this.colsMetrics = [];}
            // riferimento all'icona filters-icon per poter aprire la dialog con textarea
            let btn = e.target.parentElement.querySelector('#metrics-icon');

            // imposto evento click sul tasto id="metrics-icon"
            btn.onclick = this.handlerMetricSetting.bind(this);
          } else {
            // elimino questo campo dall'oggetto this.filters
            delete this.metrics[tableName][e.target.getAttribute('label')];
            // se this.filters[nometabella] ora non continee nessun campo elimino anche this.filters[nometabella]
            if (Object.keys(this.metrics[tableName]).length === 0) {delete this.metrics[tableName];}
            // console.log(this.metrics);
          }
          break;
      }

    }


  }

  handlerFilterSetting(e) {
    // console.log(e);
    // appro la dialog per filters
    let fieldName = document.getElementById('filter-fieldName');
    fieldName.innerHTML = e.path[1].querySelector('li').getAttribute('label');

    this.dialogFilters.showModal();
    // aggiungo evento al tasto ok per memorizzare il filtro e chiudere la dialog
    this.dialogFilters.querySelector('#btnFilterDone').onclick = this.handlerBtnFilterDone.bind(this);
    this.dialogFilters.querySelector('#btnFilterCancel').onclick = this.handlerBtnFilterCancel.bind(this);

  }

  handlerMetricSetting(e) {
    // console.log(e);
    // visualizzo la lista dei filtri creati, per poterli associare alla metrica
    this.createFiltersList();
    // appro la dialog per filters

    let fieldName = document.getElementById('metric-fieldName');
    fieldName.innerHTML = e.path[1].querySelector('li').getAttribute('label');

    this.dialogMetrics.showModal();
    // aggiungo evento al tasto ok per memorizzare il filtro e chiudere la dialog
    this.dialogMetrics.querySelector('#btnMetricDone').onclick = this.handlerBtnMetricDone.bind(this);
    this.dialogMetrics.querySelector('#btnMetricCancel').onclick = this.handlerBtnMetricCancel.bind(this);

  }

  handlerBtnFilterDone() {
    let tableName = this.activeCardRef.getAttribute('name');
    let fieldName = document.getElementById('filter-fieldName').innerText;
    let operator = document.getElementById('operator').innerText;
    let values = document.getElementById('input-values').value;
    let filterName = document.getElementById('filter-name').value;
    this.conditionsColName.push({'filterName' : filterName, 'fieldName' : fieldName, 'operator': operator, 'values': values});
    this.filters[tableName] = this.conditionsColName;


    console.log(this.filters);

    this.dialogFilters.close();

  }

  createFiltersList() {
    // aggiungo il filtro creato alla dialog metric-setting in modo da poter associare i filtri a una determinata metrica
    // recupero l'elenco dei filtri già presenti in metric-filters, lo inserisco in un array per confrontarlo con this.filters
    let metricFiltersList = Array.from(this.dialogMetrics.querySelectorAll('#metric-filters > li'));
    console.log(metricFiltersList);
    let arrMetricFilters = [];
    metricFiltersList.forEach((filter) => {
      arrMetricFilters.push(filter.getAttribute('filter-name'));
    });
    console.log(arrMetricFilters);

    if (Object.keys(this.filters).length > 0) {
      let metricFiltersUl = document.getElementById('metric-filters');
      Object.keys(this.filters).forEach((table) => {
        // per ogni tabella recupero i propri filtri per inserirli in un elenco
        // console.log(table);
        this.filters[table].forEach((filter) => {
          console.log(filter);
          // se questo filtro è già presente nell'elenco non lo inserisco
          console.log((arrMetricFilters.includes(filter.filterName)));
          if ( !arrMetricFilters.includes(filter.filterName) ) {
            let li = document.createElement('li');
            li.innerText = filter.filterName;
            li.setAttribute('filter-name', filter.filterName);
            li.setAttribute('table-name', table);
            li.setAttribute('field-name', filter.fieldName);
            li.setAttribute('operator', filter.operator);
            li.setAttribute('values', filter.values);
            metricFiltersUl.appendChild(li);
            li.onclick = this.handlerFilterMetric;
          }
        });
      });
    }

  }

  handlerFilterMetric(e) {
    // selezione filtro da associare alla metrica
    // console.log(this);
    this.toggleAttribute('selected');
  }

  handlerBtnFilterCancel() {
    this.dialogFilters.close();
  }

  handlerBtnMetricDone() {
    let tableName = this.activeCardRef.getAttribute('name');
    let fieldName = document.getElementById('metric-fieldName').innerText;
    let sqlFunction = document.querySelector('#function-list > li[selected]').innerText;
    let distinctOption = document.getElementById('checkbox-distinct').checked;
    let alias = document.getElementById('alias-metric').value;
    // TODO: aggiungere i filters associati alla metrica
    let filters = [];
    document.querySelectorAll('#metric-filters > li[selected]').forEach((filter) => {
      filters.push(filter.getAttribute('filter-name'));
    });

    this.colsMetrics.push({'sqlFunction': sqlFunction, 'fieldName': fieldName, 'distinct' : distinctOption, 'aliasMetric' : alias, 'filters' : filters});
    this.metrics[tableName] = this.colsMetrics;
    console.log(this.metrics);
    this.dialogMetrics.close();
  }

  handlerBtnMetricCancel() {
    this.dialogMetrics.close();
  }

  removeHierarchy(relationId, value) {
    console.log(relationId);
    console.log(value);
    console.log('delete hierarchy');
    /* prima di eliminare la gerarchia devo stabilire se le due card, in questo momento, sono in modalità hierarchies
    // ...(questo lo vedo dall'attributo presente su card-table)
    // elimino la gerarchia solo se la relazione tra le due tabelle riguarda le due tabelle attualmente impostate in modalità [hierarchies]
    // se la relazione riguarda le tabelle A e B e attualmente la modalità = A e B allora elimino la gerarchia
    // altrimenti se la relazione riguarda A e B e attualmente la modalità impostata [hierarchies] riguarda B e C aggiungo la relazione e non la elimino
    */
    // elementi li che hanno la relazione relationId
    let liElementsRelated = document.querySelectorAll('.card-table[hierarchies] li[data-relation-id]['+relationId+']').length;

    if (liElementsRelated === 2) {
      // tra le due tabelle attualmente .card-table[hiearachies] non esiste questa relazione, per cui si sta creando una nuova relazione
      // ci sono due colonne che fanno parte di "questa relazione" (cioè delle due tabelle attualmente in modalità [hierarchies]) quindi possono essere eliminate
      document.querySelectorAll('.card-table[hierarchies] ul > .element > li[data-relation-id]['+relationId+']').forEach((li) => {
        console.log('elimino li :'+li.innerText);
        // TODO: se è presente un'altra relazione, quindi un altro attributo data-rel, NON elimino [hierarchy] e [data-relation-id]
        //... (per non eliminare l'icona) che fa riferimento ad un'altra relazione sulla stessa colonna (doppia chiave)
        li.removeAttribute(relationId);
        li.removeAttribute('selected');
        let relationFound = false; // altra relazione trovata ?
        // console.log(li.getAttributeNames());
        // console.log(li.getAttributeNames().indexOf('data-rel-'));
        li.getAttributeNames().forEach((attr) => {
          // console.log(attr.indexOf('data-rel-'));
          if (attr.indexOf('data-rel-') !== -1) {
            console.log('trovata altra relazione : '+attr);
            relationFound = true;
          }

        });
        if (!relationFound) {
          li.removeAttribute('data-relation-id');
          li.removeAttribute('hierarchy');
        }
      });
      delete this.hierarchy['hier_'+value];
    }

  }

  createHierarchy() {
    console.log('createHierarchy');
    let hier = [];
    this.colSelected = [];
    document.querySelectorAll('.card-table[hierarchies]').forEach((card) => {
      let tableName = card.getAttribute('name');

      // let liRef = card.querySelector('li[hierarchy]:not([data-relation-id])');
      let liRef = card.querySelector('li[hierarchy][selected]');
      if (liRef) {
        this.colSelected.push(liRef);
        hier.push(tableName+"."+liRef.innerText);
      }
      // console.log(hier);
      // per creare correttamente la relazione è necessario avere due elementi selezionati
      if (hier.length === 2) {
        this.relationId++;
        this.hierarchy['hier_'+this.relationId] = hier;
        // visualizzo l'icona per capire che c'è una relazione tra le due colonne
        this.colSelected.forEach((el) => {
          el.setAttribute('data-rel-'+this.relationId, this.relationId);
          // el.setAttribute('data-relation-id', 'rel_'+this.relationId);
          el.setAttribute('data-relation-id', true);
          // la relazione è stata creata, posso eliminare [selected]
          el.removeAttribute('selected');
        });
        console.log(this.hierarchy);
      }
    });
  }

  changeMode() {
    /*
    * quando si imposta la modalità tra hierarchies, columns e filters resetto tutte le card-table
    */
    document.querySelectorAll('.hierarchies .card-table').forEach((card) => {
      if (card.hasAttribute("hierarchies")) {card.removeAttribute('hierarchies');}
      if (card.hasAttribute("columns")) {card.removeAttribute('columns');}
      if (card.hasAttribute("filters")) {card.removeAttribute('filters');}
      if (card.hasAttribute("groupby")) {card.removeAttribute('groupby');}
      if (card.hasAttribute("metrics")) {card.removeAttribute('metrics');}
      card.querySelector('.help').innerText = "";
    });

  }
}
