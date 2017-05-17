var map;
function initMap() {
        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(document.getElementById('map'), {
        	center: {lat: 51.439727, lng: -0.0553157},
        	zoom: 14,
        	mapTypeControl: false
        });
    }


    /* Opens the drawer when the menu icon is clicked*/

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

// 


var fourSquareUrl = "https://api.foursquare.com/v2/venues/search?v=20161016&ll=51.439727%2C%20-0.0553157&query=cafe&limit=10&intent=checkin&radius=1000&client_id=1YB1LHRYRGHEHPW3O4FC4UBDTZYEZWE4DTGUBD3NZ01C2BDY&client_secret=3W51M0JUXM4FGIP1GR2LN11AEKAIXHC5RDGE5N33DMUXXAJG";

var $itemsList = $('#fourSquareList');

$.getJSON(fourSquareUrl, function(data){
	venues = data.response.venues;
	for (var i = 0; i < venues.length; i++){
		var venue = venues[i];
		$itemsList.append('<h3>' + venue.name + '</h3><h4>Address</h4><p>' + venue.location.formattedAddress + '</p><h4>Distance</h4><p>' + venue.location.distance + ' metres away' + '</p><hr>');
		console.log("This works");
	};
});


var model = {
	// Empty list to store my foursquare locations
	fourSquareLocsList: []

};



// ------------- ViewModel ------------- //

var appViewModel = {
	
};

