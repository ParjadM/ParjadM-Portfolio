import React, { useState, useEffect } from 'react';
import { CloudRain, Sun, Cloud, Snowflake, CloudLightning, Loader2, MapPin } from 'lucide-react';

export const WeatherApp = ({ theme }) => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [locationName, setLocationName] = useState('New York');

    const fetchWeather = async (lat, lon) => {
        try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto`);
            const data = await res.json();
            setWeather(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch weather data.');
            setLoading(false);
        }
    };

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    
                    // Optional: Reverse geocoding to get city name (using a free API)
                    try {
                        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                        const geoData = await geoRes.json();
                        setLocationName(geoData.address.city || geoData.address.town || geoData.address.village || 'Local Weather');
                    } catch {
                        setLocationName('Local Weather');
                    }

                    fetchWeather(lat, lon);
                },
                (error) => {
                    // Default to New York if denied
                    fetchWeather(40.7128, -74.0060);
                }
            );
        } else {
            fetchWeather(40.7128, -74.0060);
        }
    }, []);

    const getWeatherIcon = (code, className) => {
        // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
        if (code <= 3) return <Sun className={className} />;
        if (code <= 48) return <Cloud className={className} />;
        if (code <= 67) return <CloudRain className={className} />;
        if (code <= 77) return <Snowflake className={className} />;
        if (code <= 82) return <CloudRain className={className} />;
        if (code <= 86) return <Snowflake className={className} />;
        if (code >= 95) return <CloudLightning className={className} />;
        return <Sun className={className} />;
    };

    const getWeatherDescription = (code) => {
        if (code === 0) return 'Clear Sky';
        if (code === 1 || code === 2 || code === 3) return 'Partly Cloudy';
        if (code === 45 || code === 48) return 'Foggy';
        if (code >= 51 && code <= 67) return 'Rainy';
        if (code >= 71 && code <= 77) return 'Snowy';
        if (code >= 80 && code <= 82) return 'Rain Showers';
        if (code >= 85 && code <= 86) return 'Snow Showers';
        if (code >= 95) return 'Thunderstorm';
        return 'Sunny';
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-b from-blue-900 to-gray-900 text-white">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>Detecting Atmosphere...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-b from-gray-800 to-gray-900 text-white p-6 text-center">
                <CloudRain className="w-12 h-12 text-red-400 mb-4" />
                <p>{error}</p>
            </div>
        );
    }

    const current = weather?.current;
    const daily = weather?.daily;

    return (
        <div className="flex flex-col h-full w-full bg-gradient-to-br from-blue-900 via-indigo-900 to-gray-900 text-white overflow-y-auto">
            {/* Header / Current Weather */}
            <div className="flex flex-col items-center justify-center pt-10 pb-8 px-4 text-center border-b border-white/10">
                <div className="flex items-center space-x-2 text-white/70 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium tracking-wide">{locationName}</span>
                </div>
                
                <div className="flex items-center justify-center mb-2">
                    {getWeatherIcon(current.weather_code, "w-16 h-16 mr-4 text-yellow-300 drop-shadow-lg")}
                    <div className="text-7xl font-light tracking-tighter">
                        {Math.round(current.temperature_2m)}°
                    </div>
                </div>
                
                <div className="text-xl font-medium text-blue-200">
                    {getWeatherDescription(current.weather_code)}
                </div>
                <div className="text-sm text-white/60 mt-1">
                    Wind: {current.wind_speed_10m} mph
                </div>
            </div>

            {/* 7-Day Forecast */}
            <div className="flex-1 p-4">
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 px-2">7-Day Forecast</h3>
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-2 border border-white/10">
                    {daily?.time.map((time, index) => {
                        const date = new Date(time);
                        // Make sure we add local timezone offset so dates don't shift
                        date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
                        
                        const dayName = index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
                        
                        return (
                            <div key={time} className="flex items-center justify-between py-3 px-4 border-b border-white/5 last:border-0 hover:bg-white/5 rounded-xl transition-colors">
                                <span className="w-16 font-medium">{dayName}</span>
                                <div className="flex-1 flex justify-center">
                                    {getWeatherIcon(daily.weather_code[index], "w-5 h-5 text-blue-300")}
                                </div>
                                <div className="w-24 flex items-center justify-end space-x-3 text-sm">
                                    <span className="text-white/60">{Math.round(daily.temperature_2m_min[index])}°</span>
                                    <span className="font-medium">{Math.round(daily.temperature_2m_max[index])}°</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
