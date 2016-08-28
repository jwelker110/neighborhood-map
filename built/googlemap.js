"use strict";
/**
 * Class that creates a Google Map in the element associated with
 * the provided ID.
 *
 * lambdas are used to preserve the lexical 'this' in the class
 * functions.
 */
var GoogleMap = (function () {
    /**
     * Constructor for map object.
     * @param coords - coordinates to center map on
     * @param id - id string of the element that will hold the map
     * @param zoom - "height" above the map
     */
    function GoogleMap(coords, id, zoom) {
        var _this = this;
        if (id === void 0) { id = 'map'; }
        if (zoom === void 0) { zoom = 15; }
        this.markers = [];
        this.locations = [];
        /**
         * Set the callback when a map marker has been selected
         * @param fn - the callback
         */
        this.setMarkerClickedCallback = function (fn) {
            _this.markerClickedCallback = fn;
        };
        /**
         * Creates the map markers for each location, and centers the map after
         * @param locations - the array of venues to be marked
         * @param center - the center of the map containing lat and lng properties
         */
        this.setLocations = function (locations, center) {
            _this.removeAllMarkers();
            _this.deleteAllMarkers();
            if (locations.length < 1) {
                return;
            }
            for (var i = 0, l = locations.length; i < l; i++) {
                var loc = locations[i];
                // create the location on the map
                loc.marker = _this.createMarker(loc.venue.location.lat, loc.venue.location.lng);
            }
            // pan to lat/lng center of all markers
            _this.gMap.panTo(center);
            // display the markers on the map
            _this.addMarkersRecursively(locations, locations.length - 1);
            _this.locations = locations;
        };
        /**
         * Hides the marker by setting it's map property to null
         * @param marker - the marker to remove from the map
         */
        this.hideMarker = function (marker) {
            marker.setMap(null);
        };
        /**
         * Shows the marker on the map by setting the map property
         * @param marker - the marker to add to the map
         */
        this.showMarker = function (marker) {
            marker.setMap(_this.gMap);
        };
        /**
         * Recurse so they pop in one at a time
         * @param locations - array of locations to create markers for
         * @param index - the current index
         */
        this.addMarkersRecursively = function (locations, index) {
            if (index < 0) {
                return;
            }
            // so they don't all pop in at once!
            setTimeout(function () {
                _this.addMarker(locations[index]);
                _this.addMarkersRecursively(locations, index - 1);
            }, 50);
        };
        /**
         * Removes all the markers from the map
         */
        this.removeAllMarkers = function () {
            for (var i = 0; i < _this.markers.length; i++) {
                _this.hideMarker(_this.markers[i]);
            }
        };
        /**
         * Removes the reference to the markers currently stored
         */
        this.deleteAllMarkers = function () {
            _this.markers = [];
        };
        /**
         * Creates the Google Street View Panorama
         * @param lat - the latitude of the streetview location
         * @param lng - the longitude of the streetview location
         * @param id - the string representation of the HTML element that should contain the street view
         * @param heading - the initial direction of the street view
         * @param pitch - the initial tilt of the street view
         * @returns {google.maps.StreetViewPanorama}
         */
        this.createStreetView = function (lat, lng, id, heading, pitch) {
            if (heading === void 0) { heading = 35; }
            if (pitch === void 0) { pitch = 0; }
            return new google.maps.StreetViewPanorama(document.getElementById(id), {
                position: new Coords(lat, lng),
                pov: {
                    heading: heading,
                    pitch: pitch
                },
                disableDefaultUI: true
            });
        };
        /**
         * Generates html representation of place
         * @param item - the place we want to represent
         * @returns {string} - string containing html formatting
         */
        this.getLocationContent = function (item) {
            // get ready to make the link to it's FS page
            var itemUrlStart = '';
            var itemUrlEnd = '';
            var itemUrl = '';
            var itemTips = item.tips && item.tips.length > 0 ? item.tips[0] : {};
            /**
             * get the venue FS page url
             * <div class="info-see-more">See more on <a target="_blank" href="fsUrlHere">Foursquare</a></div>
             */
            if (itemTips.canonicalUrl) {
                itemUrlStart = '<div class="info-see-more">See more on <a target="_blank" href="' + itemTips.canonicalUrl + '">';
                itemUrlEnd = '</a></div>';
                itemUrl = itemUrlStart + 'Foursquare' + itemUrlEnd;
            }
            /**
             * get venue name
             * <h4 class="info-title">VenueName</h4>
             */
            var name = '<h4 class="info-title">' + item.venue.name + '</h4>';
            /**
             * get venue rating
             * <div class="info-rating-container>
             *   <div class="info-rating">
             *     <span style="color: #ratingColor">rating/10</span> with # votes
             *   </div>
             * </div>
             */
            var ratingContainer = '';
            if (item.venue.rating) {
                // let rating = '<div class="info-rating">Rated ' + item.venue.rating + '</div>';
                var ratingCount = '<div class="info-rating"><span style="color: #' + item.venue.ratingColor + '">' +
                    item.venue.rating + '/10</span>' +
                    ' with ' + item.venue.ratingSignals + ' votes' +
                    '</div>';
                ratingContainer = '<div class="info-rating-container">' + ratingCount + '</div>';
            }
            /**
             * get first venue review
             * <div class="info-review"><em>review</em> - username</div>
             */
            var review = 'No reviews available for this venue';
            if (itemTips.text) {
                review = '<div class="info-review"><em>"' + itemTips.text + '"</em> - ' + itemTips.user.firstName + '</div>';
            }
            /**
             * set up streetview container
             */
            var streetViewContainer = '<div id="streetview"></div>';
            return ('<div class="info">' +
                name +
                streetViewContainer +
                review +
                ratingContainer +
                itemUrl +
                '</div>');
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
         * @param lat - latitude
         * @param lng - longitude
         * @returns {google.maps.Marker}
         */
        this.createMarker = function (lat, lng) {
            var placeLoc = new Coords(lat, lng);
            return new google.maps.Marker({
                map: null,
                position: placeLoc
            });
        };
        /**
         * Adds the provided marker to the map and sets the appropriate
         * listeners on the marker
         * @param place - the place to add
         */
        this.addMarker = function (place) {
            _this.markers.push(place.marker);
            place.marker.setMap(_this.gMap);
            google.maps.event.addListener(place.marker, 'click', function () {
                if (_this.markerClickedCallback) {
                    _this.markerClickedCallback();
                }
                _this.animateMarker(place.marker, 2000);
                _this.infoWindow.setContent(_this.getLocationContent(place));
                _this.infoWindow.open(_this.gMap, place.marker);
                _this.gMap.setStreetView(_this.createStreetView(place.marker.position.lat(), place.marker.position.lng(), 'streetview'));
                _this.gMap.panTo(place.marker.getPosition());
                // adjust the marker info window down a bit to allow greater visibility
                _this.gMap.panBy(0, -200);
            });
        };
        /**
         * Removes the provided marker from the map
         * @param marker - marker to remove
         */
        this.removeMarker = function (marker) {
            marker.setMap(null);
            google.maps.event.clearListeners(marker, 'click');
        };
        /**
         * Trigger the click event associated with the marker
         * @param marker - the marker to trigger
         */
        this.triggerMarker = function (marker) {
            google.maps.event.trigger(marker, 'click');
        };
        /**
         * Animates the given marker for 1.5 seconds
         * @param marker - the marker
         * @param animateTime {number} - how long to animate marker
         */
        this.animateMarker = function (marker, animateTime) {
            if (animateTime === void 0) { animateTime = 1500; }
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () {
                marker.setAnimation(null);
            }, animateTime);
        };
        this.gMap = new google.maps.Map(document.getElementById(id), {
            center: coords,
            zoom: zoom,
            mapTypeControl: false,
            streetViewControl: false
        });
        this.infoWindow = new google.maps.InfoWindow();
        this.service = new google.maps.places.PlacesService(this.gMap);
    }
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
//# sourceMappingURL=googlemap.js.map