/** In questo file ci saranno tutte le funzioni di supporto all'applicazione
 * es.: la funzione logout(che distruggerà le variabili di sessione
 */
/* jshint esversion : 6 */

class Application {
  constructor() {}

  init() {
  	// var main = document.getElementsByTagName("main")[0];
    console.log('init');

    let body = document.getElementById('body');
  	// console.log(main);
  	var spinner = document.querySelector('.loader');
  	spinner.setAttribute('hidden', true);
    body.removeAttribute('hidden');
    // console.log('initLoader');
  	// main.removeAttribute('hidden');

  	var i = document.querySelector("i.md-circle");
    // gestore dell'evento scroll
    document.querySelector('main').addEventListener('scroll', this.handlerScroll, true);
    document.getElementById('container').addEventListener('click', this.containerClick, true);

  	/*console.log(window.screen.height);
  	console.log(window.screen.availHeight);
  	console.log(window.screenTop);*/

  	//document.getElementById("testTop").innerText = i.offsetTop+" - "+window.screen.availHeight;
      //document.getElementById("testTop").innerText = window.screenTop;
    // console.log(main.offsetHeight);
  }

  handlerScroll() {
    // console.log('handlerScroll');
    // se ci sono tooltip aperti li chiudo
    let openedTooltips = document.querySelector('.tooltip[open]');
  	if (openedTooltips) {
  	  console.log('tooltip aperti');
  	  openedTooltips.removeAttribute('open');
  	}
  }

