// TODO: definire dei metodi per spostare la pagina in base al viewport/device. Attualmente la translate è impostata a 1000px per ogni pagina
class Page {

  constructor(container) {
    this.containerPages = container;
    this.container = document.getElementById('container');

  }

  set currentPage(page) {
    this.page = page;
  }

  get currentPage() {return this.page;}

  set currentStep(step) {
    this.step = +step;
  }

  get currentStep() {return this.step;}

  next() {
    /* Metodi si sposta sulla pagina successiva degli Step*/

    // ottengo la pagina corrente
    this.currentPage = document.querySelector('.page[selected]');
    // rimuovo [selected] dalla pagina corrente
    this.page.removeAttribute('selected');
    // pagina successiva
    this.nextPage = this.page.nextElementSibling;
    // la imposto come [selected]
    this.nextPage.setAttribute('selected', true);
    // set lo step corrente
    this.currentStep = this.nextPage.getAttribute('data-step');
    // imposto, sul container delle pagine il data-step attivo in questo momento, dopo il next
    this.containerPages.setAttribute('data-step', +this.nextPage.getAttribute('data-step'));
    // imposto il data-page attuale anche sul container, questo mi servirà per gestire i tasti da visualizzare/nascondere in #controls, in base alla pagina visualizzata
    this.container.setAttribute('data-page', +this.nextPage.getAttribute('data-step'));
  }

  previous() {
    /* Metodi si sposta sulla pagina successiva degli Step*/

    // ottengo la pagina corrente
    this.currentPage = document.querySelector('.page[selected]');
    // rimuovo [selected] dalla pagina corrente
    this.page.removeAttribute('selected');
    // pagina successiva
    this.previousPage = this.page.previousElementSibling;
    // set lo step corrente
    this.currentStep = this.previousPage.getAttribute('data-step');
    // la imposto come [selected]
    this.previousPage.setAttribute('selected', true);
    // imposto, sul container delle pagine il data-step attivo in questo momento, dopo il next
    this.containerPages.setAttribute('data-step', this.currentStep);
    // imposto il data-page attuale anche sul container, questo mi servirà per gestire i tasti da visualizzare/nascondere in #controls, in base alla pagina visualizzata
    this.container.setAttribute('data-page', +this.previousPage.getAttribute('data-step'));
  }

}
