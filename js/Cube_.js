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
    this.objFilter = {};
    this.conditionsColName = [];
    this.metrics = new Object(); // metriche non filtrate
    this.filteredMetrics = new Object(); // metriche filtrate
    this.colsMetrics = [];
    this.colsFilteredMetrics = [];
    this.groupBy = new Object();
    this.colsGroupBy = [];
    this.relationId = 0;
    this.dialogFilters = document.getElementById('filter-setting');
    // this.dialogMetrics = document.getElementById('metric-setting');
    this.dialogColumns = document.getElementById('column-setting');
    this.dialogGroupBy = document.getElementById('groupby-setting');
    this.currentFieldSetting = null;
    this.dimensions = [];
  }

  set cubeId(value) {
    this.#_cubeId = value;
  }

  get cubeId() {return this.#_cubeId;}

  set cubeTitle(value) {this.cube_title = value;}
  get cubeTitle() {return this.cube_title;}

  set dimensionTitle(value) {this.dimension_title = value;}
  get dimensionTitle() {return this.dimension_title;}

  set dimensionsSelected(value) {this.dimensions.push(value);}

  get dimensionsSelected() {return this.dimensions;}

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

    if (!this.filters.hasOwnProperty(tableName)) {this.objFilter = {};}

    console.log(this.filters);

    this.conditionsColName.push({'fieldName' : fieldName, 'operator' : operator, 'values' : values});
    // this.conditionsColName.push({'filterName' : filterName, 'fieldName' : fieldName, 'operator' : operator, 'values' : values});
    this.conditionsColName.forEach((filter) => {this.objFilter[filterName] = filter;});

    this.filters[tableName] = this.objFilter;
    console.log(this.filters);
    this.dialogFilters.close();
  }

  changeMode(value, text) {
    // imposto la modalità della card (hierarchies, columns, filters, groupby,metrics)
    // console.log(this.activeCardRef);

    this.activeCardRef.setAttribute('mode', value);
    let info = this.activeCardRef.parentElement.querySelector('.info');
    info.removeAttribute('hidden');
    info.innerHTML = text;

  }

}
