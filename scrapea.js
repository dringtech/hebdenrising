var q = require('q');
var scrape = require('scrape');

var extractData = function($) {
  return $('script').find(':contains("root.chartData")').map(function (script) {
    var raw = script.children[0].data;
    var station = JSON.parse(
      raw.match(/.*?root\.station\s*=\s*(.*?); root\.whereAmI.*/)[1]
    );
    delete station.formatted_value_timestamps;
    delete station.percentile_5_values;
    delete station.errors;
    delete station.por_max_values;
    return(station);
  })[0];
};

var getStationData = function(id) {
  var root = 'https://flood-warning-information.service.gov.uk/station/';
  var deferred = q.defer();
  scrape.request(root + id, function (err, $) {
    if (err) return console.error(err);
    deferred.resolve(extractData($));
  });
  return deferred.promise;
};

module.exports = {
  getStationData: getStationData,
};
