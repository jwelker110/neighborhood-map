import * as ko from "knockout";

export class ViewModel {

    locations: KnockoutObservableArray<any> = ko.observableArray([]);
    filteredLocations: KnockoutObservableArray<any> = ko.observableArray([]);
    filter: string = '';
    map: any;

    constructor(map: any){
        this.map = map;
        this.map.search(undefined, this.searchCallback);
    }

    setLocations = (locations: any[]) => {
        this.locations(locations);
        this.setFilteredLocations(locations);
    };

    setFilteredLocations = (locations: any[]) => {
        this.filteredLocations(locations);
    };

    searchCallback = (results: any[]) => {
        this.setLocations(results);
    };

    setCurrentLocation = (place: any) => {
        this.map.triggerMarker(place.marker);
    };

    filterLocations = (obj: any, event: any) => {
        this.setLocations(this.map.filterLocations(obj.filter));
    };
}
