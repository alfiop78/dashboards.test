/*
timelineId = elemento id della class='timelineContent'
*/

class Timeline {

  constructor(timelineId) {
    this.timelineRef = document.querySelector('#'+timelineId);
    // console.log(this.timelineRef);
    this.translateRef = this.timelineRef.querySelector('.timelineTranslate');
    // console.log(this.translateRef);
    this.overflowRef = this.timelineRef.querySelector('.timelineOverflow');
    // console.log(this.overflowRef);
    this.totalElements = this.timelineRef.querySelector('.timelineTranslate').childElementCount;
    // this.activeElementId = +this.timelineRef.querySelector('.timelineOverflow').getAttribute('active');
    this.btnAdd = this.timelineRef.querySelector('#add');
    // console.log(this.btnAdd);
  }

  set elementAdded(element) {this.addedElement = element;}

  get elementAdded() {return this.addedElement;}

  move() {
    // Spostamento timeline
    // se data-elements="1" c'è solo una element nell'timelineoverflow, quindi lo incremento di 1
    if (+this.overflowRef.getAttribute("data-elements") !== 1) {

      let total = this.timelineRef.querySelector('.timeline').childElementCount;
      if (this.timelineRef.querySelector('.timeline span[active]')) {
        this.timelineRef.querySelector('.timeline span[active]').removeAttribute('active');
      }
      // console.log(document.querySelector(".timeline span[id='"+total+"']"));
      this.timelineRef.querySelector(".timeline span[id='"+total+"']").setAttribute('active', true);
      let offsetCard = this.timelineRef.querySelector("div[element][data-id='"+total+"']").offsetLeft-18;
      // console.log(offsetCard);
      this.translateRef.style.transform = "translateX(-"+offsetCard+"px)"
      this.translateRef.setAttribute('data-x', -offsetCard);
    }
    // .timelineOverflow[data-elements="1"] ha una larghezza di 300px metre se ha più di un elemento ha un width = 600px
    this.overflowRef.setAttribute('data-elements', this.totalElements);
    // TODO: recupero le dimensioni delle cards ed imposto .timelineOverflow sulla width risultante
    let widthOverflow = 0;
    this.timelineRef.querySelectorAll('div[element]').forEach((element) => {
      // recupero la timeline attiva
      let step = +this.timelineRef.querySelector('.timeline span[active]').getAttribute('id');
      // console.log(step); // es.: step attivo 4, recupero la larghezza delle element 4 e 5
      // console.log(element);
      // console.log(element.clientWidth);

      if (+element.getAttribute('data-id') === step || +element.getAttribute('data-id') === step+1) {
        widthOverflow += element.clientWidth+36;
        // console.log(typeof widthOverflow);
        // console.log(widthOverflow);
      }
      // console.log(widthOverflow);
      this.overflowRef.style.width = widthOverflow+"px";

    });

  }

  goStep(e) {
    // spostamento timeline sull'elemento selezionato
    if (document.querySelector('.timeline span[active]')) {
      document.querySelector('.timeline span[active]').removeAttribute('active');
    }
    e.target.setAttribute('active', true);
    // left dello step this.id
    let offsetCard = document.querySelector("div[element][data-id='"+e.target.id+"']").offsetLeft-18;
    // console.log(offsetCard);
    this.translateRef.style.transform = "translateX(-"+offsetCard+"px)"
    this.translateRef.setAttribute('data-x', -offsetCard);

  }

  add() {
    // Metodo per aggiungere un nuovo elemento alla timeline
    // aggiungo la element
    console.log(this);
    let tmplElement = this.timelineRef.querySelector('#template-element');
    let tmplContent = tmplElement.content.cloneNode(true);
    let element = tmplContent.querySelector('div[element]');
    element.setAttribute('data-id', ++this.totalElements);
    // element.querySelector('div[subElement]').innerText = "element "+this.totalElements;
    this.translateRef.appendChild(element);
    this.addCircle();
    // mi sposto allo step della timeline appena aggiunta
    this.move();
    this.elementAdded = element;
  }

  addInfoReferenceElement() {
    // aggiungo sull'elemento div[element] il nomde dell'elemento contenuto al suo interno, questo apparirà nelle "info" sotto i circle come una sorta di "segnalibri"
    // element = elemento nel DOM che contiene l'attributo da far visualizzare come segnalibro

  }

  addCircle() {
    // aggiungo lo step nella timeline
    let tmplCircleTimeline = this.timelineRef.querySelector('#circle-timeline');
    let tmplContent = tmplCircleTimeline.content.cloneNode(true);
    let circle = tmplContent.querySelector('span');
    let totalCircle = this.timelineRef.querySelector('.timeline').childElementCount;
    circle.id = ++totalCircle;
    circle.setAttribute('active', true);
    this.timelineRef.querySelector('.timeline').appendChild(circle);
    circle.onclick = this.goStep.bind(this);
  }

  activeElements() {
    // recupero i due elementi "visibili", quindi attivi, nll'overflow
    // all'interno dei circle (in alto nella timeline) è presente l'id dell'elemnto attivo. Ottenuto l'id ricavo anche l'elemento successivo a quello attivo
    
    let activeElementId = +this.timelineRef.querySelector('.timelineContainer > .timeline > span[active]').getAttribute('id');
    // console.log(activeElementId);
    let first = this.overflowRef.querySelector("div[element][data-id='"+activeElementId+"']");
    let second = first.nextElementSibling;

    return [first, second];
  }
}