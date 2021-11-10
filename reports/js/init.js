var App = new Application();
var Query = new Queries();
const Dim = new DimensionStorage();
var StorageCube = new CubeStorage();
var StorageProcess = new ProcessStorage();
var StorageFilter = new FilterStorage();
var StorageMetric = new MetricStorage();

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
		ulDimensions : document.getElementById('dimensions'),
		aggregationFunction : document.getElementById('function-list')
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
		console.log('cube selected : ', StorageCube.selected.name);
		e.currentTarget.toggleAttribute('selected');
		if (e.currentTarget.hasAttribute('selected')) {
			// Query.addFromCubes(StorageCube.selected.FACT);
			// visualizzo la <ul> contentente le dimensioni appartenenti al cubo selezionato
			document.querySelectorAll("ul[data-id='fields-dimensions'] > section[data-cube-name='"+StorageCube.selected.name+"']").forEach( (dimension) => {
				// console.log('Dimensioni del cubo selezionato : ', dimension);
				dimension.hidden = false;
				dimension.toggleAttribute('data-searchable');
			});
			// visualizzo la FACT nello step 3 Metrics
			document.querySelectorAll("ul[data-id='fields-tables'] > section[data-cube-name='"+StorageCube.selected.name+"']").forEach( (table) => {
				table.hidden = false;
				table.toggleAttribute('data-searchable');
			});
		} else {
			// deselect cube
			document.querySelectorAll("ul[data-id='fields-dimensions'] > section[data-cube-name='"+StorageCube.selected.name+"']").forEach( (table) => {
				table.hidden = true;
				table.toggleAttribute('data-searchable');
			});
			// nascondo la FACT nello step 3
			document.querySelectorAll("ul[data-id='fields-tables'] > section[data-cube-name='"+StorageCube.selected.name+"']").forEach( (table) => {
				table.hidden = true;
				table.toggleAttribute('data-searchable');
			});
		}
	};

	app.handlerDimensionSelected = (e) => {
		Dim.selected = e.currentTarget.getAttribute('data-dimension-name');
		console.log('Dimensione selezionata : ', Dim.selected);
		e.currentTarget.toggleAttribute('selected');
		if (e.currentTarget.hasAttribute('selected')) {
			document.querySelectorAll("ul[data-id='fields-hierarchies'] > section[data-dimension-name='"+Dim.selected.name+"']").forEach( (hier) => {
				// console.log('elenco gerarchie appartententi alla dimensione selezionata : ', hier);
				hier.hidden = false;
				hier.toggleAttribute('data-searchable');
			});
			Query.factRelation = Dim.selected;
			// Query.where = Dim.selected.join;
			// Query.from = Dim.selected.from;
		} else {
			// TODO: deselect cube
			document.querySelectorAll("ul[data-id='fields-hierarchies'] > section[data-dimension-name='"+Dim.selected.name+"']").forEach( (hier) => {
				// console.log('elenco gerarchie appartententi alla dimensione selezionata : ', hier);
				hier.hidden = true;
				hier.toggleAttribute('data-searchable');
			});
			// TODO: delete factRelation
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
		StorageFilter.filter = e.currentTarget.getAttribute('label');
		e.currentTarget.toggleAttribute('selected');
		Query.filterName = StorageFilter.filter.name;
		if (e.currentTarget.hasAttribute('selected')) {
			// recupero dallo storage il filtro selezionato
			console.log(StorageFilter.filter);
			console.log(StorageFilter.filter.formula);
			Query.filters = StorageFilter.filter.formula;
		} else {
			// delete filter
			Query.deleteFilter();
		}
	};

	// selezione di una metrica già esistente, lo salvo nell'oggetto Query, come quando si salva un nuovo filtro dalla dialog
	app.handlerMetricSelected = (e) => {
		StorageMetric.metric = e.currentTarget.getAttribute('label');
		e.currentTarget.toggleAttribute('selected');
		if (e.currentTarget.hasAttribute('selected')) {
			// aggiungo la metrica
			// recupero dallo StorageMetric la metrica selezionata
			debugger;
			console.log(StorageMetric.metric);
			console.log(StorageMetric.metric.name);
			console.log(StorageMetric.metric.formula);
			Query.metricName = StorageMetric.metric.name;
			// se la metrica contiene un filtro bisogna aggiungerla a Query.filteredMetrics altrimenti a Query.metrics
			if (StorageMetric.metric.formula[StorageMetric.metric.name].hasOwnProperty('filters')) {
				Query.filteredMetrics = StorageMetric.metric.formula[StorageMetric.metric.name];
			} else {
				Query.metrics = StorageMetric.metric.formula[StorageMetric.metric.name];
			}
		} else {
			// elimino la metrica
		}
	};

	// selezione della metrica, apro la dialog per impostare la metrica
	app.handlerSelectedMetricToSet = (e) => {
		Query.field = e.currentTarget.getAttribute('label');
		app.dialogMetric.querySelector('h4 > span').innerHTML = Query.field;
		app.dialogMetric.querySelector('section').setAttribute('data-table-selected', e.currentTarget.getAttribute('data-table-name'));

		// ul.querySelectorAll('.element').forEach((el) => {el.remove();});
		// carico elenco filtri presenti su tutte le tabelle che fanno parte di tutte le dimensioni selezionate
		// 1 new : per ogni tabella presente nelle dimensioni dei cubi selezionati, visualizzo l'elenco dei filtri presenti nello storage
		const content = app.tmpl_ulList.content.cloneNode(true);
		const ul = content.querySelector("ul[data-id='fields-filter']");
		const parent = document.getElementById('existsFilter_Metric'); // dove verrà inserita la <ul>
		// ripulisco la lista dei filtri
		if (parent.querySelector('ul')) parent.querySelector('ul').remove();
		console.log('Dim.dimension : ', Dim.dimensions);
		for (const [key, value] of (Object.entries(Dim.dimensions))) {
			// per ogni tabella presente nella property 'from' recupero i filtri presenti nello storage
			value.from.forEach( (table) => {
				console.log('table : ', table);
				const filters = StorageFilter.tableFilters(table);
				filters.forEach( (filter) => {
					const contentElement = app.tmpl_ulListSection.content.cloneNode(true);
					const section = contentElement.querySelector('section');
					const element = section.querySelector('.element');
					const li = element.querySelector('li');
					section.hidden = false;
					section.setAttribute('data-label-search', filter.name);
					section.setAttribute('data-table-name', table);
					li.innerText = filter.name;
					li.setAttribute('label', filter.name);
					ul.appendChild(section);
					li.onclick = e => e.currentTarget.toggleAttribute('selected');
				});
				parent.appendChild(ul);
			});
		}
	
		app.dialogMetric.showModal();
	};

	// selezione della tabella nella sezione Column
	app.handlerTableSelectedColumns = (e) => {
		console.clear();
		Query.table = e.currentTarget.getAttribute('data-table-name');
		Query.tableId = +e.currentTarget.getAttribute('data-table-id');
		// console.log('e.currentTarget : ', e.currentTarget);
		console.log('Query.table : ', Query.table);
		console.log('Query.tableId : ', Query.tableId);
		// visualizzo elenco dei campi, aggiunti in fase di mapping, della tabella selezionata
		app.dialogTables.querySelector('section').setAttribute('data-table-selected', Query.table);
		app.dialogTables.querySelector('section').setAttribute('data-hier-name', e.currentTarget.getAttribute('data-hier-name'));
		app.dialogTables.querySelector('section').setAttribute('data-dimension-name', e.currentTarget.getAttribute('data-dimension-name'));
		// visualizzo solo i campi della tabella selezionata
		document.querySelectorAll("ul[data-id='fields-column'] > section[data-table-name='"+Query.table+"']").forEach( (table) => {
			table.hidden = false;
			table.toggleAttribute('data-searchable');
		});
		// nascondo i field NON appartenenti alla tabella selezionata
		document.querySelectorAll("ul[data-id='fields-column'] > section:not([data-table-name='"+Query.table+"'])").forEach( table => table.hidden = true);
		app.dialogTables.querySelector('h4 > span').innerHTML = Query.table;
		app.dialogTables.showModal();
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

	// selezione della FACT nella sezione metric
	app.handlerTableSelectedMetrics = (e) => {
		const fact = e.currentTarget.getAttribute('data-fact');
		Query.from = fact;
		e.currentTarget.toggleAttribute('selected');
		if (e.currentTarget.hasAttribute('selected')) {
			document.querySelectorAll("ul[data-id='fields-metric'] > section[data-fact='"+fact+"']").forEach( (metric) => {
				metric.hidden = false;
				metric.toggleAttribute('data-searchable');
			});
		} else {
			// deselezione
			document.querySelectorAll("ul[data-id='fields-metric'] > section[data-fact='"+fact+"']").forEach( (metric) => {
				metric.hidden = true;
				metric.toggleAttribute('data-searchable');
			});
		}
	};

	// selezione della tabella nello step Filter, visualizzo i filtri creati su questa tabella, recuperandoli dallo storage
	app.handlerTableSelectedFilter = (e) => {
		console.info('Tabella selezionata: ', e.currentTarget.getAttribute('data-table-name'));
		Query.table = e.currentTarget.getAttribute('data-table-name');
		Query.tableId = +e.currentTarget.getAttribute('data-table-id');
		// visualizzo elenco dei campi, aggiunti in fase di mapping, della tabella selezionata
		app.dialogFilter.querySelector('section').setAttribute('data-table-selected', Query.table);
		app.dialogFilter.querySelector('section').setAttribute('data-hier-name', e.currentTarget.getAttribute('data-hier-name'));
		app.dialogFilter.querySelector('section').setAttribute('data-dimension-name', e.currentTarget.getAttribute('data-dimension-name'));
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
	/*app.handlerFilterOperatorSelected = (e) => {
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
	};*/

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
				  console.debug('Dati non recuperati');
				}
			})
		.catch( (err) => console.error(err));
	};

	app.btnColumnDone.onclick = (e) => {
		// console.log('Query.table : ', Query.table);
		// console.log('Query.tableId : ', Query.tableId);
		const hier = app.dialogTables.querySelector('section').getAttribute('data-hier-name');
		const list = document.getElementById('fieldList-tables');
		Dim.selected = app.dialogTables.querySelector('section').getAttribute('data-dimension-name');
		const liTable = list.querySelector('section[data-label-search="'+Query.table+'"][data-hier-name="'+hier+'"] li'); // elemento <li> che contiene il nome della tabella da impostare
		const columnIcon = list.querySelector('section[data-label-search="'+Query.table+'"][data-hier-name="'+hier+'"] #columns-icon-'+hier+"-"+Query.table);
		// console.log('query.select : ', Query.select[Query.table]);
		if (Query.select[Query.table]) {
			// Ci sono campi selezionati per questa tabella, aggiungo anche il campo 'id' di questa tabella.
			// TODO: al momento disattivato
			/*const fieldList = document.getElementById('table-fieldList');
			Query.field = fieldList.querySelector('section[data-table-name="'+Query.table+'"]').getAttribute('data-label-search');
			Query.select = {SQLFormat: null, alias : Query.table+"_"+Query.field};
			*/
			// TODO: aggiungo anche la primaryKey per questa tabella (Questo serve per fare la join tra le varie temp table quando ci sono metriche filtrate)
			
			for ( const [k, table] of Object.entries(Dim.selected.hierarchies[hier])) {
				// recupero la property 'join' (nella dimensione) dove la key è maggiore della tableId al momento selezionata (Quindi recupero tutte le hier inferiori)
				if (+k >= Query.tableId) {
					Query.from = table;
					if (Dim.selected.join[+k]) {
						Query.joinId = +k;
						Query.where = Dim.selected.join[+k];
					};
				};
			}
			liTable.setAttribute('data-columns', true);
			columnIcon.setAttribute('selected', true);
		} else {
			debugger;
			// non ci sono filtri impostati/selezionati per questa tabella, la elimina da Query.from e deseleziono con l'attr 'selected' in 'fieldList-tables'
			liTable.removeAttribute('data-columns');
			columnIcon.removeAttribute('selected');
			// se l'elemento <li> con il nome della tabella NON contiene l'attr data-filters (quindi su questa tabella non è stato impostato un filtro) la posso eliminare dalla _from e dalla _join
			if (!liTable.hasAttribute('data-filters')) {
				for ( const [k, table] of Object.entries(Dim.selected.hierarchies[hier])) {
					// recupero la property 'join' (nella dimensione) dove la key è maggiore della tableId al momento selezionata
					if (+k <= Query.tableId) {
						Query.deleteFrom(Query.table);
						if (Dim.selected.join[+k]) {
							Query.joinId = +k;
							Query.deleteWhere();
						};
					};
				}
			}
		}
		app.dialogTables.close();
	};

	// tasto 'fatto' nella dialogMetric, salvo la metrica impostata
	app.btnMetricDone.onclick = (e) => {
		const name = app.dialogMetric.querySelector('#metric-name').value;
		const alias = document.getElementById('alias-metric').value;
		const SQLFunction = document.querySelector('#function-list > li[selected]').getAttribute('label');
		const distinctOption = document.getElementById('checkbox-distinct').checked;
		Query.table = app.dialogMetric.querySelector('section').getAttribute('data-table-selected');
		Query.metricName = name;
		console.log(Query.metricName);
		//console.log(Query.table);
		// verifico se ci sono filtri da associare a questa metrica
		const ul = app.dialogMetric.querySelector('#existsFilter_Metric > ul');
		console.log('ul con filtri all\'interno della metrica : ', ul);
		let filtersAssociated = {};
		// const filterStorage = new FilterStorage()
		ul.querySelectorAll('section li[selected]').forEach((filter) => {
			// filtersAssociated.push(filter.getAttribute('label'));
			// set il nome del filtro
			StorageFilter.filter = filter.getAttribute('label');
			// recupero dallo storage il contenuto del filtro per inserirlo in un object (quest'ultimo verrà inserito nella metrica)
			filtersAssociated[filter.getAttribute('label')] = StorageFilter.filter;
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

		// salvo la nuova metrica nello storage
		console.log(metricObj)
		StorageMetric.save = metricObj
		
		// storage.save = metricObj;

		app.dialogMetric.close();
	};

	// salvataggio del filtro impostato nella dialog
	app.btnFilterSave.onclick = (e) => {
		console.log(Query.table);
		// Filter save
		const textarea = document.getElementById('filterSQLFormula');
		let filterName = document.getElementById('inputFilterName');
		
		Query.filterName = filterName.value;

		debugger;
		const formula = `${Query.table}.${textarea.value}`;
		// ciclo gli elementi nella formula per creare il filtro
		// Array.from(document.querySelectorAll('#filterFormula > span')).forEach((span) => {
		// 	//console.log(span);
		// 	formula += (span.classList.contains('formulaField')) ? `${Query.table}.${span.innerText} `: `${span.innerText} `;
		// });
	
		console.log(formula);

		// Query.filters = formula.trimEnd();
		// Quando creo un filtro su una determinata tabella posso riutilizzarlo elencando la lista dei filtri già creati, successivamnete...
		// ...cliccando una determinata tabella mostro l'elenco dei filtri già creati per questa tabella, in modo da non duplicarli e/o non doverli ricreare
		// const filterObj = ;
		StorageFilter.save = {'type': 'FILTER', 'name': filterName.value, 'table': Query.table, formula};
	
		// visualizzo il filtro appena creato nella section #sectionFields-filter
		// TODO: e anche nella lista dei filtri esistenti all'interno della metrica, se si vuole utilizzarlo nella metrica 
		/*const ulFilterMetric = document.getElementById('ul-existsFilter_Metric');
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
		textarea.querySelectorAll('span').forEach((span) => {span.remove();});*/
	};

	app.btnFilterDone.onclick = () => {
		// console.log(Query.filters);
		console.log('Query.table : ', Query.table);
		let hier = app.dialogFilter.querySelector('section').getAttribute('data-hier-name');
		const list = document.getElementById('fieldList-tables');
		Dim.selected = app.dialogFilter.querySelector('section').getAttribute('data-dimension-name');
		const liTable = list.querySelector('section[data-label-search="'+Query.table+'"][data-hier-name="'+hier+'"] li'); // elemento <li> che contiene il nome della tabella da impostare
		const columnIcon = list.querySelector('section[data-label-search="'+Query.table+'"][data-hier-name="'+hier+'"] #filter-icon-'+hier+"-"+Query.table);
		// console.log('filterIcon : ', filterIcon);
		console.log(Query.filters);
		console.log(Query.filters[Query.table]);
		debugger;
		if (Query.filters[Query.table]) {
		// if (Object.keys(Query.filters).length !== 0) {
			// sono stati selezionati dei filtri per questa tabella, imposto il nome della tabella con l'attr 'selected' in 'fieldList-tables'
			
			for ( const [k, table] of Object.entries(Dim.selected.hierarchies[hier])) {
				// recupero la property 'join' (nella dimensione) dove la key è maggiore della tableId al momento selezionata
				if (+k >= Query.tableId) {
					Query.from = table;
					if (Dim.selected.join[+k]) {
						Query.joinId = +k;
						Query.where = Dim.selected.join[+k];
					}
				};
			}
			list.querySelectorAll('section[data-label-search="'+Query.table+'"][data-hier-name="'+hier+'"]').forEach( (section) => {
				section.querySelector('li').setAttribute('data-filters', true);
				section.querySelector('#filter-icon-'+hier+"-"+Query.table).setAttribute('selected', true);
			});
		} else {
			debugger;
			// non ci sono filtri impostati/selezionati per questa tabella, la elimina da Query.from e deseleziono con l'attr 'selected' in 'fieldList-tables'
			list.querySelectorAll('section[data-label-search="'+Query.table+'"][data-hier-name="'+hier+'"]').forEach( (section) => {
				section.querySelector('li').removeAttribute('data-filters');
				section.querySelector('#filter-icon-'+hier+"-"+Query.table).removeAttribute('selected');
			});
			Query.deleteFrom(Query.table);
		}		
		app.dialogFilter.close();
	};

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
				li.setAttribute('data-cube-name', cubeName);
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
				for (const [key, value] of Object.entries(Dim.selected.hierarchies[hier])) {
					// ciclo le tabelle presenti nella gerarchia
					const contentElement = app.tmpl_ulListHidden.content.cloneNode(true);
					const section = contentElement.querySelector('section');
					const element = section.querySelector('.element');
					const li = element.querySelector('li');
					const iColumns = element.querySelector('#columns-icon');
					const iFilter = element.querySelector('#filter-icon');
					section.setAttribute('data-label-search', value); // utilizzabile per la ricerca dalla input sopra
					section.setAttribute('data-dimension-name', dimName); // utilizzabile dalla dimensione + gerarchia selezionata
					section.setAttribute('data-hier-name', hier);
					li.innerText = value;
					li.setAttribute('data-table-id', key);
					li.setAttribute('label', value);
					iColumns.setAttribute('data-dimension-name', dimName); // attributo che viene letto in app.handlerTableSelected per recuperare la property 'columns' della dimensione
					iColumns.setAttribute('data-table-name', value);
					iColumns.setAttribute('data-hier-name', hier);
					iColumns.id = "columns-icon-"+hier+"-"+value;
					iColumns.setAttribute('data-table-id', key);
					iFilter.setAttribute('data-dimension-name', dimName);
					iFilter.setAttribute('data-table-name', value);
					iFilter.id = "filter-icon-"+hier+"-"+value;
					iFilter.setAttribute('data-hier-name', hier);
					iFilter.setAttribute('data-table-id', key);
					// imposto onclick sulle icone columns e filter
					iColumns.onclick = app.handlerTableSelectedColumns; // apre la dialog dialogTables per impostare gli alias e SQL per le colonne
					iFilter.onclick = app.handlerTableSelectedFilter; // apre la dialog dialogFilter per impostare i filtri
					iFilter.setAttribute('data-popup-label', 'Filtri');
					iColumns.setAttribute('data-popup-label', 'Colonne');
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
				debugger;
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

	// recupero elenco di tutti i filtri presenti nello storage, per ogni dimensione
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
					iEdit.setAttribute('data-popup-label', "Modifica filtro");
					section.setAttribute('data-label-search', filter.name);
					section.setAttribute('data-table-name', table);
					li.innerText = filter.name;
					li.setAttribute('label', filter.name);
					ul.appendChild(section);
					li.onclick = app.handlerFilterSelected;
				});
				parent.appendChild(ul);
			});
		}
	};

	app.getTables = () => {
		const content = app.tmpl_ulList.content.cloneNode(true);
		const ul = content.querySelector("ul[data-id='fields-tables']");
		const parent = document.getElementById('tableList-metric'); // dove verrà inserita la <ul>
		// creo un unica <ul> con dentro tutte le dimensioni, queste verranno filtrate quando si selezionano uno o più cubi
		// console.log('lista cubi : ', StorageCube.cubes); // tutta la lista dei cubi
		for (const [cubeName, cubeValue] of (Object.entries(StorageCube.cubes))) {
			// console.log('key : ', cubeName);
			// console.log('value : ', cubeValue); // tutto il contenuto del cubo
			// console.log('metriche : ', cubeValue.metrics);
			// console.log('metriche : ', cubeValue.FACT);
			// debugger;
			// per ogni cubo leggo la fact
			const contentElement = app.tmpl_ulListSection.content.cloneNode(true);
			const section = contentElement.querySelector('section');
			const element = section.querySelector('.element');
			const li = element.querySelector('li');
			section.setAttribute('data-label-search', cubeValue.FACT); // questo attr consente la ricerca dalla input sopra
			section.setAttribute('data-cube-name', cubeName); // questo attr consente la ricerca dalla selezione del cubo
			li.innerText = cubeValue.FACT;
			li.setAttribute('data-fact', cubeValue.FACT);
			li.setAttribute('label', cubeValue.FACT);
			ul.appendChild(section);
			li.onclick = app.handlerTableSelectedMetrics;
			parent.appendChild(ul);
		}
	};

	// elenco di tutte le metriche impostate all'interno del cubo, queste sono le metriche che si possono impostare, quindi mettere la funzione (SUM, AVG, ecc...), il distinct e l'alias
	app.getMetricsInCubes = () => {
		const content = app.tmpl_ulList.content.cloneNode(true);
		const ul = content.querySelector("ul[data-id='fields-metric']");
		const parent = document.getElementById('metrics'); // dove verrà inserita la <ul>
		// creo un unica <ul> con dentro tutte le dimensioni, queste verranno filtrate quando si selezionano uno o più cubi
		// console.log('lista cubi : ', StorageCube.cubes); // tutta la lista dei cubi
		for (const [cubeName, cubeValue] of (Object.entries(StorageCube.cubes))) {
			// per ogni FACT aggiungo l'elenco delle metriche impostate sul cubo nel div #metrics
			cubeValue.metrics[cubeValue.FACT].forEach( (metric) => {
				// console.log('metric : ', metric);
				const contentElement = app.tmpl_ulListSection.content.cloneNode(true);
				const section = contentElement.querySelector('section');
				const element = section.querySelector('.element');
				const li = element.querySelector('li');
				section.setAttribute('data-label-search', metric); // questo attr consente la ricerca dalla input sopra
				section.setAttribute('data-fact', cubeValue.FACT); // questo attr consente la ricerca dalla selezione del cubo
				li.innerText = metric;
				li.setAttribute('label', metric);
				li.setAttribute('data-table-name', cubeValue.FACT);
				ul.appendChild(section);
				li.onclick = app.handlerSelectedMetricToSet; // metrica da impostare
				parent.appendChild(ul);
			});
		}
	};

	// recupero tutte le metriche esistenti dallo storage, per tutti i cubi. Queste sono le metriche che sono state già impostate e quindi si possono già utilizzare nel report che si sta creando
	app.getMetrics = () => {
		const content = app.tmpl_ulList.content.cloneNode(true);
		const ul = content.querySelector("ul[data-id='fields-metric']");
		const parent = document.getElementById('existMetrics'); // dove verrà inserita la <ul>
		// creo un unica <ul> con dentro tutte le dimensioni, queste verranno filtrate quando si selezionano uno o più cubi
		// console.log('lista cubi : ', StorageCube.cubes); // tutta la lista dei cubi
		for (const [cubeName, cubeValue] of (Object.entries(StorageCube.cubes))) {
			// console.log('StorageMetric : ', StorageMetric.metrics);
			for ( const [metricName, metric] of Object.entries(StorageMetric.metrics)) {
				const contentElement = app.tmpl_ulListSection.content.cloneNode(true);
				const section = contentElement.querySelector('section');
				const element = section.querySelector('.element');
				const li = element.querySelector('li');
				section.setAttribute('data-label-search', metricName); // questo attr consente la ricerca dalla input sopra
				section.setAttribute('data-fact', cubeValue.FACT); // questo attr consente la ricerca dalla selezione del cubo
				li.innerText = metricName;
				li.setAttribute('label', metricName);
				ul.appendChild(section);
				li.onclick = app.handlerMetricSelected;
				parent.appendChild(ul);
			}
		}
	};

	app.getCubes();

	app.getDimensions();

	app.getHierarchies();

	app.getTablesInHierarchies();

	app.getColumnsInTable();

	app.getFiltersInFrom();

	app.getTables();

	app.getMetricsInCubes();

	app.getMetrics();

	app.datamartToBeProcessed();

	// abilito il tasto btnFilterSave se il form per la creazione del filtro è corretto
	app.checkFilterForm = () => {
		const filterName = document.getElementById('inputFilterName');
		const filterFormula = document.getElementById('filterSQLFormula');
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
		// recupero tutte le colonne/filtro selezionate per impostare _from
		console.log('Query.filters : ', Query.filters);
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
	// document.getElementById('fieldSearch').oninput = App.searchInList;

	document.addEventListener('input', (e) => {
		// console.log('currentTarget : ', e.target);
		if (e.target.hasAttribute('type') && e.target.getAttribute('type') === 'search') {
			e.target.oninput = App.searchInSectionList;
		}
	});

	// eventi mouseEnter/Leave su tutte le icon con l'attributo data-popup-label
	document.querySelectorAll('i[data-popup-label]').forEach( (icon) => {
		icon.onmouseenter = app.showPopup;
		icon.onmouseleave = app.hidePopup;
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

	app.checkDialogMetric = () => {
		const metricName = document.getElementById('metric-name').value;
		const aliasMetric = document.getElementById('alias-metric').value;
		(metricName.length !== 0 && aliasMetric.length !== 0) ? app.btnMetricDone.disabled = false : app.btnMetricDone.disabled = true;
	};

	document.getElementById('alias-metric').oninput = () => app.checkDialogMetric();

	document.getElementById('metric-name').oninput = () => app.checkDialogMetric();

	document.getElementById('inputFilterName').oninput = () => app.checkFilterForm();

	document.getElementById('filterSQLFormula').oninput = () => app.checkFilterForm();

	// operatori logici nella dialog Filter (AND, OR, NOT, ecc...)
	document.querySelectorAll('#logicalOperator > span').forEach((span) => {
		span.onclick = app.handlerLogicalOperatorSelected;
	});

	// funzioni di aggregazione da selezionare nella dialogMetrics
	app.aggregationFunction.onclick = (e) => {
		// deseleziono altre funzioni di aggregazione precedentemente selezionate e seleziono quella e.target
		e.path[1].querySelector('li[selected]').toggleAttribute('selected');
		// console.log('e.target : ', e.target.toggleAttribute('selected'))
		e.target.toggleAttribute('selected');
	};

	// 'Salva' nella dialogTables
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