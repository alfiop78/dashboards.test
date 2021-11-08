class Queries {
	constructor() {
		this._select = {};
		this._fromCubes = new Set(); // qui memorizzo solo i cubi, clausola FROM
		this._fromSet = new Set();
		this._whereMap = new Map();
		// this._fromArray = [];
		this._where = {};
		this._factRelation = {};
		this._filter = {}
		this._groupBy = {};
		this._metrics = {};
		this._filteredMetrics = {};
	}

	set table(value) {this._table = value;}

	get table() {return this._table;}

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

	deleteFrom(tableName) {
		this._fromSet.delete(tableName);
		console.log('_from : ', this._fromSet);
	}

	set filterName(value) {this._filterName = value};

	get filterName() {return this._filterName;}

	set select(object) {
		// es.: this._select[nometabella] = {field: nomecolonna, SQLFormat: (es.: date_format), 'alias': "Cod.Sede"}
		this._obj = {};
		if (this._select.hasOwnProperty(this._table)) {
			// tabella già presente nell'object _select
			if (!this._select[this._table].hasOwnProperty(this._field)) {
				// field NON presente in _select[_table], lo aggiungo
				this._select[this._table][this._field] = object;
			} /*else {
				delete this._select[this._table][this._field];
			}*/
		} else {
			this._obj[this._field] = object;
			this._select[this._table] = this._obj;
		}
		console.log('select : ', this._select);
	}

	get select() {return this._select;}

	deleteSelect() {
		delete this._select[this._table][this._field];
		// verifico se this._select[this._table] contiene altri elementi, se non li contiene elimino anche la proprietà che include il nome della tabella
		if (Object.keys(this._select[this._table]).length === 0) delete this._select[this._table];

		console.log('select : ', this._select);
	}

	getAliasColumn() {
		return this._select[this._table][this._field]['alias'];
	}

	set joinId(value) {this._joinId = value;}

	get joinId() {return this._joinId;}

	set where(join) {
		console.log('join : ', join);
		this._where[this.joinId] = join;
		// this._where = join;
		debugger;
		// const key = Object.keys(join);
		// this._where = this._joinId;
		// let w = {};
		// for ( const [k, v] of Object.entries(join)) {
		// 	// w[k] = v;
		// 	// this._where[k] = v;
		// }
		// this._where[this._joinId] = w;
		console.log('where : ', this._where);
	}

	get where() {return this._where;}

	set factRelation(dimension) {
		console.log('dimName : ', dimension.name);
		this._factRelation[dimension.name] = dimension.cubes;
		console.log('fact join : ', this._factRelation);
	}

	get factRelation() {this._factRelation;}

	set filters(object) {
		this._filter[this._filterName] = object;
		console.log('filter : ', this._filter);
		// NOTE: object filter salvato in storage
		    /* filter_name: {
		        'formula' : "id_Azienda = 43",
		        'table' : 'Azienda',
		        'TYPE' : 'FILTER'
		        'name' : nome del filtro
		    }
		    */
	}

	get filters() {return this._filter};

	deleteFilter() {
		debugger;
		delete this._filter[this.filterName];
		console.log('filter : ', this._filter);
	}

	set groupBy(object) {
		// aggiungo l'object per il group by
		// es.: this._groupBy[nometabella] = {field: nomecolonna, SQLFormat: (es.: date_format)}
		this._obj = {};
		if (this._groupBy.hasOwnProperty(this._table)) {
			// tabella già presente nell'object _select
			if (!this._groupBy[this._table].hasOwnProperty(this._field)) {
				// field NON presente in _groupBy[_table], lo aggiungo
				this._groupBy[this._table][this._field] = object;
			}
		} else {
			this._obj[this._field] = object;
			this._groupBy[this._table] = this._obj;
		}
		console.log('groupBy : ', this._groupBy);
	}

	get groupBy() {return this._groupBy;}

	deleteGroupBy() {
		delete this._groupBy[this._table][this._field];
		// verifico se this._select[this._table] contiene altri elementi, se non li contiene elimino anche la proprietà che include il nome della tabella
		if (Object.keys(this._groupBy[this._table]).length === 0) delete this._groupBy[this._table];

		console.log('groupBy : ', this._groupBy);
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

	addFromCubes(value) {
		this._fromCubes.add(value);
		console.log('fromCubes : ', this._fromCubes);
	}

	deleteFromCubes(value) {
		this._fromCubes.delete(value);
		console.log('fromCubes : ', this._fromCubes);
	}

	save(processId, name) {
		this._reportProcess = {};
		this._reportProcess['select'] = this._select;
		debugger;
		this._reportProcess['from'] = Array.from(this._fromSet); // converto il set in un array
		this._reportProcess['where'] = this._where;
		this._reportProcess['factJoin'] = this._factRelation;
		this._reportProcess['filters'] = this._filter;
		this._reportProcess['groupBy'] = this._groupBy;
		this._reportProcess['metrics'] = this._metrics;
		this._reportProcess['filteredMetrics'] = this._filteredMetrics;
		this._reportProcess['processId'] = processId; // questo creerà il datamart FX[processId]
		this._reportProcess['name'] = name;
		this._reportProcess['type'] = 'PROCESS';

		window.localStorage.setItem('process_' + name, JSON.stringify(this._reportProcess));

	}

	getJSONProcess(value) {
		return JSON.parse(window.localStorage.getItem('process_' + value));
	}
}