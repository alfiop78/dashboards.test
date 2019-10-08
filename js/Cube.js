class Cube {

  constructor() {
    this.dimension = [];
    this.tables = [];
    this.hierarchy = new Object(); // Oggetto che contiene un'array di gerarchie (memorizzato in this.hierarchies)
    this.hierarchies = [];

  }

  set table(values) {
    this.tables = values;
    this.dimension = this.tables;
  }

  set columns(values) {
    this.cols = values;
    this.dimension[this.tables] = this.cols;
    console.log(this.dimension);
    console.log(Object.keys(this.dimension).length);
  }

  createTable() {
    let tmplTableAdded = document.getElementById('template-table-added');
    let tableAddedContent = tmplTableAdded.content.cloneNode(true);
    let section = tableAddedContent.querySelector('section');
    section.id = "table-selected-"+Object.keys(this.dimension).length;
    let parent = document.getElementById('table-list');
    section.querySelector('h5').innerText = this.tables;
    parent.appendChild(section);
    this.cols.forEach((el) => {
      // console.log(el);
      let li = document.createElement('li');
      li.innerText = el;
      li.setAttribute('label', this.tables);
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
