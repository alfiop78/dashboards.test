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
		tmpl_ulListHidden : document.getElementById('templateListHidden'),
		tmpl_ulListWithEdit : document.getElementById('templateListWithEdit'),
		tmpl_ulListSection : document.getElementById('templateListSection'),

		// popup
		popup : document.getElementById('popup'),

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

	app.showPopup = (e) => {
		// const toast = document.getElementById('toast');
		// console.log('pageX : ', e.pageX);
		// console.log('pageY : ', e.pageY);
		// console.log('offset : ', e.offsetX);
		// console.log('screen : ', e.screenX);
		const yPosition = e.target.getBoundingClientRect().bottom + 10;
		const left = e.target.getBoundingClientRect().left;
		const right = e.target.getBoundingClientRect().right;
		// ottengo il centro dell'icona
		let centerElement = left + ((right - left) / 2);
		app.popup.innerHTML = e.currentTarget.getAttribute('data-popup-label');
		app.popup.style.display = 'block';
		// ottengo la metà del popup, la sua width varia a seconda di cosa c'è scritto dentro, quindi qui devo prima visualizzarlo (display: block) e dopo posso vedere la width
		const elementWidth = app.popup.offsetWidth / 2;
		// il popup verrà posizionato al centro dell'icona
		const xPosition = centerElement - elementWidth;
		
		app.popup.style.setProperty('--left', xPosition+"px");
		app.popup.style.setProperty('--top', yPosition+"px");
		app.popup.animate([
			{transform: 'scale(.2)'},
			{transform: 'scale(1.2)'},
			{transform: 'scale(1)'}
		], { duration: 50, easing: 'ease-in-out' });

		// console.log(e.target.getBoundingClientRect().bottom);
		// console.log(e.target.getBoundingClientRect().left);
		// console.log(' : ', rect);
	};

	app.hidePopup = (e) => {
		app.popup.style.display = 'none';
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
				  console.debug('FX non è stata creata');
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

	app.handlerCubeSelected = (e) => {
		// const cubeId = e.currentTarget.getAttribute('data-cube-id');
		// const fieldType = e.currentTarget.getAttribute('data-list-type');
		StorageCube.selected = e.currentTarget.getAttribute('label');
		console.log('cube selected : ', StorageCube.selected);
		e.currentTarget.toggleAttribute('selected');
		if (e.currentTarget.hasAttribute('selected')) {
			// Query.addFromCubes(StorageCube.selected.FACT);
			// visualizzo la <ul> contentente le dimensioni appartenenti al cubo selezionato
			// document.querySelectorAll("ul[data-id='fields-dimensions'] > .element[data-cube-id='"+cubeId+"']").forEach( (dim) => {
			// 	console.log('elenco dimensioni appartententi al cubo selezionato : ', dim);
			// 	// TODO: visualizzare con l'attr hide oppure hidden (da decidere in base alla class .element che ha display: flex quindi hidden non è disponibile)
			// });
			document.querySelectorAll("ul[data-id='fields-dimensions'] > section[data-cube-name='"+StorageCube.selected.name+"']").forEach( (dimension) => {
				console.log('tabelle appartententi alla gerarchia selezionata : ', dimension);
				dimension.hidden = false;
				dimension.toggleAttribute('data-searchable');
			});
		} else {
			// TODO: deselect cube
			document.querySelectorAll("ul[data-id='fields-dimensions'] > section[data-cube-name='"+StorageCube.selected.name+"']").forEach( (table) => {
				table.hidden = true;
				dimension.toggleAttribute('data-searchable');
			});
		}
	};

	app.handlerDimensionSelected = (e) => {
		Dim.selected = e.currentTarget.getAttribute('data-dimension-name');
		console.log('Dimensione selezionata : ', Dim.selected);
		// Query.where = Dim.selected.cubes[StorageCube.selected.name];
		e.currentTarget.toggleAttribute('selected');
		if (e.currentTarget.hasAttribute('selected')) {
			document.querySelectorAll("ul[data-id='fields-hierarchies'] > section[data-dimension-name='"+Dim.selected.name+"']").forEach( (hier) => {
				// console.log('elenco gerarchie appartententi alla dimensione selezionata : ', hier);
				hier.hidden = false;
				hier.toggleAttribute('data-searchable');
			});
		} else {
			// TODO: deselect cube
			document.querySelectorAll("ul[data-id='fields-hierarchies'] > section[data-dimension-name='"+Dim.selected.name+"']").forEach( (hier) => {
				// console.log('elenco gerarchie appartententi alla dimensione selezionata : ', hier);
				hier.hidden = true;
				hier.toggleAttribute('data-searchable');
			});
		}
	};

	// selezione del cubo step-1
	/*app.handlerCubeSelected = (e) => {
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
	};*/

	// selezione delle dimensioni da utilizzare per la creazione del report
	/*app.handlerDimensionSelected = (e) => {
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
	};*/

	// selezione della gerarchia
	app.handlerHierSelected = (e) => {
		console.clear();
		const hier = e.currentTarget.getAttribute('data-hier-name');
		e.currentTarget.toggleAttribute('selected');
		if (e.currentTarget.hasAttribute('selected')) {
			document.querySelectorAll("ul[data-id='fields-tables'] > section[data-hier-name='"+hier+"']").forEach( (table) => {
				// console.log('tabelle appartententi alla gerarchia selezionata : ', table);
				table.hidden = false;
				// imposto l'elemento con l'attr 'searchable' in modo che il metodo SearchInSectionList cerca solo tra gli elementi che hanno questo attributo
				// senza questo attributo, il metodo cerca tra tutti gli elementi e quindi và a nascondere/visualizzare anche quelli appartenenti ad altre dimensioni/gerarchie/tabelle ecc...
				table.toggleAttribute('data-searchable');
			});
		} else {
			// deselezionata la gerarchia
			document.querySelectorAll("ul[data-id='fields-tables'] > section[data-hier-name='"+hier+"']").forEach( (table) => {
				table.hidden = true;
				table.toggleAttribute('data-searchable');
			});
		}
	};

	// crreo la lista delle gerarchie presenti nella dimensione selezionata
	/*app.createListHierarchies = (hierarchies) => {
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
	};*/

	// creo l'elenco delle tabelle nel div fieldList-tables, nello step "Gerarchie/Tabelle"
	/*app.createTableListForColumns = (index, elements) => {
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
	};*/

	// creo elenco tabelle nel div tableList-filter presente nello step Filtri
	/*app.createTableListForFilters = (index, elements) => {
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
	};*/

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

	/*app.createListTableMetrics = (metrics, cubeName) => {
		// ulTable conterrà le tabelle che hanno metriche (step-4 1° colonna)
		let ulTable = document.getElementById('tables-metric');
		// metrics è un Object che contiene un'array di campi impostati, nel Mapping, come metriche
		/*
			DocVenditaDettaglio: Array(3)
				0: "NettoRiga"
				1: "PrzMedioPond"
				2: "Quantita"
		*//*
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
	};*/

	// tasto add nella sezione Filtri (step 3)
	// app.handlerAddFilter = (e) => {
	// 	// carico elenco field per la tabella selezionata
	// 	debugger;
	// 	Query.table = e.currentTarget.getAttribute('label');
	// 	// app.getFields();
	// 	// apro la dialog filter
	// 	app.dialogFilter.showModal();
	// 	// event su <li> degli operatori
	// 	document.querySelectorAll('#operatorList').forEach((li) => {
	// 		li.onclick = app.handlerFilterOperatorSelected;
	// 	});
	// };

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
		console.clear();
		debugger;
		// console.log('e.currentTarget : ', e.currentTarget);
		console.info('Tabella selezionata: ', e.currentTarget.getAttribute('data-table-name'));
		const tableSelected = e.currentTarget.getAttribute('data-table-name');
		// visualizzo elenco dei campi, aggiunti in fase di mapping, della tabella selezionata
		app.dialogTables.querySelector('section').setAttribute('data-table-selected', tableSelected);
		// visualizzo solo i campi della tabella selezionata
		document.querySelectorAll("ul[data-id='fields-column'] > section[data-table-name='"+tableSelected+"']").forEach( (table) => {
			table.hidden = false;
			table.toggleAttribute('data-searchable');
		});
		// nascondo i field NON appartenenti alla tabella selezionata
		document.querySelectorAll("ul[data-id='fields-column'] > section:not([data-table-name='"+tableSelected+"'])").forEach( table => table.hidden = true);
		app.dialogTables.querySelector('h4 > span').innerHTML = tableSelected;
		app.dialogTables.showModal();
		Query.table = tableSelected;
		// Query.tableId = +e.currentTarget.getAttribute('data-table-id');

		// Dim.selected.from.forEach( table => Query.from = table);
		// // Query.from = Dim.selected.from;
		// Query.where = Dim.selected.join;
		
		// in base alla tabella selezionata, recupero le metriche già esistenti, nello storage, per questa tabella
		/*const storage = new MetricStorage()
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
		}*/
	};

	app.selectColumn = (e) => {
		console.log('e.currentTarget : ', e.currentTarget);
		e.currentTarget.toggleAttribute('selected');
		Query.field = e.currentTarget.getAttribute('label');
		if (!e.currentTarget.hasAttribute('selected')) {
			// deselezionato
			Query.deleteSelect();
			Query.deleteGroupBy();
		}
		// passo il focus alla textarea
		// document.getElementById('sqlFormula').focus();
		document.getElementById('inputColumnName').focus();
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
		console.info('Tabella selezionata: ', e.currentTarget.getAttribute('data-table-name'));
		Query.table = e.currentTarget.getAttribute('data-table-name');
		// visualizzo elenco dei campi, aggiunti in fase di mapping, della tabella selezionata
		app.dialogFilter.querySelector('section').setAttribute('data-table-selected', Query.table);
		// visualizzo il nome della tabella nel tag h4 > span
		app.dialogFilter.querySelector('h4 > span').innerHTML = Query.table;
		console.log('Query.table : ', Query.table);
		app.getFields(); // recupero i campi della tabella selezionata
		// console.log('lista filtri : ', StorageFilter.tableFilters(Query.table));
		// const filters = StorageFilter.tableFilters(Query.table)
		// visualizzo i filtri esistenti sulla tabella selezionata
		document.querySelectorAll("ul[data-id='fields-filter'] > section[data-table-name='"+Query.table+"']").forEach( filter => filter.hidden = false);
		// nascondo i filter NON appartenenti alla tabella selezionata
		document.querySelectorAll("ul[data-id='fields-filter'] > section:not([data-table-name='"+Query.table+"'])").forEach( filter => filter.hidden = true);
		app.dialogFilter.showModal();

	};

	// selezione del field nella dialogFilter
	app.handlerFilterFieldSelected = (e) => {
		e.currentTarget.toggleAttribute('selected');
		Query.field = e.target.getAttribute('label');
		Query.fieldType = e.target.getAttribute('data-type');
		// inserisco il field selezionato nella textarea
		const textarea = document.getElementById('filterSQLFormula');
		textarea.value = Query.field;
		textarea.focus();
		app.getDistinctValues();
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
					// let ul = document.getElementById('filter-fieldList');
					const content = app.tmpl_ulList.content.cloneNode(true);
					const ul = content.querySelector("ul[data-id='fields-field']");
					const parent = document.getElementById('filter-fieldList'); // dove verrà inserita la <ul>
					// ul.querySelectorAll('section').forEach((el) => {el.remove();});
					for ( const [key, value] of Object.entries(data)) {
						const contentElement = app.tmpl_ulListSection.content.cloneNode(true);
						const section = contentElement.querySelector('section');
						const element = section.querySelector('.element');
						const li = element.querySelector('li');
						section.hidden = false;
						section.setAttribute('data-label-search', value[0]);
						section.setAttribute('data-table-name', Query.table);
						li.innerText = value[0];
						// scrivo il tipo di dato senza specificare la lunghezza int(8) voglio che mi scriva solo int
						let pos = value[1].indexOf('('); // datatype
						let type = (pos !== -1) ? value[1].substring(0, pos) : value[1];
						li.setAttribute('data-type', type);
						li.setAttribute('label', value[0]); // nome campo
						ul.appendChild(section);
						li.onclick = app.handlerFilterFieldSelected;
						parent.appendChild(ul);
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
					const content = app.tmpl_ulList.content.cloneNode(true);
					const ul = content.querySelector("ul[data-id='fields-values']");
					const parent = document.getElementById('filter-valueList'); // dove verrà inserita la <ul>
					// pulisco la ul
					ul.querySelectorAll('section').forEach((item) => {item.remove();});
					for (const [key, value] of Object.entries(data)) {
						const contentElement = app.tmpl_ulListSection.content.cloneNode(true);
						const section = contentElement.querySelector('section');
						const element = section.querySelector('.element');
						const li = element.querySelector('li');
						section.hidden = false;
						section.setAttribute('data-label-search', value[Query.field]);
						// section.setAttribute('data-table-name', Query.table);
						li.innerText = value[Query.field];
						li.id = key;
						li.setAttribute('label', value[Query.field]);
						li.innerHTML = value[Query.field];
						ul.appendChild(section);
						li.onclick = app.handlerValueFilterSelected;
						parent.appendChild(ul);
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
		const textarea = document.getElementById('filterSQLFormula');
		// aggiungo alla textarea il valore selezionato
		textarea.value += e.currentTarget.getAttribute('label');
		app.checkFilterForm();
	};

	// carico elenco Cubi su cui creare il report
	app.getCubes = () => {
		// StorageCube.list(ul);
		const content = app.tmpl_ulList.content.cloneNode(true);
		const ul = content.querySelector("ul[data-id='fields-cubes']");
		const parent = document.getElementById('fieldList-cubes'); // dove verrà inserita la <ul>
		for (const [key, value] of Object.entries(StorageCube.cubes)) {
			const contentElement = app.tmpl_ulListSection.content.cloneNode(true);
			const section = contentElement.querySelector('section');
			const element = section.querySelector('.element');
			const li = element.querySelector('li');
			section.setAttribute('data-label-search', key);
			section.removeAttribute('hidden');
			// element.setAttribute('data-cube-id', value.id);
			// element.setAttribute('data-cube-name', key);
			li.innerText = key;
			li.setAttribute('label', key);
			li.setAttribute('data-cube-id', value.id);
			li.setAttribute('data-cube-name', key);
			ul.appendChild(section);
			li.onclick = app.handlerCubeSelected;
		}
		parent.appendChild(ul);
	};

	app.getDimensions = () => {
		// elenco di tutte le dimensioni
		const content = app.tmpl_ulList.content.cloneNode(true);
		const ul = content.querySelector("ul[data-id='fields-dimensions']");
		const parent = document.getElementById('dimensionList'); // dove verrà inserita la <ul>
		// creo un unica <ul> con dentro tutte le dimensioni, queste verranno filtrate quando si selezionano uno o più cubi
		console.log('lista cubi : ', StorageCube.cubes); // tutta la lista dei cubi
		for (const [cubeName, cubeValue] of (Object.entries(StorageCube.cubes))) {
			console.log('key : ', cubeName);
			console.log('value : ', cubeValue); // tutto il contenuto del cubo
			console.log('dimensioni associate : ', cubeValue.associatedDimensions);
			// per ogni dimensione presente in associatedDimensions inserisco un element (preso dal template app.tmplListField)
			cubeValue.associatedDimensions.forEach( (dimension, index) => {
				const contentElement = app.tmpl_ulListSection.content.cloneNode(true);
				const section = contentElement.querySelector('section');
				const element = section.querySelector('.element');
				const li = element.querySelector('li');
				section.setAttribute('data-label-search', dimension); // questo attr consente la ricerca dalla input sopra
				section.setAttribute('data-cube-name', cubeName); // questo attr consente la ricerca dalla selezione del cubo
				// element.setAttribute('data-dimension-id', dimName);
				// element.setAttribute('data-hier-id', hier);
				li.innerText = dimension;
				li.setAttribute('data-dimension-name', dimension);
				li.setAttribute('label', dimension);
				ul.appendChild(section);
				li.onclick = app.handlerDimensionSelected;
			}); // forse index si deve sostituire con un dimensionId (che attualmente non viene creato quando si crea una dimensione)
			parent.appendChild(ul);
		}
	};

	app.getHierarchies = () => {
		// lista di tutte le gerarchie, imposto un data-dimension-id/name sugli .element della lista gerarchie, in questo modo posso filtrarle quando seleziono le dimensioni nello step precedente
		const content = app.tmpl_ulList.content.cloneNode(true);
		const ul = content.querySelector("ul[data-id='fields-hierarchies']");
		const parent = document.getElementById('tableList-hierarchies'); // dove verrà inserita la <ul>

		// ottengo l'elenco delle gerarchie per ogni dimensione presente in storage, successivamente, quando la dimensione viene selezionata, visualizzo/nascondo solo quella selezionata
		console.log('lista dimensioni :', Dim.dimensions);
		// per ogni dimensione presente aggiungo gli elementi nella ul con le gerarchie
		for (const [dimName, dimValue] of (Object.entries(Dim.dimensions))) {	
			// per ogni dimensione presente in associatedDimensions inserisco un element (preso dal template app.tmplListField)
			for (const hier in dimValue.hierarchies) {
				const contentElement = app.tmpl_ulListSection.content.cloneNode(true);
				const section = contentElement.querySelector('section');
				const element = section.querySelector('.element');
				const li = element.querySelector('li');
				section.setAttribute('data-label-search', hier); // ricerca dalla input sopra
				section.setAttribute('data-dimension-name', dimValue.name);
				section.setAttribute('data-hier-name', hier);
				li.innerText = hier;
				li.setAttribute('data-hier-name', hier);
				ul.appendChild(section);
				li.onclick = app.handlerHierSelected;
			}
			parent.appendChild(ul);
		}
	};

	app.getTablesInHierarchies = () => {
		// lista di tutte le tabelle, incluse nelle dimensioni e di conseguenza, nelle gerarchie
		const content = app.tmpl_ulList.content.cloneNode(true);
		const ul = content.querySelector("ul[data-id='fields-tables']");
		const parent = document.getElementById('fieldList-tables'); // dove verrà inserita la <ul>
		// per ogni dimensione, vado a leggere le hierarchies presenti, le ciclo per creare una <ul>, in sectionFields-tables, con le tabelle presenti nella gerarchia in ciclo
		for (const [dimName, dimValue] of (Object.entries(Dim.dimensions))) {
			Dim.selected = dimName;
			console.log('hierarchies : ', Dim.selected.hierarchies);
			for (const hier in Dim.selected.hierarchies) {
				for (const table in Dim.selected.hierarchies[hier]) {
					// ciclo le tabelle presenti nella gerarchia
					const contentElement = app.tmpl_ulListHidden.content.cloneNode(true);
					const section = contentElement.querySelector('section');
					const element = section.querySelector('.element');
					const li = element.querySelector('li');
					const iColumns = element.querySelector('#columns-icon');
					const iFilter = element.querySelector('#filter-icon');
					section.setAttribute('data-label-search', dimValue.hierarchies[hier][table]); // utilizzabile per la ricerca dalla input sopra
					section.setAttribute('data-dimension-name', dimName); // utilizzabile dalla dimensione + gerarchia selezionata
					section.setAttribute('data-hier-name', hier);
					li.innerText = dimValue.hierarchies[hier][table];
					iColumns.setAttribute('data-dimension-name', dimName); // attributo che viene letto in app.handlerTableSelected per recuperare la property 'columns' della dimensione
					iColumns.setAttribute('data-table-name', dimValue.hierarchies[hier][table]);
					iFilter.setAttribute('data-dimension-name', dimName);
					iFilter.setAttribute('data-table-name', dimValue.hierarchies[hier][table]);
					// imposto onclick sulle icone columns e filter
					iColumns.onclick = app.handlerTableSelectedColumns; // apre la dialog dialogTables per impostare gli alias e SQL per le colonne
					iFilter.onclick = app.handlerTableSelectedFilter; // apre la dialog dialogFilter per impostare i filtri
					iFilter.setAttribute('data-popup-label', 'Filtri');
					iFilter.addEventListener("mouseenter", app.showPopup, false);
					iFilter.addEventListener("mouseleave", app.hidePopup, false);
					ul.appendChild(section);
				}
				parent.appendChild(ul);
			}
		}
	};

	app.getColumnsInTable = () => {
		console.clear();
		// lista di tutte le colonne, incluse nelle dimensioni, property 'columns'
		const content = app.tmpl_ulList.content.cloneNode(true);
		const ul = content.querySelector("ul[data-id='fields-column']");
		const parent = document.getElementById('table-fieldList'); // dove verrà inserita la <ul>
		// per ogni dimensione, recupero la property 'columns'
		console.log('Dim.dimension : ', Dim.dimensions);
		for (const [key, value] of (Object.entries(Dim.dimensions))) {
			// key : nome della dimensione
			// value : tutte le property della dimensione
			console.log('key : ', key);
			// console.log('value : ', value.columns);
			for ( const [table, fields] of Object.entries(value.columns)) {
				console.log('table : ', table);
				// console.log('fields : ', fields);
				fields.forEach( (field) => {
					const contentElement = app.tmpl_ulListSection.content.cloneNode(true);
					const section = contentElement.querySelector('section');
					const element = section.querySelector('.element');
					const li = element.querySelector('li');
					section.setAttribute('data-label-search', field);
					section.setAttribute('data-table-name', table);
					li.innerText = field;
					li.setAttribute('label', field);
					ul.appendChild(section);
					li.onclick = app.selectColumn;
				});
				parent.appendChild(ul);
			}
			/*Dim.selected = dimName;
			console.log('hierarchies : ', Dim.selected.hierarchies);
			for (const hier in Dim.selected.hierarchies) {
				for (const table in Dim.selected.hierarchies[hier]) {
					// ciclo le tabelle presenti nella gerarchia
					const contentElement = app.tmpl_ulListHidden.content.cloneNode(true);
					const section = contentElement.querySelector('section');
					const element = section.querySelector('.element');
					const li = element.querySelector('li');
					const iColumns = element.querySelector('#columns-icon');
					const iFilter = element.querySelector('#filter-icon');
					section.setAttribute('data-label-search', Dim.selected.hierarchies[hier][table]); // utilizzabile per la ricerca dalla input sopra
					section.setAttribute('data-dimension-id', dimName); // utilizzabile dalla dimensione + gerarchia selezionata
					section.setAttribute('data-hier-id', hier);
					li.innerText = Dim.selected.hierarchies[hier][table];
					iColumns.setAttribute('data-dimension-name', dimName); // attributo che viene letto in app.handlerTableSelected per recuperare la property 'columns' della dimensione
					iColumns.setAttribute('data-table-name', Dim.selected.hierarchies[hier][table]);
					// imposto onclick sulle icone columns e filter
					iColumns.onclick = app.handlerTableSelectedColumns; // apre la dialog dialogTables per impostare gli alias e SQL per le colonne
					// iColumns.onclick = app.handlerTableSelectedColumns; // apre la dialog dialogFilter per impostare i filtri
					ul.appendChild(section);
				}
				parent.appendChild(ul);
			}*/
		}
	};

	app.getFiltersInFrom = () => {
		console.clear();
		const content = app.tmpl_ulList.content.cloneNode(true);
		const ul = content.querySelector("ul[data-id='fields-filter']");
		const parent = document.getElementById('existFilters'); // dove verrà inserita la <ul>
		console.log('Dim.dimension : ', Dim.dimensions);
		for (const [key, value] of (Object.entries(Dim.dimensions))) {
			// key : nome della dimensione
			// value : tutte le property della dimensione
			console.log('key : ', key);
			// console.log('value : ', value.from);
			value.from.forEach( (table) => {
				console.log('table : ', table);
				const filters = StorageFilter.tableFilters(table);
				filters.forEach( (filter) => {
					const contentElement = app.tmpl_ulListWithEdit.content.cloneNode(true);
					const section = contentElement.querySelector('section');
					const element = section.querySelector('.element');
					const li = element.querySelector('li');
					const iEdit = element.querySelector('#edit-icon');
					section.setAttribute('data-label-search', filter.name);
					section.setAttribute('data-table-name', table);
					li.innerText = filter.name;
					li.setAttribute('label', filter.name);
					ul.appendChild(section);
					// li.onclick = app.selectColumn;
				});
				parent.appendChild(ul);
			});
		}
	};

	app.getCubes();

	app.getDimensions();

	app.getHierarchies();

	app.getTablesInHierarchies();

	app.getColumnsInTable();

	app.getFiltersInFrom();

	app.datamartToBeProcessed();

	// abilito il tasto btnFilterSave se il form per la creazione del filtro è corretto
	app.checkFilterForm = () => {
		const filterName = document.getElementById('inputFilterName');
		const filterFormula = document.getElementById('filterSQLFormula');
		//console.log(filterFormula.childElementCount);
		// verifica se il nome del filtro è stato inserito
		// verifica se la formula è stata inserita
		( (filterName.value.length !== 0) && (filterFormula.value.length !== 0) ) ? app.btnFilterSave.disabled = false : app.btnFilterSave.disabled = true;
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

	document.addEventListener('input', (e) => {
		// console.log('currentTarget : ', e.target);
		if (e.target.hasAttribute('type') && e.target.getAttribute('type') === 'search') {
			e.target.oninput = App.searchInSectionList;
		}
	});

	// input di ricerca nella dialogFilter, ricerca nell'elenco dei valori
	// document.getElementById('valuesSearch').oninput = App.searchInList;

	// input per filter-name, controllo se il form per la creazione del filtro è convalidato
	/*document.getElementById('filter-name').oninput = function(e) {
		// TODO: controllo se il form è completato
		app.checkFilterForm();
	};*/

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