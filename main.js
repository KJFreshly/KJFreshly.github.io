const resultContainer = document.getElementById("result_container");
const addressInput = document.getElementById("address");
const radiusInput = document.getElementById("radius");
const openCheckbox = document.getElementById("open");
const ratingSelect = document.getElementById("rating");
const priceSelect = document.getElementById("price");
const includeRadio = document.getElementById("include");
const excludeRadio = document.getElementById("exclude");
const keywordInput = document.getElementById("keyword");
const submitButton = document.getElementById("submit");
submitButton.addEventListener("click", main);
var restaurants = [];

async function main() {
    /* Validate Inputs */
    /* Address */
    var address = addressInput.value;
    if (!address) {
        alert("INVALID ADDRESS");
        return;
    }

    /* Radius */
    try {
        var radius = parseInt(radiusInput.value);
    } catch (e) {
        alert("INVALID RADIUS");
        return;
    }

    if (radius == null || radius < 50 || radius > 50000) {
        alert("INVALID RADIUS");
        return;
    }

    /* Minimum Rating */
    try {
        var minRating = parseFloat(ratingSelect.value);
    } catch (e) {
        alert("INVALID MINIMUM RATING");
        return;
    }

    if (minRating == null || minRating < 0.0 || minRating > 4.0) {
        alert("INVALID MINIMUM RATING");
        return;
    }

    /* Maximum Price */
    try {
        var maxPrice = parseInt(priceSelect.value);
    } catch (e) {
        alert("INVALID MAXIMUM PRICE");
        return;
    }

    if (maxPrice == null || maxPrice < 1 || maxPrice > 4) {
        alert("INVALID MAXIMUM PRICE");
        return;
    }

    /* Get Lat/Lng of Address */
    var geocoder = new google.maps.Geocoder();
    var latlng;
    await geocoder.geocode({ address: address }, function (results, status) {
        if (status == "OK") {
            latlng = results[0].geometry.location;
        } else {
            alert("INVALID ADDRESS");
            return;
        }
    });

    /* Create User Location Using Geocoded Lat/Lng */

    var userLocation = new google.maps.LatLng(latlng.lat(), latlng.lng());
    var map = new google.maps.Map(document.getElementById("map"), {
        center: userLocation,
    });

    /* Generate Nearby Search Request */

    var locationRequest = {
        location: userLocation,
        radius: radius,
        type: ["restaurant"],
    };

    /* Currently Open */
    if (openCheckbox.checked) {
        locationRequest.openNow = true;
    }

    /* Find Nearby Restaurants */
    var placesService = new google.maps.places.PlacesService(map);

    try {
        var searchResults = await asyncNearbySearch(
            placesService,
            locationRequest
        );
    } catch (e) {
        alert(e);
    }

    console.log("BEFORE FILTER");
    console.log(searchResults);

    /* Filter Restaurants Based On Input */
    for (let i = searchResults.length - 1; i >= 0; i--) {
        if (
            searchResults[i].rating < minRating ||
            searchResults[i].price_level > maxPrice
        ) {
            searchResults.pop();
        }
    }

    if (searchResults.length == 0) {
        alert("NO RESULTS AFTER FILTER");
        return;
    }

    console.log("BEFORE FILTER");
    console.log(searchResults);

    /* Show Results */
    for (let i = 0; i < searchResults.length; i++) {
        let el = document.createElement('p');
        el.textContent = `Name: ${searchResults[i].name} / 
        Rating: ${searchResults[i].rating} / 
        Price Level: ${searchResults[i].price_level}`;
        resultContainer.appendChild(el);
    }
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
