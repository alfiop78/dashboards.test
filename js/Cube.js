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
    this.activeCardRef.setAttribute('name', this.tableSelected);
    this.activeCardRef.querySelector('h5').innerText = this.tableSelected;
    // azzero il contenuto di this.cols
    this.cols = [];
  }

  get table() {return this.tableSelected;}

  set activeCard(cardRef) {this.activeCardRef = cardRef;}

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
    this.activeCard = e.path[3];
    // console.log(e.target);
    let tableName = e.path[3].getAttribute('name');
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
      switch (attributes[i].name) {
        // OPTIMIZE: ottimizzare
        case 'hierarchies':
          console.log('hierarchies');
          // se è presente un altro elemento coon attributo hierarchy ma NON data-relation-id, "deseleziono" quello con hierarchy per mettere [hierarchy]
          // ...a quello appena selezionato, in questo modo posso selezionare solo una colonna per volta ad ogni relazione da creare
          // se però, viene cliccato una colonna con già una relazione impostata (quindi ha [data-relationn-id]) elimino la relazione da
          // ...entrambe le tabelle tramite un identificatifo di relazione
          let liRelationSelected = e.path[3].querySelector('li[hierarchy]:not([data-relation-id])');
          // console.log(liRelationSelected);
          e.target.toggleAttribute('hierarchy');
          // se ho selezionato una colonna diversa da quella già selezionata, rimuovo la selezione corrente e imposto quella nuova
          // se è stata selezionata una colonna già selezionata la deseleziono
          if (liRelationSelected && (liRelationSelected.id !== e.target.id)) {liRelationSelected.toggleAttribute('hierarchy');}
          /* oltre a fare il toggle dell'attributo, se questa colonna era stata già messa in
          relazione con un altra tabella (quindi attributo [data-relation-id] presente) elimino anche la relazione tra i due campi.
          Bisogna eliminarla sia dal DOM, eliminando [data-relation-id] che dall'array this.hierarchy
          */

          if (e.target.hasAttribute('data-relation-id')) {
            let relationId = e.target.getAttribute('data-relation-id');
            // verifico se questo relationId è presente su qualche altra colonna, di altre tabelle
            console.log('verifico rel : '+relationId);
            this.removeHierarchy(relationId);

          }

          this.createHierarchy();
          break;
        case 'columns':
          console.log('columns');
          e.target.toggleAttribute('columns');
          break;
        case 'filters':
          console.log('filters');
          e.target.toggleAttribute('filters');
          break;
      }

    }


  }

  removeHierarchy(relationId) {
    document.querySelectorAll('.card-table ul > .element > li[data-relation-id="'+relationId+'"]').forEach((li) => {
      li.removeAttribute('data-relation-id');
      if (li.hasAttribute('hierarchy')) {li.removeAttribute('hierarchy');}
    });
    // cerco, nell'array this.hierarchies la relazione (relationId) da eliminare
    delete this.hierarchies[relationId];
    // la successiva chiamata a createHierachy (nel metodo handlerColumns) aggiornerà l'array delle gerarchie (this.hierarchy) eliminando la
    // relazione appena eliminata qui da this.hierarchies
  }

  createHierarchy() {
    console.log('createHierarchy');
    let hier = [];
    this.colSelected = [];
    document.querySelectorAll('.card-table[hierarchies]').forEach((card) => {
      let tableName = card.getAttribute('name');

      let liRef = card.querySelector('li[hierarchy]:not([data-relation-id])');
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
          el.setAttribute('data-relation-id', 'rel_'+this.relationId);
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
      card.querySelector('.help').innerText = "";
    });

  }
}
