define(["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    var ViewModel = (function () {
        function ViewModel(map) {
            var _this = this;
            this.locations = ko.observableArray([]);
            this.filteredLocations = ko.observableArray([]);
            this.filter = '';
            this.isListCollapsed = ko.observable(true);
            this.toggleListCollapsed = function () {
                _this.isListCollapsed(!_this.isListCollapsed());
            };
            this.expandList = function () {
                _this.isListCollapsed(false);
            };
            this.setLocations = function (locations) {
                _this.locations(locations);
                _this.setFilteredLocations(locations);
            };
            this.setFilteredLocations = function (locations) {
                _this.filteredLocations(locations);
            };
            this.searchCallback = function (results) {
                _this.setLocations(results);
            };
            this.setCurrentLocation = function (place) {
                _this.isListCollapsed(true);
                _this.map.triggerMarker(place.marker);
            };
            this.filterLocations = function (obj, event) {
                _this.setLocations(_this.map.filterLocations(obj.filter));
            };
            this.map = map;
            this.map.search(undefined, this.searchCallback);
            this.isCollapsedComputed = ko.pureComputed(function () {
                return _this.isListCollapsed() ? 'ptm-list-collapsed' : 'ptm-list-expanded';
            }, this);
            this.isPlusComputed = ko.pureComputed(function () {
                return _this.isListCollapsed() ? 'ptm-expanded' : 'ptm-collapsed';
            });
        }
        return ViewModel;
    }());
    exports.ViewModel = ViewModel;
});
