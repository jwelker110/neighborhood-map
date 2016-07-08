import * as ko from "knockout";

export class ViewModel {

    locations: KnockoutObservableArray<any> = ko.observableArray([]);
    filter: KnockoutObservable<string> = ko.observable('');
    currentLocation: KnockoutObservable<any> = ko.observable();
    info: KnockoutObservable<string> = ko.observable('');
    map: any;

    constructor(map: any){
        this.map = map;
        this.filter = ko.observable('');
        this.currentLocation = ko.observable();
        this.info = ko.observable('');
        this.getNearbyLocations();
    }

    setLocations = (locations: any[]) => {
        // TODO check for empty and display message
        this.locations(locations);
        console.log(locations);
        for(let i = 0, l = locations.length; i < l; i++) {
            this.locations()[i].marker = this.map.addMarker(this.locations()[i]);
        }
    };

    /**
     * Remove the event listeners we no longer need
     */
    removeLocations = () => {
        this.locations = ko.observableArray([]);
    };

    setCurrentLocation = (place: any) => {
        this.currentLocation(place);
        this.map.gMap.panTo(place.geometry.location);
        this.map.animateMarker(place.marker);
        this.map.setInfoWindow(place.name, place.marker);
    };

    getNearbyLocations = () => {
        this.map.nearbySearch(this.setNearbyLocations);
    };

    setNearbyLocations = (results: any[], status: any) => {
        if(status == google.maps.places.PlacesServiceStatus.OK){
            var markers = this.locations();
            for(let i = 0, l = markers.length; i < l; i++) {
                this.map.removeMarker(markers[i]);
            }
            this.setLocations(results);
        }
    };
}
