class Queries {
	constructor() {
		this._select = {};
		this._cols = [];

		this._from = {};
		this._where = {};
		this._groupBy = {};
	}

	set table(value) {this._table = value;}

	get table() {return this._table;}

	set field(value) {this._field = value;}

	get field() {return this._field;}

	set select(object) {
		this._obj = {};
		console.log(object);
		//this._cols.push({field, format, alias});
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



	
}