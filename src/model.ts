import * as ko from "knockout";

export class ViewModel {

    locations = ko.observableArray([]);
    filteredLocations = ko.observableArray([]);
    filter = '';
    map: any;
    isListCollapsed = ko.observable(true);
    isCollapsedComputed: KnockoutComputed<any>;
    isPlusComputed: KnockoutComputed<any>;

    constructor(map: any){
        this.map = map;
        this.map.search(undefined, this.searchCallback);
        this.isCollapsedComputed = ko.pureComputed(() => {
            return this.isListCollapsed() ? 'ptm-list-collapsed' : 'ptm-list-expanded';
        }, this);
        this.isPlusComputed = ko.pureComputed(() => {
            return this.isListCollapsed() ? 'ptm-expanded' : 'ptm-collapsed';
        });
    }

    toggleListCollapsed = () => {
        this.isListCollapsed(!this.isListCollapsed());
    };

    expandList = () => {
        this.isListCollapsed(false);
    };

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
        this.isListCollapsed(true);
        this.map.triggerMarker(place.marker);
    };

    filterLocations = (obj: any, event: any) => {
        this.setLocations(this.map.filterLocations(obj.filter));
    };
}
