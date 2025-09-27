import Openrouteservice from 'https://cdn.jsdelivr.net/npm/openrouteservice-js@latest/dist/ors-js-client.js';


var API_KEY = prompt("Enter API KEY");


/**
 *  Makes request to openRouteService for the clicked Coordinates.
 *  Always requests 5 isochrones for 0.2, 0.4, 0.6, 0.8 and 1km walking profiles.
 *  Also requests the attribute total_pop (population) for each of the isochrones.
 * 
 *  Returns a geojson with 1 feature per isochrone. 
 *  Each feature's property "total_pop" contains an int for the population count
 * 
 */
async function openRouteServiceRequest(clickedCoordinates) {
    const Isochrones = new Openrouteservice.Isochrones({
         api_key:  API_KEY   
    });
    try {
        let response = await Isochrones.calculate({
            locations: [[clickedCoordinates.lng, clickedCoordinates.lat]],
            profile: 'foot-walking',
            range: [0.2, 0.4, 0.6, 0.8, 1],
            units: 'km',
            range_type: 'distance',
            area_units: 'km',
            attributes:["total_pop"]
        })

        return sortFeaturesByDistanceDesc(response);

    } catch (err) {
        console.log("An error occurred when fetching isocrones: " + err)
        console.error(await err.response)
        
        // show error message to user
        alert("An error occrured when fetching isochrones.")
    }
}

/**
 * This function iterates over all the geojson's features
 * and sorts them by their isochrone distance value.
 * This is used so that the isochrones with the smallest area are shown on top
 * when this geojson is added to the map.
 * 
 * The smallest isochrones have to be shown on top so that they remain clickable (not covered by larger isochrones)
 * 
 * @param {*} orsResponse : geojson
 * @returns geojson
 */
function sortFeaturesByDistanceDesc(orsResponse) {
    orsResponse.features = orsResponse.features.sort((a, b) => {
        const valueA = a.properties?.value || 0;
        const valueB = b.properties?.value || 0;
        return valueB - valueA; // Descending order (largest to smallest)
    });

    return orsResponse;
}

export { openRouteServiceRequest };
