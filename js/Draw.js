class Draw {
  constructor(table, options) {
    /*
    * table è il riferimento all'elemento table nel DOM
    */
    this.options = options;
    this.table = table;
    this.paramsParent = document.querySelector('section[params] > div.params')
  }

  addColumn(colName) {
    this.th = document.createElement('th');
    this.th.innerHTML = colName;
    this.table.querySelector('thead tr').appendChild(this.th);
  }

  addParams(colName, datalistId) {
    // TODO: aggiungo anche il filtro per ogni colonna, deciderò successivamente, nelle opzioni, se visualizzarlo o meno.
    this.tmplParams = document.getElementById('params');
    this.tmplContent = this.tmplParams.content.cloneNode(true);
    this.params = this.tmplContent.querySelector('div.md-field');
    this.params.querySelector('input').setAttribute('list', "datalist-"+datalistId);
    this.params.querySelector('datalist').id = "datalist-"+datalistId;
    this.params.querySelector('label').setAttribute('for', "param-"+datalistId);
    this.params.querySelector('input').id = "param-"+datalistId;
    this.paramsParent.appendChild(this.params);
  }

  createDatalist() {
    // console.log(this.table.cols.length);
    console.log(this.table.rows.length);
    this.tbody = this.table.querySelector('tbody');
    let arrTest = [];
    for (let i = 0; i < this.tbody.rows.length; i++) {
      // console.log(this.tbody.rows[i]);
      // console.log(this.tbody.rows[i].cells[0]);
      // console.log(this.tbody.rows[i].cells);

      for (let c = 0; c < this.tbody.rows[i].cells.length; c++) {
        // console.log(this.tbody.rows[i].cells[c]);
        let arr = [c, this.tbody.rows[i].cells[c].innerHTML];
        arrTest.push(arr);
      }


    }
    console.log(arrTest);
  }

  addRow(rowValues) {
    // console.log(rowValues);
    this.tr = document.createElement('tr');
    this.tr.setAttribute('row', 'body');
    this.table.querySelector('tbody').appendChild(this.tr);

    // NOTE: Utilizzando le arrowFunction posso referenziare, con this, l'oggetto esterno alla function
    rowValues.forEach((el, i) => {
      // el contiene il valore della cella
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
    // TODO: qui si dovrebbe impostare una class che applica una transition per visualizzare la table
    this.option();
  }

  option() {
    console.log(this.options);
    console.log(Object.keys(this.options));

  }

}
