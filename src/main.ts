import * as ko from "knockout";
import {ViewModel} from "model";
import {FourSquare} from "foursquare";

var fs = new FourSquare(
    "XJ5MBAGS2GLP1QAXQJWSAVYPKZLRFQK1XNUEE24FHTD2NG1F",
    "I5PXU1HOIGN5ASTP04HAQDB3ZNOTKXJD1GX5GIR1CBHGWIW3");

// create our model here
var vm = new ViewModel(map);

let p: any[] = [];
p.push(fs.nearParams('baton rouge'));
p.push(fs.queryParams('food'));
fs.venuesSearch(p, fsCallback);

function fsCallback(resp: any) {
    // set the locations in the google map and the model
    map.foursquareCallback(resp, vm.foursquareCallback);

}

ko.applyBindings(vm);
