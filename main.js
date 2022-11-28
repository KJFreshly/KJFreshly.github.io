const resultContainer = document.getElementById("result_container");
const decisionContainer = document.getElementById("decision_container");
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
    /* Clear Previous DOM Elements */
    while (resultContainer.firstChild) {
        resultContainer.removeChild(resultContainer.firstChild);
    }

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
        alert(e);
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
        return;
    }

    console.log("BEFORE FILTER");
    console.log(searchResults);

    /* Filter Restaurants Based On Input */

    searchResults = await filterSearchResults(searchResults, minRating, maxPrice);

    console.log("AFTER FILTER");
    console.log(searchResults);

    if (searchResults.length == 0) {
        alert("NO RESULTS AFTER FILTER");
        return;
    }

    /* Show Results */
    for (let i = 0; i < searchResults.length; i++) {
        let el = document.createElement('p');
        el.textContent = `Name: ${searchResults[i].name} / 
        Rating: ${searchResults[i].rating} / 
        Price Level: ${searchResults[i].price_level}`;
        resultContainer.appendChild(el);
    }

    /* Show Random Decision */
    var randomIndex = Math.floor(Math.random() * searchResults.length - 1);
    var randomEl = document.createElement('p');
    randomEl.textContent = `YOUR CHOICE: ${searchResults[randomIndex].name} / 
        RATING: ${searchResults[randomIndex].rating} / 
        PRICE LEVEL: ${searchResults[randomIndex].price_level}`;
    decisionContainer.appendChild(randomEl);
}

const asyncNearbySearch = async(service, request) => {
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

const filterSearchResults = async(resultsArray, minRating, maxPrice) => {
    return new Promise((resolve, reject) => {
        let newArray = resultsArray;
        let i = 0;
        while (i < newArray.length) {
            if (
                newArray[i].rating < minRating ||
                newArray[i].price_level >= maxPrice
            ) {
                newArray.splice(i, 1);
            } else {
                i++;
            }
        }
        if (resultsArray != null) {
            resolve(newArray);
        } else {
            reject(alert("FILTER ERROR"));
        }       
    })
}
