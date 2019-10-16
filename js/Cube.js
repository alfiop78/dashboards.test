class Cube {

  constructor() {
    this.tables = [];
    this.cols = [];
    this.hierarchy = new Object(); // Oggetto che contiene un'array di gerarchie (memorizzato in this.hierarchies)
    this.hierarchies = [];

  }

  set table(value) {
    this.tableSelected = value;
    console.log(this.tableSelected);
    // azzero il contenuto di this.cols
    this.cols = [];
  }

  get table() {return this.tableSelected;}

  set activeCard(cardRef) {
    this.activeCardRef = cardRef;
    // imposto il titolo della tabella selezionata e memorizzata in this.tableSelected
    this.activeCardRef.querySelector('h5').innerText = this.tableSelected;
  }

  get activeCard() {return this.activeCardRef;}

  set columns(values) {
    // selezione delle colonne nella card attiva
    console.log('set columns');
    console.log(this.activeCardRef);
    this.cols.push(values);
    this.tables[this.tableSelected] = this.cols;
    console.log(this.tables);
    // console.log(Object.keys(this.tables).length);
    // let li = document.createElement('li');
    // li.innerText = values;
    // this.activeCard.querySelector('ul').appendChild(li);
    // // NOTE: in questo modo this, nel Metodo handlerColumns è riferito a Cube e non a <li> su cui si è cliccato
    // li.onclick = this.handlerColumns.bind(this);


  }

  handlerColumns(e) {
    // console.log(this);
    // se la card/table [active] non ha gli attributi [hierarchies] oppure [filters] oppure [columns] disabilito la selezione delle righe
    // questo perchè, se non si specifica prima cosa si vuol fare con le colonne selezionate, non abilito la selezione
    // [hierarchies] : consente di inserire una relazione tra le due tabelle, selezionando una colonna per ciascuna tabella
    // [filter] : consente di impostare le colonne che saranno utilizzate come filtri nella query
    // [columns] : consente di selezionare le colonne che verranno mostrate nella SELECT della query (quindi nel corpo della table, sul dashboard)
    // console.log(this.activeCardRef.attributes);
    let attributes = this.activeCardRef.attributes;
    // console.log(e.target);
    // console.log(this.activeCardRef.hasAttribute('hierarchies'));
    let ulContainer = e.path[2];
    for (let i = 1; i < attributes.length; i++) {
      // i = 1 perchè il primo attributo è certamente [class]
      // console.log(attributes[i].name);
      switch (attributes[i].name) {
        // OPTIMIZE: ottimizzare
        case 'hierarchies':
          // nella scelta della relazione posso selezionare solo una colonnna per volta, quindi ad ogni selezione di colonna elimino la selezione precedente
          // console.log(e.path[2].querySelectorAll('li[selected]'));
          ulContainer.querySelectorAll('li[selected]').forEach((li) => {li.removeAttribute('selected');});
          e.target.toggleAttribute('selected');
          break;
        case 'columns':
          e.target.setAttribute('selected', true);
          break;
        case 'filters':
          e.target.setAttribute('selected', true);
          break;
      }

    }
    this.createHierarchy();
  }

  createHierarchy() {
    let hier = [];
    let colsSelected = [];
    // this.hierarchies = [];
    document.querySelectorAll('.card-table[hierarchies]').forEach((card) => {
      let tableName = card.querySelector('h5').innerText;
      console.log(tableName);
      // recupero la colonna selezionata per questa card
      // let liSelected = card.querySelector('li[selected]');
      // hier.push(tableName+"."+liSelected.innerText);
      // TODO: aggiungo un icona per confermare che la colonna è stata messa in relazione
      // la stessa colonna, non la elimino, potrebbe servire per impostare anche i filtri(FILTERS) e le columns(SELECT)

      card.querySelectorAll('.element:not([relation]) > li[selected]').forEach((li) => {
        console.log(li);
        colsSelected.push(li);
        hier.push(tableName+"."+li.innerText);
      });
    });
    console.log(hier.length);
    if (hier.length === 2) {
      this.hierarchies.push(hier);
      this.hierarchy.hier = this.hierarchies;
      // TODO: inserisco un icona per capire che c'è una relazione tra le due colonne
      colsSelected.forEach((el) => {
        el.parentElement.setAttribute('relation', true);
        el.parentElement.querySelector('i').removeAttribute('hover');
        el.parentElement.querySelector('i').innerText = "insert_link";
        el.parentElement.querySelector('small').innerText = this.hierarchies.length;
      });

    }

    console.log(this.hierarchy);
  }




}
