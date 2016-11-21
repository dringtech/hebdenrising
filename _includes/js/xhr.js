var xhr = function () {
  if (window.XMLHttpRequest) {
    return new XMLHttpRequest();
  } else {
    // code for IE6, IE5
    return new ActiveXObject('Microsoft.XMLHTTP');
  }
};
