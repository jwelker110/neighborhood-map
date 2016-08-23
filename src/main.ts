import * as ko from "knockout";
import {ViewModel} from "model";

// create our model here
var vm = new ViewModel(map);

ko.applyBindings(vm);
