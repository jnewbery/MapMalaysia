var config = {
  "title":"MapMalaysia",
  "key":"pk.eyJ1Ijoiam9ubnluZXdicyIsImEiOiJVWjVLc2lFIn0.bkFBnPr8j36t_p6L2bcKlw",
  "min_zoom": 5,
  "home":{
    "lat_lon":[3.8, 102],
    "zoom":7
  },
  "zooms":[
    {
      "name": "East Malaysia",
      "id": "EM",
      "lat_lon": [3.8, 102],
      "zoom": 7 
    },
    {
      "name": "West Malaysia",
      "id": "WM",
      "lat_lon": [4, 114.4],
      "zoom": 7
    }
  ],
  "states_url":"./public/data/states.geojson",
  "stats_url":"./public/data/stats.json"
};