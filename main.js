/* DOM Element Variables */
const suggestionContainer = document.getElementById("suggestion_container");
const addressInput = document.getElementById("address");
const radiusInput = document.getElementById("radius");
const openCheckbox = document.getElementById("open");
const ratingSelect = document.getElementById("rating");
const priceSelect = document.getElementById("price");
const includeRadio = document.getElementById("include");
const excludeRadio = document.getElementById("exclude");
const keywordInput = document.getElementById("keyword");
const submitContainer = document.getElementById("submit_container");
const submitButton = document.getElementById("submit");
const beginButton = document.getElementById("begin");
const continueButton = document.getElementById("continue");
const continueContainer = document.getElementById("continue_container");
const waitingContainer = document.getElementById("waiting_container");

/* Event Listeners */
submitButton.addEventListener("click", searchForRestaurants);
beginButton.addEventListener("click", begin);
continueButton.addEventListener("click", nextInput);

/* Global Variables */
var restaurants = [];
var suggestedRestaurantIndex;
var values = {
    address: null,
    radius: null,
    currentlyOpen: false,
    minRating: null,
    maxPrice: null,
}
var inputIndexCounter = 0;
const inputs = [document.getElementById("input_a"), document.getElementById("input_b"), 
                document.getElementById("input_c"), document.getElementById("input_d")];

/* Display First Input Field (inputs[0]) */
function begin() {
    beginButton.classList.add("hidden");
    continueContainer.classList.remove("hidden");    
    inputs.forEach((e) => {e.classList.add("hidden")})
    inputIndexCounter = 0;
    inputs[0].classList.remove("hidden");
}

async function searchForRestaurants() {
    /* Suggest Another Restaurant Without Researching If Already Searched */
    if (restaurants.length > 0) {
        suggestDifferentRestaurant();
        return;
    }

    displayWaiting();
    
    /* Get Lat/Lng of Address */
    var geocoder = new google.maps.Geocoder();
    var latlng;
    try {
        await geocoder.geocode({ address: values.address }, function (results, status) {
            if (status == "OK") {
                latlng = results[0].geometry.location;
            } else {
                alert("INVALID ADDRESS");
                return;
            }
        });
    } catch (e) {
        location.reload();
        return;
    }
    

    /* Create User Location Using Geocoded Lat/Lng */
    var userLocation = new google.maps.LatLng(latlng.lat(), latlng.lng());
    var map = new google.maps.Map(document.getElementById("map"), {
        center: userLocation,
    });

    /* Generate Nearby Search Request */
    var locationRequest = {
        location: userLocation,
        radius: values.radius,
        openNow: values.currentlyOpen,
        type: ["restaurant"],
    };

    /* Find Nearby Restaurants */
    var placesService = new google.maps.places.PlacesService(map);
    try {
        await asyncNearbySearch(placesService, locationRequest);
    } catch(e) {
        alert(e);
        location.reload();
        return;
    }

    /* Filter Restaurants Based On Input */
    restaurants = await filterSearchResults(restaurants, values.minRating, values.maxPrice);

    if (restaurants.length == 0) {
        alert("NO RESULTS");
        return;
    }

    /* Show Random Decision */
    suggestRandomRestaurant();
}

/* An Async Wrapper Function For Maps API Nearby Search That Paginates Through All Results
   (Up To 60 Total) */
const asyncNearbySearch = async(service, request) => {
    return new Promise((resolve, reject) => {
        service.nearbySearch(request, function (results, status, pagination) {
            if (status !== "OK") reject(status);
            pushSearchResults(results);
            if (pagination && pagination.hasNextPage) {
                pagination.nextPage();
            } else {
                resolve(results);
            }
        })
    });
}

function displayWaiting() {
    submitContainer.classList.add("hidden");
    waitingContainer.classList.remove("hidden");
}

/* Used In asyncNearbySearch To Push Results To Global restaurants Variable */
function pushSearchResults(results) {
    for (let i = 0; i < results.length; i++) {
        restaurants.push(results[i]);
    }
}