  getSessionName() {
    // recupeero il nome dell'utente da inserire nel drawer
    var url = "/w/aj/ajUserName.php";

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          // console.log(request.response);
          if (request.response) {
            let response = JSON.parse(request.response);
            document.querySelector('.account > h5').innerHTML = response;
          }
        }
      }
    };

    request.open('POST', url);
    request.setRequestHeader('Content-Type','application/json');
    request.send();
  }

  loading() {
    // visualizzo lo snipper nei loading di ricerca
    var main = document.getElementsByTagName("main")[0];
    let snipper = document.querySelector('.loader');
    main.setAttribute('hidden', true);
    snipper.removeAttribute('hidden');
  }

  back() {
    window.location.href="../";
  }

  menu() {
    console.log('open drawer');
    this.drawer = document.getElementById('drawer');
    console.log(this.drawer);
    this.drawer.toggleAttribute('open');
    document.getElementById('container').addEventListener('click', this.containerClick, true);
  }

  containerClick() {
    // console.log('containerClick');
    this.drawerOpen = document.querySelector('#drawer[open]');
    // console.log(this.drawerOpen);
    // chiudo il drawer
    // se il drawer è aperto lo chiudo
    if (this.drawerOpen) {
      this.drawerOpen.toggleAttribute('open');
      document.getElementById('container').removeEventListener('click', this.containerClick, true);
    }
    let openedTooltips = document.querySelector('.tooltip[open]');
  	if (openedTooltips) {
  	  // console.log('tooltip aperti');
  	  openedTooltips.removeAttribute('open');
  	}
    document.querySelectorAll('div.elements[show]').forEach((el) => {el.removeAttribute('show');});
  }

  menuOpen(url) {
    window.location.href = url;
  }

  toggleButtonMDC(fieldId, toggle) {
    // utilizzata per tasti materialdesign e <i>
    (toggle === 1) ? fieldId.removeAttribute("disabled") : fieldId.setAttribute("disabled", "true");
  }

  toggleButtonMaterial(idField, toggle) {

    /* usato per i tasti done*/
    // TODO impostare qui i vari tipi di tasti (buttonMaterial(icone) - tasti input type=button oppure submit) ed eliminare le altre due funzioni (
    // toggleButtonMaterialStandard e toggleButton)
    if (toggle === 1) {
        /* active
        * in futuro posso controllare se una delle Class esiste con
        * contains(class)	Returns a Boolean value, indicating whether an element has the specified class name.*/
       idField.classList.remove("md-inactive");
       //idField.classList.add("md-active");
    } else {
       idField.classList.add("md-inactive");
       //idField.classList.remove("md-active");
    }
  }

  toggleModal(modalType) {

    /* modalType è il tipo di modal all'interno di .modal-window chhe verrà visualizzata (removeAttribute/setAttribute hidden)
    * vedere la pagina operations/index dove ci sono due modal*/
    document.getElementsByClassName("modal-window")[0].classList.toggle("show");

    //let elementRef = modalType.attributes;
    //  in fase di chiusura modal, vado a vedere quella che non ha  attributo hidden (che sarebbe quella che è stata aperta.)
    //  se modalType = null vuol dire che sto in chiusura, quindi vado a vedere quale modal non ha hidden e gli imposto hidden
    if (!modalType) {
      // modal da chiuedere perchè modalType = null
      // NOTE: Esempio di recupero degli attributo di un elemento
      let modals = Array.from(document.querySelectorAll('.modal'));
      for (let i in modals) {
        if (modals[i].hasAttribute('hidden')) {console.log('attr hidden');} else {modals[i].toggleAttribute('hidden');}
      }
    } else {
      // apertura modal (è stato passato l'argomento modalType)
      modalType.toggleAttribute('hidden');}
  }

  getFormatDate(date, options = {year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'}) {
    // NOTE: parametri di default in una funzione
    /* options accetta le opzioni del formato data
    se si vuole una data con weekday, senza weekday, con il nome breve del mese anzichè lungo, ecc....
    */
    let dateObj = new Date(date);
    // NOTE: se non si vuole il weekday si dovrebbero inserire le options direttamente nell'istanza dell'oggetto Intl (da provare)
    // es.: new Intl.DateTimeFormat('it-IT', year: 'numeric', month: 'long', day: 'numeric').format(dateObj)
    // TODO: se la data corrisponde a oggi/ieri far comparire la scritta 'oggi' anzichè la data di oggi, stesso discorso per 'ieri'

    // let options = {year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'};
    return new Intl.DateTimeFormat('it-IT', options).format(dateObj);
  }

  getFormatDateInputField(date, options = {year: 'numeric', month: '2-digit', day: 'numeric'}) {
    // NOTE: parametri di default in una funzione
    /* options accetta le opzioni del formato data
    se si vuole una data con weekday, senza weekday, con il nome breve del mese anzichè lungo, ecc....
    */
    let dateObj;
    if (date) {
      // è stata passata una data specifica
      dateObj = new Date(date);
    } else {
      // nessuna data come argomento, imposto la data corrente
      dateObj = new Date();
    }
    let year = new Intl.DateTimeFormat('it-IT', options = {year: 'numeric'}).format(dateObj);
    let month = new Intl.DateTimeFormat('it-IT', options = {month: '2-digit'}).format(dateObj);
    let day = new Intl.DateTimeFormat('it-IT', options = {day: 'numeric'}).format(dateObj);

    // NOTE: se non si vuole il weekday si dovrebbero inserire le options direttamente nell'istanza dell'oggetto Intl (da provare)
    // es.: new Intl.DateTimeFormat('it-IT', year: 'numeric', month: 'long', day: 'numeric').format(dateObj)
    // TODO: se la data corrisponde a oggi/ieri far comparire la scritta 'oggi' anzichè la data di oggi, stesso discorso per 'ieri'

    // let options = {year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'};
    return year+'-'+month+'-'+day;
  }

  // TODO: da sostituire con le nuove funzioni di ECMAScript6
  getFormattedDate(date) {
    //restituisco data corrente nel formato corretto per le input type=date
    var dateObj;
    // se non viene passata la data prendo la data corrente
    (date) ? dateObj = new Date(date) : dateObj = new Date();
    var month = dateObj.getMonth()+1;
    var year = dateObj.getFullYear();
    var day = (dateObj.getDate() < 10) ? "0"+dateObj.getDate(): dateObj.getDate();
    month = (dateObj.getMonth()+1 < 10) ? "0"+month:month;
    // REVIEW: valutare la possibiltà di restituire un oggetto Date per poter poi fare i confronti tra date
    /*
    let dateObject = new Date(year, month, day);
    console.log(dateObject);
    return dateObject;*/
    return {date: year+"-"+month+"-"+day};

  }

  getFormattedYearMonth(date) {
    let dateObj;
    (date) ? dateObj = new Date(date) : dateObj = new Date();
    let year = dateObj.getFullYear();
    let month = dateObj.getMonth()+1;
    month = (dateObj.getMonth()+1 < 10) ? "0"+month:month;
    // console.log(year+month);
    return year+"-"+month;
    // return new Date(year, month);
  }

  getDateSub(monthSub) {
    /* ottengo un periodo precedente alla data passata (es.: 5 mesi prima)*/
    let dateObj = new Date();
    monthSub *= 30; // es.: 3 mesi = 90giorni

    var dayValue = (1000*60*60*24); // 1 giorno
    dateObj.setTime(dateObj.getTime()-(dayValue*monthSub));
    var month = dateObj.getMonth()+1;
    var year = dateObj.getFullYear();
    var day = (dateObj.getDate() < 10) ? "0"+dateObj.getDate(): dateObj.getDate();
    month = (dateObj.getMonth()+1 < 10) ? "0"+month:month;
    return {dateSub: year+"-"+month+"-"+day};
  }

  handlerConsole(message, icon, time) {
    console.log(message+icon);
    // type = info, warning, error, done
    document.querySelector('#console p').innerText = message;
    document.querySelector('#console i').classList.add(icon);
    document.querySelector('#console i').innerText = icon;
    document.getElementById("console").setAttribute('open',true);

    setTimeout(function() {
      document.getElementById("console").removeAttribute('open');
    }, time);

    setTimeout(function() {
      // dopo un secondo rimuovo il contenuto del messaggio insieme alla class icon (done, error, warning, ecc..)
      document.querySelector('#console p').innerText = "";
  	  document.querySelector('#console i').innerText = "";
  	  document.querySelector('#console i').classList.remove(icon);
    }, time+1000);
  }

  mySelectToggle(select) {
    // IDEA: Provare a creare un customElement (da googleDeveloper)
    /* select con elenco a discesa personale, questo metodo viene chiamato dagli eventi onclick (open) e onblur (close), oppure dalla selezione
    di un elemento nella lista, che successivamente chiude la select*/

    select.classList.toggle('show');
  }

  mySelectSelection(thisElement, targetElement, inputElement) {
    /* thisElement corrisponde al div che contiene la ul
     * targetElement è l'elemento su cui si è fatto click quindi la li
     * inputElement è la input dove verrà inserito il testo selezionato dalla select */

     // deseleziono l'elemento attualmente selezionato
    let lis = thisElement.querySelectorAll('li');
    for (var i = 0; i < lis.length; i++) {
      //console.log(li.classList.contains('selected'));
      if (lis[i].classList.contains('selected')) {
        lis[i].classList.remove('selected');
      }
    }
    targetElement.classList.add('selected');
    // inserisco il valore selezionato nella input
    inputElement.value = targetElement.innerText;
    // inserisco anche has-content sulla label
    thisElement.parentElement.querySelector('label').classList.add('has-content');
  }

  mySelectSetDefault(thisElement, targetElement, inputElement) {
    /* thisElement corrisponde al div che contiene la ul
     * targetElement è l'elemento su cui si è fatto click quindi la li
     * inputElement è la input dove verrà inserito il testo selezionato dalla select */

    targetElement.classList.add('selected');
    // inserisco il valore selezionato nella input
    inputElement.value = targetElement.innerText;
    // inserisco anche has-content sulla label
    thisElement.parentElement.querySelector('label').classList.add('has-content');
  }

  getMySelectSelection(thisElement) {
    /* thisElement corrisponde al div che contiene la ul*/
    // restituisco l'elemento selezionato nella custom list

    let liSelected = thisElement.querySelector('ul > li.selected');
    if (liSelected) {return parseInt(liSelected.id);}
  }

  getNoteMySelectSelection(thisElement) {
    /* thisElement corrisponde al div che contiene la ul*/
    // restituisco le Note dell'elemento selezionato nella custom list

    let liSelected = thisElement.querySelector('ul > li.selected');
    if (liSelected) {return liSelected.getAttribute('label');}
  }

  validityForm(inputs) {
    // inputs deve essere inviato come Array.from()
    this.fieldError = false;
    for (var field in inputs) {
      if (!inputs[field].checkValidity() || inputs[field].value.length === 0) {
        console.error(inputs[field].id);

        return inputs[field].id;
      } else {
        this.fieldError = false;
      }
    }
    return this.fieldError;
  }
}

