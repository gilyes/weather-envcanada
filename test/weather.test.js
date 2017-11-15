var expect = require("chai").expect;
var fs = require("fs");
var rewire = require("rewire");
var weather = rewire("../lib/weather");
var nock = require("nock");

describe("weather", function() {
    describe(".getWeatherBySiteName()", function() {
        it("should return weather data for existing site name", function(done) {
            var siteListXml = fs.readFileSync('test/data/siteList.xml', 'utf8');
            nock('http://dd.weatheroffice.ec.gc.ca')
                .get('/citypage_weather/xml/siteList.xml')
                .reply(200, siteListXml);

            var weatherXml = fs.readFileSync('test/data/cityWeather.xml', 'utf8');
            nock('http://dd.weatheroffice.ec.gc.ca')
                .get('/citypage_weather/xml/AB/s0000045_e.xml')
                .reply(200, weatherXml);

            weather.getWeatherBySiteName("Edmonton", "AB", function(error, weather) {
                expect(weather).to.have.property('temperature', '-20');
                done();
            });
        });

        it("should return no weather data for invalid site name", function(done) {
            // Nock doesn't seem to set error in callback when replying with error status
            //nock('http://dd.weatheroffice.ec.gc.ca')
            //    .get('/citypage_weather/xml/AB/INVALIDCODE_e.xml')
            //    .reply(404);

            weather.getWeatherBySiteName("INVALIDNAME", "AB", function(error, weather) {
                expect(error).to.exist;
                done();
            });
        })
    });

    describe(".getWeatherBySiteCode()", function() {
        it("should return weather data for existing site code", function(done) {
            var xml = fs.readFileSync('test/data/cityWeather.xml', 'utf8');
            nock('http://dd.weatheroffice.ec.gc.ca')
                .get('/citypage_weather/xml/AB/s0000045_e.xml')
                .reply(200, xml);

            weather.getWeatherBySiteCode("s0000045", "AB", function(error, weather) {
                expect(weather).to.have.property('temperature', '-20');
                done();
            });
        });

        it("should return no weather data for invalid site code", function(done) {
            // Nock doesn't seem to set error in callback when replying with error status
            //nock('http://dd.weatheroffice.ec.gc.ca')
            //    .get('/citypage_weather/xml/AB/INVALIDCODE_e.xml')
            //    .reply(404);

            weather.getWeatherBySiteCode("INVALIDCODE", "AB", function(error, weather) {
                expect(error).to.exist;
                done();
            });
        })
    });

    describe(".getSiteByName()", function() {

        it("should return existing site (matching casing)", function(done) {
            var xml = fs.readFileSync('test/data/siteList.xml', 'utf8');
            nock('http://dd.weatheroffice.ec.gc.ca')
                .get('/citypage_weather/xml/siteList.xml')
                .reply(200, xml);

            weather.getSiteByName('Edmonton', 'AB', function(error, site) {
                expect(site).to.be.deep.equal({
                    siteName: 'Edmonton',
                    code: 's0000045',
                    province: 'AB'
                });
                done();
            });
        });

        it("should return existing site (different casing)", function(done) {
            var xml = fs.readFileSync('test/data/siteList.xml', 'utf8');
            nock('http://dd.weatheroffice.ec.gc.ca')
                .get('/citypage_weather/xml/siteList.xml')
                .reply(200, xml);

            weather.getSiteByName('edmonton', 'ab', function(error, site) {
                expect(site).to.be.deep.equal({
                    siteName: 'Edmonton',
                    code: 's0000045',
                    province: 'AB'
                });
                done();
            });
        });

        it("should return error for non-existent site", function(done) {
            var xml = fs.readFileSync('test/data/siteList.xml', 'utf8');
            nock('http://dd.weatheroffice.ec.gc.ca')
                .get('/citypage_weather/xml/siteList.xml')
                .reply(200, xml);

            weather.getSiteByName('NON-EXISTENT SITE', 'AB', function(error, site) {
                expect(error).to.exist
                    .and.be.instanceof(Error)
                    .and.have.property('message', 'No site with this name found.');
                done();
            });
        });
    });

    describe(".parseSiteXml()", function() {

        var parseSiteXml = weather.__get__("parseSiteXml");

        it("should parse out sites into an array", function(done) {
            var xml = fs.readFileSync('test/data/siteList.xml', 'utf8');

            parseSiteXml(xml, function(error, sites) {
                expect(sites).to.be.an('array');
                done();
            });
        });

        it("should parse out site properties", function(done) {
            var xml = fs.readFileSync('test/data/siteList.xml', 'utf8');

            parseSiteXml(xml, function(error, sites) {
                expect(sites).to.have.deep.property('[44]')
                    .to.be.deep.equal({
                        siteName: 'Edmonton',
                        code: 's0000045',
                        province: 'AB'
                    });
                done();
            });
        });

    });

    describe(".parseWeatherXml()", function() {

        var parseWeatherXml = weather.__get__("parseWeatherXml");

        it("should parse out current temperature", function(done) {
            var xml = fs.readFileSync('test/data/cityWeather.xml', 'utf8');
            parseWeatherXml(xml, function(error, weatherData) {
                expect(weatherData).to.have.property('temperature', '-20');
                done();
            });
        });

        it("should parse out current temperature unit", function(done) {
            var xml = fs.readFileSync('test/data/cityWeather.xml', 'utf8');
            parseWeatherXml(xml, function(error, weatherData) {
                expect(weatherData).to.have.property('temperatureUnit', 'C');
                done();
            });
        });

        it("should parse out current conditions", function(done) {
            var xml = fs.readFileSync('test/data/cityWeather.xml', 'utf8');
            parseWeatherXml(xml, function(error, weatherData) {
                expect(weatherData).to.have.property('conditions', 'Clear');
                done();
            });
        });

        it("should parse out warnings", function(done) {
            var xml = fs.readFileSync('test/data/cityWeather.xml', 'utf8');
            parseWeatherXml(xml, function(error, weatherData) {
                expect(weatherData).to.have.property('warnings')
                    .that.is.an('array')
                    .with.deep.property('[0]')
                    .that.deep.equal({
                        description: 'EXTREME COLD WARNING IN EFFECT',
                        priority: 'high'
                    });
                done();
            });
        });

        it("should parse empty warnings when no warnings", function(done) {
            var xml = fs.readFileSync('test/data/cityWeather-nowarnings.xml', 'utf8');
            parseWeatherXml(xml, function(error, weatherData) {
                expect(weatherData).to.have.property('warnings').that.is.empty;
                done();
            });
        });

        it("should parse out forecasts", function(done) {
            var xml = fs.readFileSync('test/data/cityWeather.xml', 'utf8');
            parseWeatherXml(xml, function(error, weatherData) {
                expect(weatherData).to.have.property('forecasts')
                    .that.is.an('array')
                    .with.length.of('8')
                    .with.deep.property('[0]')
                    .that.deep.equals({
                        period: 'Thursday night',
                        temperature: `Low minus 21.`,
                        pop: '',
                        popSummary: ``,
                        cloudPopSummary: `Clear.`,
                        relativeHumidityPercent: '75',
                        windSummary: `Wind northwest 20 km/h gusting to 40 becoming light this evening.`,
                        windChillSummary: `Wind chill minus 29.`,
                        summary: `Clear.`,
                        fullSummary: `Clear. Wind northwest 20 km/h gusting to 40 becoming light this evening. Low minus 21. Wind\r\n                chill minus 29.\r\n            `
                    });
                done();
            });
        });
        
        it("should parse out forecast with blank windChillSummary if no windChill data exists", function(done) {
            var xml = fs.readFileSync('test/data/cityWeather.xml', 'utf8');
            parseWeatherXml(xml, function(error, weatherData) {
                expect(weatherData.forecasts[2]).to.have.property('windChillSummary')
                    .that.is.a('string')
                    .with.length.of('0')
                done();
            });
        });

        it("should parse empty forecasts when no forecasts", function(done) {
            var xml = fs.readFileSync('test/data/cityWeather-noforecasts.xml', 'utf8');
            parseWeatherXml(xml, function(error, weatherData) {
                expect(weatherData).to.have.property('forecasts').that.is.empty;
                done();
            });
        });
    })
});