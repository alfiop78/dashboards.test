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
    this.colTmpl = this.tmplCol.content.cloneNode(true);
    this.col = this.colTmpl.querySelector('span[col]');
    this.col.innerHTML = colName;
    // aggiungo un id alla colonna
    this.col.setAttribute("data-colID", this.headerSection.querySelector('div[row]').childElementCount);
    this.headerSection.querySelector('div[row]').appendChild(this.col);
    // let colsCount = this.headerSection.querySelector('div[row]').childElementCount;
    // this.headerSection.querySelector('div[row]').style.gridTemplateColumns = "repeat("+colsCount+", calc(100% / "+colsCount+"))";
  }

  addRow(rowValues) {
    // TODO: imposto grid-template-column in base a quante colonne ci sono
    // console.log(this.bodySection);
    let colsCount = this.headerSection.querySelector('div[row]').childElementCount;
    // console.log(rowValues.length);
    // node
    this.rowNode = this.tmplRow.content.cloneNode(true);
    // elemento contenuto nel template
    this.row = this.rowNode.querySelector('div[row]');
    // lo aggiungo al DOM nella section body della tabella
    this.bodySection.appendChild(this.row);

    // NOTE: Utilizzando le arrwFunction posso referenziare, con this, l'oggetto esterno alla function
    rowValues.forEach((el) => {
      this.colTmpl = this.tmplCol.content.cloneNode(true);
      this.col = this.colTmpl.querySelector('span[col]');
      this.col.innerHTML = el;
      this.col.setAttribute("data-colID", this.row.childElementCount);
      this.row.appendChild(this.col);
      this.row.style.gridTemplateColumns = "repeat("+colsCount+", calc(100% / "+colsCount+"))";
    });
    // this.row.style.gridTemplateColumns = "repeat(4, calc(100% / 4))";

    // NOTE: L'utilizzo di this all'interno della function referenzia la function stessa, non ho possibilità di fare riferimento a this di un oggetto esterno
    // alla function
    // rowValues.forEach(function(el) {
    //   console.log(this.row);
    // });
  }

  calcColumns() {
    let colsCount = this.headerSection.querySelector('div[row]').childElementCount;
    this.headerSection.querySelector('div[row]').style.gridTemplateColumns = "repeat("+colsCount+", calc(100% / "+colsCount+"))";
  }

  draw() {
    this.calcColumns();
    this.option();
  }

  option() {
    console.log(this.options);
    this.propertyOpt = this.options.cols; // vanno ciclate le proprietà impostate nelle options
    console.log(this.propertyOpt);
    console.log(this.propertyOpt[0].col);
    let col = this.propertyOpt[0].col; // index della colonna impostato
    console.log(this.propertyOpt[0].visible);
    // console.log(this.table.querySelectorAll('span[col][data-colID="'+col+'"]')); // elenco della colonna
    this.table.querySelectorAll('span[col][data-colID="'+col+'"]').forEach((el) => {
      console.log(el);
      // el.hidden = true;
      el.parentElement.removeChild(el);
    });
    this.calcColumns();

  }
}
