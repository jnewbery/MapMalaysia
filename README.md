MapMalaysia
===========

An interactive map of Malaysia. As it stands, the map displays population density in each of Malaysia's states, but the code is easily reusable to display other data.

Most of the code is taken from the leaflet choropeth tutorial: http://leafletjs.com/examples/choropleth.html

I couldn't find a good source of geographic data for Malaysia, so the states are hand drawn using the geoJSON editor here: http://blog.sallarp.com/google-maps-geojson-editor/ . If anyone knows of a good source of data or a better editor, let me know!

Files
-----

Leaflet js and css files included.

json directory contains:
- *states.json* - the actual json file that is used to render the map.
- a json file for each individual state
- a path.json file that contains the frontiers between (most of) the states, since those paths need to be reused. This file is not valid geoJSON.

Bugs
----

- the Kuala Lumpur and Putrajaya enclaves in Selangor are not rendering properly, although the Selangor border is shown correctly.