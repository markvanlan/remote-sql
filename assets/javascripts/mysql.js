$(function() {
  $.get("/mysql-databases", function(data) {
    for (var i = 0; i < data.length; i++) {
      $("#databases").append(databaseTemplate(data[i]));
    }
  });

  let databaseTemplate = function(name) {
    return (
      "<a href='/mysql/" +
      name +
      "''> <li class='database'>" +
      name +
      "</li> </a>"
    );
  };
});
