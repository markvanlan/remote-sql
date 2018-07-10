let getDataForTable = function(table) {
  $('#data').empty()
 var pageURL = window.location.href;
  var db = pageURL.substr(pageURL.lastIndexOf('/') + 1);
  url = "/mysql/"+db+"/table/"+table
  $.get(url, function(data){
    createTableFromData(data[0], data[1])
  })
}

function createTableFromData(details, data) {
  $('#data').append(createHeaderRow(details))
  $('#data').append(createDataRows(data))
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
      html = html + "<td><div class='data-row'>" + data[i][key] + "</div></td>"
    }
    for(let y=0;y<data[i].length;y++){
      
    }
    html = html + "</tr>"
  }
  return(html)
}