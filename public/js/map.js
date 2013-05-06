var eastMalaysiaLatLon = [3.8, 102],
    eastMalaysiaZoom = 7,
    westMalaysiaLatLon = [4, 114.4],
    westMalaysiaZoom = 7;

var map = L.map('map').setView(eastMalaysiaLatLon, eastMalaysiaZoom);

var cloudmade = L.tileLayer('http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png', {
	attribution: 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade',
	key: 'BC9A493B41014CAABB98F0471D759707',
	styleId: 22677
}).addTo(map);
// control that shows state info on hover
var info = L.control();
info.onAdd = function (map) {
	this._div = L.DomUtil.create('div', 'info');
	this.update();
	return this._div;
};

info.update = function (props) {
	this._div.innerHTML = '<h4>Malaysian states</h4>' +  (props ?
		'<b>' + props.name + '</b><br />' + props.density + ' people / km<sup>2</sup>'
		: 'Hover over a state');
};

info.addTo(map);

// get color depending on population density value
function getColor(d) {
	return d > 1000 ? '#800026' :
	       d > 500  ? '#BD0026' :
	       d > 200  ? '#E31A1C' :
	       d > 100  ? '#FC4E2A' :
	       d > 50   ? '#FD8D3C' :
	       d > 20   ? '#FEB24C' :
	       d > 10   ? '#FED976' :
	                  '#FFEDA0';
}

function style(feature) {
	return {
		weight: 2,
		opacity: 1,
		color: 'white',
		dashArray: '3',
		fillOpacity: 0.7,
		fillColor: getColor(feature.properties.density)
	};
}

function highlightFeature(e) {
	var layer = e.target;
	layer.setStyle({
		weight: 5,
		color: '#666',
		dashArray: '',
		fillOpacity: 0.7
	});
	if (!L.Browser.ie && !L.Browser.opera) {
		layer.bringToFront();
	}
	info.update(layer.feature.properties);
}

var geojson;
function resetHighlight(e) {
	geojson.resetStyle(e.target);
	info.update();
}

function zoomToFeature(e) {
	map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
	layer.on({
		mouseover: highlightFeature,
		mouseout: resetHighlight,
		click: zoomToFeature
	});
}

geojson = L.geoJson(statesData, {
	style: style,
	onEachFeature: onEachFeature
}).addTo(map);
map.attributionControl.addAttribution('Population data from <a href="http://en.wikipedia.org/wiki/States_of_Malaysia">Wikipedia</a>');
var legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {
	var div = L.DomUtil.create('div', 'info legend'),
		grades = [0, 10, 20, 50, 100, 200, 500, 1000],
		labels = [],
		from, to;
	for (var i = 0; i < grades.length; i++) {
		from = grades[i];
		to = grades[i + 1];
		labels.push(
			'<i style="background:' + getColor(from + 1) + '"></i> ' +
			from + (to ? '&ndash;' + to : '+'));
	}
	div.innerHTML = labels.join('<br>');
	return div;
};

legend.addTo(map);

document.getElementById("WM").onclick = function () 
{
    map.setView(eastMalaysiaLatLon, eastMalaysiaZoom);
}

document.getElementById("EM").onclick = function () 
{
    map.setView(westMalaysiaLatLon, westMalaysiaZoom);
}

$('.nav-tabs').button()