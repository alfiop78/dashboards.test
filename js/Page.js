class Page {

  constructor(container) {
    this.containerPages = container;

  }

  set currentPage(page) {
    this.page = page;
  }

  get currentPage() {return this.page;}

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
    // imposto, sul container delle pagine il data-step attivo in questo momento, dopo il next
    this.containerPages.setAttribute('data-step', +this.nextPage.getAttribute('data-step'));
  }

  back() {
    /* Metodi si sposta sulla pagina successiva degli Step*/

    // ottengo la pagina corrente
    this.currentPage = document.querySelector('.page[selected]');
    // rimuovo [selected] dalla pagina corrente
    this.page.removeAttribute('selected');
    // pagina successiva
    this.previousPage = this.page.previousElementSibling;
    // la imposto come [selected]
    this.previousPage.setAttribute('selected', true);
    // imposto, sul container delle pagine il data-step attivo in questo momento, dopo il next
    this.containerPages.setAttribute('data-step', +this.previousPage.getAttribute('data-step'));
  }

  previous() {}
}
