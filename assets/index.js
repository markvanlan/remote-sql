
$( document ).ready(function() {
  $( "#mysql-selector" ).click(function() {
    toggleToMysql()
  });

  $( "#postgres-selector" ).click(function() {
    toggleToPostgres()
  });
});

function toggleToPostgres() {
  $('#postgres').show()
  $('#mysql').hide()
  $('body').css('background','linear-gradient(90deg,#bfd3ff,#5578da)')
}

function toggleToMysql() {
  $('#postgres').hide()
  $('#mysql').show()
  $('body').css('background','linear-gradient(90deg,#ffbfbf,#da5555)')
}