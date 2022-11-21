const imageContainer = document.getElementById("image_container");
const addressInput = document.getElementById("address");
const radiusInput = document.getElementById("radius");
const openCheckbox = document.getElementById("open");
const ratingInput = document.getElementById("rating");
const includeCheckbox = document.getElementById("include");
const excludeCheckbox = document.getElementById("exclude");
const keywordInput = document.getElementById("keywords");
const submitButton = document.getElementById("submit");
submitButton.addEventListener("click", main);

async function main() {
    /* TODO: Verify Input */
    var address = addressInput.value;

    /* Create Map Center Using Geocode */
    var geocoder = new google.maps.Geocoder();
    var latlng;

    await geocoder.geocode({ address: address }, function (results, status) {
        if (status == "OK") {
            latlng = results[0].geometry.location;
        } else {
            alert("geo failed");
        }
    });

    var mapCenter = new google.maps.LatLng(latlng.lat(), latlng.lng());
    var map = new google.maps.Map(document.getElementById("map"), {
        center: mapCenter,
    });

    /* TODO: Generate and validate request from user input */
    var radius = radiusInput.value;
    var locationRequest = {
        location: mapCenter,
        radius: radius,
        type: ["restaurant"],
    };

    /* Add information to request per user input */
    if (openCheckbox.checked) {
        locationRequest.openNow = true;
    }

    /* Find nearby restaurants */
    var placesService = new google.maps.places.PlacesService(map);
    var searchResults = await asyncNearbySearch(placesService, locationRequest);

    /* TODO: Get place_id from each location object from searchResults to use in place_details */
    var placeids = [];
    searchResults.forEach((location) => placeids.push(location.place_id));

    console.log(placeids);
}

async function asyncNearbySearch(service, request) {
    return new Promise((resolve, reject) => {
        service.nearbySearch(request, function (results, status) {
            if (status == "OK") {
                resolve(results);
            } else {
                reject(status);
            }
        });
    });
}
