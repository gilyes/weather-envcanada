'use strict';

var request = require("request");
var xml2js = require("xml2js");
require('array.prototype.find');

module.exports = {
    getWeatherBySiteName: getWeatherBySiteName,
    getWeatherBySiteCode: getWeatherBySiteCode,
    getSiteByName: getSiteByName
};

function getWeatherBySiteName(siteName, province, callback) {
    getSiteUrl(siteName, province, function(error, url) {
        if (error) {
            return callback(error);
        }

        return getWeather(url, callback);
    });

}

function getWeatherBySiteCode(siteCode, province, callback) {
    var url = buildSiteUrl(siteCode, province);
    return getWeather(url, callback);
}

function getSiteByName(siteName, province, callback) {
    request({
        "rejectUnauthorized": false,
        "url": "http://dd.weatheroffice.ec.gc.ca/citypage_weather/xml/siteList.xml"
    }, function(error, response, body) {
        if (error) {
            return callback(error);
        }

        parseSiteXml(body, function(error, sites) {
            if (error) {
                return callback(error);
            }

            var site = sites.find(function(site) {
                // siteName may or may not contain province
                return site.siteName.trim().toUpperCase() === siteName.trim().toUpperCase() &&
                    (!province || site.province.trim().toUpperCase() === province.trim().toUpperCase());
            });

            if (site) {
                return callback(null, site);
            }
            else {
                return callback(new Error('No site with this name found.'))
            }
        });
    })
}

function getWeather(url, callback) {
    request({
        "rejectUnauthorized": false,
        "url": url
    }, function(error, response, body) {
        if (error) {
            return callback(error);
        }

        parseWeatherXml(body, callback);
    })
}

function getSiteUrl(siteName, province, callback) {
    getSiteByName(siteName, province, function(error, site) {
        if (error) {
            return callback(error);
        }

        var url = buildSiteUrl(site.code, site.province);
        return callback(null, url);
    });
}

function buildSiteUrl(siteCode, province) {
    return 'http://dd.weatheroffice.ec.gc.ca/citypage_weather/xml/' + province + '/' + siteCode + '_e.xml'
}

function parseSiteXml(xml, callback) {
    xml2js.parseString(xml, function(error, json) {
        if (error) {
            return callback(error);
        }

        var sites = [];

        json.siteList.site.forEach(function(site) {
            sites.push({
                siteName: site.nameEn[0],
                code: site.$.code,
                province: site.provinceCode[0],
            });
        });

        return callback(null, sites);
    });
}

function parseWeatherXml(xml, callback) {
    xml2js.parseString(xml, function(error, json) {
        if (error) {
            return callback(error);
        }

        var weather = {
            temperature: 'N/A',
            temperatureUnit: 'N/A',
            conditions: 'N/A',
            warnings: [],
            forecasts: [],
            relativeHumidityPercent: 0,
            windSummary: 'N/A',
            windChillSummary: 'N/A'
        };

        var weatherRoot = json.siteData;

        var currentConditions = weatherRoot.currentConditions[0];
        var temperature = currentConditions.temperature[0];
        weather.conditions = currentConditions.condition[0];
        weather.temperature = parseFloat(temperature._).toFixed(0);
        weather.temperatureUnit = temperature.$.units;

        if (weatherRoot.forecastGroup[0].forecast) {
            weatherRoot.forecastGroup[0].forecast.forEach(function(forecast) {
                var pop = forecast.abbreviatedForecast[0].pop[0]._;
                weather.forecasts.push({
                    period: forecast.period[0]._,
                    temperature: forecast.temperatures[0].textSummary[0],
                    pop: pop && pop.length > 0 ? 'POP ' + pop + forecast.abbreviatedForecast[0].pop[0].$.units : '',
                    popSummary: forecast.precipitation[0].textSummary[0],
                    cloudPopSummary: forecast.cloudPrecip[0].textSummary[0],
                    relativeHumidityPercent: forecast.relativeHumidity[0]._,
                    windSummary: (forecast.winds[0].hasOwnProperty('textSummary')) ? forecast.winds[0].textSummary[0] : '',
                    windChillSummary: (forecast.hasOwnProperty('windChill')) ? forecast.windChill[0].textSummary[0] : '',
                    summary: forecast.abbreviatedForecast[0].textSummary[0] + '.',
                    fullSummary: forecast.textSummary[0]
                });
            });
        }

        weatherRoot.warnings.forEach(function(warning) {
            if (warning.event) {
                weather.warnings.push({
                    description: warning.event[0].$.description,
                    priority: warning.event[0].$.priority
                });
            }
        });

        return callback(null, weather);
    });
}
