var scrapea = require('./scrapea');
var q = require('q');
var fs = require('fs');

q.all(
  ['8205', '8343', '8097', '8048', 8152].map(scrapea.getStationData)
).then(function(results) {
  fs.writeFile('station.json', JSON.stringify(results), function (err) {
    if (err) throw err;
    console.log('It\'s saved!');
  });
});
