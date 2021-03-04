const locationTemplate = document.getElementById("location-template");
const citiesList = document.getElementById("cities");
const addCityInput = document.getElementById("add-city-input");

document.getElementById("add-city-form").addEventListener("submit", addCityEventHandler);
for (let i = 0; i < localStorage.length; i++) {
    addCity(localStorage.getItem(localStorage.key(i)), true);
}

function fetchByCity(city) {
    return fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=bb00e2c76a482605b246251414383c30`)
        .then(response => response.json());
}

function fetchByLocation(location) {
    return fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${location.coords.latitude}&lon=${location.coords.longitude}&units=metric&appid=bb00e2c76a482605b246251414383c30`)
        .then(response => response.json());
}

function showWeather(weatherInfo, loadingPlaceholderElement, cityNameElement, temperatureElement, imgElement, weatherElement, elementsToShow = []) {
    loadingPlaceholderElement.style.display = "none";
    for (const element of elementsToShow) {
        element.style.display = "block";
    }
    cityNameElement.innerHTML = weatherInfo.name;
    temperatureElement.innerHTML = `${Math.round(weatherInfo.main.temp)}°C`
    imgElement.src = `${weatherInfo.weather[0].icon}.png`;
    const weatherFeatures = weatherElement.children;
    weatherFeatures[0].children[1].innerHTML = `${Math.round(weatherInfo.wind.speed)} m/s, ${weatherInfo.wind.deg}°`;
    weatherFeatures[1].children[1].innerHTML = `${weatherInfo.clouds.all}%`;
    weatherFeatures[2].children[1].innerHTML = `${weatherInfo.main.pressure} hPa`;
    weatherFeatures[3].children[1].innerHTML = `${weatherInfo.main.humidity}%`;
    weatherFeatures[4].children[1].innerHTML = `[${weatherInfo.coord.lat}, ${weatherInfo.coord.lon}]`;
}

function addCity(cityName, isCalledFromStorage) {
    let newCityElement = locationTemplate.content.cloneNode(true);
    citiesList.appendChild(newCityElement);
    newCityElement = citiesList.lastElementChild;
    fetchByCity(cityName)
        .then(obj => {
            showWeather(obj, newCityElement.children[0],
                newCityElement.querySelector("div.favorite-item-header h3"),
                newCityElement.querySelector(".t-favourite"),
                newCityElement.querySelector(".weather-img"),
                newCityElement.querySelector(".weather-features"),
                [newCityElement.children[1]]);
            if (!isCalledFromStorage)
                localStorage.setItem(obj.name, obj.name);
        }).catch(() => {
        citiesList.removeChild(newCityElement);
        alert("Could not retrieve information on this city.");
    });
}

function addCityEventHandler(event) {
    event.preventDefault();
    addCity(addCityInput.value.trim().toLowerCase().replace(/\s+/g, ' '), false);
    addCityInput.value = "";
}

function removeCity(caller) {
    let cityToRemove = caller.closest(".location-container");
    cityToRemove.remove();
    localStorage.removeItem(cityToRemove.querySelector("div.favorite-item-header h3").innerHTML);
}

navigator.geolocation.getCurrentPosition(position =>
    fetchByLocation(position).then(obj =>
        showWeather(obj, document.getElementById("loading-placeholder-top"),
            document.getElementById("current-city-name"),
            document.getElementById("t-current"),
            document.getElementById("weather-img-big"),
            document.getElementById("current-weather-features"),
            [document.getElementById("current-weather-block"), document.getElementById("current-weather-features")]))
        .catch(() => alert("An error has occurred.")),
    () =>
    fetchByCity("Moscow,ru").then(obj =>
        showWeather(obj, document.getElementById("loading-placeholder-top"),
            document.getElementById("current-city-name"),
            document.getElementById("t-current"),
            document.getElementById("weather-img-big"),
            document.getElementById("current-weather-features"),
            [document.getElementById("current-weather-block"), document.getElementById("current-weather-features")]))
        .catch(() => alert("An error has occurred.")));