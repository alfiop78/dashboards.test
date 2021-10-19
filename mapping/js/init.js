var App = new Application();
var cube = new Cube();
var dimension = new Dimension();
// TODO: dichiarare qui le altre Classi
(() => {
	var app = {
		dialogCubeName : document.getElementById('cube-name'),
		dialogDimensionName : document.getElementById('dimension-name'),
		dialogHierarchyName : document.getElementById('hierarchy-name'),
		dialogReportList : document.getElementById('dialog-report-list'),

		hierarchyContainer : document.getElementById('hierarchiesContainer'),

		btnBack : document.getElementById('mdc-back'),
		btnNewReport: document.getElementById('mdc-new-report'),

		btnSaveDimension : document.getElementById('saveDimension'),
		btnSaveHierarchy : document.getElementById('hierarchySave'),
		btnSaveCube : document.getElementById('saveCube'),
		btnSaveCubeName : document.getElementById('btnCubeSaveName'),

		tmplCloseTable : document.getElementById('closeTable'), // tasto close table
		tmplInputSearch : document.getElementById('inputSearch'), // input per ricerca fields nelle tabelle
		tmplSectionOption : document.getElementById('sectionOption'), // options laterale per ogni tabella

		// tasto openTableList
		btnTableList : document.getElementById('openTableList'),
		tableList : document.getElementById('tableList'),
		// tasto openDimensionList per l'apertura dell'elenco delle dimensioni
		btnDimensionList : document.getElementById('openDimensionList'),
		dimensionList : document.getElementById('dimensionList'),

		btnNewFact : document.getElementById('mdc-newFact'),

		card : null,
		cardTitle : null,
		content : document.getElementById('content'),
		body : document.getElementById('body'),
		// dropzone : document.getElementsByClassName('dropzone')[0],
		currentX : 0,
		currentY : 0,
		initialX : 0,
		initialY : 0,
		active : false,
		xOffset : 0,
		yOffset : 0,
		dragElement : null,
		elementMenu : null
	};

	App.init();

	app.dragStart = function(e) {
		// mousedown da utilizzare per lo spostamento dell'elemento
		if (e.target.localName === 'h6') {
			app.cardTitle = e.target;
			app.card = e.path[4];
			// recupero la posizione attuale della card tramite l'attributo x-y impostato su .cardTable
			app.xOffset = e.path[4].getAttribute('x');
			app.yOffset = e.path[4].getAttribute('y');
		}
		// cardTitle = document.querySelector('.card.table .title > h6');
		if (e.type === 'touchstart') {
			app.initialX = e.touches[0].clientX - app.xOffset;
			app.initialY = e.touches[0].clientY - app.yOffset;
		} else {
			app.initialX = e.clientX - app.xOffset;
			app.initialY = e.clientY - app.yOffset;
		}
		if (e.target === app.cardTitle) {app.active = true;}
	};

	app.dragEnd = function() {
		// console.log(e.target);
		// mouseup, elemento rilasciato dopo lo spostamento
		app.initialX = app.currentX;
		app.initialY = app.currentY;
		app.active = false;
	};

	app.drag = function(e) {
		// mousemove elemento si sta spostato
		// console.log(e.target);
		// console.log(e);
		if (app.active) {
			e.preventDefault();

			if (e.type === 'touchmove') {
				app.currentX = e.touches[0].clientX - app.initialX;
				app.currentY = e.touches[0].clientY - app.initialY;
			} else {
				app.currentX = e.clientX - app.initialX;
				app.currentY = e.clientY - app.initialY;
			}

			app.xOffset = app.currentX;
			app.yOffset = app.currentY;
			// imposto sulla .cardTable le posizioni dove è 'stato lasciato'  dopo il drag in modo da "riprendere" lo
			// spostamento da dove era rimasto
			app.card.setAttribute('x', app.xOffset);
			app.card.setAttribute('y', app.yOffset);

			app.card.style.transform = 'translate3d(' + app.currentX + 'px, ' + app.currentY + 'px, 0)';
		}
	};

	app.body.onmousedown = app.dragStart;
	app.body.onmouseup = app.dragEnd;
	app.body.onmousemove = app.drag;

	// TODO: aggiungere anhce eventi touch...

	app.handlerDragStart = function(e) {
		// console.log('start');
		// dragStart
		// console.log(e.target.id);
		// return;
		e.dataTransfer.setData('text/plain', e.target.id);
		app.dragElement = document.getElementById(e.target.id);
		// console.log(e.path);
		app.elementMenu = e.path[1]; // elemento da eliminare al termine drl drag&drop
		// console.log(e.dataTransfer);
	};

	app.handlerDragOver = function(e) {
		// console.log('dragOver');
		e.preventDefault();
	};

	app.handlerDragEnter = function(e) {
		// console.log('dragEnter');
		e.preventDefault();
		// console.log(e.target);

		if (e.target.className === 'dropzone') {
		  console.info('DROPZONE');
		  // TODO: css effect
		}
	};

	app.handlerDragLeave = function(e) {
		e.preventDefault();
		// console.log('dragLeave');
	};

	app.handlerDragEnd = function(e) {
		e.preventDefault();
		// console.log('dragEnd');
		// console.log(e.target);
		// faccio il DESCRIBE della tabella
		app.getTable(cube.card.tableName);
	};

	app.handlerDrop = function(e) {
		e.preventDefault();
		// console.log('drop');
		// console.log(e.target);
		let data = e.dataTransfer.getData('text/plain');
		let card = document.getElementById(data);
		// console.log(e.dataTransfer);
		// console.log(e.target);
		// nuova tabella droppata
		// console.log(card);
		// console.log(app.dragElement);
		// TODO: dopo il drop elimino l'elemento <li> e imposto il template #cardLayout
		// TODO: la .card .draggable diventa .card .table
		card.className = 'card table';
		card.removeAttribute('draggable');
		card.removeAttribute('name');
		// elimino lo span all'interno della card
		card.querySelector('span[label]').remove();
		// associo gli eventi mouse
		card.onmousedown = app.dragStart;
		card.onmouseup = app.dragEnd;
		card.onmousemove = app.drag;
		// TODO: prendo il template cardLayout e lo inserisco nella card table
		let tmpl = document.getElementById('cardLayout');
		let content = tmpl.content.cloneNode(true);
		let cardLayout = content.querySelector('.cardLayout');

		// imposto il titolo in h6
		cardLayout.querySelector('h6').innerHTML = card.getAttribute('label');
		card.appendChild(cardLayout);

		app.body.appendChild(card);
		// tabella fact viene colorata in modo diverso, imposto attributo fact sia sulla .card.table che sulla .cardTable
		if (app.btnTableList.hasAttribute('fact')) {
		  card.setAttribute('fact', true);
		  card.querySelector('.cardTable').setAttribute('fact', true);
		  // visualizzo l'icona metrics
		  card.querySelector('section[options] > .popupContent[hide]').removeAttribute('hide');
		}

		// imposto la card draggata nella posizione dove si trova il mouse
		card.style.transform = 'translate3d(' + e.offsetX + 'px, ' + e.offsetY + 'px, 0)';
		card.setAttribute('x', e.offsetX);
		card.setAttribute('y', e.offsetY);
		// chiudo la list openTableList
		app.btnTableList.removeAttribute('open');
		app.tableList.toggleAttribute('hidden');

		// evento sul tasto close della card
		card.querySelector('i[data-id="closeTable"]').onclick = app.handlerCloseCard;
		// evento sulla input di ricerca nella card
		card.querySelector('input').oninput = App.searchInList;
	
		cube.activeCard = {'ref': card.querySelector('.cardTable'), 'tableName': card.getAttribute('label')};
		// inserisco il nome della tabella selezionata nella card [active]
		// cube.table = card.getAttribute('label');

		// inserisco il nome della tabella nella struttura gerarchica sulla destra
		const hierarchiesTables = document.getElementById('hierTables');
		let id = hierarchiesTables.childElementCount;
		// let dropzone = document.createElement('div');
	
		// dropzone.classList = 'dropzoneHier';
		// hierarchiesTables.appendChild(dropzone);
		let div = document.createElement('div');
		div.className = 'hier table dropzoneHier';
		div.id = 'relation_' + id;
		div.setAttribute('draggable', true);
		div.setAttribute('label', cube.card.tableName);
		div.innerText = cube.card.tableName;

		hierarchiesTables.appendChild(div);
		// imposto sul div l'evento drag&drop
		div.ondragstart = app.hierDragStart;
		div.ondragover = app.hierDragOver;
		div.ondragenter = app.hierDragEnter;
		div.ondragleave = app.hierDragLeave;
		div.ondragend = app.hierDragEnd;
		div.ondrop = app.hierDrop;

		// event sui tasti section[options]
		card.querySelector('i[join]').onclick = app.handlerAddJoin;
		card.querySelector('i[metrics]').onclick = app.handlerAddMetric;
		card.querySelector('i[columns]').onclick = app.handlerAddColumns;
	};

	app.hierDragStart = function(e) {
		console.log('hier drag start');
		e.dataTransfer.setData('text/plain', e.target.id);
		// disattivo temporaneamente gli eventi drop e dragend su app.content
		app.content.removeEventListener('dragend', app.handlerDragEnd, true);
		app.content.removeEventListener('drop', app.handlerDrop, true);
	};

	app.hierDragOver = function(e) {
		console.log('dragover');
		e.preventDefault();
		// console.log(e.target);
	};

	app.hierDragEnter = function(e) {
		e.preventDefault();
		console.log(e.target);

		if (e.target.className === 'dropzoneHier') {
			console.info('DROPZONE');
			// TODO: css effect
		}
	};

	app.hierDragLeave = function(e) {e.preventDefault();};

	app.hierDragEnd = function(e) {
		e.preventDefault();
		// reimposto gli eventi drop e dragend su app.content
		app.content.addEventListener('dragend', app.handlerDragEnd, true);
		app.content.addEventListener('drop', app.handlerDrop, true);
	};

	app.hierDrop = function(e) {
		e.preventDefault();
		let data = e.dataTransfer.getData('text/plain');
		console.log(data);
		const draggedCard = document.getElementById(data);
		const nextCard = draggedCard.nextElementSibling;
		// e.target.before(document.getElementById(data));
		// verifico se il target è l'elemento successivo o precedente, se successivo effettuo un after() altrimenti un before()
		(e.target === nextCard) ? e.target.after(document.getElementById(data)) : e.target.before(document.getElementById(data));

		// let parent = document.getElementById('hierTables');
		// parent.replaceChild(document.getElementById(data), e.target);
	};

	app.content.ondragover = app.handlerDragOver;
	app.content.ondragenter = app.handlerDragEnter;
	app.content.ondragleave = app.handlerDragLeave;
	// app.content.ondrop = app.handlerDrop;
	app.content.addEventListener('drop', app.handlerDrop, true);
	// app.content.ondragend = app.handlerDragEnd;
	app.content.addEventListener('dragend', app.handlerDragEnd, true);

	app.handlerColumns = function(e) {
		// selezione della colonna nella card table
		// console.log(e.target);
		dimension.activeCard = e.path[3];
		cube.fieldSelected = e.target.getAttribute('label');
	
		// console.log(cube.activeCard);

		// se è presente un altro elemento con attributo hierarchy ma NON data-relation-id, "deseleziono" quello con hierarchy per mettere ...
		// ...[hierarchy] a quello appena selezionato. In questo modo posso selezionare solo una colonna per volta ad ogni relazione da creare
		// se però, viene cliccato una colonna con già una relazione impostata (quindi ha [data-relationn-id]) elimino la relazione da
		// ...entrambe le tabelle tramite un identificatifo di relazione

		let attrs = cube.card.ref.getAttribute('mode');

		switch (attrs) {
			case 'relations':
				if (e.target.hasAttribute('data-relation-id')) {
					// debugger;
					/* oltre a fare il toggle dell'attributo, se questa colonna era stata già messa in
					relazione con un altra tabella (quindi attributo [data-relation-id] presente) elimino anche la relazione tra i due campi.
					Bisogna eliminarla sia dal DOM, eliminando [data-relation-id] che dall'array this.hierarchy
					*/
					e.target.toggleAttribute('selected');
					// recupero tutti gli attributi di e.target e vado a ciclare this.removeHierarchy(relationId) per verificare uno alla volta quale posso eliminare
					for (let name of e.target.getAttributeNames()) {
						// console.log(name);
						let relationId, value;
						if (name.substring(0, 9) === 'data-rel-') {
							relationId = name;
							value = e.target.getAttribute(name);
							app.removeHierarchy(relationId, value);
						}
					}
				} else {
					let liRelationSelected = dimension.card.querySelector('li[relations]:not([data-relation-id])');
					// console.log(liRelationSelected);
					e.target.toggleAttribute('relations');
					e.target.toggleAttribute('selected');
					// se ho selezionato una colonna diversa da quella già selezionata, rimuovo la selezione corrente e imposto quella nuova
					// se è stata selezionata una colonna già selezionata la deseleziono
					if (liRelationSelected && (liRelationSelected.id !== e.target.id)) {
						liRelationSelected.toggleAttribute('relations');
						liRelationSelected.toggleAttribute('selected');
					}
				}
				app.createHierarchy();
				break;
			case 'metrics':
				console.log('metrics');
				e.target.toggleAttribute('metrics');

				if (!e.target.hasAttribute('metrics')) {
				  console.log('da eliminare');
				  //delete cube.metrics[tableName][fieldName];
				  
				} else {

				  cube.metrics = cube.fieldSelected;
				}
				break;
			default:
				debugger;
				// se la card è stata imposta con l'attributo mode ...
				if (cube.card.ref.hasAttribute('mode')) {
					console.log('columns');
					e.target.toggleAttribute('columns');
					if (!e.target.hasAttribute('columns')) {
						// TODO: elimino la selezione effettuata
						console.log('TODO Da eliminare');
					} else {
						// aggiungo la selezione effettuata
						dimension.columns = cube.fieldSelected;
					}
				}
				// if (!e.target.hasAttribute('columns') && Object.keys(this.columns).length > 0) {
				//   delete dimension.columns[tableName][fieldName];
				//   if (Object.keys(dimension.columns[tableName]).length === 0) {delete dimension.columns[tableName];}
				// }
				// console.log(dimension.columns);
		}
	};

	app.handlerBtnMetricDone = function(e) {    
		// TODO: eliminare dopo averla spostata in /reports
		const metricName = app.dialogMetrics.querySelector('#metric-name').value;
		const sqlFunction = document.querySelector('#function-list > li[selected]').innerText;
		const distinctOption = document.getElementById('checkbox-distinct').checked;
		const alias = document.getElementById('alias-metric').value;

		console.log(cube.fieldSelected);

		let objParam = {};
		cube.arrMetrics.push({sqlFunction, 'fieldName': cube.fieldSelected, metricName, 'distinct' : distinctOption, 'alias' : alias});
		// cube.arrMetrics.forEach((metric) => {objParam[metric.metricName] = metric;});
		cube.arrMetrics.forEach((metric) => {objParam = metric;});
		cube.metrics = objParam;
	};

	app.handlerAddColumns = function(e) {
		// console.log(e.target);
		// console.log(e.path);
		console.log('add columns');

		const cardTable = e.path[3].querySelector('.cardTable');
		cube.activeCard = {'ref': cardTable, 'tableName': cardTable.getAttribute('name')};
		cube.mode('columns', 'Seleziona le colonne da mettere nel corpo della tabella');
	};

	app.handlerAddMetric = function(e) {
		// imposto il metrics mode
		const cardTable = e.path[3].querySelector('.cardTable');
		cube.activeCard = {'ref': cardTable, 'tableName': cardTable.getAttribute('name')};
		cube.mode('metrics', 'Seleziona le colonne da impostare come Metriche');
	};

	app.createHierarchy = function(e) {
		console.log('create Relations');
		let hier = [];
		let colSelected = [];
		document.querySelectorAll('.cardTable[mode="relations"]').forEach((card) => {
			let tableName = card.getAttribute('name');
			let liRef = card.querySelector('li[relations][selected]');
			if (liRef) {
				// metto in un array gli elementi selezionati per la creazione della gerarchia
				colSelected.push(liRef);
				hier.push(tableName+'.'+liRef.innerText);
			}
			console.log(hier);
			// per creare correttamente la relazione è necessario avere due elementi selezionati
			if (hier.length === 2) {
				// se, in questa relazione è presente anche la tabella FACT rinomino hier_n in fact_n in modo da poter separare le gerarchie
				// e capire quali sono quelle con la fact (quindi legate al Cubo) e quali no (posso salvare la Dimensione, senza il legame con il Cubo)
				if (card.hasAttribute('fact')) {
					console.log('FACT TABLE Relation');
					cube.relationId++;
					cube.relations['cubeJoin_'+cube.relationId] = hier;
					console.log(cube.relations);
					cube.saveRelation = colSelected;
					// colSelected.forEach((el) => {
					//   el.setAttribute('data-rel-'+cube.relationId, cube.relationId);
					//   // el.setAttribute('data-relation-id', 'rel_'+this.relationId);
					//   el.setAttribute('data-relation-id', true);
					//   // la relazione è stata creata, posso eliminare [selected]
					//   el.removeAttribute('selected');
					// });
				} else {
					dimension.relationId++;
					dimension.hierarchies = hier;
					//debugger;
					// visualizzo l'icona per capire che c'è una relazione tra le due colonne
					dimension.saveRelation = colSelected;
					// colSelected.forEach((el) => {
					//   el.setAttribute('data-rel-'+dimension.relationId, dimension.relationId);
					//   // el.setAttribute('data-relation-id', 'rel_'+this.relationId);
					//   el.setAttribute('data-relation-id', true);
					//   // la relazione è stata creata, posso eliminare [selected]
					//   el.removeAttribute('selected');
					// });
					console.log(dimension.hierarchies);
					// esiste una relazione, visualizzo il div hierarchiesContainer
					app.hierarchyContainer.removeAttribute('hidden');
				}
			}
		});
	};

	app.removeHierarchy = function(relationId, value) {
		console.log(relationId);
		console.log(value);
		debugger;
		console.log('delete hierarchy');
		/* prima di eliminare la gerarchia devo stabilire se le due card, in questo momento, sono in modalità hierarchies
		// ...(questo lo vedo dall'attributo presente su card-table)
		// elimino la gerarchia solo se la relazione tra le due tabelle riguarda le due tabelle attualmente impostate in modalità [hierarchies]
		// se la relazione riguarda le tabelle A e B e attualmente la modalità impostata è A e B allora elimino la gerarchia
		// altrimenti se la relazione riguarda A e B e attualmente la modalità impostata [hierarchies] riguarda B e C aggiungo la relazione e non la elimino
		*/
		// elementi li che hanno la relazione relationId
		let liElementsRelated = document.querySelectorAll('.cardTable[hierarchies] li[data-relation-id]['+relationId+']').length;

		if (liElementsRelated === 2) {
			// tra le due tabelle .card-table[hiearachies] non esiste questa relazione, per cui si sta creando una nuova relazione
			// ci sono due colonne che fanno parte di "questa relazione" (cioè delle due tabelle attualmente in modalità [hierarchies]) quindi possono essere eliminate
			document.querySelectorAll('.cardTable[hierarchies] ul > .element > li[data-relation-id]['+relationId+']').forEach((li) => {
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
			delete cube.hierarchyFact['dimensionJoin_'+value];
			delete cube.hierarchyTable['dimensionJoin_'+value];
			console.log(cube.hierarchyTable);
		}
	};

	app.handlerCloseCard = function(e) {
		// elimino la card e la rivisualizzo nel drawer (spostata durante il drag&drop)
		console.log(e.target);
		console.log(e.path);
		// TODO: rimettere la card chiusa al suo posto originario, nel drawer
		e.path[5].remove();
		// TODO: eliminare anche dal flusso delle gerarchie sulla destra

		// TODO: controllo struttura gerarchiiccaaa app.checkStepGuide
	};

	app.getDimensions = function() {
		// recupero la lista delle dimensioni in localStorage, il Metodo getDimension restituisce un array
		// const tmplDimension = document.getElementById('dimension');
		const dimension = new DimensionStorage();
		let obj = dimension.list();
		// console.log(obj);
		const tmplDimension = document.getElementById('dimension');
		Array.from(Object.keys(obj)).forEach((dimName) => {
			// console.log(dimName);
			let tmplContent = tmplDimension.content.cloneNode(true);
			let div = tmplContent.querySelector('.dimensions');
			div.querySelector('h5').innerHTML = dimName;
			div.querySelector('h5').setAttribute('label', dimName);
			document.querySelector('#dimensions').appendChild(div);
			div.querySelector('h5').onclick = app.handlerDimensionSelected;

			// aggiungo anche le tabelle all'interno ella dimensione
			// console.log(obj[dimName]); // valore/i
			const tmplMiniCard = document.getElementById('miniCard');

			obj[dimName].forEach((table) => {
				let contentMiniCard = tmplMiniCard.content.cloneNode(true);
				let miniCard = contentMiniCard.querySelector('.miniCard');
				miniCard.querySelector('h6').innerHTML = table;
				// console.log(table);
				div.appendChild(miniCard);
			});
		});
	};

	app.getCubes = function() {
		// recupero la lista dei Cubi in localStorage
		const cubes = new CubeStorage();
		let obj = cubes.list();
		const ul = document.getElementById('cubes');

		for (let i in obj) {
			let element = document.createElement('div');
			element.className = 'element';
			element.setAttribute('label', obj[i]['key']);
			let li = document.createElement('li');
			li.innerText = obj[i]['key'];
			li.setAttribute('label', obj[i]['key']);
			li.id = 'cubeId_' + obj[i]['cubeId'];
			ul.appendChild(element);
			element.appendChild(li);
			li.onclick = app.handlerCubeSelected;
		}
	};

	app.handlerCubeSelected = function(e) {
		// TODO: stabilire quale attività far svolgere quando si clicca sul nome del report/cubo
		// ricreo un datamart

		let data = window.localStorage.getItem(e.target.getAttribute('label'));
		// console.log(data);
		var url = 'ajax/cube.php';
		let params = 'cube='+data;
		console.log(params);
		var request = new XMLHttpRequest();
		request.onreadystatechange = function() {
			if (request.readyState === XMLHttpRequest.DONE) {
				if (request.status === 200) {
					var response = JSON.parse(request.response);
					console.table(response);
				} else {
					// TODO:
				}
			} else {
				// TODO:
			}
		};

		request.open('POST', url);
		// request.setRequestHeader('Content-Type','application/json');
		request.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
		request.send(params);
		// return;

		// console.log(this.getAttribute('label'));

		// let reportName = this.getAttribute('label');
		//
		// // recupero un datamart FX... già creato e visualizzo l'anteprima
		// var url = "ajax/reports.php";
		// let reportId = this.getAttribute('id');
		// let params = "reportId="+reportId;
		//
		// // console.log(params);
		// var request = new XMLHttpRequest();
		// request.onreadystatechange = function() {
		//   if (request.readyState === XMLHttpRequest.DONE) {
		//     if (request.status === 200) {
		//       var response = JSON.parse(request.response);
		//       console.table(response);
		//       // abilito il tasto btnPreviewReport
		//       app.btnPreviewReport.disabled = false;
		//       // app.createReport(response, oStorage.getJSONCube(reportName));
		//       app.dialogReportList.close();
		//
		//     } else {
		//       // TODO:
		//     }
		//   } else {
		//     // TODO:
		//   }
		// };
		//
		// request.open('POST', url);
		// // request.setRequestHeader('Content-Type','application/json');
		// request.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
		// request.send(params);
	};

	app.getDatabaseTable = function() {
		// TODO: utilizzare le promise
		var url = 'ajax/database.php';

		var request = new XMLHttpRequest();

		request.onreadystatechange = function() {
			if (request.readyState === XMLHttpRequest.DONE) {
				if (request.status === 200) {
					var response = JSON.parse(request.response);
					// console.table(response);
					let ul = document.getElementById('tables');
					for (let i in response) {
						let tmpl = document.getElementById('el');
						let tmplContent = tmpl.content.cloneNode(true);
						let element = tmplContent.querySelector('.element.card');
						element.ondragstart = app.handlerDragStart;
						element.id = 'table-' + i;
						element.setAttribute('label', response[i][0]);
						ul.appendChild(element);
						let span = document.createElement('span');
						span.classList = 'elementSearch';
						span.setAttribute('label', response[i][0]);
						span.innerHTML = response[i][0];
						element.appendChild(span);
					}
				} else {
					// TODO:
				}
			} else {
				// TODO:
			}
		};

		request.open('POST', url);
		request.setRequestHeader('Content-Type','application/json');
		request.send();
	};

	app.handlerAddJoin = function(e) {
		const cardTable = e.path[3].querySelector('.cardTable');
		cube.activeCard = {'ref': cardTable, 'tableName': cardTable.getAttribute('name')};
		cube.mode('relations', 'Selezionare le colonne che saranno messe in relazione');
	};

	app.getTable = function(table) {
		let tmplList = document.getElementById('templateListColumns');
		// elemento dove inserire le colonne della tabella
		let ulContainer = cube.card.ref.querySelector('#columns');

		var url = '/ajax/tableInfo.php';
		let params = 'tableName='+table;
		var request = new XMLHttpRequest();

		request.onreadystatechange = function() {
			if (request.readyState === XMLHttpRequest.DONE) {
				if (request.status === 200) {
					var response = JSON.parse(request.response);
					// console.table(response);
					ulContainer.removeAttribute('hidden');
					for (let i in response) {
						let tmplContent = tmplList.content.cloneNode(true);
						let element = tmplContent.querySelector('.element');
						// element.setAttribute('name', 'columnSearch');
						let li = element.querySelector('li');
						li.className = 'elementSearch';
						// let iElement = element.querySelector('i');
						li.innerText = response[i][0];
						li.setAttribute('label', response[i][0]);
						// scrivo il tipo di dato senza specificare la lunghezza int(8) voglio che mi scriva solo int
						let pos = response[i][1].indexOf('(');
						let type = (pos !== -1) ? response[i][1].substring(0, pos) : response[i][1];
						li.setAttribute('data-type', type);
						//li.setAttribute('data-table',cube.table);
						li.id = i;
						ulContainer.appendChild(element);
						// li.onclick = cube.handlerColumns.bind(cube);
						li.onclick = app.handlerColumns;
					}
				} else {
					// TODO:
				}
			} else {
				// TODO:
			}
		};

		request.open('POST', url);
		// request.setRequestHeader('Content-Type','application/json');
		request.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
		request.send(params);
	};

	/*events */

	/* tasto OK nella dialog dimension name*/
	document.getElementById('btnDimensionSaveName').onclick = function() {
		/*
		  Salvo la dimensione, senza il legame con la FACT.
		  Salvo in localStorage la dimensione creata
		  // Visualizzo nell'elenco di sinistra la dimensione appena creata
		  // creo un contenitorre per le dimensioni salvate, con dentro le tabelle che ne fanno parte.
		*/
		dimension.title = document.getElementById('dimensionName').value;
		// cube.dimension
		const storage = new DimensionStorage();
		let from = [];
		document.querySelectorAll('.cardTable').forEach((card) => {
			if (card.getAttribute('name')) {from.push(card.getAttribute('name'));}
		});
		dimension.from = from;

		// ordine gerarchico (per stabilire quale tabella è da associare al cubo) questo dato viene preso dalla struttura di destra
		let hierarchyOrder = {};
		Array.from(document.querySelectorAll('#hierarchies .hier.table')).forEach((table, i) => {
			hierarchyOrder[i] = table.getAttribute('label');
		});
		dimension.hierarchyOrder = hierarchyOrder;
	
		dimension.save();
		storage.save = dimension.dimension;
		//storage.dimension = dimension.dimension;
		app.dialogDimensionName.close();
	
		// chiudo le card presenti
		app.closeCards();
		// visualizzo le dimensioni create
		// imposto, sulla icona openTableList, il colore della fact
		app.btnTableList.setAttribute('fact', true);
		app.getDimensions(); // TODO: qui andrò ad aggiornare solo la dimensione appena salvata/modificata

		delete dimension.dimension;
	};

	app.closeCards = function() {
		document.querySelectorAll('.card.table').forEach((item) => {
			console.log(item);
			item.remove();
		});
	};

	app.btnSaveDimension.onclick = function(e) {
		if (e.target.hasAttribute('disabled')) return;
		app.dialogDimensionName.showModal();
	};

	app.btnSaveHierarchy.onclick = function(e) {
		if (e.target.hasAttribute('disabled')) return;
		// TODO salvo la gerarchia che andrà inserita in dimension
		// TODO abilito il tasto save dimension
		app.btnSaveDimension.removeAttribute('disabled');
		app.btnSaveDimension.classList.remove('md-dark', 'md-inactive');
	};

	app.btnSaveCube.onclick = function() {app.dialogCubeName.showModal();};

	app.btnSaveCubeName.onclick = function() {
		console.log('cube save');
		let cubeStorage = new CubeStorage();
		cube.title = document.getElementById('cubeName').value;

		cube.FACT = document.querySelector('.card.table[fact]').getAttribute('label');
		// Creo il cubeId basandomi sui cubi già creati in Storage, il cubeId lo associo al cubo che sto per andare a salvare.
		cube.id = cubeStorage.getIdAvailable();
		console.log(cube.id);

		const dimensionStorage = new DimensionStorage();
		
		let dimensionObject = {};

		cube.dimensionsSelected.forEach((dimensionName) => {
			console.log(dimensionName);
			dimensionStorage.selected = dimensionName;
			console.log(dimensionStorage.selected);      
			dimensionObject[dimensionName] = dimensionStorage.selected;
			// salvo la/le dimenioni scelte nell'object cube
			cube.associatedDimensions = dimensionObject;
		});

		cube.save();

		// salvo il cubo in localStorage
		cubeStorage.save = cube.cube;

		app.dialogCubeName.close();

		// TODO: visualizzo il tasto crea report che rimanda alla pagina /reports
		// app.btnNewReport.removeAttribute('hidden');
	};

	app.handlerOpenTableList = function() {
		const tableList = document.getElementById('tableList');
		app.btnTableList.toggleAttribute('open');
		tableList.toggleAttribute('hidden');
		document.getElementById('tableSearch').focus();
	};

	app.btnNewFact.onclick = function() {
		app.btnTableList.setAttribute('fact', true);
		app.handlerOpenTableList();
	};

	app.btnBack.onclick = function() {};

	/* ricerca in lista tabelle */
	document.getElementById('tableSearch').oninput = App.searchInList;

	app.btnTableList.onclick = app.handlerOpenTableList;

	document.getElementById('processCube').onclick = function(e) {
		// visualizzo la lista delle tabelle
		const cubeList = document.getElementById('cubesList');
		cubeList.toggleAttribute('hidden');
		e.target.toggleAttribute('open');
		document.getElementById('cubeSearch').focus();
	};

	app.btnDimensionList.onclick = function(e) {
		const dimensionList = document.getElementById('dimensionList');
		dimensionList.toggleAttribute('hidden');
		e.target.toggleAttribute('open');
		document.getElementById('dimensionSearch').focus();
	};

	app.handlerDimensionSelected = function(e) {
		// selezione di una dimensione da inserire nel body
		console.log(e.target);
		debugger;
		const storage = new DimensionStorage();
		let lastTableInHierarchy;
		storage.selected = e.target.getAttribute('label');
		// memorizzo la dimensione selezionata per recuperarla nel salvataggio del cubo
		cube.dimensionsSelected = e.target.getAttribute('label');
		// recupero tutta la dimensione selezionata, dallo storage
		console.log(storage.selected);
		// TODO: tramite questa dimensione vado a ricreare l'ultima tabella della relazione, reimpostando le colonne/filtri/groupBy impostati su questa tabella
		if (storage.selected.hasOwnProperty('hierarchies')) {
			// recupero l'ultima tabella da hierarchyOrder
			lastTableInHierarchy = storage.selected.hierarchies[Object.keys(storage.selected.hierarchies).length-1];
		} else {
			// recupero l'ultima tabella dalla unica presente, quindi nella from dell'oggetto
			lastTableInHierarchy = storage.selected.from;
		}
		// TODO: creo la card (lastTableInHierarchy)
		let card = document.createElement('div');
		card.className = 'card table';
		card.setAttribute('label',lastTableInHierarchy);
		card.onmousedown = app.dragStart;
		card.onmouseup = app.dragEnd;
		card.onmousemove = app.drag;
		// prendo il template cardLayout e lo inserisco nella .card.table
		let tmpl = document.getElementById('cardLayout');
		let content = tmpl.content.cloneNode(true);
		let cardLayout = content.querySelector('.cardLayout');

		cardLayout.querySelector('.cardTable').setAttribute('fact', true);
		// imposto il titolo in h6

		cardLayout.querySelector('h6').innerHTML = lastTableInHierarchy;
		card.appendChild(cardLayout);
		console.log(card);
		app.body.appendChild(card);

		// evento sul tasto close della card
		card.querySelector('i[data-id="closeTable"]').onclick = app.handlerCloseCard;
		// evento sulla input di ricerca nella card
		card.querySelector('input').oninput = App.searchInList;
		cube.activeCard = {'ref': card.querySelector('.cardTable'), 'tableName': card.getAttribute('label')};

		// event sui tasti section[options]
		card.querySelector('i[join]').onclick = app.handlerAddJoin;

		app.getTable(lastTableInHierarchy);
	};

	/*events */

	app.getDatabaseTable();

	app.getDimensions();

	app.getCubes();

	// inserisco lo storage che era presente sul pc desktop
	let storage = new CubeStorage();
	/*storage.save = {
		"type":"DIMENSION",
		"columns":{
			"ZonaVenditaCM":["Codice","Descrizione"],
			"Azienda":["descrizione"],
			"CodSedeDealer":["Descrizione"]
		},
		"name":"dim-kpi dealers",
		"from":["ZonaVenditaCM","Azienda","CodSedeDealer","DocVenditaIntestazione"],
		"join":{
			"dimensionJoin_1":["ZonaVenditaCM.id","Azienda.id_ZonaVenditaCM"],
			"dimensionJoin_2":["Azienda.id","CodSedeDealer.id_Azienda"],
			"dimensionJoin_3":["CodSedeDealer.id","DocVenditaIntestazione.id_CodSedeDealer"]
		},
		"hierarchies":{"0":"ZonaVenditaCM","1":"Azienda","2":"CodSedeDealer","3":"DocVenditaIntestazione"}
	};*/

	// storage.save = {"type":"FILTER","name":"glm","table":"Azienda","formula":"Azienda.id = 43"};
	// storage.save = {"type":"METRIC","name":"q","formula":{"venduto":{"SQLFunction":"SUM","table":"DocVenditaDettaglio","field":"NettoRiga","name":"venduto","distinct":false,"alias":"Venduto"},"q":{"SQLFunction":"SUM","table":"DocVenditaDettaglio","field":"Quantita","name":"q","distinct":false,"alias":"q"}}};
	// storage.save = {"type":"METRIC","name":"qtaOff","formula":{"qtaOff":{"SQLFunction":"SUM","table":"DocVenditaDettaglio","field":"Quantita","name":"qtaOff","distinct":false,"alias":"Quantità (off)","filters":{"rep.off":{"type":"FILTER","name":"rep.off","table":"DocVenditaIntestazione","formula":"DocVenditaIntestazione.Reparto = \"OFF\""}}}}};

	// storage.save = {"id":0,"type":"REPORT","name":"rep-0","options":{"inputSearch":true,"positioning":[{"select":"DEALER"},{"select":"SEDE"},{},{},{},{},{},{},{},{},{},{},{},{},{}]},"process":{"select":{"Azienda":{"descrizione":{"SQLFormat":null,"alias":"DEALER"}},"CodSedeDealer":{"Descrizione":{"SQLFormat":null,"alias":"SEDE"}}},"from":["DocVenditaDettaglio","ZonaVenditaCM","Azienda","CodSedeDealer","DocVenditaIntestazione"],"where":{"dimensionJoin_1":["ZonaVenditaCM.id","Azienda.id_ZonaVenditaCM"],"dimensionJoin_2":["Azienda.id","CodSedeDealer.id_Azienda"],"dimensionJoin_3":["CodSedeDealer.id","DocVenditaIntestazione.id_CodSedeDealer"]},"factJoin":{"cubeJoin_1":["DocVenditaDettaglio.NumRifInt","DocVenditaIntestazione.NumRifInt"],"cubeJoin_2":["DocVenditaDettaglio.id_Azienda","DocVenditaIntestazione.id_Azienda"]},"filters":{"glm":"Azienda.id = 43"},"groupBy":{"Azienda":{"descrizione":{"SQLFormat":null}},"CodSedeDealer":{"Descrizione":{"SQLFormat":null}}},"metrics":{"venduto":{"SQLFunction":"SUM","table":"DocVenditaDettaglio","field":"NettoRiga","name":"venduto","distinct":false,"alias":"Venduto"}},"filteredMetrics":{"qtaOff":{"SQLFunction":"SUM","table":"DocVenditaDettaglio","field":"Quantita","name":"qtaOff","distinct":false,"alias":"Quantità (off)","filters":{"rep.off":{"type":"FILTER","name":"rep.off","table":"DocVenditaIntestazione","formula":"DocVenditaIntestazione.Reparto = \"OFF\""}}}},"processId":0,"name":"rep-0","type":"PROCESS"}};
	// storage.save = {"type":"FILTER","name":"rep.mag","table":"DocVenditaIntestazione","formula":"DocVenditaIntestazione.Reparto = \"MAG\""};
	// storage.save = {"type":"FILTER","name":"rep.off","table":"DocVenditaIntestazione","formula":"DocVenditaIntestazione.Reparto = \"OFF\""};
	// storage.save = {"type":"METRIC","name":"venduto","formula":{"venduto":{"SQLFunction":"SUM","table":"DocVenditaDettaglio","field":"NettoRiga","name":"venduto","distinct":false,"alias":"Venduto"}}};
	// storage.save = {"select":{"Azienda":{"descrizione":{"SQLFormat":null,"alias":"a"}}},"from":["DocVenditaDettaglio","ZonaVenditaCM","Azienda","CodSedeDealer","DocVenditaIntestazione"],"where":{"dimensionJoin_1":["ZonaVenditaCM.id","Azienda.id_ZonaVenditaCM"],"dimensionJoin_2":["Azienda.id","CodSedeDealer.id_Azienda"],"dimensionJoin_3":["CodSedeDealer.id","DocVenditaIntestazione.id_CodSedeDealer"]},"factJoin":{"cubeJoin_1":["DocVenditaDettaglio.NumRifInt","DocVenditaIntestazione.NumRifInt"],"cubeJoin_2":["DocVenditaDettaglio.id_Azienda","DocVenditaIntestazione.id_Azienda"]},"filters":{"glm":"Azienda.id = 43"},"groupBy":{"Azienda":{"descrizione":{"SQLFormat":null}}},"metrics":{"venduto":{"SQLFunction":"SUM","table":"DocVenditaDettaglio","field":"NettoRiga","name":"venduto","distinct":false,"alias":"Venduto"},"q":{"SQLFunction":"SUM","table":"DocVenditaDettaglio","field":"Quantita","name":"q","distinct":false,"alias":"q"},"qtaOff":{"SQLFunction":"SUM","table":"DocVenditaDettaglio","field":"Quantita","name":"qtaOff","distinct":false,"alias":"Quantità (off)","filters":{"rep.off":{"type":"FILTER","name":"rep.off","table":"DocVenditaIntestazione","formula":"DocVenditaIntestazione.Reparto = \"OFF\""}}}},"filteredMetrics":{},"processId":1,"name":"x","type":"PROCESS"};

})();
