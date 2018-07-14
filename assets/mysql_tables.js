let lastRow = 0;
let limits;
let currentTable;

document.addEventListener("DOMContentLoaded", function(event) { 
  document.getElementById('tables').children[lastRow].style.backgroundColor = '#ffbfbf'
  $( "#update" ).click(function() {
    getDataForTable(currentTable, false)
  });
  $( "#clear" ).click(function() {
    getDataForTable(currentTable, true)
  });
});

let getDataForTable = function(table, firstLoad) {
  currentTable = table;
  if (firstLoad) {
    limits = {
      offset:1,
      count:100,
    }
  } 
  else {
    getLimitsFromInputs()
  }
  $('#data').empty()
  var pageURL = window.location.href;
  var db = pageURL.substr(pageURL.lastIndexOf('/') + 1);
  url = "/mysql/"+db+"/table/"+table.innerHTML+"/"+limits.offset+"/"+limits.count
  $.get(url, function(data){    
    createTableFromData(data[0], data[1])
    updateTableRowCount(data[2][0]["COUNT(*)"])
    if (firstLoad && data[2][0]["COUNT(*)"] < 100)
      limits.count = data[2][0]["COUNT(*)"] - 1
    fillLimitInputs()
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
  addOnclickToRow()
}

function createHeaderRow(details) {
  let html = "<tr id='data-headers'>"
  for(let i=0;i<details.length;i++) {
    html = html + "<th>" + details[i].Field + "</th>"
  }
  return(html = html + "</tr>")
}

function createDataRows(data) {
  let html = ""
  for(let i=0;i<data.length;i++) {
    html = html + "<tr>"
    for (var key in data[i]) {
      html = html + "<td><div class='data-row' data-column="+key+">" + data[i][key] + "</div></td>"
    }
    for(let y=0;y<data[i].length;y++){
      
    }
    html = html + "</tr>"
  }
  return(html)
}

function addOnlick(data){
  console.log(data)
}

function highlightCorrectTable(newRow) {
  if (newRow == lastRow)
    return
  let table = document.getElementById('tables')
  table.children[newRow].style.backgroundColor = '#ffbfbf'
  table.children[lastRow].style.backgroundColor = ''
  lastRow = newRow;
}

function updateTableRowCount(count) {
  $('#count').prop('readonly',false);
  $('#count').val(count);
  $('#count').prop('readonly',true);
}

function getLimitsFromInputs() {
  limits.offset = parseInt($('#start').val())  
  if (limits.offset < 1)
    limits.offset = 1
  limits.count = parseInt($('#end').val() - limits.offset)
  if (limits.count < limits.offset){
    limits.count = 100
    limits.offset = 1
  }
}

function fillLimitInputs() {
  $('#start').val(limits.offset)
  $('#end').val(limits.offset + limits.count)
}

function addOnclickToRow() {
  let rows = $('#data').find('tr')
  for(let i=1;i<rows.length;i++){
    $(rows[i]).click(function(){
      showModal(rows[i])
    })
  }
}

// MODAL FUNCTIONS
function showModal(data){
  let tds = data.children
  let html; 
  for(let i=0;i<tds.length;i++){    
    html = html + "<tr>"
    let div = tds[i].children[0]
    let column_name = div.dataset[Object.keys(div.dataset)[0]]
    html = html + "<td>"+column_name+"</td><td><input value="+div.innerHTML+"></td>"
    html = html + "</tr>"
  }
  $('#modal-bg').fadeIn()
  $('#modal').fadeIn()
  $('#modal-table').append(html)
}

function closeModal() {
  $('#modal-bg').fadeOut()
  $('#modal').fadeOut()
  $('#modal-table').empty()  
}