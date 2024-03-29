class Queries {
	#select;
	#obj;
	#table;
	#column;
	#firstTable; // la prima tabella della gerarchia, da qui posso ottenere la from e la join
	#joinId;
	constructor() {
		this.#select = {};
		this.#obj = {}; // object generico
		this._fromSet = new Set();
		this._where = {};
		this._factRelation = {};
		this._filter = {}
		this._metrics = {};
		this._filteredMetrics = {};
		this.#firstTable = {};
	}

	set table(value) {this.#table = value;}

	get table() {return this.#table;}

	set tableId(value) {this._tableId = value;}

	get tableId() {return this._tableId;}

	set field(value) {this._field = value;}

	get field() {return this._field;}

	set fieldType(value) {this._fieldType = value;}

	get fieldType() {return this._fieldType;}

	set from(value) {
		// this._fromArray.push(value); // TODO: probabilmente questo non viene mai utilizzato (da verificare)
		this._fromSet.add(value);
		console.log('from : ', this._fromSet);
	}

	get from() {return this._fromSet;}

	addTables() {
		if ( !this.#firstTable.hasOwnProperty('tableId')) this.#firstTable = {tableId : this._tableId, table : this.table};

		if ( +this.#firstTable.tableId > +this._tableId ) {
			this.#firstTable = {tableId : this._tableId, table : this.table};
		}
		console.log('#firstTable : ', this.#firstTable);
	}

	get tables() {return this.#firstTable;}


	deleteFrom(tableName) {
		this._fromSet.delete(tableName);
		console.log('_from : ', this._fromSet);
	}

	set filterName(value) {this._filterName = value};

	get filterName() {return this._filterName;}

	set columnName(value) {this.#column = value;}

	get columnName() {return this.#column;}

	set select(object) {
		// es.: this.#select[nometabella] = {field: nomecolonna, SQLFormat: (es.: date_format), 'alias': "Cod.Sede"}
		this.#obj = {};
		if (this.#select.hasOwnProperty(this.#column)) {
			// tabella già presente nell'object #select
			if (!this.#select[this.#column].hasOwnProperty(this._field)) {
				// field NON presente in #select[#table], lo aggiungo
				this.#select[this.#column][this._field] = object;
			}
		} else {
			// this.#obj[this._field] = object;
			this.#select[this.#column] = object;
		}
		console.log('select : ', this.#select);
	}

	get select() {return this.#select;}

	deleteSelect() {
		debugger;
		// TODO: da completare dopo la modifica della select
		delete this.#select[this.#column];
		// if (Object.keys(this.#select).length === 0) delete this.#select;
		// if (Object.keys(this.#select).length === 0) unset this.#select;

		console.log('select : ', this.#select);
	}

	getAliasColumn() {
		return this.#select[this.#table][this._field]['alias'];
	}

	set joinId(value) {this.#joinId = value;}

	get joinId() {return this.#joinId;}

	set where(join) {
		console.log('join : ', join);
		this._where[this.#joinId] = join;
		console.log('where : ', this._where);
	}

	deleteWhere() {
		delete this._where[this.#joinId];
		console.log('where : ', this._where);	
	}

	get where() {return this._where;}

	set factRelation(dimension) {
		// console.log('dimName : ', dimension.name);
		this._factRelation[dimension.name] = dimension.cubes;
		console.log('_factRelation : ', this._factRelation);
	}

	get factRelation() {this._factRelation;}

	deleteFactRelation(dimName) {
		debugger;
		delete this._factRelation[dimName];
		console.log('_factRelation : ', this._factRelation);
	}

	set filters(object) {
		this.#obj = {};
		if (this._filter.hasOwnProperty(this.#table)) {
			// tabella già presente nell'object #select
			if (!this._filter[this.#table].hasOwnProperty(this._filterName)) {
				this._filter[this.#table][this._filterName] = object;
			}
		} else {
			this.#obj[this._filterName] = object;
			this._filter[this.#table] = this.#obj;
		}
		// *********************
		// this._filter[this._filterName] = {table : object.table, formula : object.formula};
		console.log('filter : ', this._filter);
	}

	get filters() {return this._filter};

	deleteFilter() {
		delete this._filter[this.#table][this.filterName];
		// se, per questa tabella non ci sono altri filtri, elimino anche la property this.#table
		if (Object.keys(this._filter[this.#table]).length === 0) delete this._filter[this.#table];
		console.log('filter : ', this._filter);
	}

	set metricName(value) {this._metricName = value;}

	get metricName() {return this._metricName;}

	set metrics(object) {
		debugger;
		// object = {sqlFunction: "SUM", field: "NettoRiga", metricName: "netto riga", distinct: false, alias: "Venduto"}
		this._metrics[this._metricName] = object;
		console.log('metrics : ', this._metrics);
		// NOTE: object metric da salvare in storage
		    /*matricName: 
				type: "METRIC"
				name: "n"
				formula: {
					SQLFunction: "SUM", table: "DocVenditaDettaglio", field: "NettoRiga", distinct: false, alias: "netto"
					}
		    */
	}

	get metrics() {return this._metrics;}

	deleteMetric() {
		debugger;
		delete this._metrics[this._metricName];
		console.log('_metrics : ', this._metrics);
	}

	set filteredMetrics(object) {
		console.log(object);
		this._filteredMetrics[this._metricName] = object;
		console.log(this._filteredMetrics);
		/*matricName: 
				type: "METRIC"
				name: "n"
				formula: {
					SQLFunction: "SUM", table: "DocVenditaDettaglio", field: "NettoRiga", distinct: false, alias: "netto", 
					filters: {
						glm:
							type: "FILTER"
							name: "glm"
							table: "Azienda"
							formula: "Azienda.id = 43"}
					}
		    */
	}

	get filteredMetrics() {return this._filteredMetrics;}

	deleteFilteredMetric() {
		debugger;
		delete this._filteredMetrics[this._metricName];
		console.log('_filteredMetrics : ', this._filteredMetrics);
	}

	save(processId, name) {
		this._reportProcess = {};
		this._reportProcess['select'] = this.#select;
		this._reportProcess['from'] = Array.from(this._fromSet); // converto il set in un array
		this._reportProcess['where'] = this._where;
		this._reportProcess['factJoin'] = this._factRelation;
		this._reportProcess['filters'] = this._filter;
		this._reportProcess['metrics'] = this._metrics;
		this._reportProcess['filteredMetrics'] = this._filteredMetrics;
		this._reportProcess['processId'] = processId; // questo creerà il datamart FX[processId]
		//  al posto del processId voglio utilizzare il nome del report legato alla FX_
		this._reportProcess['name'] = name;
		this._reportProcess['type'] = 'PROCESS';

		window.localStorage.setItem('process_' + name, JSON.stringify(this._reportProcess));

	}

	getJSONProcess(value) {
		return JSON.parse(window.localStorage.getItem('process_' + value));
	}
}