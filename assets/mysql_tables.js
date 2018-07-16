let lastRow = 1;
let limits;
let currentTable;
let currentSort = {
  column: "NONE",
  sort: "NONE"
}

document.addEventListener("DOMContentLoaded", function(event) { 
  document.getElementById('tables').children[lastRow].style.backgroundColor = '#ffbfbf'
  $( "#update" ).click(function() {
    getDataForTable(currentTable, false)
  });
  $( "#clear" ).click(function() {
    getDataForTable(currentTable, true)
  });  
  getDataForTable($('#tables')[0].children[lastRow], true)
});

let getDataForTable = function(table, firstLoad) {
  currentTable = table;
  if (firstLoad) {
    limits = {
      offset:1,
      count:100,
    }
    currentSort.column = "NONE"
    currentSort.sort = "NONE"
  } 
  else
    getLimitsFromInputs()

  $('#data').empty()
  let pageURL = window.location.href;
  let db = pageURL.substr(pageURL.lastIndexOf('/') + 1);
  url = "/mysql/"+db+"/table/"+table.innerHTML+"/"+limits.offset+"/"+limits.count+"/"+currentSort.column+"/"+currentSort.sort
  $.get(url, function(data){    
    createTableFromData(data[0], data[1])
    updateTableRowCount(data[2][0]["COUNT(*)"])
    if (firstLoad && data[2][0]["COUNT(*)"] < 100)
      limits.count = data[2][0]["COUNT(*)"] - 1
    fillLimitInputs()
    for(let i=0;i<table.parentNode.children.length;i++){
      if (table.parentNode.children[i] == table) {
        highlightCorrectTable(i)
      }
    }
    updateColumnSortIndicator()
  })
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
    for (let key in data[i]) {
      html = html + "<td><div class='data-row' data-column="+key+">" + data[i][key] + "</div></td>"
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
  limits.count = parseInt($('#end').val()) - limits.offset
  if (parseInt($('#end').val()) <= limits.offset){
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
  for(let i=0;i<rows[0].children.length;i++){
    $(rows[0].children[i]).click(function(){
      updateTableSort(rows[0].children[i])
    })
  }
  for(let i=1;i<rows.length;i++){
    $(rows[i]).click(function(){
      showModal(rows[i])
    })
  }
}

function updateTableSort(column) {
  let td = column
  let columnName = $(td).contents().get(0).nodeValue

  if (currentSort.column == columnName) {
    if (currentSort.sort == "NONE")
      currentSort.sort = "ASC"
    else if (currentSort.sort == "ASC")
      currentSort.sort = "DESC"
    else if (currentSort.sort = "DESC")
      currentSort.sort = "NONE"
  }
  else {
      currentSort.column = columnName
      currentSort.sort = "ASC"
  }
  getDataForTable(currentTable)
}

function updateColumnSortIndicator() {
  $('#sort-indicator').remove() // Remove the arrow from wherever it was
  let tds = $("#data-headers")[0].children
  let td;
  if (currentSort.column == "NONE")
    return
  for(let i=0;i<tds.length;i++){
    if (tds[i].innerHTML == currentSort.column)
      td = tds[i]
  }
  let indicator = document.createElement('span')
  indicator.style.marginLeft = "5px"
  indicator.id = 'sort-indicator'
  indicator.innerHTML = ""
  if (currentSort.sort == "ASC")
    indicator.innerHTML = "↓"
  else if (currentSort.sort == "DESC")
    indicator.innerHTML = "↑"
  td.appendChild(indicator)
}

// MODAL FUNCTIONS
function showModal(data){  
  $('#modal-table').empty()  
  $('#modal-table').removeData()
  let tds = data.children
  let html; 
  for(let i=0;i<tds.length;i++){    
    html = html + "<tr>"
    let div = tds[i].children[0]
    let column_name = div.dataset[Object.keys(div.dataset)[0]]
    $('#modal-table').data(column_name, div.innerHTML)
    html = html + "<td>"+column_name+"</td><td><textarea>"+div.innerHTML+"</textarea></td>"
    html = html + "</tr>"
  }
  $('#modal-bg').fadeIn(200)
  $('#modal').fadeIn(200)
  $('#modal-table').append(html)
}

function closeModal() {
  $('#modal-bg').fadeOut(200)
  $('#modal').fadeOut(200)
}

function saveModalData(){
  let newValues = {}
  let rows = $('#modal-table > tbody > tr')
  for(let i=0;i<rows.length;i++){
    newValues[rows[i].children[0].innerHTML] = rows[i].children[1].children[0].value
  }
  let data = { 
    originalValues: $('#modal-table').data(),
    newValues: newValues
  }
  let pageURL = window.location.href;
  let db = pageURL.substr(pageURL.lastIndexOf('/') + 1);
  url = "/mysql/"+db+"/table/"+currentTable.innerHTML+"/row_update"
  $.ajax({
    type: "POST",
    url: url,
    data: data,
    success: function(){
      console.log("Saved")
    },
    dataType: "JSON"
  });
  getDataForTable(currentTable, false)
  closeModal()
}