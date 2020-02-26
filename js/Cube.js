
class Dimension {
  constructor() {
    this._dimension = {};
    this._hierarchies = {};
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
    this._dimension['title'] = value;
    this._dimension['type'] = 'DIMENSION';
  }

  get title() {return this._dimension['title'];}

  set from(value) {this._dimension['from'] = value;}

  get from() {return this._dimension['from'];}

  set hierarchies(value) {
    this._hierarchies['hier_'+this.relationId];
    this._dimension['hierarchies'] = this._hierarchies;
  }

  get hierarchies() {return this._hierarchies;}

}

class Cube {
  
  constructor() {
    this._cubeId;
    this.cube = {};
    this.dimension = {};
    this.hierarchyFact = {}; // Oggetto che contiene un'array di gerarchie (memorizzato in this.hierarchies)
    this.hierarchyTable = {}; // Oggetto che contiene un'array di gerarchie (memorizzato in this.hierarchies)
    this.hierarchyOrder = {}; // ordine gerarchico della struttura (con l'ultima tabella che rappresenta l'associazione con la FACT)
    this.relationId = 0;
    this.currentFieldSetting = null;
    this.dimensions = [];
  }

  set cubeId(value) {
    this._cubeId = value;
  }

  get cubeId() {return this._cubeId;}

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

  changeMode(value, text) {
    // imposto la modalità della card (hierarchies, columns, filters, groupby,metrics)
    // console.log(this.activeCardRef);

    this.activeCardRef.setAttribute('mode', value);
    let info = this.activeCardRef.parentElement.querySelector('.info');
    info.removeAttribute('hidden');
    info.innerHTML = text;

  }

}