"use strict";

/**
 * This class handles querying the FourSquare API
 */
export class FourSquare {

    baseUrl = 'https://api.foursquare.com/v2/';
    version = '20160716';
    method = 'foursquare';

    clientId: string;
    clientSecret: string;

    constructor(id: string, secret: string) {
        this.clientId = id;
        this.clientSecret = secret;
    }

    /**
     * Build the auth params
     * @returns - url string containing client id and secret params
     */
    secretParams = (): string => {
        return '&client_id=' + this.clientId + '&client_secret=' + this.clientSecret;
    };

    /**
     * Build the version and method params
     * @returns - url string containing method and version info
     */
    versionMethodParams = (): string => {
        return '&v=' + this.version + '&m=' + this.method;
    };

    /**
     * Build the lat,lng param
     * @param coords - coordinates to search near
     * @returns - url string containing the ll param
     */
    latLngParams = (coords: {lat: any, lng: any}): string => {
        return 'll=' + coords.lat + ',' + coords.lng;
    };

    /**
     * Build the query param
     * @param query - the search term(s)
     * @returns - url string containing the query param
     */
    queryParams = (query: string): string => {
        return 'query=' + query;
    };

    /**
     * Build the "near" query param
     * @param locale - the location to query
     * @returns - url string containing the near param
     */
    nearParams = (locale: string): string => {
        return 'near=' + locale;
    };

    /**
     * Build the radius param
     * @param radius - the radius, in meters, to include search results
     * @returns - url string containing the radius param
     */
    radiusParams = (radius: number = 3200): string => {
        return 'radius=' + radius;
    };

    /**
     * Build the intent param
     * @param intent - the FS intent, defaults to 'checkin'
     * @returns - url string containing the intent param
     */
    intentParams = (intent: string = 'checkin'): string => {
        return 'intent=' + intent;
    };

    /**
     * Perform a venue search with the provided parameters
     * @param params {Array} - parameters to include in the query url
     * @param callback {Function} - function to call when request is complete; passed in the JSON response.
     * @param onError - callback called when the request encounters an error
     */
    venuesSearch = (params: string[], callback: any, onError: any) => {
        var ep = 'venues/explore?';

        // generate our URL please
        var url = this.baseUrl + ep + params.join('&') + this.secretParams() + this.versionMethodParams();

        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            var resp = JSON.parse(xhr.responseText ? xhr.responseText : "{}");
            if (!resp.meta || resp.meta.code != 200) {  // something went wrong querying the API
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
    buildVenuesSearch = (searchString: string, center: {lat: any, lng: any}, callback: any, onError: any) => {
        let params: any[] = [];

        let keywords = [' near ', ' nearby ', ' surrounding ', ' at ', ' around ', ' by ', ' in '];
        let locale: any = null;

        // check for location keywords
        for (let i = 0; i < keywords.length; i++) {
            if (searchString.indexOf(keywords[i]) > -1) {
                locale = searchString.split(keywords[i]);
                break;
            }
        }

        if (locale && locale.length > 1) {  // this means they entered more than just a location
            params.push(this.nearParams(locale[locale.length - 1]));
            params.push(this.queryParams(locale[0]));
        } else {
            // they didn't use a location keyword so just use current position
            params.push(this.latLngParams({
                lat: center.lat(),
                lng: center.lng()
            }));
            params.push(this.queryParams(searchString));
        }

        params.push(this.intentParams());
        params.push(this.radiusParams());

        this.venuesSearch(params, callback, onError);
    };

}
