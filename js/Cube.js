class Cube {
  
	constructor() {
		this._cube = {};
		this._metrics = {}; // contiene gli oggetti metriche
		this.arrMetrics = []; // accessibile dall'esterno
		this.relationId = 0;
		this._join = {};
		this._dimensions = []; // dimensioni selezionate da associare al cube
		this._associatedDimension = [];
	}

	set id(value) {this._id = value;}

	get id() {return this._id;}

	set title(value) {this._title = value;}

	get title() {return this._title;}

	set relations(value) {
		this._join['hier_'+this.relationId] = value;
	}

	get relations() {return this._join;}

	saveRelation(value) {
		// value : colSelected
		value.forEach((el) => {
			el.setAttribute('data-rel-'+this.relationId, this.relationId);
			// el.setAttribute('data-relation-id', 'rel_'+this.relationId);
			el.setAttribute('data-relation-id', true);
			// la relazione è stata creata, posso eliminare [selected]
			el.removeAttribute('selected');
		});
	}

	set activeCard(card) {
		// la card è un obj contenente il riferimento nel DOM e il nome della tabella
		// console.log(card);
		this.card = card; // contiene {'ref': riferimento della card nel DOM, tableName: 'nometabella'}
		this.card.ref.setAttribute('name', card.tableName);
		this._tableName = card.tableName;
	}

	get activeCard() {return this.card;}

	set fieldSelected(value) {this._field = value;}

	get fieldSelected() {return this._field;}

	set metrics(field) {
		// TODO: da rivedere, utilizzare la stessa logica utilizzata in dimension.columns() per aggiungere/rimuovere la field selezionata
		if (!this._metrics.hasOwnProperty(this._tableName)) {this._arrMetrics = [];}

		this._arrMetrics.push(field);

		this._metrics[this._tableName] = this._arrMetrics;
		console.log(this._metrics);
	}

	get metrics() {return this._metrics;}

	set FACT(value) {this._fact = value;}

	get FACT() {return this._fact;}

	save() {
		this._cube.type = 'CUBE';
		this._cube.name = this._title;
		this._cube.metrics = this._metrics;
		// this._cube.relations = this._join; // questa deve essere salvata all'interno della dimensione, non nel cubo
		this._cube.FACT = this._fact;
		this._cube.id = this._id;
		this._cube.associatedDimensions = this._associatedDimension;
	}

	get cube() {return this._cube;}

	mode(value, text) {
		// imposto la modalità della card (relations, columns, filters, groupby,metrics)
		// console.log(this.activeCardRef);

		this.card.ref.setAttribute('mode', value);
		let info = this.card.ref.parentElement.querySelector('.info');
		info.removeAttribute('hidden');
		info.innerHTML = text;
	}

	set dimensionsSelected(value) {this._dimensions.push(value);}

	get dimensionsSelected() {return this._dimensions;}

	set associatedDimensions(dimensionName) {
		debugger;
		this._associatedDimension.push(dimensionName);
		// this._associatedDimension = obj;
	}

	get associatedDimensions() {return this._associatedDimension;}

}

class Dimension {
	#columns; // private
	#field;
	#table;
	constructor() {
		this._dimension = {};
		this._join = {}; // relazioni tra le tabelle
		this._hierarchies = {}; // ordine gerarchico
		this._lastTableInHierarchy;
		this.#columns = {}; // Object di colonne selezionate, queste potranno essere inserite nella creazione del report {'nometabella' : [array di colonne]}
		this.#field = {};
		this.relationId = 0;
	}

	set table(value) {this.#table = value;}

	get table() {return this.#table;}

	set id(value) {this._id = value;}

	get id() {return this._id;}

	set field(object) {this.#field = object;}

	get field() {return this.#field;}

	set activeCard(cardRef) {
		// la card su cui si sta operando
		this.card = cardRef;
		console.log(this.card);
		this._tableName = this.card.getAttribute('name');
	}

	get activeCard() {return this.card;}

	set title(value) {this._title = value;}

	get title() {return this._title;}

	set from(value) {this._from = value;}

	get from() {return this._from;}

	set hierarchies(value) {
		if (!this._join.hasOwnProperty(this.#table)) {
			this.relationId = 0;
			this._join[this.#table] = {[this.relationId] : value};
			// this._join[this.#table] = value;
			this.relationId++;
		} else {
			this._join[this.#table][this.relationId] = value;
		}
		console.log('this._join : ', this._join);
		
	}

	get hierarchies() {return this._join;}

	set hierarchyOrder(object) {
		console.log('object : ', object);
		this._hierarchies[object.title] = {order : object.hierarchyOrder};
		this._hierarchies[object.title]['columns'] = this.#columns;
		this._lastTableInHierarchy = object.hierarchyOrder[Object.keys(object.hierarchyOrder).length-1];
		console.log('this._hierarchies : ', this._hierarchies);
		console.log('this._lastTableInHierarchy : ', this._lastTableInHierarchy);
	}

	get hierarchyOrder() {return this._hierarchies;}

	saveRelation(value) {
		// value : colSelected
		value.forEach((el) => {
			el.setAttribute('data-rel-'+this.relationId, this.relationId);
			// el.setAttribute('data-relation-id', 'rel_'+this.relationId);
			el.setAttribute('data-relation-id', true);
			// la relazione è stata creata, posso eliminare [selected]
			el.removeAttribute('selected');
		});
	}

	columns() {
		this._obj = {};
		if (!this.#columns.hasOwnProperty(this._tableName)) {
			// #columns non ha l'attributo _tableName, lo aggiungo
			this._obj[this.#field.field] = this.#field.type;
			this.#columns[this._tableName] = this._obj;
		} else {
			// tabella già presente, verifico se il campo è già presente, se non lo è lo aggiungo altrimenti lo elimino
			if (!this.#columns[this._tableName].hasOwnProperty(this.#field.field)) {
				// field non esistente per questa tabella, lo aggiungo
				this.#columns[this._tableName][this.#field.field] = this.#field.type;
			} else {
				// field già esiste per questa tabella, lo elimino
				delete this.#columns[this._tableName][this.#field.field];
			}
		}
		console.log('this.#columns : ', this.#columns);
	}

	save() {
		debugger;
		this._dimension.type = 'DIMENSION';
		// TODO Aggiungere dimensionId
		// this._dimension.columns = this.#columns;
		this._dimension.name = this._title;
		this._dimension.from = this._from;
		this._dimension.join = this._join;
		this._dimension.cubes = {}; // object con i nomi dei cubi che hanno associazione con questa dimensione. Questa viene popolata quando si associa la dimensione al cubo
		this._dimension.lastTableInHierarchy = this._lastTableInHierarchy;
		this._dimension.hierarchies = this._hierarchies;
		console.log(this._dimension);
	}

	get dimension() {return this._dimension;}

}