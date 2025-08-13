document.getElementById("search-btn").addEventListener("click", () => {
  const city = document.getElementById("city-input").value.trim();
  if (!city) return showError("Please enter a city name");
  getWeatherByCity(city);
});

document.getElementById("city-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const city = e.target.value.trim();
    if (!city) return showError("Please enter a city name");
    getWeatherByCity(city);
  }
});

document.getElementById("current-location-btn").addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => getWeatherByCoordinates(pos.coords.latitude, pos.coords.longitude),
      () => showError("Unable to retrieve your location")
    );
  } else {
    showError("Geolocation is not supported by your browser");
  }
});

function showError(message) {
  document.getElementById("weather-result").innerHTML = `<p style="color:red;">${message}</p>`;
}

function showLoading() {
  document.getElementById("weather-result").innerHTML = `<p>Loading weather data...</p>`;
}

function getWeatherByCity(city) {
  const apiKey = "50fb71355f52e1e0bef4804a00a3063c";
  showLoading();
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
    .then((res) => res.json())
    .then((data) => {
      if (data.cod !== 200) return showError(data.message);
      displayWeather(data);
      getForecast(data.coord.lat, data.coord.lon);
    })
    .catch(() => showError("Error fetching weather data"));
}

function getWeatherByCoordinates(lat, lon) {
  const apiKey = "50fb71355f52e1e0bef4804a00a3063c";
  showLoading();
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
    .then((res) => res.json())
    .then((data) => {
      displayWeather(data);
      getForecast(lat, lon);
    })
    .catch(() => showError("Error fetching location weather"));
}

function getForecast(lat, lon) {
  const apiKey = "50fb71355f52e1e0bef4804a00a3063c";
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
    .then((res) => res.json())
    .then(displayForecast)
    .catch(() => showError("Error fetching forecast"));
}

function displayWeather(data) {
  const bgMap = {
    Clear: "linear-gradient(to top, #f9d423, #ff4e50)",
    Clouds: "linear-gradient(to top, #bdc3c7, #2c3e50)",
    Rain: "linear-gradient(to top, #00c6fb, #005bea)",
    Snow: "linear-gradient(to top, #e0eafc, #cfdef3)",
    Thunderstorm: "linear-gradient(to top, #373b44, #4286f4)",
    Drizzle: "linear-gradient(to top, #4facfe, #00f2fe)"
  };
  document.body.style.background = bgMap[data.weather[0].main] || "#333";
  const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
  const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();
  document.getElementById("weather-result").innerHTML = `
    <h2>${data.name}, ${data.sys.country}</h2>
    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather Icon">
    <p>Temperature: ${data.main.temp} °C</p>
    <p>Feels Like: ${data.main.feels_like} °C</p>
    <p>Weather: ${data.weather[0].description}</p>
    <p>Humidity: ${data.main.humidity} %</p>
    <p>Wind Speed: ${data.wind.speed} m/s</p>
    <p>Sunrise: ${sunrise}</p>
    <p>Sunset: ${sunset}</p>
  `;
}

function displayForecast(data) {
  const forecastContainer = document.createElement("div");
  forecastContainer.innerHTML = "<h3>5-Day Forecast</h3>";
  const daily = {};
  data.list.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];
    if (!daily[date] && item.dt_txt.includes("12:00:00")) {
      daily[date] = item;
    }
  });
  Object.values(daily).forEach((day) => {
    forecastContainer.innerHTML += `
      <div style="display:inline-block; margin:10px; padding:10px; border:1px solid #ccc; border-radius:8px;">
        <p>${new Date(day.dt_txt).toLocaleDateString()}</p>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png">
        <p>${day.main.temp} °C</p>
        <p>${day.weather[0].description}</p>
      </div>
    `;
  });
  document.getElementById("weather-result").appendChild(forecastContainer);
}
