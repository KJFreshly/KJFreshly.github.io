var map;
var placesService;
var infowindow;
var geocoder;

var button = document.getElementById("button");
button.addEventListener("click", main);

async function main() {
    /* TODO: Verify Input */
    var address = document.getElementById("address").value;

    geocoder = new google.maps.Geocoder();

    var latlng;

    await geocoder.geocode({ address: address }, function (results, status) {
        if (status == "OK") {
            latlng = results[0].geometry.location;
        } else {
            alert("geo failed");
        }
    });

    /* Create Map Center Using Geocode */
    var mapCenter = new google.maps.LatLng(latlng.lat(), latlng.lng());

    map = new google.maps.Map(document.getElementById("map"), {
        center: mapCenter,
    });

    /* TODO: Generate request from user input */
    var request = {
        location: mapCenter,
        radius: "500",
        type: ["restaurant"],
    };

    placesService = new google.maps.places.PlacesService(map);

    /* Find nearby restaurants */
    await placesService.nearbySearch(request, function (results, status) {
        if (status == "OK") {
            for (var i = 0; i < results.length; i++) {
                console.log(results[i]);
            }
        } else {
            alert("search failed");
        }
    });
}
