import * as ko from "knockout";
import {ViewModel} from "model";

// create our model here
var vm: ViewModel = new ViewModel(map);
ko.applyBindings(vm);


