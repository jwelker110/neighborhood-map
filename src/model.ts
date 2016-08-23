import * as ko from "knockout";
import * as fs from "foursquare";
import {FourSquare} from "./foursquare";
"use strict";

export class ViewModel {

    locations = ko.observableArray([]);
    filteredLocations = ko.observableArray([]);
    filter = ko.observable('Food near Baton Rouge');
    searchAction = ko.observable('search');
    map: any;
    isListCollapsed = ko.observable(true);
    isCollapsedComputed: KnockoutComputed<any>;
    listPulldownComputed: KnockoutComputed<any>;
    loading = ko.observable(true);
    alerts = ko.observableArray([]);
    fs: FourSquare;

    constructor(map: any){
        this.map = map;

        this.fs = new FourSquare(
            "XJ5MBAGS2GLP1QAXQJWSAVYPKZLRFQK1XNUEE24FHTD2NG1F",
            "I5PXU1HOIGN5ASTP04HAQDB3ZNOTKXJD1GX5GIR1CBHGWIW3");
        this.searchSubmit(null, null);

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

    fsCallback = (resp: any) => {
        // set the locations in the google map and the model
        this.map.foursquareCallback(resp, this.foursquareCallback);
    };

    onError = () => {
        this.addAlert('An error occurred while retrieving venues. Please reload the page and try again.', null);
    };

    searchSubmit = (obj: any, event: any) => {
        if(this.filteredLocations().length > 0 && this.searchAction() == 'filter') {
            this.setCurrentLocation(this.filteredLocations()[0]);
            return;
        } else if (this.searchAction() == 'search') {
            // TODO NEED TO REMOVE OLD MARKERS FROM GOOGLE MAP
            // if the user supplies near param, use it, else use current lat lng position
            let p: any[] = [];

            let filterLower = this.filter().toLowerCase();
            // look for location keywords
            let keywords = ['near', 'at', 'around', 'by', 'in'];
            let locale: any = null;
            for(let i = 0; i < keywords.length; i++) {
                if(filterLower.indexOf(keywords[i]) > -1) {
                    locale = filterLower.split(keywords[i]);
                    break;
                }
            }
            if(locale && locale.length > 1) {  // this means they entered more than just a location
                p.push(this.fs.nearParams(locale[locale.length - 1]));
                p.push(this.fs.queryParams(locale[0]));
            } else {
                // they didn't use a location keyword so just use current position
                let center = this.map.gMap.getCenter();
                p.push(this.fs.latLngParams({
                    lat: center.lat(),
                    lng: center.lng()
                }));
                p.push(this.fs.queryParams(this.filter()));
            }

            this.fs.venuesSearch(p, this.fsCallback, this.onError);
            this.filter('');
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
        this.setLocations(resp.response && resp.response.venues ? resp.response.venues : []);
        this.setAction('filter');
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

    addAlert = (msg: string, type: string) => {
        this.alerts.push({
            msg: msg,
            type: type ? type : 'alert-danger'
        });
    };
}
