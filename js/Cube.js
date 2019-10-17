class Cube {

  constructor() {
    this.tables = [];
    this.cols = [];
    this.hierarchy = new Object(); // Oggetto che contiene un'array di gerarchie (memorizzato in this.hierarchies)
    this.hierarchies = [];
    this.relationId = 0;
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
    console.log(e.path);
    console.log(e.target);
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
    console.log(this.activeCardRef);
    for (let i = 1; i < attributes.length; i++) {
      // i = 1 perchè il primo attributo è certamente [class]
      // console.log(attributes[i].name);
      switch (attributes[i].name) {
        // OPTIMIZE: ottimizzare
        case 'hierarchies':
          console.log('hierarchies');
          // se è presente un altro elemento coon attributo relation ma NON data-relation-id, "deseleziono" quello con relation per mettere [relation]
          // ...a quello appena selezionato, in questo modo posso selezionare solo una colonna per volta ad ogni relazione da creare
          // se però, viene cliccato una colonna con già una relazione impostata (quindi ha [data-relationn-id]) elimino la relazione da
          // ...entrambe le tabelle tramite un identificatifo di relazione
          let liRelationSelected = e.path[3].querySelector('li[relation]:not([data-relation-id])');
          if (liRelationSelected) {liRelationSelected.toggleAttribute('relation');}

          e.target.toggleAttribute('relation');

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
    document.querySelectorAll('.card-table[hierarchies]').forEach((card) => {
      let tableName = card.querySelector('h5').innerText;

      let liRef = card.querySelector('li[relation]:not([data-relation-id])');
      if (liRef) {
        this.colSelected.push(liRef);
        hier.push(tableName+"."+liRef.innerText);
      }

      // per creare correttamente la relazione è necessario avere due elementi selezionati
      if (hier.length === 2) {
        this.relationId++;
        this.hierarchies['rel_'+this.relationId] = hier;
        // this.hierarchies.push(hier);
        this.hierarchy.hier = this.hierarchies;
        // visualizzo l'icona per capire che c'è una relazione tra le due colonne
        this.colSelected.forEach((el) => {
          console.log(Object.keys(this.hierarchies));
          el.setAttribute('data-relation-id', Object.keys(this.hierarchies));
          el.parentElement.querySelector('small').innerText = this.relationId;
        });
        console.log(this.hierarchy);

      }
    });



  }




}
