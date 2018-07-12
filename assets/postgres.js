$(function() {
  $.get('/postgres-databases', function(data) {
    for(var i=0;i<data.length;i++){
      $('#databases').append(databaseTemplate(data[i].datname))
    }
  })

  let databaseTemplate = function(name){
    return ("<a href='/postgres/" + name + "''> <li class='database'>" + name + "</li> </a>")
  }

});