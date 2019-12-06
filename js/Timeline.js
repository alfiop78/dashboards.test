/*
timelineId = elemento id della class='timelineContent'
*/

class Timeline {

  constructor(timelineId) {
    this.timelineRef = document.querySelector('#'+timelineId);
    console.log(this.timelineRef);
    this.translateRef = this.timelineRef.querySelector('.timelineTranslate');
    console.log(this.translateRef);
    this.overflowRef = this.timelineRef.querySelector('.timelineOverflow');
    console.log(this.overflowRef);
    this.totalElements = this.timelineRef.querySelector('.timelineTranslate').childElementCount;
    // this.activeElementId = +this.timelineRef.querySelector('.timelineOverflow').getAttribute('active');
    this.btnAdd = this.timelineRef.querySelector('#add');
    this.btnAdd.onclick = this.add.bind(this);
    // console.log(this.btnAdd);
  }

  move() {
    // Spostamento timeline
    // se data-elements="1" c'è solo una element nell'timelineoverflow, quindi lo incremento di 1
    if (+this.overflowRef.getAttribute("data-elements") !== 1) {

      let total = document.querySelector('.timeline').childElementCount;
      if (document.querySelector('.timeline span[active]')) {
        document.querySelector('.timeline span[active]').removeAttribute('active');
      }
      // console.log(document.querySelector(".timeline span[id='"+total+"']"));
      document.querySelector(".timeline span[id='"+total+"']").setAttribute('active', true);
      let offsetCard = document.querySelector("div[element][data-id='"+total+"']").offsetLeft;
      this.translateRef.style.transform = "translateX(-"+offsetCard+"px)"
      this.translateRef.setAttribute('data-x', -offsetCard);
    }
    // .timelineOverflow[data-elements="1"] ha una larghezza di 300px metre se ha più di un elemento ha un width = 600px
    this.overflowRef.setAttribute('data-elements', this.totalElements);
    // TODO: recupero le dimensioni delle cards ed imposto .timelineOverflow sulla width risultante
    let widthOverflow = 0;
    document.querySelectorAll('div[element]').forEach((element) => {
      // recupero la timeline attiva
      let step = +document.querySelector('.timeline span[active]').getAttribute('id');
      console.log(step); // es.: step attivo 4, recupero la larghezza delle element 4 e 5
      console.log(element);
      console.log(element.clientWidth);

      if (+element.getAttribute('data-id') === step || +element.getAttribute('data-id') === step+1) {
        widthOverflow += element.clientWidth;
        // console.log(typeof widthOverflow);
        // console.log(widthOverflow);
      }
      console.log(widthOverflow);
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
    let offsetCard = document.querySelector("div[element][data-id='"+e.target.id+"']").offsetLeft;
    this.translateRef.style.transform = "translateX(-"+offsetCard+"px)"
    this.translateRef.setAttribute('data-x', -offsetCard);

  }

  add() {
    // Metodo per aggiungere un nuovo elemento alla timeline
    // aggiungo la element
    console.log(this);
    let tmplElement = document.getElementById('template-element');
    let tmplContent = tmplElement.content.cloneNode(true);
    let element = tmplContent.querySelector('div[element]');
    element.setAttribute('data-id', ++this.totalElements);
    // element.querySelector('div[subElement]').innerText = "element "+this.totalElements;
    this.translateRef.appendChild(element);
    // aggiungo lo step nella timeline
    let tmplCircleTimeline = document.getElementById('circle-timeline');
    tmplContent = tmplCircleTimeline.content.cloneNode(true);
    let circle = tmplContent.querySelector('span');
    let totalCircle = document.querySelector('.timeline').childElementCount;
    circle.id = ++totalCircle;
    circle.setAttribute('active', true);
    document.querySelector('.timeline').appendChild(circle);
    circle.onclick = this.goStep.bind(this);
    // mi sposto allo step della timeline appena aggiunta
    this.move();
  }
}
