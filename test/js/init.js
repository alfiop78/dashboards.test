(() => {
  var app = {
    translateRef : document.getElementsByClassName('translate')[0],
    overflowRef : document.getElementsByClassName('overflow')[0],
    totalCards : document.getElementsByClassName('translate')[0].childElementCount,
    activeCardId : +document.getElementsByClassName('overflow')[0].getAttribute('active')

  };

  app.moveTimeline = function() {

    // se data-cards="1" c'è solo una card nell'overflow, quindi lo incremento di 1
    if (+app.overflowRef.getAttribute("data-cards") !== 1) {
      // console.log(document.querySelector('.timeline').childElementCount);
      let total = document.querySelector('.timeline').childElementCount;
      if (document.querySelector('.timeline span[active]')) {
        document.querySelector('.timeline span[active]').removeAttribute('active');
      }
      // console.log(document.querySelector(".timeline span[id='"+total+"']"));
      document.querySelector(".timeline span[id='"+total+"']").setAttribute('active', true);
      let offsetCard = document.querySelector(".card[data-id='"+total+"']").offsetLeft;
      app.translateRef.style.transform = "translateX(-"+offsetCard+"px)"
      app.translateRef.setAttribute('data-x', -offsetCard);
    }
    // .overflow[data-cards="1"] ha una larghezza di 300px metre se ha più di un elemento ha un width = 600px
    app.overflowRef.setAttribute('data-cards', app.totalCards);
    // TODO: recupero le dimensioni delle cards ed imposto .overflow sulla width risultante
    let widthOverflow = 0;
    document.querySelectorAll('.card').forEach((card) => {
      // recupero la timeline attiva
      let step = +document.querySelector('.timeline span[active]').getAttribute('id');
      console.log(step); // es.: step attivo 4, recupero la larghezza delle card 4 e 5
      console.log(card);
      console.log(card.clientWidth);

      if (+card.getAttribute('data-id') === step || +card.getAttribute('data-id') === step+1) {
        widthOverflow += card.clientWidth;
        // console.log(typeof widthOverflow);
        // console.log(widthOverflow);
      }
      console.log(widthOverflow);
      app.overflowRef.style.width = widthOverflow+"px";

    });
  };

  app.goStep = function(e) {
    console.log(this);
    console.log(this.id);
    if (document.querySelector('.timeline span[active]')) {
      document.querySelector('.timeline span[active]').removeAttribute('active');
    }
    this.setAttribute('active', true);
    // left dello step this.id
    let offsetCard = document.querySelector(".card[data-id='"+this.id+"']").offsetLeft;
    app.translateRef.style.transform = "translateX(-"+offsetCard+"px)"
    app.translateRef.setAttribute('data-x', -offsetCard);

  };

  app.add = function() {
    // aggiungo la card
    let tmplCard = document.getElementById('card');
    let tmplContent = tmplCard.content.cloneNode(true);
    let card = tmplContent.querySelector('.card');
    card.setAttribute('data-id', ++app.totalCards);
    card.querySelector('.table').innerText = "card "+app.totalCards;
    app.translateRef.appendChild(card);
    // aggiungo lo step nella timeline
    let tmplCircleTimeline = document.getElementById('circle-timeline');
    tmplContent = tmplCircleTimeline.content.cloneNode(true);
    let circle = tmplContent.querySelector('span');
    let totalCircle = document.querySelector('.timeline').childElementCount;
    circle.id = ++totalCircle;
    circle.setAttribute('active', true);
    document.querySelector('.timeline').appendChild(circle);
    circle.onclick = app.goStep;
    // mi sposto allo step della timeline appena aggiunta
    app.moveTimeline();
  };


  document.getElementById('addCard').onclick = app.add;
})();
