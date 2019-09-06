class Draw {
  constructor(table, options) {
    /*
    * table è il riferimento all'elemento table nel DOM
    */
    // console.log(table);
    // console.log(options);
    this.options = options;
    this.table = table;
    this.headerSection = table.querySelector('section[header]');
    this.bodySection = table.querySelector('section[body]');
    this.tmplCol = table.querySelector('#col');
    this.tmplRow = table.querySelector('#row');

  }

  addColumn(colName) {
    // this.colTmpl = this.tmplCol.content.cloneNode(true);
    // this.col = this.colTmpl.querySelector('span[col]');
    // this.col.innerHTML = colName;
    // this.col.classList.add("column");
    // // aggiungo un id alla colonna
    // this.col.setAttribute("data-colID", this.headerSection.querySelector('div[row]').childElementCount);
    // this.headerSection.querySelector('div[row]').appendChild(this.col);
    let table = document.querySelector('table');
    let th = document.createElement('th');
    th.innerHTML = colName;
    table.querySelector('tr[row][head]').appendChild(th);
  }

  addRow(rowValues) {
    // TODO: imposto grid-template-column in base a quante colonne ci sono
    // console.log(this.bodySection);
    // let colsCount = this.headerSection.querySelector('div[row]').childElementCount;
    // console.log(rowValues.length);
    // node
    // this.rowNode = this.tmplRow.content.cloneNode(true);
    // elemento contenuto nel template
    // this.row = this.rowNode.querySelector('div[row]');
    // lo aggiungo al DOM nella section body della tabella
    // this.bodySection.appendChild(this.row);
    let tr = document.createElement('tr');
    tr.setAttribute('row', 'body');
    document.querySelector('table').appendChild(tr);

    // NOTE: Utilizzando le arrowFunction posso referenziare, con this, l'oggetto esterno alla function
    rowValues.forEach((el) => {
      // this.colTmpl = this.tmplCol.content.cloneNode(true);
      // this.col = this.colTmpl.querySelector('span[col]');
      // this.col.innerHTML = el;
      // this.col.classList.add("column");
      // this.col.setAttribute("data-colID", this.row.childElementCount);
      // this.row.appendChild(this.col);

      let table = document.querySelector('table');
      let td = document.createElement('td');
      td.innerHTML = el;
      tr.appendChild(td);
    });

    // NOTE: L'utilizzo di this all'interno della function referenzia la function stessa, non ho possibilità di fare riferimento a this di un oggetto esterno
    // alla function
    // rowValues.forEach(function(el) {
    //   console.log(this.row);
    // });
  }

  calcColumns() {
    // let colsCount = this.headerSection.querySelector('div[row]').childElementCount;
    let colsCount = this.headerSection.querySelectorAll('span[col]:not([hidden])').length;
    // let colsCount = this.headerSection.querySelectorAll('div[row]:not([hidden])');
    this.headerSection.querySelector('div[row]').style.gridTemplateColumns = "repeat("+colsCount+", calc(100% / "+colsCount+"))";
    // console.log(this.bodySection);
    // recupero tutte le righe del body per calcolarne il gridTemplateColumns
    this.bodySection.querySelectorAll('div[row]').forEach((row) => {
      row.style.gridTemplateColumns = "repeat("+colsCount+", calc(100% / "+colsCount+"))";
    });
  }

  draw() {
    // this.option();
    // this.optionTEST();
    // this.calcColumns();
  }

  option() {
    // console.log(this.options);
    this.propertyOpt = this.options.cols; // vanno ciclate le proprietà impostate nelle options
    // console.log(this.propertyOpt);
    // console.log(this.propertyOpt[0].col);
    let col = this.propertyOpt[0].col; // index della colonna impostato
    // console.log(this.propertyOpt[0].visible);
    // console.log(this.table.querySelectorAll('span[col][data-colID="'+col+'"]')); // elenco della colonna
    this.table.querySelectorAll('span[col][data-colID="'+col+'"]').forEach((el) => {
      // console.log(el);
      // el.hidden = true;
      // el.classList.remove('column');
      // el.parentElement.removeChild(el);
    });

  }
}
