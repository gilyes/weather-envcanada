# Retrieve weather data from Environment Canada #
## Getting weather ##
```javascript
var weather = require("weather-envcanada");

weather.getWeatherBySiteName("Edmonton", "AB", function(error, weatherData) {});
weather.getWeatherBySiteCode("s0000045", "AB", function(error, weatherData) {});
```
#### Result: ####
```json
{
  "temperature": "-22.7°C",
  "conditions": "Light Snow",
  "warnings": [
    {
      "description": "SNOWFALL WARNING IN EFFECT",
      "priority": "high"
    }
  ],
  "forecasts": [
    {
      "period": "Friday night",
      "summary": "Snow.",
      "temperature": "Low minus 24.",
      "pop": ""
    },
    ...
  ]
}
```
## Getting site code ##
```javascript
weather.getSiteByName("Edmonton", "AB", function(error, site) {});
```
#### Result: ####
```json
{
  "siteName": "Edmonton",
  "code": "s0000045",
  "province": "AB" 
}
```
