var map;

var itemColor = function(status) {
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

var fixCoordinates = function(c) {
  return c.split(',').map(parseFloat).reverse();
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

var addDataToMap = function(data) {
  var shops = geoJsonise(inflate(JSON.parse(data)));
  shops.features = shops.features.sort(sortStatus);

  var geojsonMarkerOptions = {
    radius: 8,
    color: "#aaa",
    weight: 1,
    fillOpacity: 0.8,
    riseOnHover: true
  };
  var popup = function(p) {
    var md = window.markdownit();
    var img = p.image?"<img src='" + p.image + "'></img>":"";
    return "<div class='popup'>" +
      p.name + "<br>" +
      "<div class='address'>" + p.street_number + " " + p.street_name + "<div>" + img +
      "<div class='comments'>" + md.render(p.comments) + "</div>" +
      "</div>";
  };

  var options = { name: 'Premises',
                  style: function (feature) {
                    return {
                      color: itemColor(feature.properties.status)
                    };
                  },
                  onEachFeature: function (feature, layer) {
                    layer.bindPopup(popup(feature.properties));
                    layer.on('mouseover', function(e) { this.openPopup(); });
                    // layer.on('mouseout', function(e) { this.closePopup(); });
                  },
                  pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                  }
                };

  var gj = L.geoJson(shops, options);
  gj.addTo(map);
};

var legend = function() {
  var legend = L.control({position: 'bottomleft'});

  legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    var ul = L.DomUtil.create('ul', 'legend-items');

    div.innerHTML = '<h1>Legend:</h1>';

    ['Fully Open', 'Partly Open', 'Popped-up elsewhere', 'Planned re-opening', 'Closed'].forEach(function(x) {
      ul.innerHTML += '<li><svg height="20" width="20" viewbox="0 0 100 100"><circle cx="50" cy="50" r="30" fill="' + itemColor(x)  + '"></circle></svg>' + x + '</li>';
    });

    div.appendChild(ul);
    return div;
  };
  return legend;
};

var init_map = function(home, initial_zoom) {
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

    var watercolor = new L.StamenTileLayer("watercolor");
    var toner = new L.StamenTileLayer("toner");
    var osm = new L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    });
    var control = new L.control.layers({"Stamen Watercolor": watercolor, "Stamen Toner": toner, "Open Street Map": osm}, {}, {autoZIndex: false, collapsed: true});

    map.addLayer(watercolor);
    control.addTo(map);
    legend().addTo(map);

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
