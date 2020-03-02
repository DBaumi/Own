/* this is the javascript code for a dynamic web page */
/* TODO:
  --exercise 4

/*
  Function for sorting tables by clicking their table headers.
  @param
    columnToSort: the number of the column which the table is sorted after
    tableNumber:  the number of the table which will be sorted
*/
function sortTable(columnToSort, tableNumber){
  var rows, table, rowX, rowY, rowSwitching = 0;

  // select which table is selected for sorting
  switch(tableNumber) {
    case 1:
      table = document.getElementById("firstTable");
      break;
    case 2:
      table = document.getElementById("secondTable");
      break;
    default:
      console.error("Missing parameter for the table!");
  }

  rowSwitching = true;

  while(rowSwitching){
    rowSwitching = false;
    rows = table.rows;

    var i, j, needSwap;
    for(i = 1; i < (rows.length - 1); i++){
      needSwap = false;
      j = i + 1;
      // get two rows to compare them
      rowX = rows[i].getElementsByTagName("td")[columnToSort];
      rowY = rows[j].getElementsByTagName("td")[columnToSort];

      // compare the tow rows with the text inside the tag --> asc sorting for now
      if(rowX.innerHTML.toLowerCase() > rowY.innerHTML.toLowerCase()){
        // mark if rows need to be swapped and then break the 'for' loop
        needSwap = true;

        // do not sort the last two rows (form and not sortable data)
        if(rowX.innerHTML.includes("<") || rowY.innerHTML.includes("<")){
          needSwap = false;
        }

        break;
      }
    }

    if(needSwap){
      rows[i].parentNode.insertBefore(rows[j], rows[i]);
      rowSwitching = true;
    }
  }
}

/*
  Function for loading the table again after the resetDatabase() got executed.
*/
function resetAndRefillTable(){
  resetDatabase();
  dynamicTableFillUp();
}

/*
  Function for reseting the database with an AJAX GET http request.
*/
function resetDatabase(){
  // create new http request
  var xhr = new XMLHttpRequest();

  // catch the response of the server with event listener
  xhr.addEventListener("load", function(){
    if(this.status == 200){
      // console.log("Server response: " + this.responseText);
      window.alert("Database reset successfully!");
    }
  });

  // open the connection and send to the server
  xhr.open("GET", "https://wt.ops.labs.vu.nl/api20/5448bd47/reset", true);
  xhr.send();
}

/*
  Function for dynamically filling up the second table on the web page.
  NOTE: clear innerHTML of tbody first and the fill it with the content from the web server
*/
function dynamicTableFillUp(){
  var xhr = new XMLHttpRequest();
  xhr.responseType = "json";

  // add an event listener with "load" and an anonymous function
  xhr.addEventListener("load", function(){
    var tableToFill = document.getElementById("contentToFillDynamically");

    // clear table first
    tableToFill.innerHTML = "";

    // check if the http request was successfull
    if(this.status = 200){
      var responseServer = this.response;
      var i;
      for(i = 0; i < responseServer.length; i++){
        tableToFill.innerHTML +=
        "<tr>" +
          "<td>" + responseServer[i].brand + "</td>" +
          "<td>" + responseServer[i].model + "</td>" +
          "<td>" + "<img src=" + responseServer[i].image + ">" + "</td>" +
          "<td>" + responseServer[i].screensize + "</td>" +
          "<td>" + responseServer[i].os + "</td>" +
        "</tr>";
      }
    }
  });

  xhr.open("GET", "https://wt.ops.labs.vu.nl/api20/5448bd47", true);
  xhr.send();
}

/*
  Function to send the form data with ajax post http request to the server.
  @ NOTE: function is not working properly:
    - elements from the form have the correct values
    - we think the error is, that we have a 'bad request' error (error 400) and we could not fix it
    - maybe the 'bad request error' is caused by the wrong url, the wrong JSON parse of the data or the wrong setRequestHeader
*/
function sendFormData(){
  // define request
  var xhr = new XMLHttpRequest();
  var url = "https://wt.ops.labs.vu.nl/api20/5448bd47";
  xhr.open("POST", url, true);

  // define header
  xhr.setRequestHeader("Content-Type", "application/json");

  // check if the request is compete and was successful
  xhr.onreadystatechange = function() {
    if(this.readyState === 4 && this.status === 200) {
      window.alret(this.responseText);
    }
  };

  // get data from the form
  var brand = document.getElementById("deviceBrand").value;
  var model = document.getElementById("deviceModel").value;
  var image = document.getElementById("deviceImg").value;
  var screensize = document.getElementById("deviceScreensize").value;
  var os = document.getElementById("deviceOS").value;

  // parse to JSON
  var data = JSON.stringify({"brand": brand, "model": model, "os": os, "image": image, "screensize": screensize});

  // send data
  xhr.send(data);
}
