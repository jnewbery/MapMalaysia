var eMyLatLon = [3.8, 102],
    wMyLatLon = [4, 114.4],
    eMyZoom = 7,
    wMyZoom = 7;

var map,
    stats,
    current_stat,
    geojson,
    legend,
    info;

// Set page title.
$('title').html(config.title);

// Add the map.
map = L.map('map').setView(config.starting_lat_lon, config.starting_zoom);

// Add cloudmade.
var cloudmade = L.tileLayer('http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png', {
	attribution: 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade',
	key: 'BC9A493B41014CAABB98F0471D759707',
	styleId: 22677
}).addTo(map);

// Change the current stat.
function selectStat(val, e) {
	// Find which stat has been selected.
	for (var jx = 0; jx < stats.length; jx ++) {
      if (e.currentTarget.id == stats[jx].id) {
      	current_stat = stats[jx];
      	break;
      }
    }

    // Update the map layers, info and legend.
    geojson.eachLayer(function(t,e){geojson.resetStyle(t)});
    updateInfo();
	updateLegend();    
}

// Get colour depending on stat value.
function getColour(d) {
	if (!current_stat) {return '#000000'}
	var ret;
	for (colour in current_stat.colours) {
		if (d > colour) {ret = current_stat.colours[colour]};
	}
	return ret;
}

// Style a map feature.
function style(feature) {
	return {
		weight: 2,
		opacity: 1,
		color: 'white',
		dashArray: '3',
		fillOpacity: 0.7,
		fillColor: getColour(feature.properties[(current_stat ? current_stat.name : '')])
	};
}

// Highlight a map feature.
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
	updateInfo(layer.feature.properties);
}

// Unhighlight a map feature.
function resetHighlight(e) {
	geojson.resetStyle(e.target);
	updateInfo();
}

// Zoom to a map feature.
function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
  id = e.target.feature.id;
  selectState(parseInt(id) - 1,true);
}

// Attach listners to each feature.
function onEachFeature(feature, layer) {
	layer.on({
		mouseover: highlightFeature,
		mouseout: resetHighlight,
		click: zoomToFeature
	});
	// TODO: This would be a good place to add the layer id/class
}

// Update the info panel.
function updateInfo(props) {
	info._div.innerHTML = '<h4>' + current_stat.name + '</h4>' +  (props ?
		'<b>' + props.Name + '</b><br />' + props[current_stat.name] + " " + current_stat.unit
		: 'Hover over a state');
};

// Update the legend panel.
function updateLegend() {
	var legend = $(".legend"),
		grades = [],
	    labels = [],
	    from,to;
	legend.html("");
	for (colour in current_stat.colours) {grades.push(parseInt(colour))};
	for (var i = 0; i < grades.length; i++) {	
		from = grades[i];
		to = grades[i+1];
		labels.push('<i style="background:' + getColour(from + 1) + '"></i> ' + from + (to ? '&ndash;' + to : '+'));
	}
	legend.append(labels.join('<br>'));
}

document.getElementById("WM").onclick = function () 
{
    map.setView(eMyLatLon, eMyZoom);
}

document.getElementById("EM").onclick = function () 
{
    map.setView(wMyLatLon, wMyZoom);
}

// Update the details panel.
selectState = function(state_ix, update_dropdown) {
  
  // Update combobox.
  $("#state-combobox").select2("val", state_ix);

  // update the table info.
  props = statesData.features[state_ix].properties;
  h = "<table class='table table-striped' style='font-size:smaller'><tbody>";

  for (var stat in props) {
    h += ("<tr><td>" + stat + "</td><td>" + props[stat] + "</td></tr>");
  }

  h += "</tbody></table>"
  $("#state-info").html(h);
};

// Get data.json and populate the map with data.
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
        
	    // Add the combobox.
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

        // Add stat buttons.
	    $("#statButtons").html("");
        for (var jx = 0; jx < data.length; jx ++) {
          if (data[jx].map) {
            $("#statButtons").append("<button type='button' value='" + jx + "'class='btn btn-primary' id='" + data[jx].id + "''>" + data[jx].name + "</button>");

            // Add a handler for the button.
            $('#' + data[jx].id).click(function (e) {selectStat(this,e)});
          }
        }

	    // Add choropleth features.
        geojson = L.geoJson(statesData, {
	      style: style,
	      onEachFeature: onEachFeature
        }).addTo(map);	

        // Add legend panel.
        legend = L.control({position: 'bottomright'});
        legend.onAdd = function (map) {
	      return L.DomUtil.create('div', 'info legend');
        };
        legend.addTo(map);

        // Add info panel.
        info = L.control();
        info.onAdd = function (map) {
          this._div = L.DomUtil.create('div', 'info');
	      return this._div;
        };
        info.addTo(map);

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