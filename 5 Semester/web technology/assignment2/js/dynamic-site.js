/* this is the javascript code for a dynamic web page */

/*
  Function for sorting all the tables on the html page.
  @param the number of the column which the table is sorted after

*/
function sortTable(columnToSort){
  var rows, table, rowX, rowY, changeRows = 0;
  //table = getElementsByTagName('table');
  table = getElementByClassName('tableInStock');
  while(changeRows){
    changeRows = false;
    rows = table.rows;

    var i, needSwap;
    for(i = 0; i < (rows.length - 1); i++){
      // get two rows to compare them
      rowX = rows[i].getElementsByTagName('td')[columnToSort];
      rowY = rows[i+1].getElementsByTagName('td')[columnToSort];

      // compare the tow rows with the text inside the tag --> asc sorting for now
      if(rowX.innerHTML.toLowerCase() > rowY.innterHTML.toLowerCase()){
        // mark if rows need to be swapped and then break the 'for' loop
        needSwap = true;
        break;
      }
    }

    if(needSwap){
      rows[i].parentNode.insertBefore(rows[i+1], rows[i]);
      changeRows = true;
    }
    /* if no swap is needed, then the sorting direction can be changed
    else {

    }*/
  }

}
