/**
 * function req'd by Google Maps to begin the initialization process
 * of the map
 */
var map: any;
function initMap(){
    map = new GoogleMap();
}

/**
 * Class that creates a Google Map in the element associated with
 * the provided ID.
 *
 * lambdas are used to preserve the lexical 'this' in the class
 * functions.
 */
class GoogleMap {
    coords: Coords;

    gMap: any;
    infoWindow: any;
    service: any;
    places: any[];
    radius: number;
    searchType: string[];

    constructor(id: string = 'map'){
        this.coords = new Coords(30.488979499999996, -90.86757639999999);
        this.gMap = new google.maps.Map(document.getElementById(id), {
            center: this.coords,
            zoom: 15
        });
        this.infoWindow = new google.maps.InfoWindow();
        this.service = new google.maps.places.PlacesService(this.gMap);
        this.radius = 800;
        this.searchType = ['food', 'store', 'poi'];
    }

    /**
     * this will perform a search for nearby places
     * @param fn - the callback executed when the places are retrieved; receives results and status of request
     */
    nearbySearch = (fn: any) => {
        this.service.nearbySearch({
            location: this.coords,
            radius: this.radius,
            type: this.searchType
        }, fn);
    };

    /**
     * Creates a marker for the given Place, and then places
     * it on the map and adds an event listener to it.
     */
    addMarker = (place: any) => {
        var placeLoc: Coords = place.geometry.location;
        var marker: any = new google.maps.Marker({
            map: this.gMap,
            position: placeLoc
        });

        google.maps.event.addListener(marker, 'click', () => {
            this.gMap.panTo(placeLoc);
            this.animateMarker(marker);
            this.setInfoWindow(place.name, marker);
            // load up the information for the point of interest
            // TODO and fill with text
            // if not available then display message to user

        });
        return marker;
    };

    removeMarker = (marker: any) => {
        google.maps.event.clearListener(marker, 'click');
    };

    /**
     * Sets the content of the info window for the given marker
     * @param info {string} - the information to display
     * @param marker {Object} - the marker to affect
     */
    setInfoWindow = (info: string, marker: any) => {
        this.infoWindow.setContent(info);
        this.infoWindow.open(this.gMap, marker);
    };

    /**
     * Animates the given marker for 1.5 seconds
     * @param marker {Object} - the marker
     */
    animateMarker = (marker: any) => {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function () {
            marker.setAnimation(null);
        }, 1500);
    }

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
