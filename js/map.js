var map;

var itemColor = function(status) {
  var colors = {
    "Fully Open": 'green',
    "Partly Open": 'yellow',
    "Planned re-opening": 'orange',
    "Popped-up somewhere else": 'blue',
    "Closed": 'red'
  };
  return colors[status];
};

var fixCoordinates = function(c) {
  return c.split(',').map(Number).reverse();
};

var geoJsonise = function(input) {
  var output = {
    "type":"featureCollection", "features": []
  };

  output.features = input
    .filter(function(x) {return x.location;})
    .map(function(row) {
      var g = {type: "Point", coordinates: fixCoordinates(row.location)};
      var f = {
        "type": "Feature",
        "geometry": g,
        "properties": row
      };
      return f;
    });
  return output;
};

var addDataToMap = function(data) {
  var shops = geoJsonise(inflate(JSON.parse(data)));
  var geojsonMarkerOptions = {
    radius: 8,
    color: "#000",
    weight: 1,
    opacity: 0.7,
    fillOpacity: 0.6
  };
  var popup = function(p) {
    // "name":"Mooch","street_number":"24","street_name":"Market Street","postcode":"HX7 6AA","location":"53.7414348,-2.0164285","date":"2016-01-03","status":"Closed","comments":"","image":"https://www.gstatic.com/images/branding/googlelogo/2x/googlelogo_color_284x96dp.png","type":""

    return "<div class='popup'>" +
      p.name + "<br>" +
      p.street_number + " " + p.street_name +
      "</div>";
  };

  var options = { name: 'Premises',
                  style: function (feature) {
                    return {
                      color: itemColor(feature.properties.status),
                      radius: 10,
                      stroke: 1
                    };
                  },
                  onEachFeature: function (feature, layer) {
                    layer.bindPopup(popup(feature.properties));
                  },
                  pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                  }
                };

  var gj = L.geoJson(shops, options);
  gj.addTo(map);
}

var init_map = function(home) {
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
        map.setView(home, 17);
    };
    goHome();

    var stamenLayerName = 'watercolor'; // 'watercolor'; // 'toner';
    var stamenLayer = new L.StamenTileLayer(stamenLayerName, {opacity: 0.5});
    map.addLayer( stamenLayer );

    // var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    // var osmAttrib='Map data Â© OpenStreetMap contributors';
    // var osm = new L.TileLayer(osmUrl, {minZoom: 8, maxZoom: 12, attribution: osmAttrib});
    // map.addLayer( osm );

    // var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    // var osmAttrib='Map data Â© openstreetmap contributors';
    // var osmLayer = new L.TileLayer(osmUrl,{minZoom:8,maxZoom:50,attribution:osmAttrib});
    // map.addLayer( osmLayer );

    // var cloudmadeLayer = new L.TileLayer(
    //   'http://{s}.tile.cloudmade.com/{api_key}/{styleId}/256/{z}/{x}/{y}.png',
    //   { attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery Â© <a href="http://cloudmade.com">CloudMade</a>', maxZoom: 20, },
    //   { api_key: '22002ecc8b934091a4f9d2b7d4410e5b', styleId: 22677 }
    // );
    // map.addLayer( cloudmadeLayer );

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

    // var baseLayers = {
    // //     "Stamen": stamenLayer,
    // //     "OpenStreetMap": osmLayer
    // };

    // var overlays = {
    //     "Shops": shopLayer
    // };

    // L.control.layers(baseLayers, overlays).addTo(map);
};
