# Retrieve weather data from Environment Canada #

## Getting weather ##

```javascript
var weather = require("weather-envcanada");

weather.getWeatherBySiteName("Edmonton", "AB", function(error, weatherData) {});
weather.getWeatherBySiteCode("s0000045", "AB", function(error, weatherData) {});
```

#### Result: ####

```javascript
{
  "temperature": "-23",
  "temperatureUnit": "C",
  "conditions": "Light Snow",
  "warnings": [
    {
      "description": "SNOWFALL WARNING IN EFFECT",
      "priority": "high"
    }
  ],
  "forecasts": [
    {
      "period": "Thursday night",
      "temperature": "Low minus 21.",
      "pop": "",
      "popSummary": "",
      "cloudPopSummary": "Clear.",
      "relativeHumidityPercent": "75",
      "windSummary": "Wind northwest 20 km/h gusting to 40 becoming light this evening.",
      "windChillSummary": "Wind chill minus 29."
      "summary": "Clear.",
      "fullSummary": "Clear. Wind northwest 20 km/h gusting to 40 becoming light this evening. Low minus 21. Wind\r\n                chill minus 29.\r\n            ",
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

```javascript
{
  "siteName": "Edmonton",
  "code": "s0000045",
  "province": "AB" 
}
```
