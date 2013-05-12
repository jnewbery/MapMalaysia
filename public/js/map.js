var eMyLatLon = [3.8, 102],
    wMyLatLon = [4, 114.4],
    eMyZoom = 7,
    wMyZoom = 7;

var map = L.map('map').setView(eMyLatLon, eMyZoom);
var stats;

$.ajax({
    dataType: 'json',
    url: "./public/data/data.json", 
    timeout: 20000,
    success: function(data) {
    	stats = data;

    	// Make the state selector.
	    onTableChange = function(evt) {
    	    // table index stored in evt.val
	    	selectState(evt.val);
	    };
        
        // Add stat Buttons.
	    $("#statButtons").html("");
        for (var jx = 0; jx < data.length; jx ++) {
          if (data[jx].map) {
            $("#statButtons").append("<button type='button' value='" + jx + "'class='btn btn-primary' id='" + data[jx].id + "''>" + data[jx].name + "</button>");

            // Add a handler for the button.
            $('#' + data[jx].id).click(function (e) {selectStat(this,e)});
          }
        }

	    selector = $("<select id='state-combobox' style='width:300px'></select>");
	    selector.append("<option value>Select state...</option>");
	    for (var ix = 0; ix < statesData.features.length; ix ++) {
	      state = statesData.features[ix];
	      stName = state.properties.Name;
	      selector.append("<option value='" + ix + "'>"+stName+"</option>");

          for (var jx = 0; jx < data.length; jx ++) {
            state.properties[data[jx].name] = data[jx].values[ix]
          }  
        }

	    $("#state-detail").html("")
	                      .append(selector)
	                      .append("<div id='state-info'></div><div id='state-searchbox'></div>");
	    $("#state-combobox").select2()
	                        .on("change", onTableChange);


        // Activate the first active stat.
	    for (var jx = 0; jx < data.length; jx ++) {
	    	if (data[jx].active) {
	    		$('#' + data[jx].id).click();
	    		break;
	    	}
	    }	
    },
    error: function(jqxhr, estatus, ethrown) {
        alert("JSON Error: " + estatus + " , " + ethrown);
    }
});

// add cloudmade
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

var colours = {};
var currentStat;

/* Change the current stat */
function selectStat(val, e) {
	// Find which stat has been selected.
    var stat;
	for (var jx = 0; jx < stats.length; jx ++) {
      if (e.currentTarget.id == stats[jx].id) {
      	stat = stats[jx];
      	break;
      }
    }

    // Update the current stat and colours
    currentStat = stat.name;
    colours = stat.colours;
    geojson.eachLayer(function(t,e){geojson.resetStyle(t)});

    // Update the legend.
	updateLegend();    
}

info.update = function (props) {
	this._div.innerHTML = '<h4>Malaysian states</h4>' +  (props ?
		'<b>' + props.Name + '</b><br />' + props["Population Density"] + ' people / km<sup>2</sup>'
		: 'Hover over a state');
};

info.addTo(map);

// get colour depending on population "Population Density" value
// TODO: remove the colouring from here and add to statButton event handlers
function getColour(d) {
	var ret;
	for (colour in colours) {
		if (d > colour) {ret = colours[colour]};
	}
	return ret;
}

function style(feature) {
	return {
		weight: 2,
		opacity: 1,
		color: 'white',
		dashArray: '3',
		fillOpacity: 0.7,
		fillColor: getColour(feature.properties[currentStat])
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
  console.info(e);
  id = e.target.feature.id;
  selectState(parseInt(id) - 1,true);
}

function onEachFeature(feature, layer) {
	layer.on({
		mouseover: highlightFeature,
		mouseout: resetHighlight,
		click: zoomToFeature
	});
	// TODO: This would be a good place to add the layer id/class
}

// Add the choropleth layers
geojson = L.geoJson(statesData, {
	style: style,
	onEachFeature: onEachFeature
}).addTo(map);

// hackhack: add ids to the layers
//var p_ids = ["Path00",
//             "Path01",
//             "Path02",
//             "Path03",
//             "Path04",
//             "Path05",
//             "Path06",
//             "Path07",
//             "Path08A",
//             "Path08B",
//             "Path09",
//             "Path10",
//             "Path11",
//             "Path12",
//             "Path13",
//             "Path14",
//             "Path15"
//             ]
//var paths = $(".leaflet-zoom-animated").find("path");
//for (var ix = 0; ix < paths.length; ix += 1) {
//	path = $(paths[ix]);
//	path.attr('id',p_ids[ix]);
//}

map.attributionControl.addAttribution('Population data from <a href="http://en.wikipedia.org/wiki/States_of_Malaysia">Wikipedia</a>');

function updateLegend() {
	var legend = $(".legend"),
		grades = [],
	    labels = [],
	    from,to;
	legend.html("");
	for (colour in colours) {grades.push(parseInt(colour))};
	for (var i = 0; i < grades.length; i++) {	
		from = grades[i];
		to = grades[i+1];
		labels.push('<i style="background:' + getColour(from + 1) + '"></i> ' + from + (to ? '&ndash;' + to : '+'));
	}
	legend.append(labels.join('<br>'));
}

// add legend to map
var legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {
	return L.DomUtil.create('div', 'info legend');
};
legend.addTo(map);

document.getElementById("WM").onclick = function () 
{
    map.setView(eMyLatLon, eMyZoom);
}

document.getElementById("EM").onclick = function () 
{
    map.setView(wMyLatLon, wMyZoom);
}

$('.nav-tabs').button()

/* selectState.. updates the details panel */
selectState = function(state_ix, update_dropdown) {
  
  // update combobox.
  $("#state-combobox").select2("val", state_ix);

  // update the table info...
  props = statesData.features[state_ix].properties;
  h = "<table class='table table-striped' style='font-size:smaller'><tbody>";

  for (var stat in props) {
    h += ("<tr><td>" + stat + "</td><td>" + props[stat] + "</td></tr>");
  }

  h += "</tbody></table>"
  $("#state-info").html(h);
};