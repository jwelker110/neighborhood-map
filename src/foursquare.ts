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
     * Build the auth params to be used in a future search
     * @returns {string} - url string containing client id and secret params
     */
    secretParams = () => {
        return '&client_id=' + this.clientId + '&client_secret=' + this.clientSecret;
    };

    versionMethodParams = () => {
        return '&v=' + this.version + '&m=' + this.method;
    };

    /**
     * Build the lat,lng param to be used in a url string
     * @returns {string} - url string containing the ll param
     * @param coords - coordinates to search near
     */
    latLngParams = (coords: {lat: any, lng: any}) => {
        return 'll=' + coords.lat + ',' + coords.lng;
    };

    queryParams = (query: string) => {
        return 'query=' + query;
    };

    nearParams = (locale: string) => {
        return 'near=' + locale;
    };

    radiusParams = (radius: number = 3200) => {
        return 'radius=' + radius;
    };

    intentParams = (intent: string = 'checkin') => {
        return 'intent=' + intent;
    };

    /**
     * Perform a venue search with the provided parameters
     * @param params {Array} - parameters to include in the query url
     * @param callback {Function} - function to call when request is complete; passed in the JSON response.
     * @param onError - callback called when the request encounters an error
     */
    venuesSearch = (params: string[], callback: any, onError: any) => {
        var ep = 'venues/search?';

        // generate our URL please
        var url = this.baseUrl + ep + params.join('&') + this.secretParams() + this.versionMethodParams();

        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = () => {
            if(xhr.readyState !== XMLHttpRequest.DONE) { return; }
            var resp = JSON.parse(xhr.responseText ? xhr.responseText : "{}");
            if(!resp.meta || resp.meta.code != 200) {  // something went wrong querying the API
                if(onError) { onError('An error occurred when retrieving venues. Please reload the page or try another search.', 'danger'); }
                return;
            }
            // let's call our callback meow
            if(typeof callback === 'function') { callback(resp); }
        };

        xhr.open('GET', url, true);
        xhr.send();
    };

    buildVenuesSearch = (searchString: string, center: {lat: any, lng: any}, callback: any, onError: any) => {
        // if the user supplies near param, use it, else use current lat lng position
        let p: any[] = [];

        // look for location keywords
        let keywords = [' near ', ' nearby ', ' surrounding ', ' at ', ' around ', ' by ', ' in '];
        let locale:any = null;

        for (let i = 0; i < keywords.length; i++) {
            if (searchString.indexOf(keywords[i]) > -1) {
                locale = searchString.split(keywords[i]);
                break;
            }
        }

        if (locale && locale.length > 1) {  // this means they entered more than just a location
            p.push(this.nearParams(locale[locale.length - 1]));
            p.push(this.queryParams(locale[0]));
        } else {
            // they didn't use a location keyword so just use current position
            p.push(this.latLngParams({
                lat: center.lat(),
                lng: center.lng()
            }));
            p.push(this.queryParams(searchString));
        }

        p.push(this.intentParams());
        p.push(this.radiusParams());

        this.venuesSearch(p, callback, onError);
    };

}
