class Cube {

  constructor() {
    this.cube = new Object();
    this.dimension = new Object();
    this.hierarchyFact = new Object(); // Oggetto che contiene un'array di gerarchie (memorizzato in this.hierarchies)
    this.hierarchyTable = new Object(); // Oggetto che contiene un'array di gerarchie (memorizzato in this.hierarchies)
    this.columns = new Object();
    this.cols = [];
    this.filters = new Object(); // contiene l'array di colonne che andranno nella WHERE come condizioni
    this.conditionsColName = [];
    this.metrics = new Object(); // metriche non filtrate
    this.filteredMetrics = new Object(); // metriche filtrate
    this.colsMetrics = [];
    this.colsFilteredMetrics = [];
    this.groupBy = new Object();
    this.colsGroupBy = [];
    this.relationId = 0;
    this.dialogFilters = document.getElementById('filter-setting');
    this.dialogMetrics = document.getElementById('metric-setting');
    this.dialogColumns = document.getElementById('column-setting');
    this.dialogGroupBy = document.getElementById('groupby-setting');

  }

  set cubeTitle(value) {this.cube_title = value;}
  get cubeTitle() {return this.cube_title;}

  set dimensionTitle(value) {this.dimension_title = value;}
  get dimensionTitle() {return this.dimension_title;}

  set table(value) {
    this.tableSelected = value;
    // console.log(this.tableSelected);
    this.activeCardRef.setAttribute('name', this.tableSelected);
    this.activeCardRef.querySelector('h5').innerText = this.tableSelected;
  }

  get table() {return this.tableSelected;}

  set activeCard(cardRef) {this.activeCardRef = cardRef;}

  get activeCard() {return this.activeCardRef;}

  handlerColumns(e) {
    // console.log(e.path);
    this.activeCard = e.path[3];
    // console.log(e.target);
    let tableName = this.activeCardRef.getAttribute('name');
    let fieldName = e.target.getAttribute('label');
    // se la card/table [active] non ha gli attributi [hierarchies] oppure [filters] oppure [columns] disabilito la selezione delle righe
    // questo perchè, se non si specifica prima cosa si vuol fare con le colonne selezionate, non abilito la selezione
    // [hierarchies] : consente di inserire una relazione tra le due tabelle, selezionando una colonna per ciascuna tabella
    // [filter] : consente di impostare le colonne che saranno utilizzate come filtri nella query
    // [columns] : consente di selezionare le colonne che verranno mostrate nella SELECT della query (quindi nel corpo della table, sul dashboard)
    // console.log(this.activeCardRef.attributes);
    let attributes = this.activeCardRef.attributes;
    // console.log(this.activeCardRef);
    for (let i = 1; i < attributes.length; i++) {
      // i = 1 perchè il primo attributo è certamente [class]
      // console.log(attributes[i].name);
      switch (attributes[i].name) {
        case 'hierarchies':
          // se è presente un altro elemento coon attributo hierarchy ma NON data-relation-id, "deseleziono" quello con hierarchy per mettere [hierarchy]
          // ...a quello appena selezionato, in questo modo posso selezionare solo una colonna per volta ad ogni relazione da creare
          // se però, viene cliccato una colonna con già una relazione impostata (quindi ha [data-relationn-id]) elimino la relazione da
          // ...entrambe le tabelle tramite un identificatifo di relazione

          if (e.target.hasAttribute('data-relation-id')) {
            /* oltre a fare il toggle dell'attributo, se questa colonna era stata già messa in
            relazione con un altra tabella (quindi attributo [data-relation-id] presente) elimino anche la relazione tra i due campi.
            Bisogna eliminarla sia dal DOM, eliminando [data-relation-id] che dall'array this.hierarchy
            */
            e.target.toggleAttribute('selected');
            // TODO: recupero tutti gli attributi di e.target e vado a ciclare this.removeHierarchy(relationId) per verificare uno alla volta quale posso eliminare
            for (let name of e.target.getAttributeNames()) {
              // console.log(name);
              let relationId, value;
              if (name.substring(0, 9) === "data-rel-") {
                relationId = name;
                value = e.target.getAttribute(name);
                this.removeHierarchy(relationId, value);
              }

            }

          } else {
            let liRelationSelected = this.activeCardRef.querySelector('li[hierarchy]:not([data-relation-id])');
            // console.log(liRelationSelected);
            e.target.toggleAttribute('hierarchy');
            e.target.toggleAttribute('selected');
            // se ho selezionato una colonna diversa da quella già selezionata, rimuovo la selezione corrente e imposto quella nuova
            // se è stata selezionata una colonna già selezionata la deseleziono
            if (liRelationSelected && (liRelationSelected.id !== e.target.id)) {
              liRelationSelected.toggleAttribute('hierarchy');
              liRelationSelected.toggleAttribute('selected');
            }

          }
          this.createHierarchy();
          break;
        case 'columns':
          // console.log('columns');
          e.target.toggleAttribute('columns');
          e.target.parentElement.querySelector('#columns-icon').onclick = this.handlerColumnSetting.bind(this);
          if (!e.target.hasAttribute('columns')) {
            delete this.columns[tableName][fieldName];
          }
          console.log(this.columns);
          break;
        case 'filters':
          console.log('filters');
          e.target.toggleAttribute('filters');
          e.target.parentElement.querySelector('#filters-icon').onclick = this.handlerFilterSetting.bind(this);
          if (!e.target.hasAttribute('filters')) {
            // elimino il filtro impostato
            delete this.filters[tableName][fieldName];
          }
          console.log(this.filters);
          break;
        case 'groupby':
          console.log('groupby');
          e.target.toggleAttribute('groupby');
          e.target.parentElement.querySelector('#groupby-icon').onclick = this.handlerGroupBySetting.bind(this);
          if (!e.target.hasAttribute('groupby')) {
            // elimino la colonna selezionata per il groupby
            delete this.groupBy[tableName][fieldName];
          }
          console.log(this.groupBy);
          break;
        case 'metrics':
          console.log('metrics');
          e.target.toggleAttribute('metrics');
          e.target.parentElement.querySelector('#metrics-icon').onclick = this.handlerMetricSetting.bind(this);
          if (!e.target.hasAttribute('metrics')) {
            delete this.metrics[tableName][fieldName];
          }
          console.log(this.metrics);
          break;
      }

    }
  }

