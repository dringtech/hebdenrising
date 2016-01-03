var map;

var getShopData = function(theMap) {
  var apiKey = "AIzaSyASHll1g8NRvfB-K9Yce_9PTCvzdaDF-wQ";
  var tableId = "1OBwaUJgccpuXMel1Srp_4lVhVFKIAIjSR0QwLvgs";
  var sqlQuery = "SELECT * FROM " + tableId;
  var urlQuery = "https://www.googleapis.com/fusiontables/v2/query?sql="+encodeURIComponent(sqlQuery)+"&key="+apiKey;
  console.log(urlQuery);
  /*
   POST https://www.googleapis.com/fusiontables/v2/query?sql=SELECT+*+from+&key={YOUR_API_KEY}
  */
  var shopReq = new XMLHttpRequest();
  shopReq.open("POST",urlQuery,true);
  shopReq.onreadystatechange = function() {
    if (shopReq.readyState !== XMLHttpRequest.DONE) { return; }
    if (shopReq.status !== 200) { return; }
    console.log(shopReq.responseText);
  };
  shopReq.send();
};

var init_map = function() {
    map = new L.Map('map');
    // var hebden = new L.LatLng( 53.742, -2.014 ); // Geographical point
    var hebden = [53.742, -2.014]; // Somewhere in the centre of Hebden Bridges

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
        map.setView(hebden, 17);
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

    var pos_marker = new L.Marker( hebden );
    var acc_marker = new L.Circle( hebden, 10 );

    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);
    map.on('click', onMapClick );

    resetPosition();

    // var geoJsonShops = new XMLHttpRequest();
    // geoJsonShops.open("GET","/api/shop/geojson/",false);
    // geoJsonShops.send();
    getShopData(map);

    var geojsonMarkerOptions = {
        radius: 8,
        // fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

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

window.onload = init_map;
