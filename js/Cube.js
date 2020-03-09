class Cube {
  
  constructor() {
    this._cube = {};
    this._metrics = {}; // contiene gli oggetti metriche
    this.arrMetrics = []; // accessibile dall'esterno
    this.relationId = 0;
    this._join = {};
    this._dimensions = []; // dimensioni selezionate da associare al cube
  }

  set id(value) {this._id = value;}

  get id() {return this._id;}
  
  set title(value) {this._title = value;}

  get title() {return this._title;}

  set relations(value) {
    this._join['hier_'+this.relationId] = value;
  }

  get relations() {return this._join;}

  set saveRelation(value) {
    // value : colSelected
    value.forEach((el) => {
      el.setAttribute('data-rel-'+this.relationId, this.relationId);
      // el.setAttribute('data-relation-id', 'rel_'+this.relationId);
      el.setAttribute('data-relation-id', true);
      // la relazione è stata creata, posso eliminare [selected]
      el.removeAttribute('selected');
    });
  }

  set activeCard(card) {
    // la card è un obj contenente il riferimento nel DOM e il nome della tabella
    // console.log(card);
    this.card = card; // contiene {'ref': riferimento della card nel DOM, tableName: 'nometabella'}
    this.card.ref.setAttribute('name', card.tableName);
    this._tableName = card.tableName;
  }

  get activeCard() {return this.card;}

  set fieldSelected(value) {this._field = value;}

  get fieldSelected() {return this._field;}

  set metrics(field) {
    if (!this._metrics.hasOwnProperty(this._tableName)) {this._arrMetrics = [];}

    this._arrMetrics.push(field);

    this._metrics[this._tableName] = this._arrMetrics;
    console.log(this._metrics);
  }

  get metrics() {return this._metrics;}

  set FACT(value) {this._fact = value;}

  get FACT() {return this._fact;}

  save() {
    this._cube.type = 'CUBE';
    this._cube.title = this._title;
    this._cube.metrics = this._metrics;
    this._cube.relations = this._join;
    this._cube.FACT = this._fact;
    this._cube.id = this._id;
    this._cube.associatedDimensions = this._associatedDimension;
  }

  get cube() {return this._cube;}

  mode(value, text) {
    // imposto la modalità della card (relations, columns, filters, groupby,metrics)
    // console.log(this.activeCardRef);

    this.card.ref.setAttribute('mode', value);
    let info = this.card.ref.parentElement.querySelector('.info');
    info.removeAttribute('hidden');
    info.innerHTML = text;
  }

  set dimensionsSelected(value) {this._dimensions.push(value);}

  get dimensionsSelected() {return this._dimensions;}

  set associatedDimensions(obj) {this._associatedDimension = obj;}

  get associatedDimensions() {return this._associatedDimension;}

}

class Dimension {
  constructor() {
    this._dimension = {};
    this._join = {}; // relazioni tra le tabelle
    this._hierarchies = {}; // ordine gerarchico
    this._columns = {}; // Object di colonne selezionate, queste potranno essere inserite nella creazione del report {'nometabella' : [array di colonne]}
    this._arrColumns = []; // array contente le colonne selezionate, questo array verrà inserito nel'object this._columns
    this.relationId = 0;
  }

  set id(value) {this._id = value;}

  get id() {return this._id;}

  set activeCard(cardRef) {
    // la card su cui si sta operando
    this.card = cardRef;
    console.log(this.card);
    this._tableName = this.card.getAttribute('name');
  }

  get activeCard() {return this.card;}

  set title(value) {this._title = value;}

  get title() {return this._title;}

  set from(value) {this._from = value;}

  get from() {return this._from;}

  set hierarchies(value) {this._join['dimensionJoin_'+this.relationId] = value;}

  get hierarchies() {return this._join;}

  set hierarchyOrder(values) {this._hierarchies = values;}

  get hierarchyOrder() {return this._hierarchies;}

  set saveRelation(value) {
    // value : colSelected
    value.forEach((el) => {
      el.setAttribute('data-rel-'+this.relationId, this.relationId);
      // el.setAttribute('data-relation-id', 'rel_'+this.relationId);
      el.setAttribute('data-relation-id', true);
      // la relazione è stata creata, posso eliminare [selected]
      el.removeAttribute('selected');
    });
  }

  set columns(field) {
    // se il nome della tabella è già presente, aggiungo l'array, altrimenti pulisco l'array per non duplicare gli elementi in entrambi gli object this._columns[nometabella]
    if (!this._columns.hasOwnProperty(this._tableName)) {this._arrColumns = [];}

    this._arrColumns.push(field);

    this._columns[this._tableName] = this._arrColumns;
    console.log(this._columns);
    
  }

  get columns() {return this._columns;}


  save() {
    this._dimension.type = 'DIMENSION';
    // TODO Aggiungere dimensionId
    this._dimension.columns = this._columns;
    this._dimension.title = this._title;
    this._dimension.from = this._from;
    this._dimension.join = this._join;
    this._dimension.hierarchies = this._hierarchies;
    console.log(this._dimension);
  }

  get dimension() {return this._dimension;}

}