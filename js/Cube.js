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
    console.log('set columns');
    this.cols.push(values);
    this.tables[this.tableSelected] = this.cols;
    console.log(this.tables);
    // console.log(Object.keys(this.tables).length);
    let li = document.createElement('li');
    li.innerText = values;
    this.activeCard.querySelector('ul').appendChild(li);
    li.onclick = this.handlerColumns;
  }

  handlerColumns(e) {
    console.log(this);
    this.toggleAttribute('selected');
  }

  createTable() {
    let tmplTableAdded = document.getElementById('template-table-added');
    let tableAddedContent = tmplTableAdded.content.cloneNode(true);
    let section = tableAddedContent.querySelector('section');
    section.id = "table-selected-"+Object.keys(this.dimension).length;
    let parent = document.getElementById('table-list');
    section.querySelector('h5').innerText = this.tableSelected;
    parent.appendChild(section);
    this.cols.forEach((el) => {
      // console.log(el);
      let li = document.createElement('li');
      li.innerText = el;
      li.setAttribute('label', this.tableSelected);
      section.appendChild(li);
      section.querySelector('ul').appendChild(li);
      li.onclick = this.handlerColumnsSelected;
    });

  }

  handlerColumnsSelected(e) {
    // console.log(this);
    // console.log(e.path[2]);
    // this.setAttribute('selected', true);
    // deseleziono prima tutte quelle attualmente selezionate
    e.path[2].querySelectorAll('li[selected]').forEach((selected) => {selected.removeAttribute('selected');});
    this.toggleAttribute('selected');
    // se ci sono almeno due colonne selezionate posso creare la gerarchia
    (document.querySelectorAll('li[selected]').length > 1) ? document.getElementById('relation').removeAttribute('hidden') : document.getElementById('relation').hidden = true;
  }

  createHierarchy() {
    let hier = [];
    document.querySelectorAll('.table-selected').forEach((el) => {
      el.querySelectorAll('li[selected]').forEach((li) => {
        // console.log(li);
        hier.push(li.getAttribute('label')+"."+li.innerText);
        li.removeAttribute('selected');
        li.hidden = true;
      });
    });
    this.hierarchies.push(hier);
    this.hierarchy.hier = this.hierarchies;
    console.log(this.hierarchy);
    // console.log(this.hierarchy.hier);
    // nascondo il tasto CREA RELAZIONI
    document.getElementById('relation').hidden = true;
  }




}