var menuTouch = document.getElementById("menu");
// console.log(menuTouch);
var xStart, move, offsetWidthMenu, touch;
var swipe = false;
if (menuTouch) {
    menuTouch.addEventListener("touchstart", menuTouchStart, false);
    menuTouch.addEventListener("touchend", menuTouchEnd, false);
    menuTouch.addEventListener("touchmove", menuTouchMove, false);
    offsetWidthMenu = menuTouch.offsetWidth;
}

function menuTouchStart(e) {
  xStart = e.touches[0].clientX;
  //console.log("menuTouchStart : " +xStart);
}

function menuTouchEnd(e) {
  if (swipe) {
      menuTouch.classList.toggle("show");
      document.getElementById("submain").classList.toggle("action");
      document.getElementById("butMenu").classList.toggle("active");
  }
}

function menuTouchMove(e) {
  var clientX;
  clientX = e.touches[0].clientX;
  //console.log("menuTouchMove : "+clientX);
  if (clientX < xStart) {((clientX-xStart) < -30) ? swipe = true : swipe = false;}
}

var timeout;


var setIconClass = function(iconType){
    switch (iconType){
      case "done":
        return {classList: "done",icon: "&#xE876;"};
        break;
      case "error":
        return {classList: "error",icon: "&#xE000;"};
        break;
      case "warning":
        return {classList: "warning",icon: "&#xE002;"};
        break;
      case "info":
        return {classList: "info",icon: "&#xE88E;"};
        break;
    }
  };

