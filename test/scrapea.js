var assert = require('assert');
var scrapea = require('../scrapea');

describe('#getStationData()', function() {
  it('retrieve valid data', function() {
    return scrapea.getStationData(8097)
      .then(function(result) {
        assert.equal(result.rloi_id, 8097);
        assert.equal(result.wiski_river_name, 'River Calder');
      });
  });
  it('throw an error with invalid data', function() {
    return scrapea.getStationData(1000)
      then(function(result) {
        console.log(result);
      });
  });
});
