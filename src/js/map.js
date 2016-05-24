var mapbox = require('mapbox.js');
var moment = require('moment');
var omnivore = require('leaflet-omnivore');
require('leaflet-hash');
var turfWithin = require('turf-within'); 


function setupMap (config) {
	L.mapbox.accessToken = config.token;
  var map = L.mapbox.map('map').setView(config.center, config.zoom);
  var layers = {
      Outdoors: L.mapbox.tileLayer('dmajka.d96f35ec'),
      Satellite: L.mapbox.tileLayer('mapbox.satellite'),
      'TNC Lands': L.mapbox.styleLayer('mapbox://styles/dmajka/cilxvob3m008e9km8od3v9lha')
      // WholeSystems: L.mapbox.styleLayer('mapbox://styles/dmajka/cimdw3j5600i7a6m414tjg9oc')        
  };

  layers.Outdoors.addTo(map);
  var hash = L.hash(map);
  L.control.layers(layers).addTo(map);
    return map;
};


function _changeIcon(layer, inputDataset) {
  layer.setIcon(L.mapbox.marker.icon({
    'marker-symbol': inputDataset.markerOptions.markerIcon,
    'marker-color': inputDataset.markerOptions.markerColor,
    'marker-size': 'small'}
    ));        
} 


function _addPopups(layer, inputDataset) {
  var feature = layer.toGeoJSON(),
      popupTemplate = inputDataset.template.popup;

  if (feature.properties && feature.properties[inputDataset.popupfield]) {
    layer.bindPopup(popupTemplate(feature));
  }                   
};


function _normalizeAttributes(layer, inputDataset) {
  var feature = layer.toGeoJSON(),
      dataName = inputDataset.shortName,  
      inDateField = inputDataset.fields.date,
      inDateFormatting = inputDataset.fields.dateFormat,
      inDataShortName = inputDataset.shortName,
      inUniqueID = inputDataset.fields.uniqueID;

  feature.properties.dataname = dataName;          
  feature.properties.date_n = moment(feature.properties[inDateField], inDateFormatting).format('YYYY-MM-DD');
  feature.properties.date_short = moment(feature.properties[inDateField], inDateFormatting).format('MMM DD');
  if (feature.properties[inDateField]) {
    feature.properties.date_year = moment(feature.properties[inDateField], inDateFormatting).format('YYYY');
  } else {
    feature.properties.date_year = 'Invalid date';
  }

  feature.properties.unique_id = dataName + feature.properties[inUniqueID].toString(); 
};


function createClusters (inputDataset) {
  var markerCluster = new L.markerClusterGroup({
    showCoverageOnHover: true,
    chunkedLoading: true,
    maxClusterRadius: inputDataset.markerOptions.maxClusterRadius,
    disableClusteringAtZoom: inputDataset.markerOptions.disableClusteringAtZoom,
    polygonOptions: {
      fillColor: '#'+inputDataset.markerOptions.markerColor,
      color: '#'+inputDataset.markerOptions.markerColor,
      weight: 1,
      opacity: 1,
      fillOpacity: 0.4
    },
    iconCreateFunction: function(cluster) {
      var childCount = cluster.getChildCount();
      var dataTypeColor = ' '+ inputDataset.shortName;
      var c = ' marker-cluster-';
        if (childCount < 10) {
          c += 'small';
        } else if (childCount < 100) {
          c += 'medium';
        } else {
          c += 'large';
        }
        return new L.DivIcon({ html: '<div><span>' + childCount + '</span></div>', className: 'marker-cluster' + c + dataTypeColor, iconSize: new L.Point(40, 40) });           
    }
  });
  return markerCluster;
};



function loadMarkers (inputData, map, ractive) {
  var markerLayerGroup = new L.FeatureGroup();
  markerLayerGroup.addTo(map);

  function _loadData(inputDataset) {
    var ptdata = inputDataset.src;
    var dataName = inputDataset.shortName;
    var points = omnivore[inputDataset.datatype](ptdata, null, L.mapbox.featureLayer(), {
      }).on('ready', function() {
        points.eachLayer(function(layer) {
          _addPopups(layer, inputDataset);
          _changeIcon (layer, inputDataset);
          _normalizeAttributes (layer, inputDataset);
        });
        
        ractive.set('inputData.'+inputDataset.shortName+'.markers.complete', points);
        // create marker cluster, add pts to marker cluster, add marker cluster to layer group
        var markerCluster = createClusters(inputDataset);
        markerCluster.id = dataName;
        markerCluster.addLayer(points);
        markerLayerGroup.addLayer(markerCluster);
        map.panBy([1,1]); //kludge to trigger inBounds and auto-populate templates.   

      }).on('error', function(error){
        console.log(error);
      });   
  };

  for (var key in inputData) {
    _loadData(inputData[key]);
  }

  markerLayerGroup.clearLayers();
  return markerLayerGroup;
};