var setIconButton = function(iconName) {
    switch (iconName) {
      case "navigate_before":
        return {icon: "&#xE408;"};
        break;
      case "add":
        return {icon: "&#xE145;"};
        break;
      case "multiline_chart":
        return {icon: "&#xE6DF;"};
        break;
      case "date_range":
        return {icon: "&#xE916;"};
        break;
      case "delete":
        return {icon: "&#xE872;"};
        break;
      case "done":
        return {icon: "&#xE876;"};
        break;
      case "edit":
        return {icon: "&#xE254;"};
        break;
      case "save":
        return {icon: ""};
        break;
    }
    //TODO da inserire anche in altre pagine (pagina nuova operazione)
  };

function daysInMonth(iMonth, iYear) {
  'use strict';
  // Subtract the overflow from 32
  return 32 - new Date(iYear, iMonth, 32).getDate();
}

function CheckInput(){
    'use strict';
    console.log("function CheckInput");
    var nome = document.getElementById('id-nome');
    var cognome = document.getElementById('id-cognome');
    var email = document.getElementById('id-email');
    var email_check = document.getElementById('id-email-check');

    if (nome.value.length != 0 && cognome.value.length != 0 && email.value.length != 0 && email_check.value.length != 0){
        //console.log("E' diverso da 0");
	//verifico il pattern per l'e-mail
	var regexp = /^[\w.-]+@[\w.-]+\.[A-Za-z]{2,6}$/;
	//verifico se le email inserite corrispondono
	if (email.value == email_check.value){
	    if (regexp.test(email.value)) {
		//e-mail corretta
		//verifico (AJAX) se è già presente nel DB
		check_email(email.value);
		$("#id-aj-msg").text("");
		document.getElementById("id-aj-msg").style.opacity="0";
	    } else {
	    	console.log("Formato e-mail errato");
			//Formato email errato
			document.getElementById("id-aj-msg").style.opacity="1";
			$("#id-aj-msg").text("Formato e-mail non corretto!");
			$("#id-email").focus();
			$("#id-email").select();
			window.setTimeout(function(){
            	document.getElementById("id-aj-msg").style.opacity="0";
            	$("#id-aj-msg").text("");
            }, 6000);
	    }
	} else {
	    //email non coincidono
		document.getElementById("id-aj-msg").style.opacity="1";
	    $("#id-aj-msg").text("L'e-mail non coincidono");
	    $("#id-email").focus();
	    $("#id-email").select();
	    window.setTimeout(function(){
        	document.getElementById("id-aj-msg").style.opacity="0";
        	$("#id-aj-msg").text("");
        }, 6000);
	}
    }
}

