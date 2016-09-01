require.config({
    paths: {
        "knockout": "/externals/knockout.min"
    }
});
var map;
var google;
/**
 * Setting up the map and the Knockout bindings. Done in here so we know the
 * Google map is ready to go before we try to use it.
 */
function initMap() {
    require(['knockout', 'model', 'googlemap'], function (ko, model, googlemap) {
        map = new googlemap.GoogleMap(new googlemap.Coords(30.4583, -91.1403), undefined, 13);
        var vm = new model.ViewModel(map);
        ko.applyBindings(vm);
    });
}
function onMapError(err) {
    alert('An error occurred when loading the map. Please refresh the page and try again.');
}
//# sourceMappingURL=main.js.map