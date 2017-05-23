'use strict';

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

var infowindow = {};

/*function infoWindowInstance(){
    infowindow = new google.maps.InfoWindow();
};*/

//var infoWindow = new google.maps.InfoWindow();

function populateInfoWindow(marker, infowindow) {
        console.log("I am marker: " + marker);
        console.log("I am infowindow: " + infowindow);

        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
          infowindow.marker = marker;
          infowindow.setContent('<div>' + marker.title + '</div>');
          infowindow.open(map, marker);
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });
        }
      };


// ------------- ViewModel ------------- //

var appViewModel = {
    // array to store list of map markers
    mapMarkersList: ko.observableArray(),
    
    // array to store list of fourSquare venues
    fourSquareLocsList: ko.observableArray(),

    infoWindowInstance: function(){
        infowindow = new google.maps.InfoWindow();
    },
    
    filterVenues: function (){
        this.fourSquareLocsList().forEach(function(item){
            if (item.venueTitle.toLowerCase().indexOf(appViewModel.filterInput()) === -1) {
                item.venueVisible(false);
                item.venueMarker.setVisible(false);
            } else {
                item.venueVisible(true)
                item.venueMarker.setVisible(true);
            };

        });
    },
    filterInput: ko.observable(''),
    
    // Call foursquare initially
    getFourSquareAPI: function (){
        var self = this;
        $.getJSON(model.fourSquareUrl, function(data){
            var venues = data.response.venues;
            for (var i = 0; i < venues.length; i++){
                var venue = venues[i];
                // store the data in observable array
                self.fourSquareLocsList.push({venueTitle: venue.name, venueAddress: venue.location.formattedAddress, venuePostCode: venue.location.postalCode, venueDistance: venue.location.distance,venueLat: venue.location.lat, venueLng: venue.location.lng, venueVisible: ko.observable(true)});
                
                };
            // Once ajax is complete, create markers from fourSquareLocsList
            }).done(function(){
                //self.infowindow;
                self.infoWindowInstance();
                console.log(infowindow);
                self.createMarkers();
        });
    },

    createMarkers: function (){
        var self = this;
        for (var i = 0; i < self.fourSquareLocsList().length; i++) {
            // Get the position date from the fourSquareLocsList array
            var title = self.fourSquareLocsList()[i].venueTitle;
            var position = {lat: self.fourSquareLocsList()[i].venueLat, lng: self.fourSquareLocsList()[i].venueLng};
            //Create a marker per location, and put into markers array.
            var marker = new google.maps.Marker({
                map: map,
                position: position,
                title: title,
                animation: google.maps.Animation.DROP,
                id: i
            });
            marker.addListener('click', function() {
                console.log("I am self: " + self)
                populateInfoWindow(self, infowindow);
            });
            
            self.fourSquareLocsList()[i].venueMarker = marker;
        };
    }
};

appViewModel.getFourSquareAPI();

ko.applyBindings(appViewModel);