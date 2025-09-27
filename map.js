import { openRouteServiceRequest } from './ors_request.js';
import { isochroneColors } from './isochroneColors.js';

// Initialize the map
const map = L.map('map').setView([53.555, 10], 13);

// Add CartoDB Dark Matter tile layer
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
}).addTo(map);


/************
 ****
 * Click listeners for map and buttons
 *****
 *************************/

// Store clicked coordinates globally
let clickedCoordinates = null;

// Add click listener to capture coordinates
map.on('click', function (e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    console.log(`Clicked coordinates: ${lat}, ${lng}`);

    // Store coordinates for isochrone request
    clickedCoordinates = { lat, lng };

    // Show the isochrone menu
    const menu = document.getElementById('isochrone-menu');
    // Given a geographical coordinate, returns the corresponding pixel coordinate relative to the map container.
    const containerPoint = map.latLngToContainerPoint(e.latlng);

    // Position menu at click location (with some offset to avoid covering the click point)
    menu.style.left = (containerPoint.x + 10) + 'px';
    menu.style.top = (containerPoint.y + 10) + 'px';
    menu.style.display = 'block';
});

// click listener for cancel button
document.getElementById('cancel-btn').addEventListener('click', function () {
    // Hide the isochrone menu
    const menu = document.getElementById('isochrone-menu');
    menu.style.display = 'none';
})

// Click listener to handle request button
document.getElementById('request-btn').addEventListener('click', async function () {
    if (!clickedCoordinates) return;

    console.log('Requesting isochrone:', {
        coordinates: clickedCoordinates,
    });

    // Hide menu
    document.getElementById('isochrone-menu').style.display = 'none';

    const orsResponse = await openRouteServiceRequest(clickedCoordinates);
    // add received isochrones as geojson layer
    let addedLayerId = addIsochronesToMap(orsResponse);
    // add a circle layer at the center of the isochrones. Pass also the corresponding isochrone layerId
    addCenterCircleToMap(orsResponse.features[0].properties.center.reverse(), addedLayerId);  // reverse coords as ors returns lng first
});


/************
 ****
 * Add an remove layers to/from map. 
 *****
 *************************/


/**
 * Adds a circle marker to the map
 * Added a the isochrones' center coordinates
 * Has an on click listener to hide (remove) the corresponding isochrones geojson layer.
 * The isochrones shall be hidden so that clicks on the map remain possible, even in aareas where the isochrones are.
 * 
 * @param {*} isochronesCenterCoords 
 * @param {*} isochronesLayerId 
 */
function addCenterCircleToMap(isochronesCenterCoords, isochronesLayerId) {
    const point = L.circleMarker(isochronesCenterCoords, {
        radius: 10,
        color: '#ff7800',
        weight: 2,
        opacity: 1,
        fillOpacity: 1
    }).addTo(map);

    point.options.metadata = {
        isochronesLayerId: isochronesLayerId
    };

    // Add click event handler to remove the corresponding isochrones layer
    point.on('click', function (e) {
        removeLayer(point.options.metadata.isochronesLayerId);
    });
}


/**
 * Add the isochrones to the map
 * Sets the color of each isochrone based on the isochrone's distance according to 
 * Binds a popup to each isochrone in order to show its population value.
 * 
 * 
 * @param {*} orsResponse | geojson
 * @returns layerId | int 
 */
function addIsochronesToMap(orsResponse) {
    // add geojson like orsResponse as new layer.
    const geoJsonLayer = L.geoJSON(orsResponse, {
        style: {
            color: '#ff7800',
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.35
        },
        onEachFeature: function (feature, layer) {
            // for each feature: set the color based on its isochrone distance
            layer.setStyle({ fillColor: isochroneColors[feature.properties.value] });
            layer.options.metadata = {
                // add the population value as metadata
                population: feature.properties.total_pop
            };

            // Bind popup with population data. To be shown on click on the isochrone.
            layer.bindPopup(`Population: ${feature.properties.total_pop}`);
        }
    }).addTo(map);

    console.log("added new isochrones layer with layerId: ", geoJsonLayer._leaflet_id)

    return geoJsonLayer._leaflet_id
}


/**
 * Removes layer with layerId from map.
 * @param {} layerId : int
 */
function removeLayer(layerId) {
    console.log("removing layer", layerId)
    map.eachLayer(function (layer) {
        if (layer._leaflet_id == layerId) {
            if (map.hasLayer(layer)) {
                map.removeLayer(layer);
            }
        }
    });
}
