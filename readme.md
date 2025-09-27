Meeting 23.09.2025
Integrating Dynamic Accessibility Feature in Dilan

The dynamic Accessibility feature includes the following steps
- show context menu at (right?) click on map to request isochrones for the clicked location
- set isochrone settings (transport mode, travel time)
- make request to OSR public endpoint 
- receive isochrone from OSR endpoint
    -> returned as geojson with a "population_stats" property
- visualize isochrone on map
- show population count for isochrone

DILAN Tool Info
- uses leaflet
- can easily add geojson to map
- has click listener for map clicks that gets clicked position


Implementation details
- for now implementation in Front-End only
- only requests population stats from OSR
- request to ORS is made from front-end , using the  API key (hopefully no CORS issues ?!)
- Population stats are shown in the context menu directly? in a modal? in some menu panel?
    --> I think for now i will make a dedicated menu in a simple div that can be moved where needed.

- make vanilla js version.
- add documenttion of open route service for the Dilan group
    -> also where to get the API-key from


TODO

remove option of time and mode in dialoque - done
just "request isochrone" - done
make cancel button work - done 
display 0.2, 0.4, 0.6, 0.8, 1.0 kilometers isochrones  - done
show clicked coordinate as center cirlcle - done

hide isochrones on click on center circlee - done
clean coode - done
import from cdn -done 
