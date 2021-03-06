((L) => {
  var map;

  function itemColor(status) {
    var s = ['#d7191c','#fdae61','#ffffbf','#abd9e9','#2c7bb6'];
    var colors = {
      "Fully Open": s[4],
      "Partly Open": s[3],
      "Popped-up elsewhere": s[2],
      "Planned re-opening": s[1],
      "Closed": s[0],
      "": '#aaa'
    };
    return colors[status];
  };
  
  var sortHoriz = function(a, b) {
    return a.geometry.coordinates[0] - b.geometry.coordinates[0];
  };
  var sortVert = function(a, b) {
    return b.geometry.coordinates[1] - a.geometry.coordinates[1];
  };
  var sortStatus = function(a, b) {
    var ordering = {
      "Fully Open": 1,
      "Partly Open": 2,
      "Popped-up elsewhere": 3,
      "Planned re-opening": 4,
      "Closed": 5,
      "": 6
    };
    return ordering[a.properties.status] < ordering[b.properties.status];
  };
  
  function addGeojson(data) {
    data.features = data.features.sort(sortStatus);
    var geojsonMarkerOptions = {
      radius: 8,
      color: "#2aa",
      weight: 1,
      fillOpacity: 0.8,
      riseOnHover: true
    };
    var popup = function(p) {
      var md = window.markdownit();
      return `<ul class='popup'><li>${p.comments}</li><li class='address'>${p.name}</li></ul>`;
    };
  
    var options = {
      name: 'Premises',
      style: (feature) => ({
        // color: itemColor(feature.properties.status)
      }),
      onEachFeature: (feature, layer) => {
        layer.bindPopup(popup(feature.properties));
        layer.on('mouseover', function(e) { this.openPopup(); });
        // layer.on('mouseout', function(e) { this.closePopup(); });
      },
      pointToLayer: (feature, latlng) => L.circleMarker(latlng, geojsonMarkerOptions)
    };
  
    var gj = L.geoJson(data, options);
    gj.addTo(map);
  }
  
  function legend() {
    var legend = L.control({position: 'bottomleft'});
  
    legend.onAdd = function (map) {
      var div = L.DomUtil.create('div', 'info legend');
      var ul = L.DomUtil.create('ul', 'legend-items');
  
      div.innerHTML = '<h1>Legend:</h1>';
  
      ['Fully Open', 'Partly Open', 'Popped-up elsewhere', 'Planned re-opening', 'Closed'].forEach(function(x) {
        ul.innerHTML += '<li><svg class="' + x + '" height="20" width="20" viewbox="0 0 100 100"><circle cx="50" cy="50" r="30" fill="' + itemColor(x)  + '"></circle></svg>' + x + '</li>';
      });
  
      div.appendChild(ul);
      return div;
    };
    return legend;
  };
  
  function init(home, initial_zoom) {
    map = new L.Map('map');

    findMe = function(e) {
        map.locate( {watch: true, maxZoom: 50} );
    };
    onLocationFound = function(e) {
        var radius = e.accuracy / 2;
        pos_marker.setLatLng( e.latlng );
        if (! map.hasLayer( pos_marker )) map.addLayer( pos_marker );
        acc_marker.setLatLng( e.latlng );
        acc_marker.setRadius( radius );
        if (! map.hasLayer( acc_marker )) map.addLayer( acc_marker );
        map.panTo( e.latlng );
    };
    onLocationError = function(e) {
        // alert(e.message);
    };
    onMapClick = function(e) {
        map.stopLocate();
        if (map.hasLayer( pos_marker )) map.removeLayer( pos_marker );
        if (map.hasLayer( acc_marker )) map.removeLayer( acc_marker );
    };
    resetPosition = function() {
        if ( typeof current_shop_location !== 'undefined' && current_shop_location !== null ) {
            pos_marker.setLatLng( current_shop_location );
            if (! map.hasLayer( pos_marker )) map.addLayer( pos_marker );
            if (map.hasLayer( acc_marker )) map.removeLayer( acc_marker );
            map.panTo( current_shop_location );
            setPosition( current_shop_location );
        }
    };
    goHome = function() {
        map.setView(home, initial_zoom);
    };
    goHome();

    var watercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: 'abcd',
      minZoom: 1,
      maxZoom: 18,
      ext: 'jpg'
    });
    var cartoPositron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    });
    var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    var control = new L.control.layers({
      "CartoDB Positron": cartoPositron,
      "Stamen Watercolor": watercolor,
      "Open Street Map": osm
    }, {}, {autoZIndex: false, collapsed: true});

    map.addLayer(cartoPositron);
    control.addTo(map);
    // legend().addTo(map);

    var pos_marker = new L.Marker( home );
    var acc_marker = new L.Circle( home, 10 );

    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);
    map.on('click', onMapClick );

    resetPosition();

    function shopPopup(feature, layer) {
      // does this feature have a property named popupContent?
      if (feature.properties && feature.properties.popupContent) {
          layer.bindPopup(feature.properties.popupContent);
      }
  }
  };

  const Map = {
    init,
    addGeojson,
  };
  window.Map = Map;
})(L);
