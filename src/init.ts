/**
 * function req'd by Google Maps to begin the initialization process
 * of the map
 */
var map: any;

declare var google: any;
function initMap() {
    map = new GoogleMap(new Coords(30.4583, -91.1403), undefined, 13);
}

function onMapError(err: any) {
    console.log('an error occurred');
}