/* Filters Through Array Of Restaurants And Splices Based On Given Properties */
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

/* Picks A Random Index From Restaurant Array */
function suggestRandomRestaurant() {
    waitingContainer.classList.add("hidden");
    submitContainer.classList.remove("hidden");
    submitButton.textContent = "Show Me Another Restaurant";

    submitContainer.firstElementChild.textContent = "Unhappy with this suggestion?";

    var randomIndex = Math.floor(Math.random() * (restaurants.length));
    displaySuggestedRestaurant(restaurants[randomIndex]);
    console.log(restaurants[randomIndex]);
}

/* Splices The Currently Suggested Restaurant From The restaurants Array And Suggests Another */
function suggestDifferentRestaurant() {
    if (restaurants.length == 1) {
        alert("NO MORE RESTAURANTS TO SELECT FROM");
        return;
    }

    restaurants.splice(suggestedRestaurantIndex, 1);
    suggestRandomRestaurant();
}

function displaySuggestedRestaurant(restaurant) {
    document.getElementById("randomP").textContent = "We Suggest Eating At...";
    document.getElementById("randomIMG").src = restaurant.photos[Math.floor(Math.random() * restaurant.photos.length)].getUrl();
    document.getElementById("randomH").textContent = restaurant.name;
    document.getElementById("randomRATING").textContent = `User Rating: ${restaurant.rating}`;
    document.getElementById("randomPRICE").textContent = `Price Level: ${restaurant.price_level}`;
    document.getElementById("randomA").href = `https://www.google.com/maps/place/?q=place_id:${restaurant.placeid}`

    suggestionContainer.classList.remove("hidden");
}

/* Shows And Hides The Different Stages Of User Input Container Divs Based On inputIndexCounter*/
function nextInput() {
    if (inputIndexCounter >= inputs.length) {
        return;
    }

    if (!validateInput(inputIndexCounter)) {
        return;
    }

    inputs[inputIndexCounter].classList.add("hidden");
    inputIndexCounter++;

    if (inputIndexCounter >= inputs.length) {
        continueContainer.classList.add("hidden");
        submitContainer.classList.remove("hidden");
        return;
    }

    inputs[inputIndexCounter].classList.remove("hidden");
}

/* Runs Corresponding Validation Methods Based On Which User Input Div Is Currently Active */
function validateInput(inputIndex) {
    switch(inputIndex) {
        case 0:
            return validateAddress();
        case 1:
            return validateCurrentlyOpen();
        case 2:
            return validateRating();
        case 3:
            return validatePrice();
    }
}

function validateAddress() {
    values.address = addressInput.value;
    if (!values.address) {
        alert("INVALID ADDRESS");
        return false;
    }

    try {
        values.radius = parseInt(radiusInput.value);
    } catch (e) {
        alert("INVALID RADIUS");
        return false;
    }

    if (values.radius == null || isNaN(values.radius) || values.radius < 1 || values.radius > 20) {
        alert("INVALID RADIUS");
        return false;
    }
    values.radius *= 1609;
    return true;
}

function validateCurrentlyOpen() {
    if (openCheckbox.checked) {
        values.currentlyOpen = true;
    }
    return true;
}

function validateRating() {
    try {
        values.minRating = parseFloat(ratingSelect.value);
    } catch (e) {
        alert(e);
        return false;
    }

    if (values.minRating == null || isNaN(values.minRating) ||values.minRating < 0.0 || values.minRating > 4.0) {
        alert("INVALID MINIMUM RATING");
        return false;
    }

    return true;
}

function validatePrice() {
    try {
        values.maxPrice = parseInt(priceSelect.value);
    } catch (e) {
        alert("INVALID MAXIMUM PRICE");
        return false;
    }

    if (values.maxPrice == null || isNaN(values.maxPrice) ||values.maxPrice < 1 || values.maxPrice > 4) {
        alert("INVALID MAXIMUM PRICE");
        return false;
    }

    return true;
}