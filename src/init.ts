/**
 * function req'd by Google Maps to begin the initialization process
 * of the map
 */
var map: any;
function initMap(){
    map = new GoogleMap(new Coords(30.4583, -91.1403));
}

/**
 * Class that creates a Google Map in the element associated with
 * the provided ID.
 *
 * lambdas are used to preserve the lexical 'this' in the class
 * functions.
 */
class GoogleMap {

    radius: number;
    gMap: any;
    infoWindow: any;
    service: any;

    coords: Coords;

    searchType: string[];
    markers: any[] = [];
    locations: any[] = [];

    searchCallback: any;

    constructor(coords: Coords,
                radius: number = 800,
                searchType: string[] = ['restaurant'],
                id: string = 'map',
                zoom: number = 15){
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

    /**
     * this will perform a search for nearby places
     * @param location - set of coordinates to search near
     */
    search = (location: Coords = this.coords, fn: any) => {
        this.searchCallback = fn;
        this.service.nearbySearch({
            location: location,
            radius: this.radius,
            type: this.searchType
        }, this.setNearbyLocations);
    };

    /**
     * Should clear any markers from the map, and then set
     * the locations on the map instance
     */
    setNearbyLocations = (results: any[], status: number) : any[] => {
        if(status != google.maps.places.PlacesServiceStatus.OK) {return [];}

        // remove the existing markers from the map
        for(let i = 0, l = this.markers.length; i < l; i++) {
            this.removeMarker(this.markers[i]);
        }
        for(let i = 0, l = results.length; i < l; i++) {
            results[i].marker = this.createMarker(results[i]);
            // we need to go ahead and get info for each marker right meow
            // why wait?
            let xhr = new XMLHttpRequest();

            // Query the server, which will query the api on our behalf
            xhr.onreadystatechange = () => {
                if(xhr.readyState !== XMLHttpRequest.DONE) {return;}
                // kk got the response let's set up our info
                var resp: any;

                // we can't parse what isn't there so we need to try
                try {
                    resp = JSON.parse(xhr.responseText)[0];
                    if(!resp) {  // this may be undefined so we have to check
                        throw new Error('Returned response was undefined. (Should be ok though)');
                    }
                }
                catch(e) {
                    console.error(e);  // we can provide basic feedback for the user
                    resp = {
                        tel: 'Unlisted',
                        website: 'https://google.com/search?q=' + results[i].name.replace(' ', '+'),
                        category_labels: [['Unknown']]
                    };
                }

                results[i].tel = resp.tel;
                results[i].website = resp.website ? resp.website : 'https://google.com/search?q=' + results[i].name.replace(' ', '+').replace('%20', '+');
                results[i].cat_labels = resp.category_labels;

                var content = this.generateLocationContent(results[i]);
                this.addMarker(results[i].marker, content);
            };

            // query our server please
            // TODO change from localhost in prod
            xhr.open('GET', encodeURI('http://localhost:8081/api/factual?name=' + results[i].name +
                    '&lat=' + results[i].geometry.location.lat()) +
                    '&lng=' + results[i].geometry.location.lng(), true);
            xhr.send();

        }

        this.locations = results;
        if(this.searchCallback) {
            this.searchCallback(results);
        }
    };

    /**
     * Generates html content of a place info
     * @param place - the place we want to know about
     * @returns {string} - string containing html formatting
     */
    generateLocationContent(place: any) {
        var cats = place.cat_labels[0].join(', ');
        return (
            '<div class="info">' +
            '<h4 class="info-title">' + place.name + '</h4>' +
            '<p class="info-categories"><strong>Categories: </strong>' + cats + '</p>' +
            '<p class="info-tel"><strong>Phone #: </strong>' + place.tel + '</p>' +
            '<a class="info-website" href="' + place.website + '">Website</a>' +
            '</div>'
        );
    }

    /**
     * Getter for locations
     * @returns {any[]}
     */
    getNearbyLocations = () : any[] => {
        return this.locations;
    };

    /**
     * Creates a map marker for the provided place
     * @param place - place to associate with marker
     * @returns {google.maps.Marker}
     */
    createMarker = (place: any): any => {
        var placeLoc = new Coords(
            place.geometry.location.lat(),
            place.geometry.location.lng()
        );
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
    addMarker = (marker: any, markerInfo: string) => {
        marker.setMap(this.gMap);
        google.maps.event.addListener(marker, 'click', () => {
            this.gMap.panTo(marker.position);
            this.animateMarker(marker);
            this.infoWindow.setContent(markerInfo);
            this.infoWindow.open(this.gMap, marker);
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

    filterLocations = (filter: string) => {
        return this.locations.filter((location: any) => {
         var match = location.name.toLowerCase().indexOf(filter.toLowerCase()) > -1;
          if(!match) {  // get it outta here!
              this.removeMarker(location.marker);
          }
          else if(!location.marker.map) {  // jk want you back
              this.addMarker(location.marker, location.name);
          }
          return match;
        });
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
