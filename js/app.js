'use strict';

// global map and infowindow variables
var map,
    infowindow;


// initialise the google map
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
       center: {lat: 51.439727, lng: -0.0553157},
       zoom: 14,
       mapTypeControl: false
   });
    infowindow = new google.maps.InfoWindow();
};

// error message in case there's a problem with google maps
function googleError(){
    alert("Sorry, an error occured with Google Maps. Please try again later.");
};

// variables to collect DOM elements
var menu = document.querySelector('#menu'),
    main = document.querySelector('main'),
    drawer = document.querySelector('#drawer'),
    close = document.querySelector('#box');

    // Opens the side-drawer when the menu icon is clicked
    menu.addEventListener('click', function(e) {
    	drawer.classList.toggle('open');
    	e.stopPropagation();
    });

    // Closes the side-drawer when the user clicks outside of the drawer area
    main.addEventListener('click', function() {
    	drawer.classList.remove('open');
    });

    // Closes the side-drawer when the close icon is clicked
    close.addEventListener('click', function() {
        drawer.classList.remove('open');
    });


// ------------- Model ------------- //

var model = {
    fourSquareUrl: "https://api.foursquare.com/v2/venues/search?v=20161016&ll=51.439727%2C%20-0.0553157&query=cafe&limit=20&intent=checkin&radius=1500&client_id=1YB1LHRYRGHEHPW3O4FC4UBDTZYEZWE4DTGUBD3NZ01C2BDY&client_secret=3W51M0JUXM4FGIP1GR2LN11AEKAIXHC5RDGE5N33DMUXXAJG"
};

// ------------- ViewModel ------------- //

var appViewModel = {

    // array to store list of fourSquare venues
    fourSquareLocsList: ko.observableArray(),


    // make the form field an observable
    filterInput: ko.observable(''),
    
    // filter list items when the user inputs text to the form field
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

    // open and populate the infowindow
    populateInfoWindow: function(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            // write the name of the cafe into the infowindow
            infowindow.setContent('<h5>' + marker.title + '</h5><p>Address:</p><div>' + marker.address + '</div><p>Distance:</p><div>' + marker.distance + ' metres away' + '</div>');
            console.log(marker);
            // instruct the infowindow to open
            infowindow.open(map, marker);
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
        }
    },
    
    // Call foursquare initially
    getFourSquareAPI: function (){
        var self = this;
        $.getJSON(model.fourSquareUrl, function(data){
            
            // store the JSON response (data) into the venues variable
            var venues = data.response.venues;
            
            // loop through the response and grab some property values
            for (var i = 0; i < venues.length; i++){
                var venue = venues[i];
                
                // store the data in the observable array
                self.fourSquareLocsList.push({
                    venueTitle: venue.name,
                    venueAddress: venue.location.formattedAddress,
                    venuePostCode: venue.location.postalCode,
                    venueDistance: venue.location.distance,
                    venueLat: venue.location.lat,
                    venueLng: venue.location.lng,
                    
                    // venueVisible is tracked by KO so that filterVenues() can switch a given array item's visibility on/off
                    venueVisible: ko.observable(true),
                });
            };
            
            // Once ajax is complete, create markers from fourSquareLocsList
        }).done(function(){
            self.createMarkers();
            
            // If the call fails for some reason, let the user know
        }).fail(function() {
            alert( "Unable to contact FourSquare to show you some awesome cafes - please try again later");
        });
    },

    // function to create map markers, add a listener to each marker and initiate a bounce animation
    createMarkers: function (){
        var self = this;
        // loops through each array item of already-parsed foursquare data
        for (var i = 0; i < self.fourSquareLocsList().length; i++) {
            
            // get the venue name
            var title = self.fourSquareLocsList()[i].venueTitle;

            var address = self.fourSquareLocsList()[i].venueAddress;

            var distance = self.fourSquareLocsList()[i].venueDistance;
            
            // get the venue position data (we'll need this to pass to the map markers)
            var position = {lat: self.fourSquareLocsList()[i].venueLat, lng: self.fourSquareLocsList()[i].venueLng};
            
            // create a marker per location and set the property values
            var marker = new google.maps.Marker({
                map: map,
                position: position,
                title: title,
                address: address,
                distance: distance,
                animation: google.maps.Animation.DROP,
                id: i
            });

            // add listener to each marker so that when clicked...
            marker.addListener('click', function() {

                // ... it runs populateInfoWindow()...
                self.populateInfoWindow(this, infowindow);

                // ... and makeBounce()
                self.makeBounce(this);

            });

            self.fourSquareLocsList()[i].venueMarker = marker;
        };
    },

    // function that runs when a marker or list item is clicked: makes the marker bounce!
    makeBounce: function(marker){
        if (marker.getAnimation() !== null) {
          marker.setAnimation(null);
      } else {
          marker.setAnimation(google.maps.Animation.BOUNCE);
      };
  },


    // KO click handler function initiated when a list item is clicked
    myClickEventHandler: function(){
        var self = this;

        // runs populateInfoWindow()
        appViewModel.populateInfoWindow(this.venueMarker, infowindow);

        // runs makeBounce()
        appViewModel.makeBounce(this.venueMarker);
    }
};

// call to foursquare to start the process
appViewModel.getFourSquareAPI();

ko.applyBindings(appViewModel);