  handlerColumnSetting(e) {
    // apro la dialog column-setting
    let fieldName = this.dialogColumns.querySelector('#fieldName');
    fieldName.innerHTML = e.path[1].querySelector('li').getAttribute('label');

    this.dialogColumns.showModal();
    // aggiungo evento al tasto ok per memorizzare il filtro e chiudere la dialog
    this.dialogColumns.querySelector('#btnColumnDone').onclick = this.handlerBtnColumnDone.bind(this);
    this.dialogColumns.querySelector('#btnColumnCancel').onclick = this.handlerBtnColumnCancel.bind(this);
  }

  handlerGroupBySetting(e) {
    // apro la dialog groupby-setting
    let fieldName = this.dialogGroupBy.querySelector('#fieldName');
    fieldName.innerHTML = e.path[1].querySelector('li').getAttribute('label');

    this.dialogGroupBy.showModal();
    // aggiungo evento al tasto ok per memorizzare il filtro e chiudere la dialog
    this.dialogGroupBy.querySelector('#btnGroupByDone').onclick = this.handlerBtnGroupByDone.bind(this);
    this.dialogGroupBy.querySelector('#btnGroupByCancel').onclick = this.handlerBtnGroupByCancel.bind(this);
  }

  handlerFilterSetting(e) {
    // console.log(e);
    // appro la dialog per filters
    let fieldName = this.dialogFilters.querySelector('#fieldName');
    fieldName.innerHTML = e.path[1].querySelector('li').getAttribute('label');

    this.dialogFilters.showModal();
    // aggiungo evento al tasto ok per memorizzare il filtro e chiudere la dialog
    this.dialogFilters.querySelector('#btnFilterDone').onclick = this.handlerBtnFilterDone.bind(this);
    this.dialogFilters.querySelector('#btnFilterCancel').onclick = this.handlerBtnFilterCancel.bind(this);
  }

  handlerMetricSetting(e) {
    // appro la dialog per filters
    // console.log(e);
    // visualizzo la lista dei filtri creati, per poterli associare alla metrica
    this.createFiltersList();

    let fieldName = this.dialogMetrics.querySelector('#fieldName');
    fieldName.innerHTML = e.path[1].querySelector('li').getAttribute('label');

    this.dialogMetrics.showModal();
    // resetto i campi della dialog
    // TODO: dovrò vedere se ho cliccato su una metrica già impostata, se già impostata, presente in this.metrics,
    // ...ripropongo i dati precedentemente salvati, altrimenti azzero la dialog
    document.getElementById('alias-metric').value = "";
    document.getElementById('checkbox-distinct').checked = false;

    document.querySelectorAll('#metric-filters > li').forEach((filter) => {
      filter.removeAttribute('selected');
    });
    // aggiungo evento al tasto ok per memorizzare il filtro e chiudere la dialog
    this.dialogMetrics.querySelector('#btnMetricDone').onclick = this.handlerBtnMetricDone.bind(this);
    this.dialogMetrics.querySelector('#btnMetricCancel').onclick = this.handlerBtnMetricCancel.bind(this);

  }

