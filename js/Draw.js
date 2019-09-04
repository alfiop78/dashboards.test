class Draw {
  constructor() {
    this.headerSection = document.querySelector('section[header]');
    this.bodySection = document.querySelector('section[body]');
    this.tmplCol = document.getElementById('col');
    this.tmplRow = document.getElementById('row');

  }

  addColumn(colName) {
    this.col = this.tmplCol.content.cloneNode(true);
    this.col.querySelector('span[col]').innerHTML = colName;
    this.headerSection.querySelector('div[row]').appendChild(this.col);
  }

  addRow(rowValues) {
    console.log(rowValues);
    this.rowT = this.tmplRow.content.cloneNode(true);
    this.row = this.rowT.querySelector('div[row]');
    let row = this.rowT.querySelector('div[row]');
    this.colT = this.tmplCol.content.cloneNode(true);
    let col = this.colT.querySelector('span[col]');
    // console.log(this.col.querySelector('span[col]'));
    // console.log(rowValues.length);
    this.bodySection.appendChild(row);
    for (let i in rowValues) {
      this.colT = this.tmplCol.content.cloneNode(true);
      let col = this.colT.querySelector('span[col]');
      col.innerHTML = rowValues[i];
      row.appendChild(col);

      console.log(addRow.row);
    }


    // rowValues.forEach(function(el) {
    //   col.innerHTML = el;
    //   row.appendChild(col);
    // });

  }
}
