let lastRow = 0;

document.addEventListener("DOMContentLoaded", function(event) { 
  document.getElementById('tables').children[lastRow].style.backgroundColor = '#ffdce2'
});

let getDataForTable = function(table) {
  $('#data').empty()
  var pageURL = window.location.href;
  var db = pageURL.substr(pageURL.lastIndexOf('/') + 1);
  url = "/postgres/"+db+"/table/"+table.innerHTML
  $.get(url, function(data){
    createTableFromData(data[0], data[1])
  })
  for(let i=0;i<table.parentNode.children.length;i++){
    if (table.parentNode.children[i] == table) {
      highlightCorrectTable(i)
    }
  }
}

function createTableFromData(details, data) {
  $('#data').append(createHeaderRow(details))
  $('#data').append(createDataRows(data))
}

function createHeaderRow(details) {
  let html = "<tr id='data-headers'>"
  for(let i=0;i<details.length;i++) {
    html = html + "<th>" + details[i].column_name + "</th>"
  }
  return(html = html + "</tr>")
}

function createDataRows(data) {
  let html = ""
  for(let i=0;i<data.length;i++) {
    html = html + "<tr>"
    for (var key in data[i]) {
      html = html + "<td><div class='data-row'>" + data[i][key] + "</div></td>"
    }
    for(let y=0;y<data[i].length;y++){
      
    }
    html = html + "</tr>"
  }
  return(html)
}

function highlightCorrectTable(newRow) {
  if (newRow == lastRow)
    return
  let table = document.getElementById('tables')
  table.children[newRow].style.backgroundColor = '#ffdce2'
  table.children[lastRow].style.backgroundColor = ''
  lastRow = newRow;
}