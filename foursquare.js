define(["require", "exports"], function (require, exports) {
    "use strict";
    /**
     * This class handles querying the FourSquare API
     */
    var FourSquare = (function () {
        function FourSquare(id, secret) {
            var _this = this;
            this.baseUrl = 'https://api.foursquare.com/v2/';
            this.version = '20160716';
            this.method = 'foursquare';
            /**
             * Build the auth params
             * @returns - url string containing client id and secret params
             */
            this.secretParams = function () {
                return '&client_id=' + _this.clientId + '&client_secret=' + _this.clientSecret;
            };
            /**
             * Build the version and method params
             * @returns - url string containing method and version info
             */
            this.versionMethodParams = function () {
                return '&v=' + _this.version + '&m=' + _this.method;
            };
            /**
             * Build the lat,lng param
             * @param coords - coordinates to search near
             * @returns - url string containing the ll param
             */
            this.latLngParams = function (coords) {
                return 'll=' + coords.lat + ',' + coords.lng;
            };
            /**
             * Build the query param
             * @param query - the search term(s)
             * @returns - url string containing the query param
             */
            this.queryParams = function (query) {
                return 'query=' + query;
            };
            /**
             * Build the "near" query param
             * @param locale - the location to query
             * @returns - url string containing the near param
             */
            this.nearParams = function (locale) {
                return 'near=' + locale;
            };
            /**
             * Build the radius param
             * @param radius - the radius, in meters, to include search results
             * @returns - url string containing the radius param
             */
            this.radiusParams = function (radius) {
                if (radius === void 0) { radius = 3200; }
                return 'radius=' + radius;
            };
            /**
             * Build the intent param
             * @param intent - the FS intent, defaults to 'checkin'
             * @returns - url string containing the intent param
             */
            this.intentParams = function (intent) {
                if (intent === void 0) { intent = 'checkin'; }
                return 'intent=' + intent;
            };
            /**
             * Perform a venue search with the provided parameters
             * @param params {Array} - parameters to include in the query url
             * @param callback {Function} - function to call when request is complete; passed in the JSON response.
             * @param onError - callback called when the request encounters an error
             */
            this.venuesSearch = function (params, callback, onError) {
                var ep = 'venues/explore?';
                // generate our URL please
                var url = _this.baseUrl + ep + params.join('&') + _this.secretParams() + _this.versionMethodParams();
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (xhr.readyState !== XMLHttpRequest.DONE) {
                        return;
                    }
                    var resp = JSON.parse(xhr.responseText ? xhr.responseText : "{}");
                    if (!resp.meta || resp.meta.code != 200) {
                        if (onError) {
                            onError('An error occurred when retrieving venues. Please reload the page or try another search.', 'danger');
                        }
                        return;
                    }
                    // let's call our callback meow
                    if (typeof callback === 'function') {
                        callback(resp);
                    }
                };
                xhr.open('GET', url, true);
                xhr.send();
            };
            /**
             * Interpret the user input to build a FS query string
             * @param searchString - the user-supplied search
             * @param center - the coords to search around
             * @param callback - the function to call after the search has completed
             * @param onError - the function to call after the search has failed
             */
            this.buildVenuesSearch = function (searchString, center, callback, onError) {
                var params = [];
                var keywords = [' near ', ' nearby ', ' surrounding ', ' at ', ' around ', ' by ', ' in '];
                var locale = null;
                // check for location keywords
                for (var i = 0; i < keywords.length; i++) {
                    if (searchString.indexOf(keywords[i]) > -1) {
                        locale = searchString.split(keywords[i]);
                        break;
                    }
                }
                if (locale && locale.length > 1) {
                    params.push(_this.nearParams(locale[locale.length - 1]));
                    params.push(_this.queryParams(locale[0]));
                }
                else {
                    // they didn't use a location keyword so just use current position
                    params.push(_this.latLngParams({
                        lat: center.lat(),
                        lng: center.lng()
                    }));
                    params.push(_this.queryParams(searchString));
                }
                params.push(_this.intentParams());
                params.push(_this.radiusParams());
                _this.venuesSearch(params, callback, onError);
            };
            this.clientId = id;
            this.clientSecret = secret;
        }
        return FourSquare;
    }());
    exports.FourSquare = FourSquare;
});
//# sourceMappingURL=foursquare.js.map