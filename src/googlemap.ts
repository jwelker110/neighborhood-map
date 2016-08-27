"use strict";

/**
 * Class that creates a Google Map in the element associated with
 * the provided ID.
 *
 * lambdas are used to preserve the lexical 'this' in the class
 * functions.
 */
class GoogleMap {

    gMap: any;
    infoWindow: any;
    service: any;

    markers: any[] = [];
    locations: any[] = [];

    largestLat: number;
    largestLng: number;

    smallestLat: number;
    smallestLng: number;

    markerClickedCallback: any;

    /**
     * Constructor for map object.
     * @param coords - coordinates to center map on
     * @param id - id string of the element that will hold the map
     * @param zoom - "height" above the map
     */
    constructor(coords: Coords, id: string = 'map', zoom: number = 15){
        this.gMap = new google.maps.Map(document.getElementById(id), {
            center: coords,
            zoom: zoom,
            mapTypeControl: false,
            streetViewControl: false
        });
        this.infoWindow = new google.maps.InfoWindow();
        this.service = new google.maps.places.PlacesService(this.gMap);

    }

    setMarkerClickedCallback = (fn: any) => {
        this.markerClickedCallback = fn;
    };

    /**
     *
     */
    setLocations = (locations: any[]) => {
        this.removeAllMarkers();
        this.deleteAllMarkers();
        if(locations.length < 1) { return; }

        // set the initial lat/lng coords
        this.largestLat = this.smallestLat = locations[0].location.lat;
        this.largestLng = this.smallestLng = locations[0].location.lng;

        for(let i = 0, l=locations.length; i < l; i++) {
            let loc = locations[i];
            // calculate lat/lng coords
            if(loc.location.lat > this.largestLat) {this.largestLat = loc.location.lat;}
            if(loc.location.lat < this.smallestLat) {this.smallestLat = loc.location.lat;}
            if(loc.location.lng > this.largestLng) {this.largestLng = loc.location.lng;}
            if(loc.location.lng < this.smallestLng) {this.smallestLng = loc.location.lng;}

            // create the location on the map
            loc.marker = this.createMarker(loc.location.lat, loc.location.lng);
        }
        // pan to lat/lng center of all markers
        this.gMap.panTo({
            lat: this.smallestLat + ((this.largestLat - this.smallestLat) / 2),
            lng: this.smallestLng + ((this.largestLng - this.smallestLng) / 2)
        });
        // display the markers on the map
        this.addMarkersRecursively(locations, locations.length - 1);
        this.locations = locations;
    };

    hideMarker = (marker: any) => {
        marker.setMap(null);
    };

    showMarker = (marker: any) => {
        marker.setMap(this.gMap);
    };

    /**
     * Recurse so they pop in one at a time
     * @param locations - array of locations to create markers for
     * @param index - the current index
     */
    addMarkersRecursively = (locations: any[], index: number) => {
        if(index < 0) {
            return;
        }
        setTimeout(() => {
            this.addMarker(locations[index]);
            this.addMarkersRecursively(locations, index - 1);
        }, 50);
    };

    removeAllMarkers = () => {
        for(let i = 0; i < this.markers.length; i++) {
            this.markers[i].setMap(null);
        }
    };

    deleteAllMarkers = () => {
        this.markers = [];
    };

    createStreetView = (lat: number, lng: number, id: string, heading: number = 35, pitch: number = 0) => {
        return new google.maps.StreetViewPanorama(
            document.getElementById(id), {
                position: new Coords(lat, lng),
                pov: {
                    heading: heading,
                    pitch: pitch
                }
            }
        );
    };

    /**
     * Generates html representation of place
     * @param place - the place we want to represent
     * @returns {string} - string containing html formatting
     */
    getLocationContent = (place: any) => {
        let title = '<h4 class="info-title">' + place.name + '</h4>';
        let streetViewContainer = '<div id="' + 'streetview' + '"></div>';
        let url = place.url ? '<a class="info-website" href="' + place.url + '">On the Web</a>' : '';

        let checkinsCount = place.stats ? place.stats.checkinsCount ? place.stats.checkinsCount : 'Unknown' : 'Unavailable';
        let checkins = '<div class="info-checkins">Check-ins: <strong>' + checkinsCount + '</strong></div>';

        let hereNowSummary = place.hereNow ? place.hereNow.summary ? place.hereNow.summary : 'Unknown visitors' : 'Visitors unavailable';
        let hereNow = '<div class="info-checkins">' + hereNowSummary + ' right now.</div>';

        return (
            '<div class="info">' +
                title +
                checkins +
                hereNow +
                streetViewContainer +
            '</div>'
        );
    };

    /**
     * Getter for locations
     * @returns {any[]}
     */
    getNearbyLocations = () : any[] => {
        return this.locations;
    };

    /**
     * Creates a map marker for the provided place
     * @param lat - latitude
     * @param lng - longitude
     * @returns {google.maps.Marker}
     */
    createMarker = (lat: number, lng: number): any => {
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
    addMarker = (place: any) => {
        this.markers.push(place.marker);
        place.marker.setMap(this.gMap);
        google.maps.event.addListener(place.marker, 'click', () => {
            if(this.markerClickedCallback) { this.markerClickedCallback(); }
            this.animateMarker(place.marker, 2000);
            this.infoWindow.setContent(this.getLocationContent(place));
            this.infoWindow.open(this.gMap, place.marker);
            this.gMap.setStreetView(
                this.createStreetView(
                    place.marker.position.lat(),
                    place.marker.position.lng(),
                    'streetview'
                )
            );
            this.gMap.panTo(place.marker.getPosition());
            this.gMap.panBy(0, -200);
        });
    };

    /**
     * Removes the provided marker from the map
     * @param marker {Object} - marker to remove
     */
    removeMarker = (marker: any) => {
        marker.setMap(null);
        google.maps.event.clearListeners(marker, 'click');
    };

    /**
     * Trigger the click event associated with the marker
     * @param marker - the marker to trigger
     */
    triggerMarker = (marker: any) => {
        google.maps.event.trigger(marker, 'click');
    };

    /**
     * Animates the given marker for 1.5 seconds
     * @param marker {Object} - the marker
     * @param animateTime {number} - how long to animate marker
     */
    animateMarker = (marker: any, animateTime: number = 1500) => {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function () {
            marker.setAnimation(null);
        }, animateTime);
    };

}

/**
 * Coords class used to contain latitude (lat) and
 * longitude (lng) coordinates.
 */
class Coords {
    lat: number;
    lng: number;

    constructor(lat: number, lng: number) {
        this.lat = lat;
        this.lng = lng;
    }
}
