class Draw {
  constructor(table, options) {
    /*
    * table è il riferimento all'elemento table nel DOM
    */
    this.options = options;
    this.table = table;
    this.paramsParent = document.querySelector('section[params] > div.params');
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
    this.params.querySelector('label').innerHTML = colName;
    this.params.querySelector('input').id = "param-"+datalistId;
    this.params.querySelector('input').setAttribute('data-param-id', datalistId);

    this.paramsParent.appendChild(this.params);
  }

  rebuildDatalist() {
    this.tbody = this.table.querySelector('tbody');
    let arrColumns = [];
    for (let c = 0; c < this.tbody.rows[0].cells.length; c++) {
      // per ogni colonna ciclo tutte le righe ed aggiungo gli elementi della colonna in un array
      // console.log(this.tbody.rows[i].cells[c]);
      // let arr = [c, this.tbody.rows[i].cells[c].innerHTML];
      let arrCols = [];

      for (let r = 0; r < this.tbody.rows.length; r++) {
        // TODO: se la row è nascosta non la inserisco nell'array
        // console.log(this.tbody.rows[r].getAttribute('hidden'));
        if (this.tbody.rows[r].getAttribute('found')) {
          arrCols.push(this.tbody.rows[r].cells[c].innerText);
        }

      }
      arrColumns.push(arrCols);

      let arrayUnique = arrColumns[c].filter((value, index, self) => self.indexOf(value) === index);
      // console.log(arrayUnique);
      this.datalist = document.getElementById('datalist-'+c);
      this.options = this.datalist.querySelectorAll('option');
      for (let i = 0; i < this.options.length; i++) {
        // console.log(this.options[i]);
        this.datalist.removeChild(this.options[i]);
      }
      arrayUnique.forEach((el, i) => {
        this.datalistOpt = document.createElement('option');
        this.datalistOpt.id = i;
        this.datalistOpt.value = el;
        this.datalist.appendChild(this.datalistOpt);
      });
    }
  }

  createDatalist() {
    // console.log(this.table.cols.length);
    console.log(this.table.rows.length);

    this.tbody = this.table.querySelector('tbody');
    let arrColumns = [];

    // console.log(this.tbody.rows[i]);
    // console.log(this.tbody.rows[i].cells[0]);
    // console.log(this.tbody.rows[i].cells);
    console.log(this.tbody.rows[0].cells.length);

    for (let c = 0; c < this.tbody.rows[0].cells.length; c++) {
      // per ogni colonna ciclo tutte le righe ed aggiungo gli elementi della colonna in un array
      // console.log(this.tbody.rows[i].cells[c]);
      // let arr = [c, this.tbody.rows[i].cells[c].innerHTML];
      let arrCols = [];

      for (let r = 0; r < this.tbody.rows.length; r++) {
        arrCols.push(this.tbody.rows[r].cells[c].innerHTML);
      }
      arrColumns.push(arrCols);

      // NOTE:  rimuovo elementi duplicati nell'array con l'utilizzo di array.filter
      /*
      callback
        Function is a predicate, to test each element of the array. Return true to keep the element, false otherwise. It accepts three arguments:
      element
        The current element being processed in the array.
      index Optional
        The index of the current element being processed in the array.
      array Optional
        The array filter was called upon.
      thisArg Optional
        Value to use as this when executing callback.
      */
      let arrayUnique = arrColumns[c].filter((value, index, self) => self.indexOf(value) === index);
      // console.log(arrayUnique);
      this.datalist = document.getElementById('datalist-'+c);
      arrayUnique.forEach((el, i) => {
        this.datalistOpt = document.createElement('option');
        this.datalistOpt.id = i;
        this.datalistOpt.value = el;
        this.datalist.appendChild(this.datalistOpt);
      });
    }
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
    // console.log(this.options);
    // console.log(Object.keys(this.options));

  }

}
