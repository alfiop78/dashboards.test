// TODO: Impostare un controllo per il next/previous su pagine inesistenti
class Page {

  constructor() {
    this.containerPages = document.getElementById('pages');
    this.container = document.getElementById('container');
    this.startPage = document.querySelector(".page[data-step='1']");
    this.currentPage = document.querySelector('.page[selected]');
  }

  set currentPage(page) {
    this._page = page;
    // ottengo la width della pagina
    this._width = this._page.offsetWidth;
  }

  get currentPage() {return this._page;}

  set currentStep(step) {this.step = +step;}

  get currentStep() {return this.step;}

  next() {
    /* Metodi si sposta sulla pagina successiva degli Step*/

    // ottengo la pagina corrente
    this.currentPage = document.querySelector('.page[selected]');
    // rimuovo [selected] dalla pagina corrente
    this._page.removeAttribute('selected');
    // pagina successiva
    this.nextPage = this._page.nextElementSibling;
    // la imposto come [selected]
    this.nextPage.setAttribute('selected', true);
    // set lo step corrente
    this.currentStep = this.nextPage.getAttribute('data-step');
    // imposto, sul container delle pagine il data-step attivo in questo momento, dopo il next
    this.containerPages.setAttribute('data-step', this.currentStep);
    // sposto il containerPages in base alla width della pagina, in particolare di #pages
    this.containerPages.style.transform = "translateX(-"+this._width+"px)";
    // imposto il data-page attuale anche sul container, questo mi servirà per gestire i tasti da visualizzare/nascondere in #controls, in base alla pagina visualizzata
    this.container.setAttribute('data-page', this.currentStep);
  }

  previous() {
    /* Metodi si sposta sulla pagina successiva degli Step*/

    // ottengo la pagina corrente
    this.currentPage = document.querySelector('.page[selected]');
    // rimuovo [selected] dalla pagina corrente
    this._page.removeAttribute('selected');
    // pagina successiva
    this.previousPage = this._page.previousElementSibling;
    // set lo step corrente
    this.currentStep = this.previousPage.getAttribute('data-step');
    // la imposto come [selected]
    this.previousPage.setAttribute('selected', true);
    // imposto, sul container delle pagine il data-step attivo in questo momento, dopo il next
    this.containerPages.setAttribute('data-step', this.currentStep);
    // sposto il containerPages in base alla width della pagina, in particolare di #pages
    this.containerPages.style.transform = "translateX("+(-this._width+this._width)+"px)";
    // imposto il data-page attuale anche sul container, questo mi servirà per gestire i tasti da visualizzare/nascondere in #controls, in base alla pagina visualizzata
    this.container.setAttribute('data-page', this.currentStep);
  }

  restart() {
    // riporto la page al primo step
    // ottengo la pagina corrente
    this.currentPage = document.querySelector('.page[selected]');
    // rimuovo [selected] dalla pagina corrente
    this.page.removeAttribute('selected');
    // set lo step corrente
    this.currentStep = this.startPage.getAttribute('data-step');
    this.startPage.setAttribute('selected', true);
    // imposto, sul container delle pagine il data-step attivo in questo momento, dopo il next
    this.containerPages.setAttribute('data-step', this.currentStep);
    // imposto il data-page attuale anche sul container, questo mi servirà per gestire i tasti da visualizzare/nascondere in #controls, in base alla pagina visualizzata
    this.container.setAttribute('data-page', this.currentStep);
  }

}
