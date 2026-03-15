window.NexoraRegistry.register({
    id: 'weather',
    name: 'Weather API',
    intents: [/weather (in|for|at) (.+)/i, /temperature (in|at|for) (.+)/i],

    async handle(match, appState = {}) {
        const city = match[2].trim();
        
        // Helper to convert WMO codes to text (Mapping for .weather-desc)
        const getWeatherDesc = (code) => {
            const mapping = {
                0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
                45: 'Fog', 48: 'Depositing rime fog', 51: 'Light drizzle',
                61: 'Slight rain', 71: 'Slight snow', 95: 'Thunderstorm'
            };
            return mapping[code] || 'Cloudy';
        };

        try {
            // 1. Geocoding with timeout/error handling
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
            if (!geoRes.ok) throw new Error('Geocoding service down');
            
            const geoData = await geoRes.json();
            if (!geoData.results?.length) {
                return { text: `Sorry, I couldn't find "${city}". Check the spelling?` };
            }

            const { latitude, longitude, name, country } = geoData.results[0];

            // 2. Weather Fetch with Unit handling
            const isFahrenheit = appState.units === 'imperial';
            const params = new URLSearchParams({
                latitude,
                longitude,
                current_weather: true,
                temperature_unit: isFahrenheit ? 'fahrenheit' : 'celsius',
                wind_speed_unit: isFahrenheit ? 'mph' : 'kmh'
            });

            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
            const weatherData = await weatherRes.json();
            const current = weatherData.current_weather;

            const tU = isFahrenheit ? '°F' : '°C';
            const wU = isFahrenheit ? 'mph' : 'km/h';
            const description = getWeatherDesc(current.weathercode);

            const html = `
            <div class="rich-widget">
                <div class="widget-title">
                    <i class="fas fa-location-dot"></i> ${name}, ${country}
                </div>
                <div class="weather-main">
                    <div class="weather-temp">${Math.round(current.temperature)}${tU}</div>
                    <i class="fas fa-cloud weather-icon"></i>
                </div>
                <div class="weather-desc">${description}</div>
                <div class="weather-grid">
                    <div><i class="fas fa-wind"></i> ${current.windspeed} ${wU}</div>
                    <div><i class="fas fa-compass"></i> ${current.winddirection}°</div>
                </div>
            </div>`;
            
            return { 
                html, 
                text: `It's currently ${description} and ${Math.round(current.temperature)}${tU} in ${name}.` 
            };

        } catch (err) {
            console.error("Weather Plugin Error:", err);
            return { text: "I'm having trouble fetching the weather. Please try again in a moment." };
        }
    }
});