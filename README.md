# neighborhood-map

The goal of this project is to create a simple map using Google's Map Service API.

The map should present users with at least 5 locations/points of interest.

Users should be able to select a location marker and be presented with that location's information, 
queried from a 3rd party API.

Checkout the [live]() version of this project (Please note: the backend is not configured and this live version
will not contain details for any locations).

### Frameworks/technologies used
- [Bootstrap CSS](http://getbootstrap.com/)
- [Knockoutjs](https://knockoutjs.com/) - for Bootstrap
- [Google Map API](https://developers.google.com/maps/)
- [Flask](http://flask.pocoo.org) - Backend server that queries [Factual API](https://github.com/Factual/factual-python-driver)
- [Factual](https://www.factual.com/solutions/developers) - Service providing place information

### Project specifications - Per Udacity's project requirements

**Interface** must include the following features:
- All application components render on-screen in a responsive manner.
- All application components are usable across modern desktop, tablet, and phone browsers.

**App Functionality** must include the following features:
- Includes a text input field that filters the map markers and list items to locations 
matching the text input. Filter function runs error-free.
- A list-view of location names is provided which displays all locations by default, 
and displays the filtered subset of locations when a filter is applied.
- Clicking a location on the list displays unique information about the location, 
and animates its associated map marker (e.g. bouncing, color change.)
- List functionality is responsive and runs error free.
- Map displays all location markers by default, and displays the filtered subset 
of location markers when a filter is applied.
- Clicking a marker displays unique information about a location in either an `infoWindow` or `DOM` element.
- Markers should animate when clicked (e.g. bouncing, color change).
- Any additional custom functionality provided in the app functions error-free.

**App Architecture** must include the following features:
- Code is properly separated based upon Knockout best practices (follow an MVVM pattern, avoid updating the 
DOM manually with jQuery or JS, use observables rather than forcing refreshes manually, etc). Knockout should 
not be used to handle the Google Map API.

**Asynchronous Data Usage** must include the following features:
- Application utilizes the Google Maps API and at least one non-Google third-party API.
- All data requests are retrieved in an asynchronous manner.
- Data requests that fail are handled gracefully using common fallback techniques (i.e. AJAX error or fail methods).
'Gracefully' means the user isn’t left wondering why a component isn’t working. If an API doesn’t load there 
should be some visible indication on the page (an alert box is ok) that it didn’t load. Note: You do not need
to handle cases where the user goes offline.

**Location Details Functionality** must include the following features:
- Functionality providing additional data about a location is provided and sourced from a 3rd party API. Information 
can be provided either in the marker’s infoWindow, or in an HTML element in the DOM (a sidebar, the list view, etc.)
- Provide attribution for the source of additional data. For example, if using Foursquare, indicate somewhere in 
your UI and in your README that you are using Foursquare data.
- Application runs without errors.
- Functionality is presented in a usable and responsive manner.

**Documentation** must include the following features:
- A README file is included detailing all steps required to successfully run the application. (Think I got that covered)
- Comments are present and effectively explain longer code procedures.
- Code is formatted with consistent, logical, and easy-to-read formatting as described in 
the [Udacity JavaScript Style Guide](http://udacity.github.io/frontend-nanodegree-styleguide/javascript.html).


### Setting up the project - using mac/linux terminal

1. [Clone](https://github.com/jwelker110/neighborhood-map.git) this repo.
2. [Install](http://blog.npmjs.org/post/85484771375/how-to-install-npm) npm.
3. [Install](https://www.npmjs.com/package/typescript) the TypeScript Compiler.
4. `cd` into the project's folder.
5. `tsc` to compile the files. They will be placed in the `built` folder.
6. `python -m SimpleHTTPServer 8080`.
7. You should be able to access the map in a web browser by typing in `localhost:8080`.
8. Assuming you want to query [Factual's](https://www.factual.com/solutions/developers) API from the application 
(Which you should), you need to [clone](https://github.com/jwelker110/neighborhood-map-backend) the backend repo, `cd` into the
directory, and place your app key and secret in the `keys_example.json` file.
9. type `mv keys_example.json secret_keys.json`
10. [Install](https://pip.pypa.io/en/stable/installing/) pip if you don't already have it.
11. `pip install virtualenv`
12. `virtualenv mapenv`
13. `pip install -r requirements.txt`
14. `python app.py` - Now you should have a webserver serving at localhost:8081

### Setting up your computer

1. [Install Python](https://www.python.org/downloads/) if necessary.
