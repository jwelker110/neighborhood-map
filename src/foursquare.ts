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
     * @param lat - latitude
     * @param lng - longitude
     * @returns {string} - url string containing the ll param
     */
    latLngParams = (lat: number, lng: number) => {
        return 'll=' + lat + ',' + lng;
    };

    queryParams = (query: string) => {
        return 'query=' + query;
    };

    nearParams = (locale: string) => {
        return 'near=' + locale;
    };

    /**
     * Perform a venue search with the provided parameters
     * @param params {Array} - parameters to include in the query url
     * @param callback {Function} - function to call when request is complete; passed in the JSON response.
     */
    venuesSearch = (params: string[], callback: any) => {
        var ep = 'venues/search?';

        // generate our URL please
        var url = this.baseUrl + ep + params.join('&') + this.secretParams() + this.versionMethodParams();

        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = () => {
            if(xhr.readyState !== XMLHttpRequest.DONE) { return; }
            var resp = JSON.parse(xhr.responseText);
            if(resp.meta.code != 200) { return; }  // something went wrong querying the API
            // let's call our callback meow
            if(callback) { callback(resp); }
        };

        xhr.open('GET', url, true);
        xhr.send();
    };



}
