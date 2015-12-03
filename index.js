var scrapea = require('./scrapea');

exports.handler = function(event, context) {
  console.log('Station ID = ', event.stationId);

  scrapea.getStationData(event.stationId)
  .then(function(results) {
    context.succeed(results);
  })
  .fail(function(error) {
    context.fail(error);
  });
};
