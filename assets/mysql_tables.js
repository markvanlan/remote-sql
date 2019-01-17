let dataRows;
let currentTable;
let currentDatabase;
let currentDatabaseType;
let currentColumns = []
let currentSelectedRow;
let currentSort = {
  column: "NONE",
  sort: "NONE"
}
let limits = {
  offset: 1,
  count:100
}
let lastRow = 1;

document.addEventListener("DOMContentLoaded", function(event) { 
  currentDatabase = window.location.href.substr(window.location.href.lastIndexOf('/') + 1);
  //  SET CURRENT DATABASE TYPE
  document.getElementById('tables').children[lastRow].style.backgroundColor = '#a9d3fd'
  $( "#update" ).click(function() {
    getDataForTable(currentTable, false)
  });
  $( "#clear" ).click(function() {
    getDataForTable(currentTable, true)
  });  
  $( "#query" ).click(function() {
    showCustomQuery()
  });
  $( "#edit-btn" ).click(function() {
    showModal($('tr.selected')[0])
  })
  $( "#delete-btn" ).click(function() {
    deleteSelectRows($('tr.selected'))
  })
  getDataForTable($('#tables')[0].children[lastRow], true)
});

let getDataForTable = function(table, firstLoad, customQuery) {
  currentTable = table;
  currentColumns = []
  if (firstLoad) {
    limits.offset = 1
    limits.count = 100
    currentSort.column = "NONE"
    currentSort.sort = "NONE"
  } 
  else
    getLimitsFromInputs()

  $('#data').empty()

  url = "/mysql/"+currentDatabase+"/table/"+table.innerHTML+"/"+limits.offset+"/"+limits.count+"/"+currentSort.column+"/"+currentSort.sort
  $.ajax({
    type: "POST",
    url: url,
    data: {query: customQuery},
    success: function(result){
      handleRowsFromServer(result, firstLoad)
      dataRows = document.getElementById('data').children[0].getElementsByTagName('tr');
    },
    dataType: "JSON"
  });
}

function handleRowsFromServer(data, firstLoad) {
  createTableFromData(data[0], data[1])
  updateTableRowCount(data[2][0]["COUNT(*)"])
  if (firstLoad && data[2][0]["COUNT(*)"] < 100)
    limits.count = data[2][0]["COUNT(*)"] - 1
  fillLimitInputs()
  for(let i=0;i<currentTable.parentNode.children.length;i++){
    if (currentTable.parentNode.children[i] == currentTable) {
      highlightCorrectTable(i)
    }
  }
  updateColumnSortIndicator()
}

function getRowsWithCustomQuery(query) {
  $.ajax({
    type: "POST",
    url: url,
    data: query,
    success: success,
    dataType: dataType
  });
}

function createTableFromData(details, data) {
  $('#data').append(createHeaderRow(details))
  $('#data').append(createDataRows(data))
  addOnclickToRow()
}

function createHeaderRow(details) {
  let html = "<tr id='data-headers'>"
  for(let i=0;i<details.length;i++) {
    currentColumns.push(details[i].Field)
    html = html + "<th>" + details[i].Field + "</th>"
  }
  return(html = html + "</tr>")
}

function createDataRows(data) {
  let html = ""
  for(let i=0;i<data.length;i++) {
    html = html + "<tr>"
    for (let key in data[i]) {
      html = html + "<td><div class='data-cell' data-column="+key+">" + data[i][key] + "</div></td>"
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
  table.children[newRow].style.backgroundColor = '#a9d3fd'
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
      RowClick(rows[i], false)
      showControlsIfNeeded()
    })
  }
}

function showControlsIfNeeded(){
  let selectedRows = $('tr.selected')
  if (selectedRows.length == 0 ){
    $('#edit-btn').fadeOut(100)
    $('#delete-btn').fadeOut(100)
  }
  else if (selectedRows.length == 1){
    $('#edit-btn').fadeIn(100)
    $('#delete-btn').fadeIn(100)
  }
  else {
    $('#edit-btn').fadeOut(100)
    $('#delete-btn').fadeIn(100)
  }
}

function RowClick(currenttr, lock) {
  if (window.event.ctrlKey) {
    toggleRow(currenttr);
  }
  if (window.event.button === 0) {
    if (!window.event.ctrlKey && !window.event.shiftKey) {
      clearAllSelectedRows(currenttr);
      toggleRow(currenttr);
    }
    if (window.event.shiftKey) {
      selectRowsBetweenIndexes([currentSelectedRow.rowIndex, currenttr.rowIndex])
    }
  }
}

function toggleRow(row) {
  console.log(row.classList)
    row.className = (row == currentSelectedRow && row.className == "selected") ? '' : 'selected';
    currentSelectedRow = row;
}

function selectRowsBetweenIndexes(indexes) {
  if (window.getSelection) {window.getSelection().removeAllRanges();}
  else if (document.selection) {document.selection.empty();}
  indexes.sort(function(a, b) {
    return a - b;
  });
  for (var i = (indexes[0]); i <= indexes[1]; i++) {
    dataRows[i].className = 'selected';
  }
}

function clearAllSelectedRows(except) {
  for (var i = 0; i < dataRows.length; i++) {
    except != dataRows[i] ? dataRows[i].className = '' : null;
  }
}

function deleteSelectRows(rows) {
  if (rows.length < 1) return
  var ids = []
  for (var i = 0; i < rows.length; i++ ) {
    var row = rows[i]
    ids.push(Number(row.querySelector('[data-column="id"]').innerHTML))
  }
  let pageURL = window.location.href;
  let db = pageURL.substr(pageURL.lastIndexOf('/') + 1);
  url = "/mysql/"+db+"/table/"+currentTable.innerHTML+"/delete_records"
  $.ajax({
    type: "POST",
    url: url,
    data: {ids: ids},
    success: function(){
      deleteRows(rows)
    },
    dataType: "JSON"
  });
}

function deleteRows(rows) {
  for ( var i = 0; i < rows.length; i++) {
    rows[i].parentNode.removeChild(rows[i])
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
  $('#custom-query-modal').fadeOut(200)
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

function showCustomQuery() {
  $('#query-type').empty()
  $('#modal-bg').fadeIn(200)
  $('#custom-query-modal').fadeIn(200)
  for(let i=0;i<currentColumns.length;i++){
    $('#query-type').append($("<option value='"+currentColumns[i]+"'>"+currentColumns[i]+"</option>"))
  }
}

function customQueryTypeChanged(option) {
  if(option == "raw")
    $('#query-comparator').hide()
  else
    $('#query-comparator').show()
}

function sendCustomQuery() {
  let query = ""
  let type = $("#query-type").val()
  let comparator = $("#query-comparator").val()
  query = "SELECT * FROM "+currentTable.innerHTML+" WHERE "
  query = query + type+" "+comparator+" '"+$('#query-input').val()+"'"
  getDataForTable(currentTable, false, query)
  closeModal()
}