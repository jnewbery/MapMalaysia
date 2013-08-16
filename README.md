# MapMalaysia

MapMalaysia is a highly customizable choropleth map of Malaysia. It currently displays population density, mean income and the results from the 2013 general elections in each of Malaysia's states, but the code is easily reusable to display other data.

Code was originally borrowed from the [leaflet choropeth tutorial](http://leafletjs.com/examples/choropleth.html), but has been heavily modified.

The state boundaries were hand drawn using [an online geoJSON editor](http://blog.sallarp.com/google-maps-geojson-editor/).

## Files

The states are constructed using two source files:

- *frontiers.geosjson* - contains definitions for the frontiers between states (eg Selangor-Pahang, Kedah-Perlis, etc).
- *states.json* - contains pseudo-geoJSON definitions of the states. It's valid geoJSON except that the LineSegments are not defined as arrays of coordinates, they're defined as a list of frontier segments which are themselves defined in *frontiers.geojson*.

*construct.js* then compiles those two files into a valid *states.geojson* file.

## Try it out!

There's a github page [here](http://jonnynewbs.github.io/MapMalaysia).

## Customizing MapMalaysia

- config.js contains the config for the choropleth map.
- The geoJSON defining the state shapes is constructed from the frontiers.geojson and states.json files as explained above. Those are where you should look if you want to modify the map for a different country or location.
- stats.json contains the stats for the different Malaysian states. If you want to display different statistics or change the colours on the map, you should modify this file. If you want to use stats from an external server or database, you should modify the stats_url field in the config.js file and then serve up a stats.json file from your external server.