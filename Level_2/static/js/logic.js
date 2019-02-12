// USGS Data
var URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var platesJSON = "/static/js/PB2002_plates.json"

// Perform a GET request to the query URL
d3.json(URL, function(data) {
    d3.json(platesJSON, function(plates) {
        // Once we get a response, send the data.features object to the createFeatures function
        createFeatures(data.features, plates.features)
    })
});


// function that creates the circle markers and gets colors plus size based on magnitude
function createFeatures(earthquakeData, platesData) {

    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: markerSize(feature.properties.mag),
                fillColor: getColor(feature.properties.mag),
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        },
        // creates the pop up information when a marker is clicked by the user
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h3>" + feature.properties.place +
                "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
        }
    });

    var tPlates = L.geoJSON(platesData, {
            onEachFeature: function(feature, layer) {
                layer.bindPopup("<h3>" + feature.properties.PlateName + "</h3>");
            }
        })
        // Sending our earthquakes layer to the createMap function
    createMap(earthquakes, tPlates);
};

// function increases the size of the markers using a multiplier of 3
function markerSize(mag) {
    return mag * 3;
};

// function that sets the colors and is utilized for the circle markers and legend
function getColor(d) {
    return d > 6 ? '#b10026' :
        d > 5 ? '#e31a1c' :
        d > 4 ? '#fc432a' :
        d > 3 ? '#fd8d3c' :
        d > 2 ? '#feb24c' :
        d > 1 ? '#f7fcb9' :
        d >= 0 ? '#78c679' :
        '#238443';
};

function createMap(earthquakesData, platesData) {

    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.dark",
        accessToken: API_KEY
    });

    var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.outdoors",
        accessToken: API_KEY
    });

    var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.satellite",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Dark Map": darkmap,
        "Outdoor Map": outdoors,
        "Satellite": satellite,
        "Street Map": streetmap

    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakesData,
        Plates: platesData // level 2 add
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 3,
        layers: [streetmap, earthquakesData, platesData]
    });

    // Setting up the legend
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function(myMap) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 1, 2, 3, 4, 5, 6],
            labels = [];
        // labels = ["#238443", "#78c679", "##f7fcb9", "#feb24c", "#feb24c", "#fc432a", "#e31a1c", "#b10026"];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(myMap);

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);


};