function updateMarkersTurf (map, ractive, markerLayerGroup, turfOverlayLayerGroup, queryString, spatialQueryString) {
	if (spatialQueryString) {
    var cartoDbOverlay = omnivore.geojson(spatialQueryString, null, L.mapbox.featureLayer());
    cartoDbOverlay.on('ready', function() {
			markerLayerGroup.clearLayers();
			turfOverlayLayerGroup.clearLayers();
			cartoDbOverlay.id = 'cartoDbOverlay';
			cartoDbOverlay.setStyle({color: '#4D5557', weight: 1.5, fillColor: '#4D5557', fillOpacity: 0.1});
			cartoDbOverlay.addTo(turfOverlayLayerGroup);

      for (var key in ractive.get('inputData')) {
        var points = ractive.get('inputData.'+[key]+'.markers.complete');        
        var markerCluster = createClusters(ractive.get('inputData.'+[key]));
        var inputDataset = ractive.get('inputData.'+[key]);
        markerCluster.id = [key][0];
                    
        turfIntersect(inputDataset, points, cartoDbOverlay);
        map.fitBounds(turfOverlayLayerGroup.getBounds());

        function turfIntersect(inputDataset, points, overlay) {
          var geoJsonPts = points.getGeoJSON();
          var overlayGeojson = overlay.getGeoJSON();
          var ptsWithin = turfWithin(geoJsonPts, overlayGeojson);
          var featureLayer = L.mapbox.featureLayer(ptsWithin); // converts from geojson to feature layer
          featureLayer.setFilter(function(f) {
            if (queryString === '') {
              return true;
            } else {
              return eval(queryString);
            }
          });

          featureLayer.eachLayer(function(layer) {
            _addPopups(layer, inputDataset);
            _changeIcon (layer, inputDataset);
            _normalizeAttributes (layer, inputDataset);
          });

          markerLayerGroup.addLayer(markerCluster);
          markerCluster.addLayer(featureLayer);
        	           
          TNC.map.onMapUpdate(map, ractive, markerLayerGroup);
          return featureLayer;        
        }
      } // end for loop
      //map.fitBounds(markerLayerGroup.getBounds());
    })
	} else {

  markerLayerGroup.clearLayers();
  turfOverlayLayerGroup.clearLayers();

  for (var key in ractive.get('inputData')) {
    var inputDataset = ractive.get('inputData.'+[key]);
    var markerCluster = TNC.map.createClusters(ractive.get('inputData.'+[key]));
    var points = ractive.get('inputData.'+[key]+'.markers.complete');    
    markerCluster.id = [key][0];

    points.setFilter(function(f) {
	    if (queryString) {
	    	return eval(queryString);
	    } else {
	      return true;		      
	    }
    });

    points.eachLayer(function(layer) {
      _addPopups(layer, inputDataset);
      _changeIcon (layer, inputDataset);
      _normalizeAttributes (layer, inputDataset);
    });

    markerLayerGroup.addLayer(markerCluster);
    markerCluster.addLayer(points);

  } // end for loop
	}

  TNC.map.onMapUpdate(map, ractive, markerLayerGroup); // pushes new markers inBounds to display arrays    
};



function fitLayerGroupBounds (layerGroup) {
  // for layer in LayerGroup, query to get bounds
  console.log('gettingBounds');
  map.eachLayer(function(layer) {
    console.log(layer.getBounds());
  })
};


function sumColumnValues (dataAttribute) {
  var itemSum = 0;
  var reportingProjects = 0;
  for (var i = 0; i < inBounds.length; i++) {
    if (inBounds[i][dataAttribute]) {
      itemSum += inBounds[i][dataAttribute];
      reportingProjects +=1;     
    }
  }
  return {'sum': itemSum, 'reporting': reportingProjects};
};


function sumMultipleColumnValues (dataAttributeArray) {
  var itemSum = 0;
  var reportingProjects = [];
  // for each project in the map bounds
  for (var i = 0; i < inBounds.length; i++) {
    // for every column in dataAttributeArray
    for (var j = 0; j < dataAttributeArray.length; j++){
      // if there's a value for project -> variable, sum it
      var habitat = dataAttributeArray[j];
      if (inBounds[i][habitat]) {
        itemSum += inBounds[i][habitat];
        if (reportingProjects.indexOf(inBounds[i]['projectname']) === -1 && inBounds[i]['projectname'] !== '') {
          reportingProjects.push(inBounds[i]['projectname']);
        }
      }
    }
  }
  return {'sum': Math.round(itemSum), 'reporting': reportingProjects};  	
};


function onMapUpdate (map, ractive, markerLayerGroup){
	ractive.set('appstate.detailsPageIndex', [0, 50]);
  ractive.set('mapCenter', map.getCenter());
  ractive.set('mapZoom', map.getZoom());

  var inBoundsAll = [];
  var bounds = map.getBounds();
  markerLayerGroup.eachLayer(function (layer){ // loop through each dataset
    var mapMarkers = pushInBounds(layer);
    ractive.set('inputData.'+layer.id+'.markers.inBounds', mapMarkers);
  });

  //refactor this to abstract it so markers get concatenated w/o specifying marker name. 
  ractive.set('derivedData.combinedMarkersInBounds', _.concat(ractive.get('inputData.tnclands.markers.inBounds'), ractive.get('inputData.coastalprojects.markers.inBounds'), ractive.get('inputData.freshwater.markers.inBounds')));
  var markersInBounds = _.orderBy(ractive.get('derivedData.combinedMarkersInBounds'), ['date_n'],['desc']);
 
  function pushInBounds(layer){
    var inBounds = [];
    layer.eachLayer(function(marker) {
    	if (layer.id !== 'cartoDbOverlay') {
        if (bounds.contains(marker.getLatLng())) {
          inBounds.push(marker.feature.properties);         
        }      		
    	}

    })
    return inBounds;
  }
};



module.exports = {
  setupMap : setupMap,
  loadMarkers : loadMarkers,
  updateMarkersTurf : updateMarkersTurf,
  createClusters: createClusters,
  fitLayerGroupBounds: fitLayerGroupBounds,
  sumColumnValues: sumColumnValues,
  sumMultipleColumnValues: sumMultipleColumnValues,
  onMapUpdate: onMapUpdate
}