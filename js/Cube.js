class Cube {

  constructor() {
    this.tables = [];
    this.hierarchy = new Object(); // Oggetto che contiene un'array di gerarchie (memorizzato in this.hierarchies)
    this.hierarchies = [];
    this.columns = new Object(); // contiene l'array di colonne che andranno nella SELECT
    this.cols = [];
    this.filters = new Object(); // contiene l'array di colonne che andranno nella WHERE come condizioni
    this.conditionsColName = [];
    this.relationId = 0;
  }

  set table(value) {
    this.tableSelected = value;
    // console.log(this.tableSelected);
    this.activeCardRef.setAttribute('name', this.tableSelected);
    this.activeCardRef.querySelector('h5').innerText = this.tableSelected;
  }

  get table() {return this.tableSelected;}

  set activeCard(cardRef) {this.activeCardRef = cardRef;}

  get activeCard() {return this.activeCardRef;}

  handlerColumns(e) {
    // console.log(e.path);
    this.activeCard = e.path[3];
    // console.log(e.target);
    let tableName = this.activeCardRef.getAttribute('name');
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
        case 'hierarchies':
          // se è presente un altro elemento coon attributo hierarchy ma NON data-relation-id, "deseleziono" quello con hierarchy per mettere [hierarchy]
          // ...a quello appena selezionato, in questo modo posso selezionare solo una colonna per volta ad ogni relazione da creare
          // se però, viene cliccato una colonna con già una relazione impostata (quindi ha [data-relationn-id]) elimino la relazione da
          // ...entrambe le tabelle tramite un identificatifo di relazione

          if (e.target.hasAttribute('data-relation-id')) {
            /* oltre a fare il toggle dell'attributo, se questa colonna era stata già messa in
            relazione con un altra tabella (quindi attributo [data-relation-id] presente) elimino anche la relazione tra i due campi.
            Bisogna eliminarla sia dal DOM, eliminando [data-relation-id] che dall'array this.hierarchy
            */
            e.target.toggleAttribute('selected');
            // TODO: recupero tutti gli attributi di e.target e vado a ciclare this.removeHierarchy(relationId) per verificare uno alla volta quale posso eliminare
            for (let name of e.target.getAttributeNames()) {
              // console.log(name);
              let relationId, value;
              if (name.substring(0, 9) === "data-rel-") {
                relationId = name;
                value = e.target.getAttribute(name);
                this.removeHierarchy(relationId, value);
              }

            }

          } else {
            let liRelationSelected = this.activeCardRef.querySelector('li[hierarchy]:not([data-relation-id])');
            // console.log(liRelationSelected);
            e.target.toggleAttribute('hierarchy');
            e.target.toggleAttribute('selected');
            // se ho selezionato una colonna diversa da quella già selezionata, rimuovo la selezione corrente e imposto quella nuova
            // se è stata selezionata una colonna già selezionata la deseleziono
            if (liRelationSelected && (liRelationSelected.id !== e.target.id)) {
              liRelationSelected.toggleAttribute('hierarchy');
              liRelationSelected.toggleAttribute('selected');
            }

          }
          this.createHierarchy();
          break;
        case 'columns':
          console.log('columns');
          e.target.toggleAttribute('columns');
          // if (!this.columns[tableName]) {this.cols = [];}
          this.cols = [];

          this.activeCardRef.querySelectorAll('li[columns]').forEach((li) => {
            // console.log(li);
            this.cols.push(li.getAttribute('label'));
          });
          // console.log(this.cols);
          this.columns[tableName] = this.cols;
          console.log(this.columns);
          break;
        case 'filters':
          console.log('filters');
          e.target.toggleAttribute('filters');

          this.conditions = [];
          let values = [34];

          this.activeCardRef.querySelectorAll('li[filters]').forEach((li) => {
            // console.log(li);
            this.conditions[li.getAttribute('label')] = {'operator': "=", 'values' : values};
          });
          // console.log(this.cols);
          this.filters[tableName] = this.conditions;
          console.log(this.filters);
          break;
      }

    }


  }

  removeHierarchy(relationId, value) {
    console.log(relationId);
    console.log(value);
    console.log('delete hierarchies');
    /* prima di eliminare la gerarchia devo stabilire se le due card, in questo momento, sono in modalità hierarchies
    // ...(questo lo vedo dall'attributo presente su card-table)
    // elimino la gerarchia solo se la relazione tra le due tabelle riguarda le due tabelle attualmente impostate in modalità [hierarchies]
    // se la relazione riguarda le tabelle A e B e attualmente la modalità = A e B allora elimino la gerarchia
    // altrimenti se la relazione riguarda A e B e attualmente la modalità impostata [hierarchies] riguarda B e C aggiungo la relazione e non la elimino
    */
    // elementi li che hanno la relazione relationId
    let liElementsRelated = document.querySelectorAll('.card-table[hierarchies] li[data-relation-id]['+relationId+']').length;

    if (liElementsRelated === 2) {
      // tra le due tabelle attualmente .card-table[hiearachies] non esiste questa relazione, per cui si sta creando una nuova relazione
      // ci sono due colonne che fanno parte di "questa relazione" (cioè delle due tabelle attualmente in modalità [hierarchies]) quindi possono essere eliminate
      document.querySelectorAll('.card-table[hierarchies] ul > .element > li[data-relation-id]['+relationId+']').forEach((li) => {
        console.log('elimino li :'+li.innerText);
        // TODO: se è presente un'altra relazione, quindi un altro attributo data-rel, NON elimino [hierarchy] e [data-relation-id]
        //... (per non eliminare l'icona) che fa riferimento ad un'altra relazione sulla stessa colonna (doppia chiave)
        li.removeAttribute(relationId);
        li.removeAttribute('selected');
        let relationFound = false; // altra relazione trovata ?
        // console.log(li.getAttributeNames());
        // console.log(li.getAttributeNames().indexOf('data-rel-'));
        li.getAttributeNames().forEach((attr) => {
          // console.log(attr.indexOf('data-rel-'));
          if (attr.indexOf('data-rel-') !== -1) {
            console.log('trovata altra relazione : '+attr);
            relationFound = true;
          }

        });
        if (!relationFound) {
          li.removeAttribute('data-relation-id');
          li.removeAttribute('hierarchy');
        }
      });
      delete this.hierarchies['rel_'+value];
    }

  }

  createHierarchy() {
    console.log('createHierarchy');
    let hier = [];
    this.colSelected = [];
    document.querySelectorAll('.card-table[hierarchies]').forEach((card) => {
      let tableName = card.getAttribute('name');

      // let liRef = card.querySelector('li[hierarchy]:not([data-relation-id])');
      let liRef = card.querySelector('li[hierarchy][selected]');
      if (liRef) {
        this.colSelected.push(liRef);
        hier.push(tableName+"."+liRef.innerText);
      }
      // console.log(hier);

      // per creare correttamente la relazione è necessario avere due elementi selezionati
      if (hier.length === 2) {
        this.relationId++;
        this.hierarchies['rel_'+this.relationId] = hier;
        // this.hierarchies.push(hier);
        this.hierarchy.hier = this.hierarchies;
        // visualizzo l'icona per capire che c'è una relazione tra le due colonne
        this.colSelected.forEach((el) => {
          el.setAttribute('data-rel-'+this.relationId, this.relationId);
          // el.setAttribute('data-relation-id', 'rel_'+this.relationId);
          el.setAttribute('data-relation-id', true);
          // la relazione è stata creata, posso eliminare [selected]
          el.removeAttribute('selected');
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
