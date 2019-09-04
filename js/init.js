/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* funzione immediata */
var App = new Application();
(() => {
  var app = {
    Draw : new Draw()

  };

  // App.getSessionName();

  App.init();

  // let obDraw = new Draw();
  // console.log(obDraw);
  // obDraw.addColumn('Dealer');
  // obDraw.addColumn('id');
  //
  // obDraw.addRow('GLM');
  // obDraw.addRow('43');


  app.getData = function() {
    var url = "/ajax/chart.php";

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          // console.log(request.response);

          var response = JSON.parse(request.response);
          console.table(response);
          // console.log(Object.keys(response[0])[0]); // nome colonna
          // console.log(Object.keys(response[0])[1]); // nome colonna
          // aggiungo le colonne
          app.Draw.addColumn('ID');
          app.Draw.addColumn('Dealer');
          for (let i in response) {
            // console.log(response[i]);
            app.Draw.addRow([response[i].id, response[i].descrizione]);
          }



        } else {

        }
      } else {

      }
    };

    request.open('POST', url);
    request.setRequestHeader('Content-Type','application/json');
    request.send();
  };

  app.getData();


})();
