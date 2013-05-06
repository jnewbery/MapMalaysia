MapMalaysia
===========

An interactive map of Malaysia. As it stands, the map displays population density in each of Malaysia's states, but the code is easily reusable to display other data.

Most of the code is taken from the leaflet choropeth tutorial: http://leafletjs.com/examples/choropleth.html

I couldn't find a good source of geographic data for Malaysia, so the states are hand drawn using the geoJSON editor here: http://blog.sallarp.com/google-maps-geojson-editor/ . If anyone knows of a good source of data or a better editor, let me know!

Files
-----

- geo.js contains all the geoJSON, (mostly) broken down into frontiers and collected into polygons. Once that work is complete, the json/<state>.json files can be removedg- Leaflet js and css files included.
- Bootstrap js and css included
