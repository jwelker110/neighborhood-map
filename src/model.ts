import * as ko from "knockout";

export class ViewModel {

    locations: KnockoutObservableArray<any> = ko.observableArray([]);
    filter: KnockoutObservable<string> = ko.observable('');
    currentLocation: KnockoutObservable<any> = ko.observable();
    info: KnockoutObservable<string> = ko.observable('');

    constructor(locations: any[]){
        this.locations = ko.observableArray(locations);
    }

}
