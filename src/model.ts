import * as ko from "knockout";

export class ViewModel {

    locations: KnockoutObservableArray<any> = ko.observableArray([]);
    filteredLocations: KnockoutObservableArray<any> = ko.observableArray([]);
    filter: KnockoutObservable<string> = ko.observable('');
    currentLocation: KnockoutObservable<any> = ko.observable();
    info: KnockoutObservable<string> = ko.observable('');
    map: any;

    constructor(map: any){
        this.map = map;
        this.getNearbyLocations();
    }

    setLocations = (locations: any[]) => {
        // TODO check for empty and display message
        for(let i = 0, l = locations.length; i < l; i++) {
            locations[i].marker = this.map.addMarker(locations[i]);
            locations[i].isMatched = ko.observable(true);
        }
        this.locations(locations);
        this.filteredLocations(locations);
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

    filterLocations = (obj: any, event: any) => {
        this.filteredLocations(this.locations().filter(function(place){
            return place.name.toLowerCase().indexOf(event.target.value.toLowerCase()) > -1;
        }));
    };
}
