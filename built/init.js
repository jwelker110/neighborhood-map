/**
 * function req'd by Google Maps to begin the initialization process
 * of the map
 */
var map;
function initMap() {
    map = new GoogleMap(new Coords(30.4583, -91.1403));
}
/**
 * Class that creates a Google Map in the element associated with
 * the provided ID.
 *
 * lambdas are used to preserve the lexical 'this' in the class
 * functions.
 */
var GoogleMap = (function () {
    function GoogleMap(coords, radius, searchType, id, zoom) {
        var _this = this;
        if (radius === void 0) { radius = 800; }
        if (searchType === void 0) { searchType = ['restaurant']; }
        if (id === void 0) { id = 'map'; }
        if (zoom === void 0) { zoom = 15; }
        this.markers = [];
        this.locations = [];
        /**
         * this will perform a search for nearby places
         * @param location - set of coordinates to search near
         * @param fn
         */
        this.search = function (location, fn) {
            if (location === void 0) { location = _this.coords; }
            _this.searchCallback = fn;
            _this.service.nearbySearch({
                location: location,
                radius: _this.radius,
                type: _this.searchType
            }, _this.setNearbyLocations);
        };
        /**
         * Should clear any markers from the map, and then set
         * the locations on the map instance
         */
        this.setNearbyLocations = function (results, status) {
            if (status != google.maps.places.PlacesServiceStatus.OK) {
                return [];
            }
            // remove the existing markers from the map
            for (var i = 0, l = _this.markers.length; i < l; i++) {
                _this.removeMarker(_this.markers[i]);
            }
            var _loop_1 = function(i, l) {
                results[i].marker = _this.createMarker(results[i]);
                // we need to go ahead and get info for each marker right meow
                // why wait?
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (xhr.readyState !== XMLHttpRequest.DONE) {
                        return;
                    }
                    // kk got the response let's set up our info
                    var resp;
                    try {
                        resp = JSON.parse(xhr.responseText)[0];
                        if (!resp) {
                            throw new Error('Returned response was undefined. (Should be ok though)');
                        }
                    }
                    catch (e) {
                        console.error(e);
                        resp = {
                            tel: 'Unlisted',
                            website: 'https://google.com/search?q=' + results[i].name.replace(' ', '+'),
                            category_labels: [['Unknown']]
                        };
                    }
                    results[i].tel = resp.tel;
                    results[i].website = resp.website ? resp.website : 'https://google.com/search?q=' + results[i].name.replace(' ', '+').replace('%20', '+');
                    results[i].cat_labels = resp.category_labels;
                    var content = _this.generateLocationContent(results[i]);
                    _this.addMarker(results[i].marker, content);
                };
                xhr.open('GET', encodeURI('http://localhost:8081/api/factual?name=' + results[i].name +
                    '&lat=' + results[i].geometry.location.lat()) +
                    '&lng=' + results[i].geometry.location.lng(), true);
                xhr.send();
            };
            for (var i = 0, l = results.length; i < l; i++) {
                _loop_1(i, l);
            }
            _this.locations = results;
            if (_this.searchCallback) {
                _this.searchCallback(results);
            }
        };
        /**
         * Getter for locations
         * @returns {any[]}
         */
        this.getNearbyLocations = function () {
            return _this.locations;
        };
        /**
         * Creates a map marker for the provided place
         * @param place - place to associate with marker
         * @returns {google.maps.Marker}
         */
        this.createMarker = function (place) {
            var placeLoc = new Coords(place.geometry.location.lat(), place.geometry.location.lng());
            return new google.maps.Marker({
                map: null,
                position: placeLoc
            });
        };
        /**
         * Adds the provided marker to the map and sets the appropriate
         * listeners on the marker
         * @param marker - the marker to add
         * @param markerInfo - the string to display in the marker info window
         */
        this.addMarker = function (marker, markerInfo) {
            marker.setMap(_this.gMap);
            google.maps.event.addListener(marker, 'click', function () {
                _this.gMap.panTo(marker.position);
                _this.animateMarker(marker);
                _this.infoWindow.setContent(markerInfo);
                _this.infoWindow.open(_this.gMap, marker);
            });
        };
        /**
         * Removes the provided marker from the map
         * @param marker {Object} - marker to remove
         */
        this.removeMarker = function (marker) {
            marker.setMap(null);
            google.maps.event.clearListeners(marker, 'click');
        };
        this.triggerMarker = function (marker) {
            google.maps.event.trigger(marker, 'click');
        };
        /**
         * Animates the given marker for 1.5 seconds
         * @param marker {Object} - the marker
         * @param animateTime {number} - how long to animate marker
         */
        this.animateMarker = function (marker, animateTime) {
            if (animateTime === void 0) { animateTime = 1500; }
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () {
                marker.setAnimation(null);
            }, animateTime);
        };
        this.filterLocations = function (filter) {
            return _this.locations.filter(function (location) {
                var match = location.name.toLowerCase().indexOf(filter.toLowerCase()) > -1;
                if (!match) {
                    _this.removeMarker(location.marker);
                }
                else if (!location.marker.map) {
                    _this.addMarker(location.marker, location.name);
                }
                return match;
            });
        };
        this.coords = coords;
        this.radius = radius;
        this.searchType = searchType;
        this.gMap = new google.maps.Map(document.getElementById(id), {
            center: coords,
            zoom: zoom,
            mapTypeControl: false
        });
        this.infoWindow = new google.maps.InfoWindow();
        this.service = new google.maps.places.PlacesService(this.gMap);
    }
    GoogleMap.prototype.generateLocationContent = function (result) {
        var cats = result.cat_labels[0].join(', ');
        return ('<div class="info">' +
            '<h4 class="info-title">' + result.name + '</h4>' +
            '<p class="info-categories"><strong>Categories: </strong>' + cats + '</p>' +
            '<p class="info-tel"><strong>Phone #: </strong>' + result.tel + '</p>' +
            '<a class="info-website" href="' + result.website + '">Website</a>' +
            '</div>');
    };
    return GoogleMap;
}());
/**
 * Coords class used to contain latitude (lat) and
 * longitude (lng) coordinates.
 */
var Coords = (function () {
    function Coords(lat, lng) {
        this.lat = lat;
        this.lng = lng;
    }
    return Coords;
}());
