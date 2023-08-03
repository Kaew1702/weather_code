const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

// Meteo API Endpoint URL (replace with the actual Meteo API URL)
const METEO_API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=16.7483&longitude=101.16438&daily=weathercode,temperature_2m_max,uv_index_max,rain_sum&timezone=Asia%2FBangkok';

app.get('/weather', async(req, res) => {
    try {
        // Fetch weather forecast data from the Meteo API
        const response = await axios.get(METEO_API_URL, {
            params: {
                latitude: '16.7483', // Replace with the latitude of your location
                longitude: '101.16483', // Replace with the longitude of your location
            },
        });

        // Extract the weather forecast data for 7 days
        const forecastData = response.data.daily;

        // Format the weather data into the Flex Message template
        const flexMessage = createFlexMessage(forecastData);

        // Add the prefix to the JSON data
        const jsonDataWithPrefix = '___TEMPLATE___ ' + jsonStringifyMinimized(flexMessage);
        // Send the response with the prefixed JSON data
        res.set('Content-Type', 'application/json');
        // Send the Flex Message as a response
        res.send(jsonDataWithPrefix);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

// Function to create the Flex Message template
function createFlexMessage(forecastData) {
    const flexMessage = {
        type: 'flex',
        altText: '7-day Weather Forecast',
        contents: {
            type: 'carousel',
            contents: forecastData.time.map((date, index) => {
                return {
                    type: 'bubble',
                    size: 'micro',
                    hero: {
                        type: 'image',
                        url: `https://raw.githubusercontent.com/Kaew1702/weather_code/8ab06bb722e1c32002e0da89ad05bd6d081752b1/${forecastData.weathercode[index]}.png`,
                        size: 'full',
                        aspectMode: 'cover',
                        aspectRatio: '320:213',
                    },
                    body: {
                        type: 'box',
                        layout: 'vertical',
                        contents: [{
                                type: 'text',
                                text: formatDate(date),
                                weight: 'bold',
                                size: 'sm',
                                wrap: true,
                            },
                            {
                                type: 'box',
                                layout: 'vertical',
                                contents: [], // Add additional contents here if needed for each day
                            },
                            {
                                type: 'text',
                                text: `Max temp ${forecastData.temperature_2m_max[index]} °C`,
                            },
                            {
                                type: 'text',
                                text: `Rain sum ${forecastData.rain_sum[index]} mm`,
                            },
                            {
                                type: 'text',
                                text: `UV index ${forecastData.uv_index_max[index]}`,
                            },
                        ],
                        spacing: 'sm',
                        paddingAll: '13px',
                    },
                };
            }),
        },
    };

    return flexMessage;
}
// Function to minimize JSON output by removing unnecessary spaces and line breaks
function jsonStringifyMinimized(obj) {
    return JSON.stringify(obj).replace(/\s+/g, '');
}
// Function to format the date in the Flex Message
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});