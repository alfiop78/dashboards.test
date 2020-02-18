class Cube {
  #_cubeId = null;

  constructor() {
    this.cube = new Object();
    this.dimension = new Object();
    this.hierarchyFact = new Object(); // Oggetto che contiene un'array di gerarchie (memorizzato in this.hierarchies)
    this.hierarchyTable = new Object(); // Oggetto che contiene un'array di gerarchie (memorizzato in this.hierarchies)
    this.hierarchyOrder = {}; // ordine gerarchico della struttura (con l'ultima tabella che rappresenta l'associazione con la FACT)
    this.columns = new Object();
    this.cols = [];
    this.filters = new Object(); // contiene l'array di colonne che andranno nella WHERE come condizioni
    this.conditionsColName = [];
    this.metrics = new Object(); // metriche non filtrate
    this.filteredMetrics = new Object(); // metriche filtrate
    this.colsMetrics = [];
    this.colsFilteredMetrics = [];
    this.groupBy = new Object();
    this.colsGroupBy = [];
    this.relationId = 0;
    // this.dialogFilters = document.getElementById('filter-setting');
    // this.dialogMetrics = document.getElementById('metric-setting');
    this.dialogColumns = document.getElementById('column-setting');
    this.dialogGroupBy = document.getElementById('groupby-setting');
    this.currentFieldSetting = null;
  }

  set cubeId(value) {
    this.#_cubeId = value;
  }

  get cubeId() {return this.#_cubeId;}

  set cubeTitle(value) {this.cube_title = value;}
  get cubeTitle() {return this.cube_title;}

  set dimensionTitle(value) {this.dimension_title = value;}
  get dimensionTitle() {return this.dimension_title;}

  set table(value) {
    this.tableSelected = value;
    // console.log(this.tableSelected);
    this.activeCardRef.setAttribute('name', this.tableSelected);
    this.activeCardRef.querySelector('h6').innerText = this.tableSelected;
  }

  get table() {return this.tableSelected;}

  set activeCard(cardRef) {
    // rimuovo l'attriubto active dalla card-table attiva
    // document.querySelector('.cardTable[active]').removeAttribute('active');
    this.activeCardRef = cardRef;
    this.activeCardRef.setAttribute('active', true);
    // this.sectionOption = cardRef;
  }

  get activeCard() {return this.activeCardRef;}

  set sectionOption(cardRef) {
    // imposto il ref per la section option, dove ci sono i tasti "laterali/nascosti" della card
    this._sectionOption = cardRef.parentElement.querySelector('section[options]');
  }

  get sectionOption() {return this._sectionOption;}

  handlerBtnFilterDone() {
    console.log(this);
    let filterName = document.getElementById('filter-name').value;
    let tableName = this.activeCardRef.getAttribute('name');
    let fieldName = this.dialogFilters.querySelector('#filterFormula .formulaField').innerText;
    let operator = this.dialogFilters.querySelector('#filterFormula .formulaOperator').innerText;
    // array di valori, nel caso di operatori IN oppure between ci sono più valori, nel caso di operator = c'è un solo valore
    let values = [];
    let value;
    // console.log(operator);

    switch (operator) {
      case 'IN':
      case 'NOT IN':
        value = this.dialogFilters.querySelector('#filterFormula .formulaValues').innerHTML;
        // console.log(value);
        // console.log('IN / NOT IN');
        values = value.split(',');

        break;
      default:
        value = this.dialogFilters.querySelector('#filterFormula .formulaValues').innerHTML;
        values.push(value);
    }
    // console.log(values);
    // debugger;

    if (!this.filters.hasOwnProperty(tableName)) {this.conditionsColName = [];}

    this.conditionsColName.push({'filterName' : filterName, 'fieldName' : fieldName, 'operator' : operator, 'values' : values});
    let objParam = {};
    this.conditionsColName.forEach((filter) => {objParam[filter.fieldName] = filter;});

    this.filters[tableName] = objParam;
    console.log(this.filters);
    // this.currentFieldSetting.setAttribute('defined', true);
    this.dialogFilters.close();
  }

  // createFiltersList() {
  //   // aggiungo il filtro creato alla dialog metric-setting in modo da poter associare i filtri a una determinata metrica
  //   // recupero l'elenco dei filtri già presenti in metric-filters, lo inserisco in un array per confrontarlo con this.filters
  //   let metricFiltersList = Array.from(this.dialogMetrics.querySelectorAll('#metric-filters > li'));
  //   // console.log(metricFiltersList);
  //   let arrMetricFilters = [];
  //   metricFiltersList.forEach((filter) => {arrMetricFilters.push(filter.getAttribute('filter-name'));});
  //   console.log(arrMetricFilters);
  //
  //   if (Object.keys(this.filters).length > 0) {
  //     let metricFiltersUl = document.getElementById('metric-filters');
  //     console.log(this.filters);
  //
  //     Array.from(Object.keys(this.filters)).forEach((table) => {
  //       console.log(table);
  //       // console.log(this.filters[table]);
  //       // per ogni tabella recupero i propri filtri per inserirli in un elenco
  //       Array.from(Object.keys(this.filters[table])).forEach((filter) => {
  //         console.log(filter);
  //         // verifico ogni filtro...
  //         // ...se questo filtro è già presente nell'elenco non lo inserisco
  //         if (!arrMetricFilters.includes(this.filters[table][filter].filterName) ) {
  //           let li = document.createElement('li');
  //           li.innerText = this.filters[table][filter].filterName;
  //           li.setAttribute('filter-name', this.filters[table][filter].filterName);
  //           li.setAttribute('table-name', table);
  //           li.setAttribute('field-name', this.filters[table][filter].fieldName);
  //           li.setAttribute('operator', this.filters[table][filter].operator);
  //           li.setAttribute('values', this.filters[table][filter].values);
  //           metricFiltersUl.appendChild(li);
  //           li.onclick = this.handlerFilterMetric;
  //         }
  //       });
  //     });
  //   }
  //
  // }

  // handlerFilterMetric(e) {
  //   // selezione filtro da associare alla metrica
  //   // console.log(this);
  //   this.toggleAttribute('selected');
  // }

  changeMode(value, text) {
    // imposto la modalità della card (hierarchies, columns, filters, groupby,metrics)
    // console.log(this.activeCardRef);

    this.activeCardRef.setAttribute('mode', value);
    let info = this.activeCardRef.parentElement.querySelector('.info');
    info.removeAttribute('hidden');
    info.innerHTML = text;

  }

}
