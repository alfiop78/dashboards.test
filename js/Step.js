/*
timelineId = elemento id della class='timelineContent'
*/

class Steps {

  constructor(stepTranslate) {
    // definisco il div che deve effettuare la translate
    console.log(stepTranslate);
    this._translate = document.getElementById(stepTranslate);
    this._page = document.querySelector('.step[selected]');
    console.log(this._page);
    console.log(this._page.offsetWidth);
    this._pageWidth = this._page.offsetWidth + 32; // width della pagina da translare
    console.log(this._pageWidth);

  }

  previous() {
    // this._pageWidth = this._page.offsetWidth + 32;
    this._translate.style.transform = "translateX("+(this._pageWidth-this._pageWidth)+"px)";
  }

  next() {
    // this._pageWidth = this._page.offsetWidth + 32;
    this._translate.style.transform = "translateX(-"+this._pageWidth+"px)";
  }

  goStep(e) {
    
  }

}
