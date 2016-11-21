var dataFactory = function dataFactory(base, suffix) {
  return function getData(id) {
    return Q.Promise(function (resolve, reject, notify) {
      var request = xhr();

      request.open('GET', base + id + suffix, true);

      request.onload = function onload() {
        if (request.status === 200) {
          resolve(JSON.parse(request.responseText));
        } else {
          reject(new Error('Status code was ' + request.status));
        }
      };

      request.onerror = function onerror() {
        reject(new Error("Can't XHR " + JSON.stringify(url)));
      };

      request.onprogress = function onprogress(event) {
        notify(event.loaded / event.total);
      };

      request.send();
    });
  };
};

var getStationData = function getStationData(id) {

  var getReadings = dataFactory(
    'http://environment.data.gov.uk/flood-monitoring/id/stations/',
    '/readings?_sorted&parameter=level'
  );

  var getStationInfo = dataFactory(
    'http://environment.data.gov.uk/flood-monitoring/id/stations/',
    ''
  );

  return Q.all([getStationInfo(id), getReadings(id)])
    .spread(function (info, readings) {
      return {
        info: info.items,
        data: readings.items,
      };
    });
};
