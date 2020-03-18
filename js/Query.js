class Queries {
	constructor() {
		this._select = {};
		this._from = {};
		this._fromArray = [];
		this._where = {};
		this._factRelation = {};
		this._filter = {}
		this._groupBy = {};
		this._metrics = {};
		this._filteredMetrics = {};

	}

	set table(value) {this._table = value;}

	get table() {return this._table;}

	set field(value) {this._field = value;}

	get field() {return this._field;}

	set fieldType(value) {this._fieldType = value;}

	get fieldType() {return this._fieldType;}

	set from(value) {
		this._fromArray.push(value);
		// console.log(this._fromArray);
		this._from = this._fromArray;
	}

	get from() {return this._from;}

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
			}
		} else {
			this._obj[this._field] = object;
			this._select[this._table] = this._obj;
		}
		console.log(this._select);
	}

	get select() {return this._select;}

	getAliasColumn() {
		return this._select[this._table][this._field]['alias'];
	}

	set where(object) {
		this._where = object;
		console.log(this._where);
		
	}

	get where() {return this._where;}

	set factRelation(object) {
		this._factRelation = object;
		console.log(this._factRelation);
	}

	get factRelation() {this._factRelation;}

	set filters(object) {
		//this.obj = {};
		this._filter[this._filterName] = object;
		console.log(this._filter);
	}

	get filters() {return this._filters};

	set groupBy(object) {
		// aggiungo l'object per il group by
		// es.: this._groupBy[nometabella] = {field: nomecolonna, SQLFormat: (es.: date_format)}
		this._obj = {};
		console.log(object);
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
		console.log(this._groupBy);
	}

	get groupBy() {return this._groupBy;}

	set metricName(value) {this._metricName = value;}

	get metricName() {return this._metricName;}

	// set metrics(object) {
	// 	// object = {sqlFunction: "SUM", field: "NettoRiga", metricName: "netto riga", distinct: false, alias: "Venduto"}
	// 	this._obj = {};
	// 	if (this._metrics.hasOwnProperty(this._table)) {
	// 		// tabella già presente nell'object _select
	// 		if (!this._metrics[this._table].hasOwnProperty(this._field)) {
	// 			// field NON presente in _select[_table], lo aggiungo
	// 			this._metrics[this._table][this._field] = object;
	// 		}
	// 	} else {
	// 		this._obj[this._field] = object;
	// 		this._metrics[this._table] = this._obj;
	// 	}
	// 	console.log(this._metrics);
	// }

	set metrics(object) {
		console.log(object);
		// object = {sqlFunction: "SUM", field: "NettoRiga", metricName: "netto riga", distinct: false, alias: "Venduto"}
		this._metrics[this._metricName] = object;
		console.log(this._metrics);
	}

	get metrics() {return this._metrics;}

	save(reportId, name) {
		this._reportProcess = {};
		this._reportProcess['select'] = this._select;
		this._reportProcess['from'] = this._from;
		this._reportProcess['where'] = this._where;
		this._reportProcess['factJoin'] = this._factRelation;
		this._reportProcess['filters'] = this._filter;
		this._reportProcess['groupBy'] = this._groupBy;
		this._reportProcess['metrics'] = this._metrics;
		this._reportProcess['filteredMetrics'] = this._filteredMetrics;
		this._reportProcess['processId'] = reportId; // questo creerà il datamart FX[reportId]
		this._reportProcess['name'] = name;
		this._reportProcess['type'] = 'PROCESS';

		window.localStorage.setItem('process_' + name, JSON.stringify(this._reportProcess));

	}

	getJSONProcess(value) {
		return JSON.parse(window.localStorage.getItem('process_' + value));
	}



	
}