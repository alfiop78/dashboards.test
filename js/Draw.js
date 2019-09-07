class Draw {
  constructor(table, options) {
    /*
    * table è il riferimento all'elemento table nel DOM
    */
    // console.log(table);
    // console.log(options);
    this.options = options;
    this.table = table;
  }

  addColumn(colName) {
    let th = document.createElement('th');
    th.innerHTML = colName;
    this.table.querySelector('thead tr').appendChild(th);
  }

  addRow(rowValues) {
    this.tr = document.createElement('tr');
    this.tr.setAttribute('row', 'body');
    this.table.querySelector('tbody').appendChild(this.tr);

    // NOTE: Utilizzando le arrowFunction posso referenziare, con this, l'oggetto esterno alla function
    rowValues.forEach((el) => {
      this.td = document.createElement('td');
      this.td.innerHTML = el;
      this.tr.appendChild(this.td);
    });

    // NOTE: L'utilizzo di this all'interno della function referenzia la function stessa, non ho possibilità di fare riferimento a this di un oggetto esterno
    // alla function
    // rowValues.forEach(function(el) {
    //   console.log(this.row);
    // });
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
