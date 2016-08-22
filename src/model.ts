import * as ko from "knockout";
"use strict";

export class ViewModel {

    locations = ko.observableArray([]);
    filteredLocations = ko.observableArray([]);
    filter = ko.observable('');
    searchAction = ko.observable('filter');
    map: any;
    isListCollapsed = ko.observable(true);
    isCollapsedComputed: KnockoutComputed<any>;
    listPulldownComputed: KnockoutComputed<any>;
    loading = ko.observable(true);

    constructor(map: any){
        this.map = map;

        this.isCollapsedComputed = ko.pureComputed(() => {
            return this.isListCollapsed() ? '' : 'list-expanded';
        }, this);
        this.listPulldownComputed = ko.pureComputed(() => {
            if(this.filteredLocations().length == 0) {
                return 'glyphicon-chevron-down';
            }
            return this.isListCollapsed() ? 'glyphicon-chevron-down' : 'glyphicon-chevron-up';
        });
    }

    searchSubmit = (obj: any, event: any) => {
        if(this.filteredLocations().length > 0 && this.searchAction() == 'filter') {
            this.setCurrentLocation(this.filteredLocations()[0]);
            return;
        } else if (this.searchAction() == 'search') {
            setTimeout(function() {
                this.loading(true);
            });
            console.log('search performed');
            this.expandList();
        }
    };

    setAction = (action: string) => {
        this.searchAction(action);
        if(this.searchAction() == 'filter') {
            this.expandList();
            this.filterLocations({filter: this.filter}, {})
        } else if(this.searchAction() == 'search') {
            this.collapseList();
        }
    };

    foursquareCallback = (resp: any) => {
        this.setLocations(resp.response.venues);
    };

    toggleListCollapsed = () => {
        this.isListCollapsed(!this.isListCollapsed());
    };

    expandList = () => {
        this.isListCollapsed(false);
    };

    collapseList = () => {
        this.isListCollapsed(true);
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
        if(this.searchAction() == 'search') {return;}
        this.setLocations(this.map.filterLocations(obj.filter));
        this.expandList();
    };
}
