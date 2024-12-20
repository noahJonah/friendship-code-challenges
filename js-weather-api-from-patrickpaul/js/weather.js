const my_APIKey = "";
const weather_form = document.getElementById("weather-form");

function FetchWeatherData(city, api_key) {
    this.city = city;
    this.api_key = api_key;
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${api_key}&units=metric`;

    this.fetch_weather = async function () {
        let icons = [];
        let days = [];
        let high_temps = [];
        let low_temps = [];

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`City not found. HTTP status: ${response.status}`);
        }
        const weather_data = await response.json();
        if (weather_data.cod === "200" && weather_data.list) {
            const current_weather = weather_data.list[0];
            
            const utc_date = new Date(current_weather.dt * 1000);

            const city_date = new Date(utc_date.getTime() + weather_data.city.timezone * 1000);

            const cloud_quantity = current_weather.clouds.all;
            const current_icon = weather_data.list[0].weather[0].icon;
            const daily_weather = weather_data.list.filter(item => item.dt_txt.includes("12:00:00"));

            
            const current_temp = weather_data.list[0].main.temp;

            const cityTimezoneOffset = current_weather.timezone; 
            const current_date = new Date((current_weather.dt + cityTimezoneOffset) * 1000);
            const current_day_en_time = city_date.toLocaleDateString('en-US',
                { weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: false });
            let cloud_description = "";

            if (cloud_quantity > 80) {
                cloud_description = "many clouds";
            } else if (cloud_quantity > 20) {
                cloud_description = "normal clouds";
            } else {
                cloud_description = "few clouds";
            }

            daily_weather.slice(1, 6).forEach(day => {
                const date = new Date(day.dt * 1000);
                const day_name = date.toLocaleDateString('en-US', { weekday: 'long' });
                const temp_high = day.main.temp_max || day.main.temp;
                const temp_low = day.main.temp_min || day.main.temp;
                const icon = day.weather[0].icon;

                days.push(day_name);
                icons.push(icon);
                high_temps.push(temp_high);
                low_temps.push(temp_low);
            });


            let point;
            if (cloud_quantity < 20) {
                point = 'High UV risk! Wear sunscreen.';
                console.log(point);
            } else if (cloud_quantity > 50) {
                point = 'Low UV risk due to cloud cover.';
                console.log(point);
            }

            return {
                city: weather_data.city.name,
                current_day_en_time: current_day_en_time,
                current_temp: current_temp,
                current_icon: current_icon,
                humidity: weather_data.list[0].main.humidity,
                wind: weather_data.list[0].wind.speed,
                cloud_description: cloud_description,
                icons: icons,
                days: days,
                high_temps: high_temps,
                low_temps: low_temps, 
                point: point
            };

        } else {
            throw new Error("Unable to fetch cloud quantity data!");
        }
    };
}

function SetWeatherData() {
    this.set_id_data = function (data, html_id) {
        document.getElementById(html_id).innerText = data;
    };

    this.current_day_icon = function (object_data, id) {
        document.getElementById(id).src = `https://openweathermap.org/img/wn/${object_data}@2x.png`;
    }

    this.set_weekly_data = function (container_id, days, icons, high_temps, low_temps) {
        const container = document.querySelector(container_id);
        container.innerHTML = ``;

        days.forEach((day_name, index) => {
            const element = document.createElement("div");
            element.innerHTML = `
                <p>${day_name}</p>
                <img src="https://openweathermap.org/img/wn/${icons[index]}@2x.png" alt="Weather icon" />
                <span class="temps">
                    <p>${Math.round(high_temps[index])}°</p>
                    <p>${Math.round(low_temps[index])}°</p>
                </span>
            `;
            container.appendChild(element);
        });
    };
}

weather_form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const city = document.getElementById("city-input").value;

    const fetched_weather = new FetchWeatherData(city, my_APIKey);
    try {
        const forecast = await fetched_weather.fetch_weather();
        console.log(forecast);

        const set_weather = new SetWeatherData();
        set_weather.set_id_data(forecast.city, "city");
        set_weather.set_id_data(forecast.city, "forecast-city");
        set_weather.set_id_data(forecast.current_temp, "temperature");
        set_weather.set_id_data(forecast.current_day_en_time, "current-day-time");
        set_weather.set_id_data(forecast.humidity, "humidity-percentage");
        set_weather.set_id_data(forecast.wind, "wind-speed");
        set_weather.set_id_data(forecast.cloud_description, "clouds-status");

        set_weather.current_day_icon(forecast.current_icon, "current-icon")

        set_weather.set_weekly_data(
            "#future-forecast", forecast.days, forecast.icons, 
            forecast.high_temps, forecast.low_temps
        );

        // Weather points
        set_weather.set_id_data(forecast.point, "point-point");

    } catch (error) {
        console.log("Error while fetching data:", error);
    }
});

