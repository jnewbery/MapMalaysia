# MapMalaysia

MapMalaysia is a highly customizable choropleth map of Malaysia. As it stands, the map displays population density, mean income and the results from the 2013 general elections in each of Malaysia's states, but the code is easily reusable to display other data.

Code was originally borrowed from the [leaflet choropeth tutorial](http://leafletjs.com/examples/choropleth.html), but has been haevily modified.

The state boundaries are hand drawn using [an online geoJSON editor](http://blog.sallarp.com/google-maps-geojson-editor/).

## Customizing MapMalaysia

- config.js contains all the config for the choropleth map as well as the geoJSON defining the state shapes. If you want to modify the map for a different country or location. This is where you should look.
- stats.json contains the stats for the different Malaysian states. Want to show different states or change the colours on the map? Modify this file. Want to use stats from an external server or database? Modify the ajax_url field in the config.js file.
