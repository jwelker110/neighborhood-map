/**
 * function req'd by Google Maps to begin the initialization process
 * of the map
 */
function initMap(){
    var m = new GoogleMap();
}

/**
 * Class that creates a Google Map in the element associated with
 * the provided ID.
 *
 * lambdas are used to preserve the lexical 'this' in the class
 * functions.
 */
export class GoogleMap {
    coords: Coords;

    gMap: any;
    infoWindow: any;
    service: any;

    constructor(id: string = 'map'){
        this.coords = new Coords(30.488979499999996, -90.86757639999999);
        this.gMap = new google.maps.Map(document.getElementById(id), {
            center: this.coords,
            zoom: 15
        });
        this.infoWindow = new google.maps.InfoWindow();
        this.service = new google.maps.places.PlacesService(this.gMap);
        this.service.nearbySearch({
            location: this.coords,
            radius: 800,
            type: ['food', 'store', 'poi']
        }, this.serviceCallback)
    }

    /***
     * If the Google Place Service is available, we start
     * placing markers.
     */
    serviceCallback = (results: any[], status: any) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            // create the markers
            for(var i = 0, l = results.length; i < l; i++){
                this.createMarker(results[i]);
            }
        }
    };

    /**
     * Creates a marker for the given Place, and then places
     * it on the map and adds an event listener to it.
     */
    createMarker = (place: any) => {
        var placeLoc: Coords = place.geometry.location;
        var marker: any = new google.maps.Marker({
            map: this.gMap,
            position: placeLoc
        });

        google.maps.event.addListener(marker, 'click', () => {
            this.gMap.panTo(placeLoc);
            this.animateMarker(marker);
            this.infoWindow.setContent(place.name);
            this.infoWindow.open(this.gMap, marker);
        })
    };

    /**
     * Animates the given marker for 1.5 seconds
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
