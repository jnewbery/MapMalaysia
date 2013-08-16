var fs = require('fs'),
    frontiers = {},
    frontiers_list = [],
    output,
    data,
    raw_frontiers,
    states,
    state;

function subst_linestring(coords) {
  var line_str = []

  frons = coords.split(',');
  console.dir("Frontiers are: " + frons);

  for (var j = 0; j < frons.length; j++) {

     fron_name = frons[j];

    // Check whether the frontier is in our frontiers dictionary. If not, check whether it's listed in reverse order
    if (frontiers_list.indexOf(fron_name) != -1) {
      fron = frontiers[fron_name];
    }
    else {
      fron_name = frons[j].substr(3,3) + frons[j].substr(0,3) + frons[j].substr(6)
      fron = frontiers[fron_name].reverse()

      if (frontiers_list.indexOf(fron_name) == -1) {
        console.dir("Error! Frontier does not appear in dictionary!")
        return('');
      }
    }

    if (fron.length == 0) {
      console.dir("Error! Frontier is empty: " + fron_name);
      return('');
    }

    // Store off the first coordinate in a line string.
    if (j == 0) {
      first_fron_name = fron_name;
      first = fron[0];
    }
    else if ((last[0] != fron[0][0]) || (last[1] != fron[0][1])) {
      console.dir("Error! " + prev_fron_name + " does not meet " + fron_name)
      console.dir(prev_fron_name + " final coord: " + last)
      console.dir(fron_name + " first coord: " + fron[0])
    }

    line_str = line_str.concat(fron);

    // Store off the last coordinate in a line string section.
    last = fron[fron.length-1]
    prev_fron_name = fron_name;

    if ((j == frons.length) && ((fron[fron.length -1][0] != first[0]) || (fron[fron.length -1][1] != first[1]))){
      console.dir("Error! " + fron_name + " does not meet " + first_fron_name)
      console.dir(fron_name + " final coord: " + last)
      console.dir(first_fron_name + " first coord: " + first)
    }
  }

  return(line_str);
}

function subst_polygon(coords) {
  for (var i = 0; i < coords.length; i++) {
    coords[i] = subst_linestring(coords[i]);
  }
}

function subst_multipolygon(coords) {
  for (var i = 0; i < coords.length; i++) {
    subst_polygon(coords[i])
  }
}

function createState(state) {
  console.dir("Building state " + state.Name)
  ret ={"type":"Feature","id":null,"geometry":null,"properties":{"Name":null}};

  ret.properties.Name = state.Name;
  ret.id = state.id;
  ret.geometry = state.geometry;
  
  // pull the frontiers coordinates into the geojson features object
  if (ret.geometry.type == "MultiPolygon"){
    subst_multipolygon(state.geometry.coordinates);
  }
  else if (ret.geometry.type == "Polygon"){
    subst_polygon(state.geometry.coordinates);
  }
  else {
    console.dir("Error! Geometry type must be MultiPolygon or Polygon")
  }

  return(ret);
}

output = {"type":"FeatureCollection","features":[]}

//Get frontiers data
//TODO: Add error catching for file read
data = fs.readFileSync(__dirname + '/frontiers.geojson', 'utf8');

//TODO: Add error catching for JSON parsing
raw_frontiers = JSON.parse(data);

for (var i = 0; i < raw_frontiers.features.length; i++) {
  frontier = raw_frontiers.features[i];
  frontiers[frontier.properties.name] = frontier.geometry.coordinates;
  frontiers_list.push(frontier.properties.name)
}

//Get state definition data
//TODO: Add error catching for file read
data = fs.readFileSync(__dirname + '/states.json', 'utf8');

//TODO: Add error catching for JSON parsing
states = JSON.parse(data);

for (var i = 0; i < states.length; i++) {
  state = states[i];
  output.features.push(createState(state));
}

fs.writeFileSync(__dirname + '/states.geojson', JSON.stringify(output,null,2));