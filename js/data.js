var normalise = function(str) {
  return str.toLowerCase();
};

var inflate = function(rawData) {
  var headers = rawData.columns;
  var rows = rawData.rows;
  var data = [];
  rows.map(function(row) {
    var obj = {};
    row.forEach(function(item, col) {
      obj[normalise(headers[col])] = item;
    });
    data.push(obj);
  });
  return data;
};

var getShopData = function(apiKey, tableId, callback) {
  var sqlQuery = "SELECT Name, Street_number, Street_name, Postcode, Location, Status, Comments, Image FROM " + tableId;
  var urlQuery = "https://www.googleapis.com/fusiontables/v2/query?sql="+encodeURIComponent(sqlQuery)+"&key="+apiKey;

  var shopReq = new XMLHttpRequest();
  shopReq.open("POST",urlQuery,true);
  shopReq.onreadystatechange = function() {
    if (shopReq.readyState !== XMLHttpRequest.DONE) { return; }
    if (shopReq.status !== 200) { return; }
    callback(shopReq.responseText);
  };
  shopReq.send();
};
