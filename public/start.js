const citiesNamesToIdsMap = {};
const locationTemplate = document.getElementById("location-template");
const citiesList = document.getElementById("cities");
const addCityInput = document.getElementById("add-city-input");
document.getElementById("add-city-form").addEventListener("submit", addCityEventHandler);

function fetchLocation(location) {
    let fetchResult;
    if (location instanceof GeolocationPosition) {
        fetchResult =
            fetch(`/weather/coordinates?lat=${location.coords.latitude}&long=${location.coords.longitude}`);
    } else if (isNaN(location)) {
        fetchResult = fetch(`/weather/city?q=${location}`);
    } else {
        fetchResult = fetch(`/weather/city?id=${location}`);
    }
    return fetchResult.then(obj => {
        if (obj.status == 404)
            throw new Error("City not found.");
        return obj.json();
    });
}

function showWeather(weatherInfo, loadingPlaceholderElement, cityNameElement, temperatureElement, imgElement, weatherElement, elementsToShow = []) {
    loadingPlaceholderElement.style.display = "none";
    for (const element of elementsToShow) {
        element.style.display = "block";
    }
    cityNameElement.innerHTML = weatherInfo.name;
    temperatureElement.innerHTML = `${Math.round(weatherInfo.main.temp)}°C`
    imgElement.src = `img/${weatherInfo.weather[0].icon}.png`;
    const weatherFeatures = weatherElement.children;
    weatherFeatures[0].children[1].innerHTML = `${Math.round(weatherInfo.wind.speed)} m/s, ${weatherInfo.wind.deg}°`;
    weatherFeatures[1].children[1].innerHTML = `${weatherInfo.clouds.all}%`;
    weatherFeatures[2].children[1].innerHTML = `${weatherInfo.main.pressure} hPa`;
    weatherFeatures[3].children[1].innerHTML = `${weatherInfo.main.humidity}%`;
    weatherFeatures[4].children[1].innerHTML = `[${weatherInfo.coord.lat}, ${weatherInfo.coord.lon}]`;
}

function hideWeather(loadingPlaceholderElement, elementsToHide = []) {
    for (const element of elementsToHide) {
        element.style.display = "none";
    }
    loadingPlaceholderElement.style.display = "flex";
}

function updateFavouriteCity(city, cityElement, isCalledFromStorage) {
    fetchLocation(city)
        .then(obj => {
            if (!isCalledFromStorage)
                fetch(`/favourites?id=${obj.id}`).then(response => response.json())
                    .then(docs => {
                        if (docs.length === 0)
                            fetch(`/favourites?id=${obj.id}`, {method: 'POST'})
                                .then(() => {
                                    citiesNamesToIdsMap[obj.name] = obj.id;
                                    showWeather(obj, cityElement.children[0],
                                        cityElement.querySelector("div.favorite-item-header h3"),
                                        cityElement.querySelector(".t-favourite"),
                                        cityElement.querySelector(".weather-img"),
                                        cityElement.querySelector(".weather-features"),
                                        [cityElement.children[1]]);
                                });
                        else
                            throw new Error("This city has already been added.");
                    }).catch(error => {
                        citiesList.removeChild(cityElement);
                        alert(error);
                });
            else {
                citiesNamesToIdsMap[obj.name] = obj.id;
                showWeather(obj, cityElement.children[0],
                    cityElement.querySelector("div.favorite-item-header h3"),
                    cityElement.querySelector(".t-favourite"),
                    cityElement.querySelector(".weather-img"),
                    cityElement.querySelector(".weather-features"),
                    [cityElement.children[1]]);
            }
        }).catch(error => {
        citiesList.removeChild(cityElement);
        alert(error);
    });
}

function addCity(city, isCalledFromStorage) {
    let newCityElement = locationTemplate.content.cloneNode(true);
    citiesList.appendChild(newCityElement);
    newCityElement = citiesList.lastElementChild;
    updateFavouriteCity(city, newCityElement, isCalledFromStorage);
}

function addCityEventHandler(event) {
    event.preventDefault();
    addCity(addCityInput.value.trim().toLowerCase().replace(/\s+/g, ' '), false);
    addCityInput.value = "";
}

function removeCity(caller) {
    let cityToRemove = caller.closest(".location-container");
    const cityName = cityToRemove.querySelector("div.favorite-item-header h3").innerHTML;
    cityToRemove.querySelector("div button i").innerHTML = "hourglass_full";
    caller.onclick = null;
    //localStorage.removeItem(citiesNamesToIdsMap[cityName]);
    fetch(`/favourites?id=${citiesNamesToIdsMap[cityName]}`, { method: 'DELETE' })
        .then(() => {
            delete citiesNamesToIdsMap[cityName];
            cityToRemove.remove();
        }, error => {
            caller.onclick = function() {removeCity(caller)};
            cityToRemove.querySelector("div button i").innerHTML = "close";
            alert(error);
        });
}

function updateDefaultCity(position) {
    fetchLocation(position).then(obj =>
        showWeather(obj, document.getElementById("loading-placeholder-top"),
            document.getElementById("current-city-name"),
            document.getElementById("t-current"),
            document.getElementById("weather-img-big"),
            document.getElementById("current-weather-features"),
            [document.getElementById("current-weather-block"), document.getElementById("current-weather-features")]))
        .catch((err) => alert("An error has occurred." + err));
}

function refresh() {
    hideWeather(document.getElementById("loading-placeholder-top"),
        [document.getElementById("current-weather-block"), document.getElementById("current-weather-features")]);
    document.querySelectorAll("#cities .location-container").forEach(city => city.remove());
    navigator.geolocation.getCurrentPosition(position => updateDefaultCity(position), () => updateDefaultCity("Moscow"));
    fetch('/favourites').then(ids => ids.json()).then(ids => {
        for (const id of ids) {
            addCity(id.id /*localStorage.getItem(id)*/, true);
        }
    })
}

refresh();