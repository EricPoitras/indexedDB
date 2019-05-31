//prefixes of implementation that we want to test
 window.indexedDB = window.indexedDB || window.mozIndexedDB || 
 window.webkitIndexedDB || window.msIndexedDB;
 //prefixes of window.IDB objects
 window.IDBTransaction = window.IDBTransaction || 
 window.webkitIDBTransaction || window.msIDBTransaction;
 window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || 
 window.msIDBKeyRange
 
if (!window.indexedDB) {
   window.alert("Your browser doesn't support a stable version of IndexedDB.")
}

console.log("Setting forecast database...");

var logcount = 1;

var API_forecastdata;
var API_hourlyforecastdata;
var db;
var refresh = window.indexedDB.deleteDatabase("Forecast");
var request = window.indexedDB.open("Forecast", 1);
request.onerror = function(event) {
    console.log("error: ");
};
request.onsuccess = function(event) {
    db = request.result;
    console.log("success: "+ db);
};  
request.onupgradeneeded = function(event) {
    var db = event.target.result;
    var objectStore = db.createObjectStore("forecasts", {keyPath: "number"});
    var objectStore2 = db.createObjectStore("hourlyforecasts", {keyPath: "number"});
    var objectStore3 = db.createObjectStore("logs", {keyPath: "number"});
};


function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else { 
    console.log("Geolocation is not supported by this browser.");
  }
}

function showPosition(position) {
  console.log("Latitude: " + position.coords.latitude + 
  "<br>Longitude: " + position.coords.longitude);
  refreshForecast(position.coords.longitude,position.coords.latitude);
  refreshHourlyForecast(position.coords.longitude,position.coords.latitude); 
}

function refreshForecast(lon,lat){

    var apiurl = 'https://api.weather.gov/points/'+lat+','+lon;
    
    fetch(apiurl)
      .then(response => {
        return response.json()
      })
      .then(data => {
        // Work with JSON data here
        console.log(data);
        var url_forecast = data.properties.forecast;
        console.log(url_forecast);

            // Fetch weekly forecast
            fetch(url_forecast)
              .then(response => {
                return response.json()
              })
              .then(data => {
                console.log(data);
                console.log(data.properties.periods);
                    API_forecastdata = data.properties.periods;
                    for (var i in API_forecastdata) {
                        console.log(API_forecastdata[i]);
                        request = db.transaction(["forecasts"], "readwrite").objectStore("forecasts").add(API_forecastdata[i]);
                            request.onsuccess = function(event) {
                               console.log("Entry has been added to your database.");
                            };
                            request.onerror = function(event) {
                               console.log("Unable to add data! ");
                            };
                    }
              })
              .catch(err => {
                console.log("Error in fetching forecast data");
              }) 
      })
      .catch(err => {
        console.log("Error in fetching grid coordinates");
      })
    
      console.log("Database updated with forecast data");
    
}

function refreshHourlyForecast(lon,lat){

    var apiurl = 'https://api.weather.gov/points/'+lat+','+lon;
    
    fetch(apiurl)
      .then(response => {
        return response.json()
      })
      .then(data => {
        // Work with JSON data here
        console.log(data);
        var url_forecast_hourly = data.properties.forecastHourly;
        console.log(url_forecast_hourly);
        
        // Fetch weekly forecast
            fetch(url_forecast_hourly)
              .then(response => {
                return response.json()
              })
              .then(data => {
                console.log(data);
                console.log(data.properties.periods);
                    API_hourlyforecastdata = data.properties.periods;
                    for (var i in API_hourlyforecastdata) {
                        console.log(API_hourlyforecastdata[i]);
                        request = db.transaction(["hourlyforecasts"], "readwrite").objectStore("hourlyforecasts").add(API_hourlyforecastdata[i]);
                            request.onsuccess = function(event) {
                               console.log("Entry has been added to your database.");
                            };
                            request.onerror = function(event) {
                               console.log("Unable to add data! ");
                            };
                    }
              })
              .catch(err => {
                console.log("Error in fetching hourly forecast data");
              })
        
      })
      .catch(err => {
        console.log("Error in fetching grid coordinates");
      })
    
      console.log("Database updated with hourly forecast data"); 
      LogFile(logcount,"Database","Data Update Done");
}

function LogFile(logcountid,category,descriptor){
    var d = new Date();
    request = db.transaction(["logs"], "readwrite").objectStore("logs").add({number: logcountid,timestamp: d, category: category, descriptor: descriptor});
    request.onsuccess = function(event) {
        console.log("Log entry has been added to your database.");
    };
    request.onerror = function(event) {
        console.log("Unable to add data to logs!");  
    };
    
    logcount++;
}

getLocation();