function check_email(email){
    'use strict';
    var url="../aj/check_user.php?email="+email;
    http.open("GET", url , true);
    document.getElementById("id-aj-msg").style.opacity="1";
    document.getElementById("id-aj-msg").innerHTML="<div id=\"ajax_wait\"><img src=\"../gif/spinner.gif\"><p>...retrieving data</p></div>";
    http.onreadystatechange=function(){
	if (http.readyState === 4 || http.readyState === "complete"){
	    //console.log('check_email : stato 4 passato');
	    if (http.status === 200){
		//console.log("check_email : stato 200 OK");
		//console.log(xmlhttp.responseText);
		if (http.responseText === 1){
			// email già presente nel sistema
				document.getElementById("id-aj-msg").style.opacity="1";
	    		document.getElementById("id-aj-msg").innerHTML= "e-mail già presente nel sistema !";
	    		document.getElementById("id-btn-register").disabled = true;
	    		document.getElementById("id-btn-register").style.backgroundColor="#EFEFEF";
	    		document.getElementById("id-btn-register").style.color="#697278";
	    		window.setTimeout(function(){
	    			document.getElementById("id-aj-msg").style.opacity="0";
	    		}, 8000);
	    	} else {
	    		document.getElementById("id-btn-register").disabled = false;
	    		document.getElementById("id-btn-register").style.backgroundColor="#DE864C";
	    		document.getElementById("id-btn-register").style.color="#dedede";
	    	}

	    } else {
		document.getElementById("AJAX_response").innerHTML="<p>ERRORE "+http.status+"</p>";
	    } //if
	} //if
    } ; //function
    http.send(null);
}

function checkBrowser(){
	'use strict';
	//console.log(checkBrowser);
	http.open("POST", "w/aj/browser.php", true);

    http.onreadystatechange=function(){
	if (http.readyState==4 || http.readyState=="complete"){
	    //console.log('Function: checkBrowser() - readyState');
	    if (http.status == 200){
	    	var arr = http.responseText.split(",");
	    	if (arr[2] == 'mobile') {
	    		var meta = document.getElementById("id-meta-viewport");
	    		meta.setAttribute("name", "viewport");
	    		meta.setAttribute("content", "width=device-width, initial-scale=1,user-scalable=0");
	    	}

			document.getElementById("id-aj-header-test").innerHTML=  http.responseText;
	    } else {
    		document.getElementById("id-aj-header-test").innerHTML="<p>ERRORE "+http.status+"</p>";
    	}
	} // if
    } ; // function
    http.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    http.send(null);
}
