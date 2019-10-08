class Cube {

  constructor() {
    this.dimension = [];
    this.tables = [];
    this.hierarchy = new Object();

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
    let parent = document.getElementById('tables');
    section.querySelector('h5').innerText = this.tables;
    parent.appendChild(section);
    this.cols.forEach((el) => {
      // console.log(el);
      let li = document.createElement('li');
      li.innerText = el;
      section.appendChild(li);
      section.querySelector('ul').appendChild(li);
      li.onclick = this.handlerColumnsSelected;
    });

  }

  handlerColumnsSelected(e) {
    // console.log(this);
    this.setAttribute('selected', true);
  }

  createHierarchy() {
    // Object.defineProperty(this.hierarchy, 'hier', {[
    //
    // ]});
    // recupero le colonne selezionate
    let a = [];
    document.querySelectorAll('.table-selected').forEach((el) => {
      console.log(el);

      el.querySelectorAll('li[selected="true"]').forEach((li) => {
        console.log(li);
        a.push(li.innerText);
      });


    });
    this.hierarchy.hier = a;
    console.log(this.hierarchy);

  }




}
