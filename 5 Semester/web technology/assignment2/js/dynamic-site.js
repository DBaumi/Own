/* this is the javascript code for a dynamic web page */
// TODO: function sortTable so, that input fields are not considered to be sorted

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
    /* if no swap is needed, then the sorting direction can be changed
    else {

    }*/
  }

}
