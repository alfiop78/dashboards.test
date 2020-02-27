
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

  set title(value) {
    this._title = value;
    // this._dimension['type'] = 'DIMENSION';
  }

  get title() {return this._title;}

  set from(value) {this._from = value;}

  get from() {return this._from;}

  set hierarchies(value) {
    this._hierarchies['hier_'+this.relationId] = value;
  }

  get hierarchies() {return this._hierarchies;}

  set hierarchyOrder(values) {
    this._hierarchyOrder = values;
  }

  get hierarchyOrder() {return this._hierarchyOrder;}

  save() {
    this._dimension.type = 'DIMENSION';
    this._dimension.title = this._title;
    this._dimension.from = this._from;
    this._dimension.hierarchies = this._hierarchies;
    this._dimension.hierarchyOrder = this._hierarchyOrder;
    console.log(this._dimension);
    // TODO: aggiungere hierarchyOrder
  }

  get dimension() {return this._dimension;}

}

class Cube {
  
  constructor() {
    this.cube = {};
    this._metrics = {};
    
  }
  
  set title(value) {this._title = value;}

  get title() {return this._title;}

  set activeCard(card) {
    // la card è un obj contenente il riferimento nel DOM e il nome della tabella
    console.log(card);
    this.card = card; // contiene {'ref': riferimento della card nel DOM, tableName: 'nometabella'}
    this.card.ref.setAttribute('name', card.tableName);
  }

  get activeCard() {return this.card;}

  set metrics(value) {
    this._metrics[this.card.tableName] = value;
  }

  get metrics() {return this._metrics;}

  mode(value, text) {
    // imposto la modalità della card (hierarchies, columns, filters, groupby,metrics)
    // console.log(this.activeCardRef);

    this.card.ref.setAttribute('mode', value);
    let info = this.card.ref.parentElement.querySelector('.info');
    info.removeAttribute('hidden');
    info.innerHTML = text;
  }

}