  handlerBtnColumnDone(e) {
    // TODO: salvo l'alias per la colonna
    let tableName = this.activeCardRef.getAttribute('name');
    let fieldName = this.dialogColumns.querySelector('#fieldName').innerText;
    let alias = document.getElementById('alias-column').value;

    // quando viene selezionata un'altra tabella, rispetto a quella che è stata già inserita nell'Object, deve resettare this.cols
    // ...altrimenti le colonne contentute in this.cols vengono aggiunte anche alla nuova tabella
    // TODO: verifico se la tabella su cui si sta operando è già inserita nell'object
    // console.log(this.columns[tableName]);
    // console.log(this.columns.hasOwnProperty(tableName));
    if (!this.columns.hasOwnProperty(tableName)) {this.cols = [];}

    this.cols.push({fieldName, 'sqlFORMAT': null, alias}); // OK 1
    // console.log(this.cols);
    let objColumnsParam = {}; // qui inserisco i parametri della colonna (es.: formattazione, alias, ecc...)
    this.cols.forEach((col) => {
      // col è un object contenente {fieldName, 'sqlFORMAT': null, alias}
      // console.log(col);
      // Inserisco come key il nome del campo, in modo da poter fare il delete this.columns[tablenName][fieldName] quando la colonna viene deselezionata
      objColumnsParam[col.fieldName] = col;
    });
    // console.log(objColumnsParam);

    // this.columns[tableName] = {'campo1': {'sqlFormat': 'DATE_FORMAT', alias}, 'campo2': {'sqlFormat': 'DATE_FORMAT', alias}}; // TEST

    this.columns[tableName] = objColumnsParam;
    console.log(this.columns);
    this.dialogColumns.close();
  }

  handlerBtnGroupByDone(e) {
    // TODO: salvo l'alias per il GroupBy
    let tableName = this.activeCardRef.getAttribute('name');
    let fieldName = this.dialogGroupBy.querySelector('#fieldName').innerText;

    console.log(this.groupBy.hasOwnProperty(tableName));
    if (!this.groupBy.hasOwnProperty(tableName)) {this.colsGroupBy = [];}

    this.colsGroupBy.push({fieldName, 'sqlFORMAT': null});

    let objParam = {}; // qui inserisco i parametri della colonna (es.: formattazione, alias, ecc...)
    this.colsGroupBy.forEach((col) => {
      objParam[col.fieldName] = col;
    });

    this.groupBy[tableName] = objParam;
    console.log(this.groupBy);
    this.dialogGroupBy.close();
  }

  handlerBtnColumnCancel(e) {this.dialogColumns.close();}

  handlerBtnGroupByCancel(e) {this.dialogGroupBy.close();}

  handlerBtnFilterDone() {
    let tableName = this.activeCardRef.getAttribute('name');
    let fieldName = this.dialogFilters.querySelector('#fieldName').innerText;
    let operator = this.dialogFilters.querySelector('#operator-list > li[selected]').innerText;
    let values = document.getElementById('filter-values').value;
    let filterName = document.getElementById('filter-name').value;

    if (!this.filters.hasOwnProperty(tableName)) {this.conditionsColName = [];}

    this.conditionsColName.push({'filterName' : filterName, 'fieldName' : fieldName, 'operator': operator, 'values': values});
    let objParam = {};
    this.conditionsColName.forEach((filter) => {objParam[filter.fieldName] = filter;});

    this.filters[tableName] = objParam;
    console.log(this.filters);
    this.dialogFilters.close();
  }

