class Queries {
	constructor() {
		this._select = {};
		this._from = {};
		this._where = {};
		this._filter = {}
		this._groupBy = {};
	}

	set table(value) {this._table = value;}

	get table() {return this._table;}

	set field(value) {this._field = value;}

	get field() {return this._field;}

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

	set filters(object) {
		this._obj = {};
		this._obj[this._field] = object;
		this._filter[this._table] = this._obj;
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



	
}