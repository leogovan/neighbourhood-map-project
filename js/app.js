var map;
function initMap() {
        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(document.getElementById('map'), {
        	center: {lat: 51.439727, lng: -0.0553157},
        	zoom: 14,
        	mapTypeControl: false
        });
};


    /* Opens the drawer when the menu icon is clicked */

    var menu = document.querySelector('#menu');
    var main = document.querySelector('main');
    var drawer = document.querySelector('#drawer');

    menu.addEventListener('click', function(e) {
    	drawer.classList.toggle('open');
    	e.stopPropagation();
    });
    main.addEventListener('click', function() {
    	drawer.classList.remove('open');
    });


// ------------- Model ------------- //

var model = {
    // Empty list to store my infobox data from foursquare
    //fourSquareLocsList: [],
    // Empty list to store the lat/lng for my map markers
    //mapMarkersList: [],
    fourSquareUrl: "https://api.foursquare.com/v2/venues/search?v=20161016&ll=51.439727%2C%20-0.0553157&query=cafe&limit=20&intent=checkin&radius=1500&client_id=1YB1LHRYRGHEHPW3O4FC4UBDTZYEZWE4DTGUBD3NZ01C2BDY&client_secret=3W51M0JUXM4FGIP1GR2LN11AEKAIXHC5RDGE5N33DMUXXAJG"
};


// ------------- ViewModel ------------- //

var appViewModel = {
    
    // array to store list of map markers
    mapMarkersList: ko.observableArray(),
    
    // array to store list of fourSquare venues
    fourSquareLocsList: ko.observableArray(),
    
    filter: ko.observable(""),
    
    // Call foursquare initially
    getFourSquareAPI: function (){
    $.getJSON(model.fourSquareUrl, function(data){
        venues = data.response.venues;
        for (var i = 0; i < venues.length; i++){
            var venue = venues[i];
            // store the data in observable array
            appViewModel.fourSquareLocsList.push({venueTitle: venue.name, venueAddress: venue.location.formattedAddress, venuePostCode: venue.location.postalCode, venueDistance: venue.location.distance,venueLat: venue.location.lat, venueLng: venue.location.lng});
            
            };
        // Once ajax is complete, create markers from fourSquareLocsList
        }).done(function(){
            appViewModel.createMarkers();
        });
    },

    createMarkers: function (){
        for (var i = 0; i < appViewModel.fourSquareLocsList().length; i++) {
            // Get the position date from the fourSquareLocsList array
            var title = appViewModel.fourSquareLocsList()[i].venueTitle;
            var position = {lat: appViewModel.fourSquareLocsList()[i].venueLat, lng: appViewModel.fourSquareLocsList()[i].venueLng};
            //Create a marker per location, and put into markers array.
            var marker = new google.maps.Marker({
                map: map,
                position: position,
                title: title,
                animation: google.maps.Animation.DROP,
                id: i 
            });
            appViewModel.mapMarkersList.push(marker);
        };
    }
};

appViewModel.getFourSquareAPI();

ko.applyBindings(appViewModel);