  createFiltersList() {
    // aggiungo il filtro creato alla dialog metric-setting in modo da poter associare i filtri a una determinata metrica
    // recupero l'elenco dei filtri già presenti in metric-filters, lo inserisco in un array per confrontarlo con this.filters
    let metricFiltersList = Array.from(this.dialogMetrics.querySelectorAll('#metric-filters > li'));
    // console.log(metricFiltersList);
    let arrMetricFilters = [];
    metricFiltersList.forEach((filter) => {arrMetricFilters.push(filter.getAttribute('filter-name'));});
    console.log(arrMetricFilters);

    if (Object.keys(this.filters).length > 0) {
      let metricFiltersUl = document.getElementById('metric-filters');
      console.log(this.filters);

      Array.from(Object.keys(this.filters)).forEach((table) => {
        console.log(table);
        // console.log(this.filters[table]);
        // per ogni tabella recupero i propri filtri per inserirli in un elenco
        Array.from(Object.keys(this.filters[table])).forEach((filter) => {
          console.log(filter);
          // verifico ogni filtro...
          // ...se questo filtro è già presente nell'elenco non lo inserisco
          if (!arrMetricFilters.includes(this.filters[table][filter].filterName) ) {
            let li = document.createElement('li');
            li.innerText = this.filters[table][filter].filterName;
            li.setAttribute('filter-name', this.filters[table][filter].filterName);
            li.setAttribute('table-name', table);
            li.setAttribute('field-name', this.filters[table][filter].fieldName);
            li.setAttribute('operator', this.filters[table][filter].operator);
            li.setAttribute('values', this.filters[table][filter].values);
            metricFiltersUl.appendChild(li);
            li.onclick = this.handlerFilterMetric;
          }
        });
      });
    }

  }

  handlerFilterMetric(e) {
    // selezione filtro da associare alla metrica
    // console.log(this);
    this.toggleAttribute('selected');
  }

  handlerBtnFilterCancel() {this.dialogFilters.close();}

  handlerBtnMetricDone() {
    let tableName = this.activeCardRef.getAttribute('name');
    let metricName = this.dialogMetrics.querySelector('#metric-name').value; // TODO: il nome non può contenere spazi ed altri caratteri da definire
    let fieldName = this.dialogMetrics.querySelector('#fieldName').innerText;
    let sqlFunction = document.querySelector('#function-list > li[selected]').innerText;
    let distinctOption = document.getElementById('checkbox-distinct').checked;
    let alias = document.getElementById('alias-metric').value;
    let arrFilters = [];
    let filters = {};
    // TODO: recupero i filtri impostati per questa metrica e li inserisco nell'array
    // document.querySelectorAll('#metric-filters > li[selected]').forEach((li) => {filters.push(li.getAttribute('filter-name'));});
    document.querySelectorAll('#metric-filters > li[selected]').forEach((li) => {
      // inserisco in filters l'object del filtro selezionato (e non solo il nome), successivamente elimino questo filtro dall'object filters di origine
      // quindi il filtro sarà applicato a livello metrica e non Report
      // recupero da this.filters il filtro selezionato
      console.log(this.filters[li.getAttribute('table-name')][li.getAttribute('field-name')]);

      arrFilters.push(this.filters[li.getAttribute('table-name')][li.getAttribute('field-name')]);

      arrFilters.forEach((filter) => {
        filters[li.getAttribute('table-name')] = filter;
      });
      console.log(filters);

      // se l'object this.filters[nometabella] non ha più nessun filtro al suo interno elimino anche this.filters[nometabella]
      if (Object.keys(this.filters[li.getAttribute('table-name')]).length === 0) {
        delete this.filters[li.getAttribute('table-name')];
      } else {
        delete this.filters[li.getAttribute('table-name')][li.getAttribute('field-name')];
      }

    });


    // aggiungo i filtri da associare a questa metrica
    if (!this.metrics.hasOwnProperty(tableName)) {this.colsMetrics = [];}
    let objParam = {};
    if (Object.keys(filters).length > 0) {
      // questa è una metrica filtrata
      this.colsFilteredMetrics.push({sqlFunction, fieldName, metricName, 'distinct' : distinctOption, 'aliasMetric' : alias, filters});
      this.colsFilteredMetrics.forEach((metric) => {objParam[metric.fieldName] = metric;});
      this.filteredMetrics[tableName] = objParam;
    } else {
      this.colsMetrics.push({sqlFunction, fieldName, metricName, 'distinct' : distinctOption, 'aliasMetric' : alias});
      this.colsMetrics.forEach((metric) => {objParam[metric.fieldName] = metric;});
      this.metrics[tableName] = objParam;
    }


    console.log(this.metrics);
    console.log(this.filteredMetrics);
    this.dialogMetrics.close();
  }

  handlerBtnMetricCancel() {
    this.dialogMetrics.close();
  }

