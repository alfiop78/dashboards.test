class Draw {
  constructor(table) {
    /*
    * table è il riferimento all'elemento table nel DOM
    */
    console.log(table);
    this.table = table;
    this.headerSection = table.querySelector('section[header]');
    this.bodySection = table.querySelector('section[body]');
    this.tmplCol = table.querySelector('#col');
    this.tmplRow = table.querySelector('#row');

  }

  addColumn(colName) {
    this.col = this.tmplCol.content.cloneNode(true);
    this.col.querySelector('span[col]').innerHTML = colName;
    this.headerSection.querySelector('div[row]').appendChild(this.col);
    let colsCount = this.headerSection.querySelector('div[row]').childElementCount;
    this.headerSection.querySelector('div[row]').style.gridTemplateColumns = "repeat("+colsCount+", calc(100% / "+colsCount+"))";
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
      this.colT = this.tmplCol.content.cloneNode(true);
      this.col = this.colT.querySelector('span[col]');
      this.col.innerHTML = el;
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
}
