import * as ko from "knockout";
import {FourSquare} from "./foursquare";

export class ViewModel {

    locations = ko.observableArray([]);
    filteredLocations = ko.observableArray([]);
    filter = ko.observable('Food near Baton Rouge');
    searchAction = ko.observable('search');
    map: any;
    isListCollapsed = ko.observable(true);
    isCollapsedComputed: KnockoutComputed<any>;
    listPulldownComputed: KnockoutComputed<any>;
    alerts = ko.observableArray([]);
    fs: FourSquare;

    constructor(map: any) {
        this.map = map;

        // used when a google marker is clicked so the list will collapse
        this.map.setMarkerClickedCallback(() => {
            this.collapseList();
        });

        // creating the new FS service
        this.fs = new FourSquare(
            "XJ5MBAGS2GLP1QAXQJWSAVYPKZLRFQK1XNUEE24FHTD2NG1F",
            "I5PXU1HOIGN5ASTP04HAQDB3ZNOTKXJD1GX5GIR1CBHGWIW3");
        this.searchSubmit();

        // apply the required class to the list when it should be shown
        this.isCollapsedComputed = ko.pureComputed(() => {
            return this.isListCollapsed() ? '' : 'list-expanded';
        });

        // change the list pulldown chevron to reflect shown/hidden list
        this.listPulldownComputed = ko.pureComputed(() => {
            if (this.filteredLocations().length == 0) {
                return 'glyphicon-chevron-down';
            }
            return this.isListCollapsed() ? 'glyphicon-chevron-down' : 'glyphicon-chevron-up';
        });
    }

    /**
     * assigns the results of the query to the locations observable
     * @param resp - the response from the fs api
     */
    searchCallback = (resp: any) => {
        this.onSuccess();
        // set the locations in the google map and the model
        this.map.setLocations(resp.response.groups[0].items, resp.response.geocode.center);
        this.setLocations(resp.response.groups[0].items);
        this.setAction('filter');
    };

    /**
     * Displays an error across the map when called
     * @param msg - the message to assign to the alert
     * @param type - the alert class to apply to the alert div
     */
    onError = (msg: string, type: string) => {
        this.addAlert(msg, type);
    };

    /**
     * Remove the alerts from the page
     */
    onSuccess = () => {
        this.alerts([]);
    };

    /**
     * Submits the current filter criteria to FS and focuses on the filter input.
     */
    searchSubmit = () => {
        if (this.filteredLocations().length > 0 && this.searchAction() === 'filter') {
            this.setCurrentLocation(this.filteredLocations()[0]);
        } else if (this.searchAction() == 'search') {
            this.fs.buildVenuesSearch(this.filter().toLowerCase(), this.map.gMap.getCenter(), this.searchCallback, this.onError);
            this.filter('');
            document.getElementById('list-filter-input').focus();
        }
    };

    /**
     * Set the current user action
     * @param action - either 'filter' or 'search' to indicate the
     * desired form submission action
     */
    setAction = (action: string) => {
        this.searchAction(action);
        if (this.searchAction() == 'filter') {
            this.expandList();
            this.filterLocations();
        } else if (this.searchAction() == 'search') {
            this.collapseList();
            if (this.filter().length > 0) {
                this.searchSubmit();
            }
        }
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

    /**
     * Assign the locations to the locations observable
     * @param locations - array of locations
     */
    setLocations = (locations: any[]) => {
        this.locations(locations);
        this.setFilteredLocations(locations);
    };

    /**
     * Assign the locations to the filtered observable
     * @param locations - array of locations
     */
    setFilteredLocations = (locations: any[]) => {
        this.filteredLocations(locations);
    };

    /**
     * Collapse the list and trigger the event associated with
     * selecting a location
     * @param place - the place to select
     */
    setCurrentLocation = (place: any) => {
        this.collapseList();
        this.map.triggerMarker(place.marker);
    };

    /**
     * Filter the current locations by name and/or address
     */
    filterLocations = () => {
        if (this.searchAction() == 'search') {
            return;
        }

        let filtered = this.locations().filter((location: any): boolean => {
            let match = location.venue.name.toLowerCase().indexOf(this.filter().toLowerCase()) > -1;

            // no need to check if it already matched eh?
            if (location.venue.location.formattedAddress.length > 1 && !match) {
                match = location.venue.location.formattedAddress[0].toLowerCase().indexOf(this.filter().toLowerCase()) > -1;
            }

            // hide locations that don't match filter
            if (!match && location.marker) {
                this.map.hideMarker(location.marker);
            } else if (!location.marker.map) {
                this.map.showMarker(location.marker);
            }

            return match;
        });

        this.setFilteredLocations(filtered);
        this.expandList();
    };

    /**
     * Add the provided alert to the alert array and display it on the page
     * @param msg - the text to display
     * @param type - the BS alert class to apply to the message
     */
    addAlert = (msg: string, type: string) => {
        this.alerts.push({
            msg: msg,
            type: type ? 'alert-' + type : 'alert-danger'
        });
    };
}
