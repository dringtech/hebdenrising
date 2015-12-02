var scrapea = require('./scrapea');
var q = require('q');

exports.handler = function(event, context) {
  console.log(JSON.stringify(event, null, 2));

  // console.log('value1 =', event.key1);
  // console.log('value2 =', event.key2);
  // console.log('value3 =', event.key3);
  q.all(
    ['8205', '8343', '8097', '8048', 8152].map(scrapea.getStationData)
  )
  .then(function(results) {
    context.succeed(results);  // Echo back the first key value
  })
  .fail(function(error) {
    context.fail(error);
  });
};
