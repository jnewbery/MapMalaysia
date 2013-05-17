var map,
    stats,
    current_stat,
    geojson,
    legend,
    info,
    zoom_buttons;

// Set page title.
$('title').html(config.title);

// Add the map.
map = L.map('map').setView(config.home.lat_lon, config.home.zoom);

// Add cloudmade.
var cloudmade = L.tileLayer('http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade',
    key: 'BC9A493B41014CAABB98F0471D759707',
    styleId: 22677
}).addTo(map);

// Add choropleth features.
geojson = L.geoJson(statesData, {
  style: style,
  onEachFeature: onEachFeature
}).addTo(map);

// Add legend panel.
legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {
  return L.DomUtil.create('div', 'panel legend');
};
legend.addTo(map);

// Add info panel.
info = L.control();
info.onAdd = function (map) {
  return L.DomUtil.create('div', 'panel info');
};
info.addTo(map);

// Add zoom buttons.
zoom_buttons = L.control({position: 'bottomleft'});
zoom_buttons.onAdd = function (map) {
  return L.DomUtil.create('div', 'zoom_buttons');
};
zoom_buttons.addTo(map);
$($(".zoom_buttons")[0]).attr('id','zoom_buttons')

$("#zoom_buttons").html("");
for (var jx = 0; jx < config.zooms.length; jx ++) {
  $("#zoom_buttons").append("<button type='button' class='btn zoom_button' id='" + config.zooms[jx].id + "'>" + config.zooms[jx].name + "</button>");

  // Add a handler for the button.
  $('#' + config.zooms[jx].id).click(function (lat_lon,zoom) {map.setView(lat_lon, zoom)}.bind(undefined,config.zooms[jx].lat_lon,config.zooms[jx].zoom));
}

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
  geojson.eachLayer(function(t){geojson.resetStyle(t)});
  updateInfo();
  updateLegend();
}

// Get colour depending on stat value.
function getColour(d) {
  colours = current_stat ? current_stat.colours : {"0":"#FFFFFF"};
  for (colour in colours) {
    if (d >= colour) {ret = colours[colour]};
  }
  return ret;
}

// Style a map feature.
function style(feature) {
  fill_col = current_stat ? feature.properties[current_stat.name] : 0;
  return {
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7,
    fillColor: getColour(fill_col)
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
function zoomToFeature(target) {
  map.fitBounds(target.getBounds());
}

// Click on a map feature.
function clickFeature(e) {
  zoomToFeature(e.target);
  selectState(parseInt(e.target.feature.id) - 1,true);
}

// Attach listners to each feature.
function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: clickFeature
  });
}

// Update the info panel.
function updateInfo(props) {
  $(".info").html('<h4>' + current_stat.name + '</h4>')
            .append(props ? '<b>' + props.Name + '</b><br />' + props[current_stat.name] + " " + current_stat.unit : 'Hover over a state');
};

// Update the legend panel.
function updateLegend() {
  var grades = [],
      labels = [],
      from,to;
  for (colour in current_stat.colours) {grades.push(parseInt(colour))};
  for (var i = 0; i < grades.length; i++) {  
    from = grades[i];
    to = grades[i+1];
    labels.push('<i style="background:' + getColour(from + 1) + '"></i> ' + from + (to ? '&ndash;' + to : '+'));
  }
  $(".legend").html("<p>" + current_stat.unit + "</p>")
              .append(labels.join('<br>'));
}

// Update the details panel.
function selectState(state_ix, update_dropdown) {

  // Update combobox.
  $("#state-combobox").select2("val", state_ix);

  // update the table info.
  props = statesData.features[state_ix].properties;
  h = "<table class='table table-striped' style='font-size:smaller'><tbody>";

  for (var i = 0; i < stats.length; i += 1) {
    h += ("<tr><td>" + stats[i].name + " (" + stats[i].unit + ")</td><td>" + props[stats[i].name] + "</td></tr>");
  }

  h += "</tbody></table>"
  $("#state-info").html(h);
};

// A state is selected in the drop menu.
function onTableChange(e) {
  // table index stored in e.val
  selectState(e.val);

  // zoom to the state
  geojson.eachLayer(function(t) {
    if ((parseInt(e.val) + 1) == parseInt(t.feature.id)) {
      map.fitBounds(t.getBounds());
    }
  })
};

// Get data.json and populate the map with data.
$.ajax({
  dataType: 'json',
  url: "./public/data/stats.json", 
  timeout: 20000,
  success: function(data) {
    stats = data;

    // Add the combobox.
    selector = $("<select id='state-combobox' style='width:100%'></select>");
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
    $("#state-combobox").select2().on("change", onTableChange);

    // Add stat buttons.
    $("#stat_buttons").html("");
    for (var jx = 0; jx < data.length; jx ++) {
      if (data[jx].map) {
        $("#stat_buttons").append("<button type='button' value='" + jx + "'class='btn btn-info' id='" + data[jx].id + "''>" + data[jx].name + "</button>");

        // Add a handler for the button.
        $('#' + data[jx].id).click(function (e) {selectStat(this,e)});
      }
    }

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