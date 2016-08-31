require.config({
    paths: {
        "knockout": "/externals/knockout.min"
    }
});
var map;
var google;
function initMap() {
    /**
     * setting a timeout so that we can get the map created once
     * it has loaded.
     * doing this because with the modules in TS it has been extremely
     * difficult to set initMap on the global scope so I am including it
     * within index so that google map api may call it.
     */
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