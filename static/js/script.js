"use strict";

var map;
var infoWindow;

// check if geolocation is available, if it is, use it to determine location
// of user
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function(pos){
    var mapTimeoutID = setInterval(function () {
      if (!map) {return;}
      //map.setCenter({lat: pos.coords.latitude, lng: pos.coords.longitude}); // TODO for actual user location use this
      clearInterval(mapTimeoutID);
    }, 100);
  });

} else {
  var m = document.getElementById('map');
  m.innerHTML = 'Geolocation is not supported by this browser';
}

/**
 * Initializes the map and locates nearby points of interest.
 * https://developers.google.com/maps/documentation/javascript/examples/place-search#try-it-yourself
 */
function initMap(){
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 30.488979499999996, lng: -90.86757639999999},
    zoom: 15
  });

  infoWindow = new google.maps.InfoWindow();
  var service = new google.maps.places.PlacesService(map);
  service.nearbySearch({
    location: {lat: 30.4889794999999, lng: -90.86757639999},
    radius: 800,
    type: ['food', 'store', 'poi']
  }, serviceCallback);
}

/**
 * Called once the nearby search has completed
 * @param results {Object} - the results of the search
 * @param status - status of the request
 */
function serviceCallback(results, status){
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    // create the markers
    for(var i = 0, l = results.length; i < l; i++){
      createMarker(results[i]);
    }
  }
}

/**
 * Creates a marker positioned at the given place
 * @param place {Object} - Object containing information pertaining to the place
 */
function createMarker(place) {
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    position: placeLoc
  });

  google.maps.event.addListener(marker, 'click', function(){
    map.panTo(place.geometry.location);
    animateMarker(marker);
    infoWindow.setContent(place.name);
    infoWindow.open(map, this);
  });
}

function animateMarker(marker) {
  marker.setAnimation(google.maps.Animation.BOUNCE);
  setTimeout(function(){
    marker.setAnimation(null);
  }, 1500);
}
