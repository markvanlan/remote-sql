
$( document ).ready(function() {
  $( "#mysql-selector" ).click(function() {
    toggleToMysql()
  });

  $( "#postgres-selector" ).click(function() {
    toggleToPostgres()
  });

  if (getUrlParameter('type') === "postgres") {
    toggleToPostgres()
  }

});

function toggleToPostgres() {
  $('#postgres').show()
  $('#mysql').hide()
  document.body.classList.remove("bg-red-gradient")
  document.body.classList.add("bg-blue-gradient")
}

function toggleToMysql() {
  $('#postgres').hide()
  $('#mysql').show()
  document.body.classList.remove("bg-blue-gradient")
  document.body.classList.add("bg-red-gradient")
}

function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};
