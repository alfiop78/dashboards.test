class Cube {
  
  constructor() {
    this._cube = {};
    this._metrics = {}; // contiene gli oggetti metriche
    this.arrMetrics = []; // accessibile dall'esterno
    this.relationId = 0;
    this._relations = {};
    this._dimensions = []; // dimensioni selezionate da associare al cube
  }

  set id(value) {this._id = value;}

  get id() {return this._id;}
  
  set title(value) {this._title = value;}

  get title() {return this._title;}

  set relations(value) {
    this._relations['hier_'+this.relationId] = value;
  }

  get relations() {return this._relations;}

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
    console.log(card);
    this.card = card; // contiene {'ref': riferimento della card nel DOM, tableName: 'nometabella'}
    this.card.ref.setAttribute('name', card.tableName);
  }

  get activeCard() {return this.card;}

  set fieldSelected(value) {this._field = value;}

  get fieldSelected() {return this._field;}

  set metrics(value) {
    this._metrics[this.card.tableName] = value;
    console.log(this._metrics);
  }

  get metrics() {return this._metrics;}

  set FACT(value) {this._fact = value;}

  get FACT() {return this._fact;}

  save() {
    this._cube.type = 'CUBE';
    this._cube.title = this._title;
    this._cube.metrics = this._metrics;
    this._cube.relations = this._relations;
    this._cube.FACT = this._fact;
    this._cube.id = this._id;
    this._cube.associatedDimensions = this._dimensions;
  }

  get cube() {return this._cube;}

  mode(value, text) {
    // imposto la modalità della card (hierarchies, columns, filters, groupby,metrics)
    // console.log(this.activeCardRef);

    this.card.ref.setAttribute('mode', value);
    let info = this.card.ref.parentElement.querySelector('.info');
    info.removeAttribute('hidden');
    info.innerHTML = text;
  }

  set dimensionsSelected(value) {this._dimensions.push(value);}

  get dimensionsSelected() {return this._dimensions;}

}

class Dimension {
  constructor() {
    this._dimension = {};
    this._hierarchies = {};
    this._hierarchyOrder = {};
    this.relationId = 0;
  }

  set id(value) {this._id = value;}

  get id() {return this._id;}

  set activeCard(cardRef) {
    // la card su cui si sta operando
    this.card = cardRef;
  }

  get activeCard() {return this.card;}

  set title(value) {this._title = value;}

  get title() {return this._title;}

  set from(value) {this._from = value;}

  get from() {return this._from;}

  set hierarchies(value) {this._hierarchies['hier_'+this.relationId] = value;}

  get hierarchies() {return this._hierarchies;}

  set hierarchyOrder(values) {this._hierarchyOrder = values;}

  get hierarchyOrder() {return this._hierarchyOrder;}

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

  save() {
    this._dimension.type = 'DIMENSION';
    // TODO Aggiungere dimensionId
    this._dimension.title = this._title;
    this._dimension.from = this._from;
    this._dimension.hierarchies = this._hierarchies;
    this._dimension.hierarchyOrder = this._hierarchyOrder;
    console.log(this._dimension);
    // TODO: aggiungere hierarchyOrder
  }

  get dimension() {return this._dimension;}

}