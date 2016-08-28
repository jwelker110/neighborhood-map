define(["require", "exports", "knockout", "./foursquare"], function (require, exports, ko, foursquare_1) {
    "use strict";
    var ViewModel = (function () {
        function ViewModel(map) {
            var _this = this;
            this.locations = ko.observableArray([]);
            this.filteredLocations = ko.observableArray([]);
            this.filter = ko.observable('Food near Baton Rouge');
            this.searchAction = ko.observable('search');
            this.isListCollapsed = ko.observable(true);
            this.alerts = ko.observableArray([]);
            /**
             * assigns the results of the query to the locations observable
             * @param resp - the response from the fs api
             */
            this.searchCallback = function (resp) {
                _this.onSuccess();
                // set the locations in the google map and the model
                _this.map.setLocations(resp.response.groups[0].items, resp.response.geocode.center);
                _this.setLocations(resp.response.groups[0].items);
                _this.setAction('filter');
            };
            /**
             * Displays an error across the map when called
             * @param msg - the message to assign to the alert
             * @param type - the alert class to apply to the alert div
             */
            this.onError = function (msg, type) {
                _this.addAlert(msg, type);
            };
            /**
             * Remove the alerts from the page
             */
            this.onSuccess = function () {
                _this.alerts([]);
            };
            /**
             * Submits the current filter criteria to FS and focuses on the filter input.
             */
            this.searchSubmit = function () {
                if (_this.filteredLocations().length > 0 && _this.searchAction() === 'filter') {
                    _this.setCurrentLocation(_this.filteredLocations()[0]);
                }
                else if (_this.searchAction() == 'search') {
                    _this.fs.buildVenuesSearch(_this.filter().toLowerCase(), _this.map.gMap.getCenter(), _this.searchCallback, _this.onError);
                    _this.filter('');
                    document.getElementById('list-filter-input').focus();
                }
            };
            /**
             * Set the current user action
             * @param action - either 'filter' or 'search' to indicate the
             * desired form submission action
             */
            this.setAction = function (action) {
                _this.searchAction(action);
                if (_this.searchAction() == 'filter') {
                    _this.expandList();
                    _this.filterLocations();
                }
                else if (_this.searchAction() == 'search') {
                    _this.collapseList();
                    if (_this.filter().length > 0) {
                        _this.searchSubmit();
                    }
                }
            };
            this.toggleListCollapsed = function () {
                _this.isListCollapsed(!_this.isListCollapsed());
            };
            this.expandList = function () {
                _this.isListCollapsed(false);
            };
            this.collapseList = function () {
                _this.isListCollapsed(true);
            };
            /**
             * Assign the locations to the locations observable
             * @param locations - array of locations
             */
            this.setLocations = function (locations) {
                _this.locations(locations);
                _this.setFilteredLocations(locations);
            };
            /**
             * Assign the locations to the filtered observable
             * @param locations - array of locations
             */
            this.setFilteredLocations = function (locations) {
                _this.filteredLocations(locations);
            };
            /**
             * Collapse the list and trigger the event associated with
             * selecting a location
             * @param place - the place to select
             */
            this.setCurrentLocation = function (place) {
                _this.collapseList();
                _this.map.triggerMarker(place.marker);
            };
            /**
             * Filter the current locations by name and/or address
             */
            this.filterLocations = function () {
                if (_this.searchAction() == 'search') {
                    return;
                }
                var filtered = _this.locations().filter(function (location) {
                    var match = location.venue.name.toLowerCase().indexOf(_this.filter().toLowerCase()) > -1;
                    // no need to check if it already matched eh?
                    if (location.venue.location.formattedAddress.length > 1 && !match) {
                        match = location.venue.location.formattedAddress[0].toLowerCase().indexOf(_this.filter().toLowerCase()) > -1;
                    }
                    // hide locations that don't match filter
                    if (!match && location.marker) {
                        _this.map.hideMarker(location.marker);
                    }
                    else if (!location.marker.map) {
                        _this.map.showMarker(location.marker);
                    }
                    return match;
                });
                _this.setFilteredLocations(filtered);
                _this.expandList();
            };
            /**
             * Add the provided alert to the alert array and display it on the page
             * @param msg - the text to display
             * @param type - the BS alert class to apply to the message
             */
            this.addAlert = function (msg, type) {
                _this.alerts.push({
                    msg: msg,
                    type: type ? 'alert-' + type : 'alert-danger'
                });
            };
            this.map = map;
            // used when a google marker is clicked so the list will collapse
            this.map.setMarkerClickedCallback(function () {
                _this.collapseList();
            });
            // creating the new FS service
            this.fs = new foursquare_1.FourSquare("XJ5MBAGS2GLP1QAXQJWSAVYPKZLRFQK1XNUEE24FHTD2NG1F", "I5PXU1HOIGN5ASTP04HAQDB3ZNOTKXJD1GX5GIR1CBHGWIW3");
            this.searchSubmit();
            // apply the required class to the list when it should be shown
            this.isCollapsedComputed = ko.pureComputed(function () {
                return _this.isListCollapsed() ? '' : 'list-expanded';
            });
            // change the list pulldown chevron to reflect shown/hidden list
            this.listPulldownComputed = ko.pureComputed(function () {
                if (_this.filteredLocations().length == 0) {
                    return 'glyphicon-chevron-down';
                }
                return _this.isListCollapsed() ? 'glyphicon-chevron-down' : 'glyphicon-chevron-up';
            });
        }
        return ViewModel;
    }());
    exports.ViewModel = ViewModel;
});
//# sourceMappingURL=model.js.map