  removeHierarchy(relationId, value) {
    console.log(relationId);
    console.log(value);
    console.log('delete hierarchy');
    /* prima di eliminare la gerarchia devo stabilire se le due card, in questo momento, sono in modalità hierarchies
    // ...(questo lo vedo dall'attributo presente su card-table)
    // elimino la gerarchia solo se la relazione tra le due tabelle riguarda le due tabelle attualmente impostate in modalità [hierarchies]
    // se la relazione riguarda le tabelle A e B e attualmente la modalità = A e B allora elimino la gerarchia
    // altrimenti se la relazione riguarda A e B e attualmente la modalità impostata [hierarchies] riguarda B e C aggiungo la relazione e non la elimino
    */
    // elementi li che hanno la relazione relationId
    let liElementsRelated = document.querySelectorAll('.card-table[hierarchies] li[data-relation-id]['+relationId+']').length;

    if (liElementsRelated === 2) {
      // tra le due tabelle attualmente .card-table[hiearachies] non esiste questa relazione, per cui si sta creando una nuova relazione
      // ci sono due colonne che fanno parte di "questa relazione" (cioè delle due tabelle attualmente in modalità [hierarchies]) quindi possono essere eliminate
      document.querySelectorAll('.card-table[hierarchies] ul > .element > li[data-relation-id]['+relationId+']').forEach((li) => {
        console.log('elimino li :'+li.innerText);
        // TODO: se è presente un'altra relazione, quindi un altro attributo data-rel, NON elimino [hierarchy] e [data-relation-id]
        //... (per non eliminare l'icona) che fa riferimento ad un'altra relazione sulla stessa colonna (doppia chiave)
        li.removeAttribute(relationId);
        li.removeAttribute('selected');
        let relationFound = false; // altra relazione trovata ?
        // console.log(li.getAttributeNames());
        // console.log(li.getAttributeNames().indexOf('data-rel-'));
        li.getAttributeNames().forEach((attr) => {
          // console.log(attr.indexOf('data-rel-'));
          if (attr.indexOf('data-rel-') !== -1) {
            console.log('trovata altra relazione : '+attr);
            relationFound = true;
          }

        });
        if (!relationFound) {
          li.removeAttribute('data-relation-id');
          li.removeAttribute('hierarchy');
        }
      });
      delete this.hierarchyFact['hier_'+value];
      delete this.hierarchyTable['hier_'+value];
    }

  }

  createHierarchy() {
    // console.log('createHierarchy');
    let hier = [];
    this.colSelected = [];
    document.querySelectorAll('.card-table[hierarchies]').forEach((card) => {
      let tableName = card.getAttribute('name');
      // let liRef = card.querySelector('li[hierarchy]:not([data-relation-id])');
      let liRef = card.querySelector('li[hierarchy][selected]');
      if (liRef) {
        this.colSelected.push(liRef);
        hier.push(tableName+"."+liRef.innerText);
      }
      // console.log(hier);
      // per creare correttamente la relazione è necessario avere due elementi selezionati
      if (hier.length === 2) {
        this.relationId++;
        // se, in questa relazione è presente anche la tabella FACT rinomino hier_n in fact_n in modo da poter separare le gerarchie
        // e capire quali sono quelle con la fact (quindi legate al Cubo) e quali no (posso salvare la Dimensione, senza il legame con il Cubo)

        // 15.11 - Le relazioni tra tabelle hier_n le inserisco direttamente in this.dimension
        // console.log(card);
        (card.hasAttribute('fact-table')) ? this.hierarchyFact['hier_'+this.relationId] = hier : this.hierarchyTable['hier_'+this.relationId] = hier;
        // (card.hasAttribute('fact-table')) ? this.hierarchyFact['fact_'+this.relationId] = hier : this.hierarchyTable['hier_'+this.relationId] = hier;

        // visualizzo l'icona per capire che c'è una relazione tra le due colonne
        this.colSelected.forEach((el) => {
          el.setAttribute('data-rel-'+this.relationId, this.relationId);
          // el.setAttribute('data-relation-id', 'rel_'+this.relationId);
          el.setAttribute('data-relation-id', true);
          // la relazione è stata creata, posso eliminare [selected]
          el.removeAttribute('selected');
        });
        console.log(this.hierarchyFact);
        console.log(this.hierarchyTable);
      }
    });
  }

  changeMode() {
    /*
    * quando si imposta la modalità tra hierarchies, columns e filters resetto tutte le card-table
    */
    document.querySelectorAll('.hierarchies .card-table').forEach((card) => {
      if (card.hasAttribute("hierarchies")) {card.removeAttribute('hierarchies');}
      if (card.hasAttribute("columns")) {card.removeAttribute('columns');}
      if (card.hasAttribute("filters")) {card.removeAttribute('filters');}
      if (card.hasAttribute("groupby")) {card.removeAttribute('groupby');}
      if (card.hasAttribute("metrics")) {card.removeAttribute('metrics');}
      card.querySelector('.help').innerText = "";
    });

  }
}
