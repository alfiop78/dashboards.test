class Cube {

  constructor() {
    this.tables = [];
    this.cols = [];
    this.hierarchy = new Object(); // Oggetto che contiene un'array di gerarchie (memorizzato in this.hierarchies)
    this.hierarchies = [];
  }

  set table(value) {
    this.tableSelected = value;
    // console.log(this.tableSelected);
    // azzero il contenuto di this.cols
    this.cols = [];
  }

  get table() {return this.tableSelected;}

  set activeCard(cardRef) {
    console.log('active Card');
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
    // console.log(e.path);
    // console.log(e.path[3].querySelector('h5').innerText);
    let tableName = e.path[3].querySelector('h5').innerText;
    // console.log(tableName);
    // console.log(e.target);
    // console.log(this);
    // se la card/table [active] non ha gli attributi [hierarchies] oppure [filters] oppure [columns] disabilito la selezione delle righe
    // questo perchè, se non si specifica prima cosa si vuol fare con le colonne selezionate, non abilito la selezione
    // [hierarchies] : consente di inserire una relazione tra le due tabelle, selezionando una colonna per ciascuna tabella
    // [filter] : consente di impostare le colonne che saranno utilizzate come filtri nella query
    // [columns] : consente di selezionare le colonne che verranno mostrate nella SELECT della query (quindi nel corpo della table, sul dashboard)
    // console.log(this.activeCardRef.attributes);
    let attributes = this.activeCardRef.attributes;
    for (let i = 1; i < attributes.length; i++) {
      // i = 1 perchè il primo attributo è certamente [class]
      console.log(attributes[i].name);
      switch (attributes[i].name) {
        // OPTIMIZE: ottimizzare
        case 'hierarchies':
          console.log('hierarchies');
          e.target.toggleAttribute('relation');
          (e.target.hasAttribute('relation')) ?
            e.path[1].querySelector('#hierarchy-icon').removeAttribute('hide') :
            e.path[1].querySelector('#hierarchy-icon').setAttribute('hide', true);

          this.createHierarchy();
          break;
        case 'columns':
        console.log('columns');
          e.target.toggleAttribute('columns');
          e.path[1].querySelector('#columns-icon').toggleAttribute('hide');
          break;
        case 'filters':
        console.log('filters');
          e.target.toggleAttribute('filters');
          e.path[1].querySelector('#filters-icon').toggleAttribute('hide');
          break;
      }

    }


  }

  createHierarchy() {
    let hier = [];
    this.colSelected = [];
    // this.hierarchies = [];
    document.querySelectorAll('.card-table[hierarchies]').forEach((card) => {
      let tableName = card.querySelector('h5').innerText;
      // console.log(tableName);
      // recupero la colonna selezionata per questa card
      // let liSelected = card.querySelector('li[selected]');
      // hier.push(tableName+"."+liSelected.innerText);
      // TODO: aggiungo un icona per confermare che la colonna è stata messa in relazione
      // la stessa colonna, non la elimino, potrebbe servire per impostare anche i filtri(FILTERS) e le columns(SELECT)

      card.querySelectorAll('li[relation]:not([data-relation-id])').forEach((li) => {
        // console.log(li);
        this.colSelected.push(li);
        hier.push(tableName+"."+li.innerText);
      });
    });
    // console.log(hier.length);
    // per creare correttamente la relazione è necessario avere due elementi selezionati
    if (hier.length === 2) {
      this.hierarchies.push(hier);
      this.hierarchy.hier = this.hierarchies;
      // TODO: inserisco un icona per capire che c'è una relazione tra le due colonne
      this.colSelected.forEach((el) => {
        el.setAttribute('data-relation-id', this.hierarchies.length);
        // el.parentElement.querySelector('i').removeAttribute('hide');
        // el.parentElement.querySelector('i').innerText = "insert_link";
        el.parentElement.querySelector('small').innerText = this.hierarchies.length;
      });
      console.log(this.hierarchy);

    }

  }




}
