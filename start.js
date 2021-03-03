function fetchByCity(city) {
    return fetch(`http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=bb00e2c76a482605b246251414383c30`)
        .then(response => response.json());
}

function fetchByLocation(location) {
    return fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${location.coords.latitude}&lon=${location.coords.longitude}&units=metric&appid=bb00e2c76a482605b246251414383c30`)
        .then(response => response.json());
}

function showWeather(weatherInfo, loadingPlaceholderElement, cityNameElement, temperatureElement, weatherElement, extraElementsToShow = []) {
    loadingPlaceholderElement.style.display = "none";
    weatherElement.style.display = "block";
    for (const element of extraElementsToShow) {
        element.style.display = "block";
    }
    cityNameElement.innerHTML = weatherInfo.name;
    temperatureElement.innerHTML = `${Math.round(weatherInfo.main.temp)}°C`
    const weatherFeatures = weatherElement.children;
    weatherFeatures[0].children[1].innerHTML = `${Math.round(weatherInfo.wind.speed)} m/s, ${weatherInfo.wind.deg}°`;
    weatherFeatures[1].children[1].innerHTML = `${weatherInfo.clouds.all}%`;
    weatherFeatures[2].children[1].innerHTML = `${weatherInfo.main.pressure} hPa`;
    weatherFeatures[3].children[1].innerHTML = `${weatherInfo.main.humidity}%`;
    weatherFeatures[4].children[1].innerHTML = `[${weatherInfo.coord.lat}, ${weatherInfo.coord.lon}]`;
}

navigator.geolocation.getCurrentPosition(position =>
    fetchByLocation(position).then(obj => {
        showWeather(obj, document.getElementById("loading-placeholder-top"),
            document.getElementById("current-city-name"),
            document.getElementById("t-current"),
            document.getElementById("current-weather-features"),
            [document.getElementById("current-weather-block")]);
    }), () => {
    fetchByCity("Moscow,ru").then(obj => {
        showWeather(obj, document.getElementById("loading-placeholder-top"),
            document.getElementById("current-city-name"),
            document.getElementById("t-current"),
            document.getElementById("current-weather-features"),
            [document.getElementById("current-weather-block")]);
    });
});