var App = new Application();
var Query = new Queries();
const Dim = new DimensionStorage();
var StorageCube = new CubeStorage();
var StorageProcess = new ProcessStorage();
var StorageFilter = new FilterStorage();

(() => {
	App.init();
	var app = {
		// templates
		tmplListField : document.getElementById('templateListField'),
		tmpl_ulList : document.getElementById('tmpl_ulList'),

		// btn		
		btnPreviousStep : document.getElementById('stepPrevious'),
		btnNextStep : document.getElementById('stepNext'),
		btnStepDone : document.getElementById('stepDone'),
		btnSaveAndProcess : document.getElementById('saveAndProcess'),
		btnSaveColumn : document.getElementById('btnSaveColumn'), // salvataggio di un alias/sql di colonna nella dialog dialogTables

		btnProcessReport : document.getElementById('btnProcessReport'), // apre la lista dei report da processare "Crea FX"

		// dialog
		dialogSaveReport: document.getElementById('dialogSaveReport'),
		dialogFilter : document.getElementById('dialogFilter'),
		// dialogColumn : document.getElementById('dialogColumn'),
		dialogTables : document.getElementById('dialogTables'),
		dialogMetric : document.getElementById('dialogMetric'),
		btnFilterSave : document.getElementById('btnFilterSave'), //tasto salva nella dialog filter
		btnFilterDone : document.getElementById('btnFilterDone'), //tasto fatto nella dialog filter
		btnColumnDone : document.getElementById('btnColumnDone'), // tasto ok nella dialogTables
		btnMetricDone : document.getElementById('btnMetricDone'), // tasto Salva nella dialogMetric
		btnSaveReport : document.getElementById('saveReport'),
		btnSaveReportDone: document.getElementById('btnReportSaveName'),
		
		btnBackPage : document.getElementById('mdcBack'), // da definire
		ulDimensions : document.getElementById('dimensions')
	};

	// la Classe Steps deve impostare alcune proprietà DOPO che viene visualizzato il body, non può essere posizionato prima di App.init();
	var Step = new Steps('stepTranslate');

	// 2021-10-19 click sul report da processare/elaborare. tasto "Process Report"
	app.handlerReportToBeProcessed = async (e) => {
		const label = e.target.getAttribute('label');
		console.log(label);
		const reportId = +e.target.getAttribute('data-id');
		console.log('reportId : ',reportId);
		let jsonData = window.localStorage.getItem(label);
		let jsonDataParsed = JSON.parse(window.localStorage.getItem(label));
		console.log(jsonDataParsed);
		const url = 'ajax/cube.php';
		const params = 'cube='+jsonData;
		console.log(params);
		debugger;
		const init = {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, method: 'POST', body: params};
		const req = new Request(url, init);

		await fetch(req)
			.then( (response) => {
			if (!response.ok) {throw Error(response.statusText);}
			return response;
			})
			.then( (response) => response.json())
			.then( (data) => {
				// console.log(data);
				if (data) {
					console.info('FX creata con successo !');
					// NOTE: qui ho creato la FX, a questo punto potrei scegliere di visualizzare il report, per il momento mi serve solo la FX.
					// per come ho gestito la creazione del report è troppo complesso, qui potrei, una volta ottenuto il risultato dalla FX, popolarla con GoogleChart DataTable, da valutare in futuro se serve.
					// app.getDatamart(reportId, jsonDataParsed); // recupero i dati dalla FX appena creata
				} else {
				  // TODO: no data
				  console.warning('FX non è stata creata');
				}
			})
		.catch( (err) => console.error(err));
	};

	// creo la lista degli elementi da processare
	app.datamartToBeProcessed = () => {
		const ul = document.getElementById('reportsProcess');
		const toProcess = StorageProcess.list(app.tmplListField, ul);
		// associo la Fn che gestisce il click sulle <li>
		ul.querySelectorAll('li').forEach( (li) => li.addEventListener('click', app.handlerReportToBeProcessed) );
	};

	// selezione del cubo step-1
	app.handlerCubeSelected = (e) => {
		const cubeId = e.currentTarget.getAttribute('data-cube-id');
		StorageCube.selected = e.currentTarget.getAttribute('label');
		console.log('cube selected : ', StorageCube.selected);
		e.currentTarget.toggleAttribute('selected');
		if (e.currentTarget.hasAttribute('selected')) {
			Query.addFromCubes(StorageCube.selected.FACT);	
			// aggiungo la fact table nella clausola FROM
			// Query.from = StorageCube.selected.FACT;
			// Query.addFromCubes(StorageCube.selected.FACT);
			// ...e la join presente nella fact, stabilita in Mapping
			// la join non è più presente nella fact ma nelle dimensioni
			// Query.factRelation = StorageCube.selected.relations;
			
			app.createListTableMetrics(StorageCube.selected.metrics, StorageCube.selected.name);
			
			// recupero l'object StorageCube dallo storage, con questo object recupero le dimensioni associate al cubo in 'associatedDimensions'
			// console.log(StorageCube.associatedDimensions(cubeName));
			let ul = document.getElementById('dimensions');
			// dimensioni associate al cubo selezionato
			const dimensions = StorageCube.associatedDimensions(StorageCube.selected.name);

			
		} else {
			Query.deleteFromCubes(StorageCube.selected.FACT);
		}
	};

	// selezione delle dimensioni da utilizzare per la creazione del report
	app.handlerDimensionSelected = (e) => {
		// imposto attributo selected sulle dimensioni selezionate
		e.currentTarget.toggleAttribute('selected');
		// popolo la sezione step 2, "colonne"
		// popolo anche lo step 3 che riguarda l'inserimento dei filtri, quindi deve essere popolato con le tabelle, compresa la fact
		const dimName = e.currentTarget.getAttribute('label');
		Dim.selected = dimName;
		console.log('Dimensione selezionata : ', Dim.selected);
		// nella dimensione selezionata c'è la join con il cubo
		// console.log('join fact : ', Dim.selected.cubes[StorageCube.selected.name]);
		console.log(Dim.selected.cubes[StorageCube.selected.name]); // relazione con il cubo presente nella dimensione
		// debugger;
		// for ( const [k, v] of Object.entries(Dim.selected.cubes[StorageCube.selected.name])) {
		// 	console.log('k : ', k);
		// 	console.log('v : ', v);
		// }
		// da valutare se passare le join a Query.where una alla volta (ciclo for) oppure passandogli tutto l'object che poi si va a ciclare all'iinterno del Query.where
		// debugger;
		Query.where = Dim.selected.cubes[StorageCube.selected.name];
		app.createListHierarchies(Dim.selected.hierarchies);

		// app.createListTableColumns(Dim.selected.columns);

		// app.createListTableFilters(Dim.selected.from);

		// l'elenco delle relazioni (key "hierarchies") lo devo prendere quando stabilisco le colonne da aggiungere alla FX.
		// Questo perchè nelle relazioni possono esserci tabelle i cui campi non li aggiungo alla FX, per cui non devono essere messe in join nella query finale
		// Es.: se scelgo le colonne Azienda.descrizione e Sede.Descrizione ma nella dimensione è presente anche ZonaVenditaCM, non devo aggiungere, nella where, la tabella ZonaVenditaCM (tabella non utilizzata nella clausola SELECT)
	};

	// crreo la lista delle gerarchie presenti nella dimensione selezionata
	app.createListHierarchies = (hierarchies) => {
		const ul = document.getElementById('dimension-hierarchies');
		console.log('ul dimension-hierarchies : ', ul);
		Object.keys(hierarchies).forEach( (hier, index) => {
			let elementTable = document.createElement('div');  
			elementTable.className = 'element';
			let li = document.createElement('li');
			li.innerText = hier;
			li.setAttribute('data-list-type', 'tables');
			li.setAttribute('label', hier);
			li.setAttribute('data-hier-id', index);
			elementTable.appendChild(li);
			ul.appendChild(elementTable);
			li.onclick = app.handlerHierSelected;

			// creo lista tabelle nello step "tabelle" 2
			app.createTableListForColumns(index, hierarchies[hier]);

			// creo lista tabelle nello step "filtri" 3
			app.createTableListForFilters(index, hierarchies[hier]);
		});
	};

	// creo l'elenco delle tabelle nel div fieldList-tables, nello step "Gerarchie/Tabelle"
	app.createTableListForColumns = (index, elements) => {
		let tmpl_ulList = document.getElementById('tmpl_ulList');
		let ulContent = tmpl_ulList.content.cloneNode(true);
		let ulTables = ulContent.querySelector('ul[data-id="fields-tables"]');
		const parentElement = document.getElementById('fieldList-tables'); // elemento a cui aggiungere la ul

		ulTables.setAttribute('data-hier-id', index);

		for (const [tableId, table] of Object.entries(elements)) {
			// inserisco i field della tabella, nascondo la lista per poi visualizzarla quando si clicca sul nome della tabella
			let content = app.tmplListField.content.cloneNode(true);
			let element = content.querySelector('.element');
			let li = element.querySelector('li');
			li.innerText = table;
			li.setAttribute('data-table-id', tableId);

			li.setAttribute('label', table);
			element.appendChild(li);
			ulTables.appendChild(element);
			li.onclick = app.handlerTableSelectedColumns; // tabella selezionata
		}
		parentElement.appendChild(ulTables);
	};

	// creo elenco tabelle nel div tableList-filter presente nello step Filtri
	app.createTableListForFilters = (index, elements) => {
		let tmpl_ulList = document.getElementById('tmpl_ulList');
		let ulContent = tmpl_ulList.content.cloneNode(true);
		let ulTables = ulContent.querySelector('ul[data-id="fields-tables"]');
		const parentElement = document.getElementById('tableList-filter'); // elemento a cui aggiungere la ul

		ulTables.setAttribute('data-hier-id', index); // questo id indicherà quale lista tabelle visualizzare, è la <ul> appartenente alla gerarchia

		for ( const [k, value] of Object.entries(elements)) {
			// elenco tabelle disponibili per ogni dimensione selezionata
			console.log('elements k: ', k);
			console.log('elements value: ', value);
			let content = app.tmplListField.content.cloneNode(true);
			let element = content.querySelector('.element');
			let li = element.querySelector('li');
			li.innerText = value;
			li.setAttribute('label', value);
			li.setAttribute('data-table-id', k);
			li.setAttribute('data-list-type', 'filter');
			element.appendChild(li);
			ulTables.appendChild(element);
			li.onclick = app.handlerTableSelectedFilter;
			// i.onclick = app.handlerAddFilter; // apro la dialog
			// per ogni tabella presente nella dimensione creo la lista con i filtri appartenenti alla tabella
			let ulContentFilters = tmpl_ulList.content.cloneNode(true);
			let ulFilters = ulContentFilters.querySelector('ul[data-id="fields-filter"]'); // conterrà l'elenco dei filtri per ogni tabella presente nella gerarchia
			ulFilters.setAttribute('data-table-id', k);
			const parentElement = document.getElementById('fieldList-existFilter'); // elemento a cui aggiungere la ul presa dal template tmpl_ulList

			console.log('lista filtri : ', StorageFilter.list(value));
			const filters = StorageFilter.list(value);

			for (const [name, value] of Object.entries(filters)) {
				let content = app.tmplListField.content.cloneNode(true);
				let element = content.querySelector('.element');
				let li = element.querySelector('li');
				li.innerText = name;
				li.setAttribute('label', name);
				element.appendChild(li);
				ulFilters.appendChild(element);
				li.onclick = app.handlerFilterSelected; // filtro selezionato
			}
			parentElement.appendChild(ulFilters);
		}
		parentElement.appendChild(ulTables);
	};

	// creo la lista delle tabelle nella sezione dello step 3 - Filtri
	/*app.createListTableFilters = (from) => {
		// console.log(from); // array
		let ul = document.getElementById('tables-filter');

		from.forEach((table, index) => {
			let li = document.createElement('li');
			let element = document.createElement('div');
			let i = document.createElement('i');
			element.className = 'element';
			li.innerText = table;
			i.className = 'material-icons md-18';
			i.innerText = 'add';
			i.setAttribute('label', table);
			li.setAttribute('data-table-id', index);
			li.setAttribute('data-list-type', 'filter');
			li.setAttribute('label', table);
			element.appendChild(li);
			element.appendChild(i);
			ul.appendChild(element);
			li.onclick = app.handlerTableSelectedFilter;
			i.onclick = app.handlerAddFilter; // apro la dialog
		});
	};*/

	app.createListTableMetrics = (metrics, cubeName) => {
		// ulTable conterrà le tabelle che hanno metriche (step-4 1° colonna)
		let ulTable = document.getElementById('tables-metric');
		// metrics è un Object che contiene un'array di campi impostati, nel Mapping, come metriche
		/*
			DocVenditaDettaglio: Array(3)
				0: "NettoRiga"
				1: "PrzMedioPond"
				2: "Quantita"
		*/
		// per ogni tabella contenente metriche ciclo i suoi campi per aggiungerli nella lista sectionFields-metrics
		Object.keys(metrics).forEach((table, index) => {
			// console.log(table);
			// console.log(metrics[table]);
			// aggiunta elenco tabelle
			let liTable = document.createElement('li');
			let elementTable = document.createElement('div');
			elementTable.className = 'element';
			liTable.innerText = table;
			liTable.setAttribute('data-table-id', index);
			liTable.setAttribute('data-list-type', 'metric');
			liTable.setAttribute('label', table);
			elementTable.appendChild(liTable);
			ulTable.appendChild(elementTable);
			liTable.onclick = app.handlerTableSelectedMetrics;
			// aggiunta ul con elenco metriche 
			let tmpl_ulList = document.getElementById('tmpl_ulList');
			let ulContent = tmpl_ulList.content.cloneNode(true);
			let ulField = ulContent.querySelector('ul[data-id="fields-metric"]');
			const parentElement = document.getElementById('sectionFields-metric'); // elemento a cui aggiungere la ul

			let tmplFieldList = document.getElementById('templateListField');

			ulField.setAttribute('data-table-id', index);

			metrics[table].forEach((metric) => {
				// console.log(metric);
				let content = tmplFieldList.content.cloneNode(true);
				let element = content.querySelector('.element');
				let li = element.querySelector('li');
			  
				li.innerText = metric;
				// li.innerText = metrics[name].alias;
				li.setAttribute('label', metric);
				li.setAttribute('data-field', metric);
				li.setAttribute('data-cube-name', cubeName);
				element.appendChild(li);
				ulField.appendChild(element);
				li.onclick = app.handlerFieldSelectedMetric;
			});
			parentElement.appendChild(ulField);
		});
	};

	// tasto add nella sezione Filtri (step 3)
	app.handlerAddFilter = (e) => {
		// carico elenco field per la tabella selezionata
		// TODO: e.currentTarget
		Query.table = e.target.getAttribute('label');
		app.getFields();
		// apro la dialog filter
		app.dialogFilter.showModal();
		// event su <li> degli operatori
		document.querySelectorAll('#operatorList').forEach((li) => {
			li.onclick = app.handlerFilterOperatorSelected;
		});
	};

	// selezione di un filtro già esistente, lo salvo nell'oggetto Query, come quando si salva un nuovo filtro dalla dialog
	app.handlerFilterSelected = (e) => {
		const storage = new FilterStorage();
		debugger;
		storage.filter = e.currentTarget.getAttribute('label');
		e.currentTarget.toggleAttribute('selected');
		Query.filterName = storage.filter.name;
		if (e.currentTarget.hasAttribute('selected')) {
			// recupero dallo storage il filtro selezionato
			console.log(storage.filter);
			console.log(storage.filter.formula);

			Query.filters = storage.filter.formula;
		} else {
			// delete filter
			Query.deleteFilter();
		}
	};

	// selezione di una metrica già esistente, lo salvo nell'oggetto Query, come quando si salva un nuovo filtro dalla dialog
	app.handlerMetricSelected = (e) => {
		const storage = new MetricStorage();
		// TODO: e.currentTarget
		storage.metric = e.target.getAttribute('label');
		// TODO: recupero dallo storage la metrica selezionata
		console.log(storage.metric);
		console.log(storage.metric.name);
		console.log(storage.metric.formula);
		Query.metricName = storage.metric.name;
		// TODO: se la metrica contiene un filtro bisogna aggiungerla a Query.filteredMetrics e non a Query.metrics
		if (storage.metric.formula[storage.metric.name].hasOwnProperty('filters')) {
			Query.filteredMetrics = storage.metric.formula[storage.metric.name];
		} else {
			Query.metrics = storage.metric.formula[storage.metric.name];
		}
	};

	// selezione della metrica, apro la dialog per impostare la metrica
	app.handlerFieldSelectedMetric = (e) => {
		// TODO: e.currentTarget
		Query.field = e.target.getAttribute('label');
		// carico elenco filtri presenti su tutte le tabelle che fanno parte di tutte le dimensioni selezionate
		// 1 - recupero le tabelle presenti nel terzo step ul #tables-filter
		const storage = new FilterStorage();
		let filters = [];
		document.querySelectorAll('#tables-filter > .element >li').forEach((table) => {filters.push(storage.list(table.getAttribute('label')));});
		console.log(filters);
		// 2 - per ogni tabella recupero i filtri impostati dallo storage e li visualizzo in ul-existsFilter_Metric
		const ul = document.getElementById('ul-existsFilter_Metric');
		// pulisco la lista dei filtri
		ul.querySelectorAll('.element').forEach((el) => {el.remove();});
	
		//console.log(ulContent);
		//let element = ulContent.querySelector('.element');
		filters.forEach((object) => {
			//console.log(object);
			if (Object.keys(object).length > 0) {
			
				for (let filter in object) {
					let ulContent = app.tmplListField.content.cloneNode(true);
					let element = ulContent.querySelector('.element');
					let li = element.querySelector('li');
					console.log(filter); // il nome del filtro
					li.innerText = filter;
					li.setAttribute('label', filter);
					//console.log(object[filter]); // la formula
					ul.appendChild(element);
					// TODO: e.currentTarget
					li.onclick = (e) => {e.target.toggleAttribute('selected');};
				}
			}
		});
		app.dialogMetric.showModal();
	};

	// selezione della tabella nella sezione Column
	app.handlerTableSelectedColumns = (e) => {
		console.log('e.currentTarget : ', e.currentTarget);
		// TODO: visualizzo elenco dei campi, aggiunti in fase di mapping, della tabella selezionata
		app.dialogTables.querySelector('section').setAttribute('data-table-selected', e.currentTarget.getAttribute('label'));
		// l'object 'columns' della dimensione contiene l'elenco dei campi mappati appartenenti alla tabella selezionata
		const fields = Dim.selected.columns[e.currentTarget.getAttribute('label')];
		const ul = document.getElementById('table-fieldList');
		fields.forEach( (field) => {
			const li = document.createElement('li');
			li.innerText = field;
			li.setAttribute('label', field);
			ul.appendChild(li);
			li.onclick = app.selectColumn;
		});
		app.dialogTables.showModal();
		Query.table = e.currentTarget.getAttribute('label');
		Query.tableId = +e.currentTarget.getAttribute('data-table-id');
		return;
		// visualizzo la ul nascosta della tabella selezionata, sezione columns
		let fieldType = e.currentTarget.getAttribute('data-list-type');
		let tableId = +e.currentTarget.getAttribute('data-table-id');
		// visualizzo, nella sezione di destra "Colonne disponibili" le colonna disponibili mappate con questa dimensione
		document.querySelector("ul[data-id='fields-"+fieldType+"'][data-table-id='"+tableId+"']").removeAttribute('hidden');
		// rimuovo eventuali altri ul aperti in precedenza
		Array.from(document.querySelectorAll("ul[data-id='fields-"+fieldType+"']:not([data-table-id='"+tableId+"'])")).forEach((ul) => {ul.setAttribute('hidden', true);});
		e.currentTarget.toggleAttribute('selected');
		Query.table = e.currentTarget.getAttribute('label');
		Query.tableId = tableId;
		Dim.selected.from.forEach( table => Query.from = table);
		// Query.from = Dim.selected.from;
		Query.where = Dim.selected.join;

		// TODO: quando si seleziona una tabella bisogna includere automaticamente il campo id in Query.columns da recuperare in app.handlerBtnColumnDone
		Query.select = {SQLFormat : null, alias : Query.table+"-"+id};
		
		// aggiungo la colonna selezionata a Query.groupBy
		obj = {};
		obj = {'SQLFormat': null};
		Query.groupBy = obj;

		debugger;
		// if (e.currentTarget.hasAttribute('selected')) {
		// 	// aggiungo, alla from, le tabelle, nelle gerarchie SUPERIORI al tableId selezionato
		// 	Dim.selected.from.forEach( (table, index) => {
		// 		if (index >= Query.tableId) {
		// 			Query.from = table;
		// 			debugger;
		// 			console.log('join : ', Dim.selected.join[index]);
		// 		}
		// 	});
		// } else {
		// 	debugger;			
		// }
		
		// in base alla tabella selezionata, recupero le metriche già esistenti, nello storage, per questa tabella
		const storage = new MetricStorage()
		// recupero le metriche già esistenti per questa tabella
		const metrics = storage.list(Query.table);
		console.log(metrics);
		// popolo il contenitore delle metriche già esistenti per questa tabella
		const ull = document.getElementById('exists-metric');
		for (let metric in metrics) {
			let content = app.tmplListField.content.cloneNode(true);
			let element = content.querySelector('.element');
			let li = element.querySelector('li');
			li.innerText = metric;
			li.setAttribute('label', metric);
			ull.appendChild(element);
			li.onclick = app.handlerMetricSelected;
		}
	};

	app.selectColumn = (e) => {
		console.log('e.currentTarget : ', e.currentTarget);
		e.currentTarget.toggleAttribute('selected');
		Query.field = e.target.getAttribute('label');
		if (!e.currentTarget.hasAttribute('selected')) {
			// deselezionato
			Query.deleteSelect();
			Query.deleteGroupBy();
		}
		// passo il focus alla textarea
		// document.getElementById('sqlFormula').focus();
		document.getElementById('inputColumnName').focus();
	};

	// selezione della gerarchia
	app.handlerHierSelected = (e) => {
		console.clear();
		// console.log('e.currentTarget : ', e.currentTarget);
		// console.log('attribute data-hier-id : ', e.currentTarget.getAttribute('data-hier-id'));
		// visualizzo la ul nascosta della gerarchia selezionata
		let fieldType = e.currentTarget.getAttribute('data-list-type');
		let hierId = +e.currentTarget.getAttribute('data-hier-id');
		// rimuovo eventuali altri ul aperti in precedenza
		Array.from(document.querySelectorAll("ul[data-id='fields-"+fieldType+"']:not([data-hier-id='"+hierId+"'])")).forEach( ul => ul.setAttribute('hidden', true));
		// visualizzo, nella sezione di destra "Tabelle disponibili" e nell'elenco tabelle dello step Filtri, le tabelle disponibili mappate con questa gerarchia
		Array.from(document.querySelectorAll("ul[data-id='fields-"+fieldType+"'][data-hier-id='"+hierId+"']")).forEach( ul => ul.removeAttribute('hidden'));
	};

	// selezione della tabella nella sezione metric
	app.handlerTableSelectedMetrics = (e) => {
		// debugger;
		// visualizzo la ul nascosta della tabella selezionata, sezione columns
		// TODO: e.currentTarget
		let fieldType = e.target.getAttribute('data-list-type');
		let tableId = +e.target.getAttribute('data-table-id');
		// visualizzo, nella sezione di destra "Colonne disponibili" le colonna disponibili mappate con questa dimensione
		document.querySelector("ul[data-id='fields-"+fieldType+"'][data-table-id='"+tableId+"']").removeAttribute('hidden');
		// rimuovo eventuali altri ul aperti in precedenza
		Array.from(document.querySelectorAll("ul[data-id='fields-"+fieldType+"']:not([data-table-id='"+tableId+"'])")).forEach((ul) => {ul.setAttribute('hidden', true);});

		e.target.toggleAttribute('selected');
		Query.table = e.target.getAttribute('label');
		// in base alla tabella selezionata, recupero le metriche già esistenti, nello storage, per questa tabella
		const storage = new MetricStorage()
		// recupero le metriche già esistenti per questa tabella
		const metrics = storage.list(Query.table);
		console.log(metrics);
		// popolo il contenitore delle metriche già esistenti per questa tabella
		const ul = document.getElementById('exists-metric');
		for (let metric in metrics) {
			let content = app.tmplListField.content.cloneNode(true);
			let element = content.querySelector('.element');
			let li = element.querySelector('li');
			li.innerText = metric;
			li.setAttribute('label', metric);
			ul.appendChild(element);
			li.onclick = app.handlerMetricSelected;
		}
	};

	// selezione della tabella nello step Filter, visualizzo i filtri creati su questa tabella, recuperandoli dallo storage
	app.handlerTableSelectedFilter = (e) => {
		// visualizzo/nascondo i filtri appartenenti alla tabella selezionata
		const fieldType = e.target.getAttribute('data-list-type');
		const table = e.currentTarget.getAttribute('label');
		const tableId = +e.currentTarget.getAttribute('data-table-id');
		// rimuovo eventuali altri ul aperti in precedenza
		Array.from(document.querySelectorAll("ul[data-id='fields-"+fieldType+"']:not([data-table-id='"+tableId+"'])")).forEach( ul => ul.setAttribute('hidden', true));
		// visualizzo, nella sezione di destra "Tabelle disponibili" e nell'elenco tabelle dello step Filtri, le tabelle disponibili mappate con questa gerarchia
		Array.from(document.querySelectorAll("ul[data-id='fields-"+fieldType+"'][data-table-id='"+tableId+"']")).forEach( ul => ul.removeAttribute('hidden'));
	};

	// selezione della colonna nella dialogFilter
	app.handlerFilterFieldSelected = (e) => {
		e.target.toggleAttribute('selected');
		// TODO: e.currentTarget
		Query.field = e.target.getAttribute('label');
		Query.fieldType = e.target.getAttribute('data-type');
		// inserisco il field selezionato nella textarea, la colonna non è editabile
		const textarea = document.getElementById('filterFormula');
		let span = document.createElement('span');
		span.className = 'formulaField';
		span.innerText = Query.field;
		textarea.appendChild(span);
		// TODO: recupero la lista dei valori distinct dalla tabella
		app.getDistinctValues();
		app.checkFilterForm();
	};

	// selezione dell'operatore nella dialogFilter
	app.handlerFilterOperatorSelected = (e) => {
		document.querySelectorAll('#operatorList li').forEach((li) => {li.removeAttribute('selected');});
		// TODO: e.currentTarget
		e.target.toggleAttribute('selected');
		const textarea = document.getElementById('filterFormula');
		let span = document.createElement('span');
		span.className = 'formulaOperator';
		span.innerText = e.target.getAttribute('label');
		span.setAttribute('label', e.target.getAttribute('label'));
		textarea.appendChild(span);
		let openPar, closePar, formulaValues;
		// OPTIMIZE: da ottimizzare
		switch (e.target.getAttribute('label')) {
			case 'IN':
			case 'NOT IN':
				openPar = document.createElement('span');
				closePar = document.createElement('span');
				formulaValues = document.createElement('span');
				// inserisco anche formulaValues tra le parentesi della IN/NOT IN
				openPar.className = 'openPar';
				formulaValues.className = 'formulaValues';
				// formulaValues.setAttribute('contenteditable', true);
				closePar.className = 'closePar';
				openPar.innerText = '( ';
				closePar.innerText = ' )';

				textarea.appendChild(openPar);
				textarea.appendChild(formulaValues);
				textarea.appendChild(closePar);
				formulaValues.focus();
				//  imposto la lista dei valori in multiselezione (una IN può avere un elenco di valori separati da virgola)
				app.dialogFilter.querySelector('#filterValueList').setAttribute('multi', true);
				break;
			default:
				// TODO: valutare le operazioni da svolgere per questo blocco
		}
		app.checkFilterForm();
	};

	// carico elenco colonne dal DB da visualizzare nella dialogFilter
	app.getFields = async () => {
		const url = '/ajax/tableInfo.php';
		const params = 'tableName='+Query.table;
		console.log('params : ', params);
		const init = {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, method: 'POST', body: params};
		const req = new Request(url, init);

		await fetch(req)
			.then( (response) => {
			if (!response.ok) {throw Error(response.statusText);}
			return response;
			})
			.then( (response) => response.json())
			.then( (data) => {
				// console.log(data);
				if (data) {
					// TODO: pulisco l'elenco dei campi
					let ul = document.getElementById('filter-fieldList');
					ul.querySelectorAll('div.element').forEach((el) => {el.remove();});
					let tmplFieldList = document.getElementById('templateListField'); // TODO: da modificare con app.tmplListField
					for ( const [key, value] of Object.entries(data)) {
						let content = tmplFieldList.content.cloneNode(true);
						let element = content.querySelector('.element');
						let li = element.querySelector('li');
						li.setAttribute('label', value[0]); // nome campo
						li.innerText = value[0];
						// scrivo il tipo di dato senza specificare la lunghezza int(8) voglio che mi scriva solo int
						let pos = value[1].indexOf('('); // datatype
						let type = (pos !== -1) ? value[1].substring(0, pos) : value[1];
						li.setAttribute('data-type', type);
						// li.id = i; al momento non mi serve
						ul.appendChild(element);
						li.onclick = app.handlerFilterFieldSelected;
					}
				} else {
				  // TODO: no data
				  console.warning('Dati non recuperati');
				}
			})
		.catch( (err) => console.error(err));
	};

	app.btnColumnDone.onclick = (e) => {
		debugger;
		// TODO: verifico se l'object select contiene la tabella selezionta, se i campi non sono stati selezionati e salvati, questa tabella non verrà inclusa nel from 
		// ...(e nemmeno le altre tabelle con data-table-id inferiore a questa)
		if (Query.select.hasOwnProperty(Query.table)) {
			Dim.selected.from.forEach( (table, index) => {
				console.log('data-table-id : ', table);
				// debugger;
				if (index >= Query.tableId) {
					Query.from = table;
					// debugger;
					// se è l'ultimo elemento non lo considero per la join perchè l'ultimo elemento ha la join con la fact
					if (index !== Dim.selected.from.length-1) {
						console.log('join : ', Dim.selected.join[index]);
						// Query.where = Dim.selected.join[index];
					}
				}
			});
		}
		app.dialogTables.close();
	};

	// salvo la metrica impostata
	app.btnMetricDone.onclick = (e) => {
		const name = app.dialogMetric.querySelector('#metric-name').value;
		const SQLFunction = document.querySelector('#function-list > li[selected]').innerText;
		const distinctOption = document.getElementById('checkbox-distinct').checked;
		const alias = document.getElementById('alias-metric').value;
		Query.metricName = name;
		console.log(Query.metricName);
		//console.log(Query.table);
		// verifico se ci sono filtri da associare a questa metrica
		const ul = document.getElementById('ul-existsFilter_Metric');
		let filtersAssociated = {};
		const filterStorage = new FilterStorage()
		ul.querySelectorAll('.element > li[selected]').forEach((filter) => {
			// filtersAssociated.push(filter.getAttribute('label'));
			// set il nome del filtro
			filterStorage.filter = filter.getAttribute('label');
			// recupero dallo storage il contenuto del filtro per inserirlo in un object (quest'ultimo verrà inserito nella metrica)
			filtersAssociated[filter.getAttribute('label')] = filterStorage.filter;
		});

		let metricObj = {};
		// se filtersAssociated > 0 sarà una metrica filtrata, altrimenti una metrica a livello di report (senza nessun filtro all'interno della metrica)
		if (Object.keys(filtersAssociated).length > 0) {
			// metrica filtrata
			console.log('metrica filtrata');
			Query.filteredMetrics = {SQLFunction, 'table': Query.table, 'field': Query.field, name, 'distinct' : distinctOption, alias, 'filters': filtersAssociated};

			console.log(Query.filteredMetrics);
			metricObj = {'type': 'METRIC', name, 'formula' : Query.filteredMetrics};
		} else {
			// metrica
			Query.metrics = {SQLFunction, 'table': Query.table, 'field': Query.field, name, 'distinct' : distinctOption, alias};
			// all'interno di 'formula' devo vedere se ci posso mettere l'object appena salvato in Query.metrics
			metricObj = {'type': 'METRIC', name, 'formula' : Query.metrics};
			//console.log(metricObj);
		}

		const storage = new MetricStorage();
		// salvo la nuova metrica nello storage
		console.log(metricObj)
		
		storage.save = metricObj;

		app.dialogMetric.close();
	};

	// salvataggio del filtro impostato nella dialog
	app.btnFilterSave.onclick = (e) => {
		// Filter save
		const textarea = document.getElementById('filterFormula');
		let filterName = document.getElementById('filter-name');
		
		console.log(filterName.value);
		Query.filterName = filterName.value;
		let operator = app.dialogFilter.querySelector('#filterFormula .formulaOperator').innerText;
		// FIXME: In futuro dovrò modificare la gestione dei filtri perchè al momento non posso inserire filtri (es.: in AND o OR) appartenenti a due tabelle diverse

		let values = [], value;

		switch (operator) {
			case 'IN':
			case 'NOT IN':
				value = app.dialogFilter.querySelector('#filterFormula .formulaValues').innerHTML;
				// console.log(value);
				// console.log('IN / NOT IN');
				values = value.split(',');
				break;
			default:
				value = app.dialogFilter.querySelector('#filterFormula .formulaValues').innerHTML;
				values.push(value);
		}

		let formula = '';
		// ciclo gli elementi nella formula per creare il filtro
		Array.from(document.querySelectorAll('#filterFormula > span')).forEach((span) => {
			//console.log(span);
			formula += (span.classList.contains('formulaField')) ? `${Query.table}.${span.innerText} `: `${span.innerText} `;
		});
	
		console.log(formula);
		console.log(Query.table);

		Query.filters = formula.trimEnd();
		// Quando creo un filtro su una determinata tabella posso riutilizzarlo elencando la lista dei filtri già creati, successivamnete...
		// ...cliccando una determinata tabella mostro l'elenco dei filtri già creati per questa tabella, in modo da non duplicarli e/o non doverli ricreare
		const storage = new FilterStorage();
		let = filterObj = {'type': 'FILTER', 'name': filterName.value, 'table': Query.table, 'formula': formula.trimEnd()};
		storage.save = filterObj;
	
		// visualizzo il filtro appena creato nella section #sectionFields-filter
		// TODO: e anche nella lista dei filtri esistenti all'interno della metrica, se si vuole utilizzarlo nella metrica 
		const ulFilterMetric = document.getElementById('ul-existsFilter_Metric');
		let ulContent = app.tmplListField.content.cloneNode(true);
		let elementFilterMetric = ulContent.querySelector('.element');
		let liFilterMetric = elementFilterMetric.querySelector('li');
		liFilterMetric.setAttribute('label', filterName.value);
		liFilterMetric.innerText = filterName.value;
		elementFilterMetric.appendChild(liFilterMetric);
		ulFilterMetric.appendChild(elementFilterMetric);

		let ul = document.getElementById('createdFilters');
		let li = document.createElement('li');
		let element = document.createElement('div');
		li.innerText = filterName.value;
		li.setAttribute('label', filterName.value);
		element.className = 'element';
		element.appendChild(li)
		ul.appendChild(element);
		// reset del form
		filterName.value = '';
		filterName.focus();
		// pulisco la textarea
		textarea.querySelectorAll('span').forEach((span) => {span.remove();});
	};

	app.btnFilterDone.onclick = () => app.dialogFilter.close();

	// recupero valori distinti per inserimento nella dialogFilter
	app.getDistinctValues = async () => {
		const url = 'ajax/columnInfo.php';
		const params = 'table='+Query.table+'&field='+Query.field;
		console.log('params : ', params);
		const ul = document.getElementById('filter-valueList');
		// pulisco la ul
		Array.from(ul.querySelectorAll('.element')).forEach((item) => {item.remove();});

		const init = {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, method: 'POST', body: params};
		const req = new Request(url, init);

		await fetch(req)
			.then( (response) => {
			if (!response.ok) {throw Error(response.statusText);}
			return response;
			})
			.then( (response) => response.json())
			.then( (data) => {
				// console.log(data);
				if (data) {
					for (const [key, value] of Object.entries(data)) {
						let element = document.createElement('div');
						element.className = 'element';
						ul.appendChild(element);
						let li = document.createElement('li');
						li.id = key;
						li.className = 'elementSearch';
						li.setAttribute('label', value[Query.field]);
						li.innerHTML = value[Query.field];
						element.appendChild(li);
						li.onclick = app.handlerValueFilterSelected;
					}
				} else {
				  // TODO: no data
				  console.warning('Dati non recuperati');
				}
			})
		.catch( (err) => console.error(err));
	};

	// selezione di uno o più valori dalla lista dei valori della colonna in dialogFilter
	app.handlerValueFilterSelected = (e) => {
		const textarea = document.getElementById('filterFormula');
		const ul = app.dialogFilter.querySelector('#filter-valueList');
		let span;
		let values = [];

		if (!ul.hasAttribute('multi')) {
			// selezione singola
			// se l'elemento target è già selezionato faccio il return
			// TODO: e.currentTarget
			if (e.target.hasAttribute('selected')) return;
			// ...altrimenti elimino tutte le selezioni fatte (single) e imposto il target selezionato
			document.querySelectorAll('#valuesList li').forEach((li) => {li.removeAttribute('selected');});
			e.target.toggleAttribute('selected');

			span = document.createElement('span');
			span.className = 'formulaValues';
		  
			switch (Query.fieldType) {
				case 'varchar':
					// TODO: definire altri datatype
					span.innerText = `"${e.target.getAttribute("label")}"`;
					break;
				default:
					// int o decimal
					span.innerText = `${e.target.getAttribute("label")}`;
			}
			textarea.appendChild(span);
			// TODO: verifico, dopo aver inserito il valore selezionato, se l'elemento precedente è un BETWEEN
			const operator = span.previousElementSibling.getAttribute('label');
			if (operator === 'BETWEEN') {
				let and = document.createElement('span');
				and.className = 'formulaOperator';
				and.innerText = 'AND';
				textarea.appendChild(and);
			}
		} else {
			// selezione multipla, quindi seleziono tutti gli elementi su cui si attiva il click
			e.target.toggleAttribute('selected');
			span = textarea.querySelector('.formulaValues');
			// TODO: recupero l'elenco dei valori selezionati nella multi
			let liSelected = app.dialogFilters.querySelectorAll('#valuesList li[selected]');
			// console.log(liSelected);
			liSelected.forEach((item) => {valuesArr.push(item.getAttribute('label'));});
			span.innerText = valuesArr;
		}
		span.focus();
		app.checkFilterForm();
	};

	// carico elenco Cubi su cui creare il report
	app.getCubes = () => {
		const ul = document.getElementById('cubes');
		StorageCube.list(ul);
		// associo la Fn che gestisce il click sulle <li>
		ul.querySelectorAll('li').forEach( li => li.addEventListener('click', app.handlerCubeSelected));
		
	};

	app.getDimensions = () => {
		// per ogni cubo creo una <ul> con dentro le dimensioni associate al cubo in ciclo
		console.log('lista cubi : ', StorageCube.cubes); // tutta la lista dei cubi
		for (const [cubeName, cubeValue] of (Object.entries(StorageCube.cubes))) {
			console.log('key : ', cubeName);
			console.log('value : ', cubeValue); // tutto il contenuto del cubo
			console.log('dimensioni associate : ', cubeValue.associatedDimensions);
			// per ogni cubo creo una <ul> con le dimensioni appartenti al cubo
			const content = app.tmpl_ulList.content.cloneNode(true);
			const ul = content.querySelector("ul[data-id='fields-dimensions']");
			const parent = document.getElementById('dimensionList'); // dove verrà inserita la <ul>
			// inserisco un data-cube-id sulla lista ul[data-id='fields-dimensions'] in modo da visualizzarla/nasconderla solo quando si seleziona il relativo cubo
			ul.setAttribute('data-cube-id', cubeValue.id);
			// per ogni dimensione presente in associatedDimensions inserisco un element (preso dal template app.tmplListField)
			cubeValue.associatedDimensions.forEach( (dimension, index) => {
				const contentElement = app.tmplListField.content.cloneNode(true);
				const element = contentElement.querySelector('.element');
				const li = element.querySelector('li');
				li.innerText = dimension;
				element.appendChild(li);
				ul.appendChild(element);
			}); // forse index si deve sostituire con un dimensionId (che attualmente non viene creato quando si crea una dimensione)
			parent.appendChild(ul);
		}
	};

	app.getHierarchies = () => {
		// ottengo l'elenco delle gerarchie per ogni dimensione presente in storage, successivamente, quando la dimensione viene selezionata, visualizzo/nascondo solo quella selezionata
		console.log('lista dimensioni :', Dim.dimensions);
		// per ogni dimensione presente creo una lista <ul> con le gerarchie presenti nella dimension in ciclo
		for (const [dimName, dimValue] of (Object.entries(Dim.dimensions))) {
			console.log('key : ', dimName);
			console.log('value : ', dimValue); // tutto il contenuto della dimensione
			console.log('gerarchie della dimensione : ', dimValue.hierarchies);
			// per ogni cubo creo una <ul> con le dimensioni appartenti al cubo
			const content = app.tmpl_ulList.content.cloneNode(true);
			const ul = content.querySelector("ul[data-id='fields-hierarchies']");
			const parent = document.getElementById('tableList-hierarchies'); // dove verrà inserita la <ul>
			// inserisco un data-cube-id sulla lista ul[data-id='fields-dimensions'] in modo da visualizzarla/nasconderla solo quando si seleziona il relativo cubo
			ul.setAttribute('data-dimension-id', dimValue.name); // TODO: al momento metto il nome ma andrà sostituito con dimensionId
			// per ogni dimensione presente in associatedDimensions inserisco un element (preso dal template app.tmplListField)
			for (const hier in dimValue.hierarchies) {
				const contentElement = app.tmplListField.content.cloneNode(true);
				const element = contentElement.querySelector('.element');
				const li = element.querySelector('li');
				li.innerText = hier;
				element.appendChild(li);
				ul.appendChild(element);
			}
			parent.appendChild(ul);
		}
		debugger;
		/*
		const ul = document.getElementById('dimension-hierarchies');
		console.log('ul dimension-hierarchies : ', ul);
		Object.keys(hierarchies).forEach( (hier, index) => {
			let elementTable = document.createElement('div');  
			elementTable.className = 'element';
			let li = document.createElement('li');
			li.innerText = hier;
			li.setAttribute('data-list-type', 'tables');
			li.setAttribute('label', hier);
			li.setAttribute('data-hier-id', index);
			elementTable.appendChild(li);
			ul.appendChild(elementTable);
			li.onclick = app.handlerHierSelected;

			// creo lista tabelle nello step "tabelle" 2
			app.createTableListForColumns(index, hierarchies[hier]);

			// creo lista tabelle nello step "filtri" 3
			app.createTableListForFilters(index, hierarchies[hier]);
		});
		*/
	};

	app.getCubes();

	app.getDimensions();

	app.getHierarchies();

	app.datamartToBeProcessed();

	// abilito il tasto btnFilterSave se il form per la creazione del filtro è corretto
	app.checkFilterForm = () => {
		const filterName = document.getElementById('filter-name');
		// textarea della formula, devo verifica se ci sono almento i 3 elementi della formula
		const filterFormula = document.getElementById('filterFormula');
		//console.log(filterFormula.childElementCount);
		// TODO: verifica se il nome del filtro è stato inserito
		// TODO: verifica se la formula è stata inserita
		let flag = ( (filterName.value.length !== 0) && (filterFormula.childElementCount >= 3) ) ? true : false;
		(flag) ? app.btnFilterSave.disabled = false: app.btnFilterSave.disabled = true;
	};

	// selezione di un operatore logica da inserire nella formula (AND, OR, NOT, ecc...)
	app.handlerLogicalOperatorSelected = (e) => {
		// TODO: e.currentTarget
		console.log(e.target);
		e.target.toggleAttribute('selected');
		const textarea = document.getElementById('filterFormula');
		let span = document.createElement('span');
		span.className = 'formulaLogicalOperator';
		span.innerText = e.target.getAttribute('label');
		textarea.appendChild(span);
	};
	/* events */

	app.btnPreviousStep.onclick = function() {Step.previous();}

	app.btnNextStep.onclick = function() {Step.next();};

	// tasto completato nello step 4, // dialog per il salvataggio del nome del report
	app.btnStepDone.onclick = function(e) {
		app.dialogSaveReport.showModal();
		// sulla dialog imposto la modalità di salvataggio tra process/report, se impostato su process salvo, dal tasto OK, il process del report, altrimenti salvo il report con tutte le sue opzioni
		app.dialogSaveReport.setAttribute('mode', 'process');
	};

	// salvo il report da processare
	app.btnSaveReportDone.onclick = () => {
		console.log(Query);
		debugger;
		// aggiungo, nella from, il cubo selezionato nel primo step
		// salvo temporaneamente la query da processare nello storage

		// ottengo un processId per passarlo a costruttore
		const processId = StorageProcess.getIdAvailable();
		const name = document.getElementById('reportName').value;

		// il datamart sarà creato come FXprocessId
		Query.save(processId, name);
		// aggiungo il report da processare nella list 'reportProcessList'
		const ulReportsProcess = document.getElementById('reportsProcess');
		let tmplContent = app.tmplListField.content.cloneNode(true);
		let element = tmplContent.querySelector('.element');
		let li = element.querySelector('li');
		li.innerText = name;
		li.setAttribute('label', 'process_' + name);
		li.setAttribute('data-id', processId);
		ulReportsProcess.appendChild(element);
		li.onclick = app.handlerReportToBeProcessed;
		app.dialogSaveReport.close();
	};

	// visualizzo la lista dei report da processare
	app.btnProcessReport.onclick = () => {
		const listReportProcess = document.getElementById('reportProcessList');
		listReportProcess.toggleAttribute('hidden');
	};

	// input di ricerca nella dialogFilter, ricerca nell'elenco dei fields
	document.getElementById('fieldSearch').oninput = App.searchInList;

	// input di ricerca nella dialogFilter, ricerca nell'elenco dei valori
	document.getElementById('valuesSearch').oninput = App.searchInList;

	// input per filter-name, controllo se il form per la creazione del filtro è convalidato
	document.getElementById('filter-name').oninput = function(e) {
		// TODO: controllo se il form è completato
		app.checkFilterForm();
	};

	document.getElementById('inputColumnName').oninput = (e) => {
		(e.target.value.length === 0) ? app.btnSaveColumn.disabled = true : app.btnSaveColumn.disabled = false;
	};

	// operatori logici nella dialog Filter (AND, OR, NOT, ecc...)
	document.querySelectorAll('#logicalOperator > span').forEach((span) => {
		span.onclick = app.handlerLogicalOperatorSelected;
	});

	app.btnSaveColumn.onclick = (e) => {
		console.clear();
		const alias = document.getElementById('inputColumnName').value;
		const textarea = (document.getElementById('sqlFormula').value.length === 0) ? null : document.getElementById('sqlFormula').value;

		Query.select = {SQLFormat: textarea, alias};
		// aggiungo la colonna selezionata a Query.groupBy
		Query.groupBy = {SQLFormat: textarea};
		document.getElementById('inputColumnName').value = '';
	};

})();