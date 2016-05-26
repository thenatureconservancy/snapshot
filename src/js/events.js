var omnivore = require('leaflet-omnivore');
var $ = require('jquery');
var TNC = {};
TNC.map = require('./map.js');
TNC.graph = require('./graph.js');
TNC.config = require('./config.js');

function onMapMove (map, ractive, markerLayerGroup, turfOverlayLayerGroup){
  map.on('moveend', _.debounce(function () {
      TNC.map.onMapUpdate(map, ractive, markerLayerGroup);
      TNC.graph.buildHistogram(ractive, 'inputData.tnclands.markers.inBounds', 'derivedData', 'date_year', ['gis_ac']);
  }, 1));
};


function resetFilter (map, ractive, markerLayerGroup, turfOverlayLayerGroup) {
  ractive.on( 'reset-filter', function ( event ) {
  	var currentYear = new Date().getFullYear();
    var slider = document.getElementById('time-slider');    	
		slider.noUiSlider.set([1950, currentYear]);
  	ractive.set('appstate.filters.time', [1950, currentYear]);
  	ractive.set('appstate.filters.turf.filterOptions', null);
  	ractive.set('appstate.filters.turf.filterLayer', null);
  	ractive.set('appstate.filters.turf.filterLabel', null); 
  	//ractive.set('appstate.filters.dataquery', null);
		//$('#spatial-select option:first-child').attr("selected", "selected");			
		$('#spatial-select-options').val(null).trigger("change");
		TNC.map.updateMarkersTurf(map, ractive, markerLayerGroup, turfOverlayLayerGroup);   	   	
  })  	
};


function updateFilterState (map, ractive, markerLayerGroup, turfOverlayLayerGroup) {
  var dataqueryFilters = 'appstate.filters.dataquery';
  var turfFilters = 'appstate.filters.turf';    

  getSpatialSelectChange('spatial-select-options', turfFilters);

  for (var key in ractive.get(dataqueryFilters)) {
    getSelectChange(key, dataqueryFilters);          
  }

  getTimeSliderChange(map, ractive, markerLayerGroup, turfOverlayLayerGroup);

  function getSpatialSelectChange(key) {
    var dropdown = document.getElementById(key);
    dropdown.onchange = function () {
      var selOpt = $('#'+key).val();
      ractive.set('appstate.filters.turf.filterOptions', selOpt);
      buildSpatialQuery();
      TNC.map.updateMarkersTurf(map, ractive, markerLayerGroup, turfOverlayLayerGroup, buildQuery(), buildSpatialQuery());
    }       
  }

  function getSelectChange(key, filterType) {
    var dropdown = document.getElementById(key);
    dropdown.onchange = function () {
      var selOpt = $('#'+key).val();
      var ractiveString = filterType+'.'+key;
      ractive.set((filterType+'.'+key), selOpt);
      buildSpatialQuery();
			TNC.map.updateMarkersTurf(map, ractive, markerLayerGroup, turfOverlayLayerGroup, buildQuery(), buildSpatialQuery());
    }       
  }

  function getTimeSliderChange(map, ractive, markerLayerGroup, turfOverlayLayerGroup) {
    var slider = document.getElementById('time-slider');
    slider.noUiSlider.on('update', function(){
      var timeArray = slider.noUiSlider.get();
      ractive.set('appstate.filters.time', timeArray);
    });
    slider.noUiSlider.on('set', function(){
      //var timeArray = slider.noUiSlider.get();
      //ractive.set('appstate.filters.time', timeArray);
      buildSpatialQuery();
      TNC.map.updateMarkersTurf(map, ractive, markerLayerGroup, turfOverlayLayerGroup, buildQuery(), buildSpatialQuery());
    });      
  }

  function buildSpatialQuery() {
    var filterLayer = ractive.get('appstate.filters.turf.filterLayer');
    var filterOptions = ractive.get('appstate.filters.turf.filterOptions');

    if (filterOptions) {
      var cartoDbTable = TNC.config.spatialOverlay[filterLayer].table;
      var fieldName = TNC.config.spatialOverlay[filterLayer].field;
      var singleFilters = [];      	
      for (var i = 0; i < filterOptions.length; i++) {
        singleFilters.push("'" + filterOptions[i] + "'");
      }
      var stringJoin = singleFilters.join(',');
      var cartoDbQuery = "http://dmajka.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM " + cartoDbTable + " WHERE " + fieldName + " IN ("+stringJoin+")";
      return cartoDbQuery;        
    }
  }    

  function buildQuery() {
  	var dataqueryFilters = ractive.get('appstate.filters.dataquery');
  	var singleFilter = [];
    var multiFilters = [];
  	for (var key in dataqueryFilters) { // for each dataquery filter
  		if (dataqueryFilters[key]) { 			// if the array isn't empty
  			for (var i = 0; i < dataqueryFilters[key].length; i++) { // for each item selected for a filter
  				singleFilter.push("f.properties['" +key+ "'] === '" + dataqueryFilters[key][i]+ "'"); // push to array				
  			}
  			var singleArray = singleFilter.join(' || '); // join selections with 'or', e.g. state = AZ or CA.
  			console.log(singleArray);
      multiFilters.push('(', singleArray, ') && ');
      console.log(multiFilters);
  		}
  	}

    var startTime = Math.round(ractive.get('appstate.filters.time[0]'));
    var endTime = Math.round(ractive.get('appstate.filters.time[1]'));
    var currentYear = new Date().getFullYear();
    var timeString = "(f.properties['date_n'] > '"+startTime+"-01-01') && (f.properties['date_n'] < '"+endTime+"-12-31')"; // this is ok

    if (startTime > 1955 || endTime !== currentYear) {
    	multiFilters.push(timeString);
    } 

  	if (multiFilters) {
			return multiFilters.join('');	// if something selected, return string to evaluate
  	} else {
  		return true; // if nothing selected, then return true
  	}
  }
};


function getSpatialExtentLayer (ractive, selectID, optionsID) {
  // keeps bootstrap dropdown from closing when clicked.
  $('#filter-dropdown .dropdown-menu-right').on({
      "click":function(e){
        e.stopPropagation();
      }
  });

  // when parent select is changed, build list of options in child select
	var dropdown = document.getElementById(selectID);
	dropdown.onchange = function () {
    var selOpt = $('#'+selectID).val();
    //ractive.set('appstate.filters.turf', selOpt);
    ractive.set('appstate.filters.turf.filterOptions', null);
    ractive.set('appstate.filters.turf.filterLayer', selOpt); //adds filter to either turf or dataquery filter categories
    populateOptions(optionsID, selOpt);   		
	}

	function populateOptions (optionsID, selOpt) {
		document.getElementById(optionsID).options.length = 0;
		var field = TNC.config.spatialOverlay[selOpt]['field'];
		// var field2 = TNC.config.spatialOverlay[selOpt]['field2'];  		

		var cartoDbTable = TNC.config.spatialOverlay[selOpt]['table'];
    var placeholderLabel = TNC.config.spatialOverlay[selOpt]['label'];
    var placeholderName = TNC.config.spatialOverlay[selOpt]['name'];      
    ractive.set('appstate.filters.turf.filterLabel', placeholderName)

		var query = "http://dmajka.cartodb.com/api/v2/sql?q=SELECT DISTINCT "+ field + " FROM " + cartoDbTable  + " ORDER BY " + field + " ASC";
	  $.getJSON(query, function(data) {
	    var sel = document.getElementById(optionsID);
	      for (var i = 0; i < data.rows.length; i++) {
	        var opt = document.createElement('option');
	        opt.innerHTML = data.rows[i][field];
	        opt.value = data.rows[i][field];
	        sel.appendChild(opt);
	      }

	      $("#spatial-select-options").select2({
	      	placeholder: placeholderLabel

	      });
	  });
	}
};


function showDetails (ractive) {
  ractive.on( 'show-details', function (event) {
    var markers = ractive.get('derivedData.combinedMarkersInBounds')
    var projectDetails = _.find(markers, {'unique_id': event.node.id });                     
    ractive.set('appstate.activeTab', 'button-details');
    ractive.set('appstate.activeDetails', projectDetails);    
  });    
};


function showDetailsFromPopup (map, ractive) {
  map.on('popupopen', function(centerMarker) {
    $(".popup-details").click(function(){
    	var projectDetails = centerMarker.popup._source.feature.properties;
      ractive.set('appstate.activeTab', 'button-details');
      ractive.set('appstate.activeDetails', projectDetails);   
      ractive.update();                   
  	                  
    });
  });    
};


function showPopup (ractive, markerLayerGroup) {
  ractive.on( 'show-popup', function (event) {
    var markers = ractive.get('derivedData.combinedMarkersInBounds');
    var projectDetails = _.find(markers, {'unique_id': event.node.id });                    
    ractive.set('appstate.mapPopup', projectDetails);
    mapHighlight({'unique_id': projectDetails.unique_id, 'dataname': projectDetails.dataname}, markerLayerGroup);    
  });
};


function mapHighlight (markerInfo, markerLayerGroup) {
  var dataset = markerInfo.dataname;
  console.log('dataset', dataset);
  var unique_id = markerInfo.unique_id;
  var markers = _.find(markerLayerGroup.getLayers(), {'id': dataset});

  markers.eachLayer(function(layer) {

  if (layer.feature.properties.unique_id === unique_id) {
    if (!layer._icon) layer.__parent.spiderfy(); // If no icon, then spiderify
    layer.openPopup();
  }
  });
};


function showFootprintOnClick (ractive, map, projectOverlayGroup) {
  function showFootprint (projectInfo) {
    var dataset = projectInfo.dataname;
    // overlay table field 
    var overlayColumn = TNC.config.inputData[dataset].fields.overlayTable; //extent_table
    var overlayAttribute = projectInfo[overlayColumn]; //huc4
    var overlayID = TNC.config.inputData[dataset].fields.overlayID;
    var extentFeature = projectInfo[overlayID]; //HUC 0102 - Penobscot
    var overlayField = TNC.config.spatialOverlay[overlayAttribute].field; //hucnamelong
    var overlayColor = TNC.config.inputData[dataset].markerOptions.markerColor;
    var cartoDbQuery = "http://dmajka.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM " + overlayAttribute + " WHERE " + overlayField + " IN ('"+extentFeature+"')";
    var cartoDbOverlay = omnivore.geojson(cartoDbQuery, null, L.mapbox.featureLayer());

    cartoDbOverlay.on('ready', function() {
      projectOverlayGroup.clearLayers();
      cartoDbOverlay.id = 'projectOverlay';
      cartoDbOverlay.setStyle({color: '#'+overlayColor, weight: 1.5, fillColor: '#'+overlayColor, fillOpacity: 0.1});      
      cartoDbOverlay.addTo(projectOverlayGroup);
      map.fitBounds(cartoDbOverlay.getBounds(), {padding: [120, 100]}); // might get goofy w/ small screen size? Could I make this responsive?  // , {padding: [150, 150]}
    });       
  }

  ractive.on( 'show-footprint', function (event) {
    showFootprint(ractive.get('appstate.activeDetails'), projectOverlayGroup);
  });

  map.on('popupopen', function(centerMarker) {
    $(".popup-zoom-footprint").click(function(){
      var projectInfo = centerMarker.popup._source.feature.properties;
      console.log(projectInfo);
      showFootprint(projectInfo, projectOverlayGroup);
    });
  });    
};


function initPopover () {
	$('#popover').popover({
		    content: $('#popover-content').html(),
		    html: true,
		    placement: 'bottom',
		    container: 'body'
		});
};


function zoomToMarker (map) {
  // centers and zooms
  map.on('popupopen', function(centerMarker) {
    var lng = centerMarker.popup._source.feature.geometry.coordinates[0];
    var lat = centerMarker.popup._source.feature.geometry.coordinates[1];         
    var coords = {'lat': lat, 'lng': lng};
    $(".popup-zoom").click(function(){
      var cM = map.project(coords);
      map.setView(map.unproject(cM),13, {animate: false});
      setTimeout(function(){ map.panBy([1,1]); }, 50); // KLUDGEEEY. Delays pan call to get markers to show up
                
    });
  });    
};


function openFilterPane () {
	var drop;
	drop = new Drop({
	  target: document.querySelector('#help'),
	  content: document.querySelector('#filter-pop'),
	  position: 'bottom center',
	  openOn: 'click'
	});

  TNC.filter.buildSpatialSelect(TNC.config.filters.spatial); // Build selects based cartodb tables
  TNC.filter.buildTimeSlider();  
};


function sectionChange (ractive) {
  ractive.on( 'section-change', function ( event ) {
    var buttonid = event.node.id;
    ractive.set('appstate.activeTab', buttonid);
    if (buttonid === 'button-summary') {
      TNC.graph.buildHistogram(ractive, 'inputData.tnclands.markers.inBounds', 'derivedData', 'date_year', ['gis_ac']);
    }

  });    
};


function changeUnits (ractive) {
	ractive.on('unit-change', function (event) {
		var buttonid = event.node.id;
		console.log(buttonid);
		if (buttonid === 'english') {
			ractive.set('appstate.units.distanceUnits', 'Miles');  			
			ractive.set('appstate.units.distanceConversion', 1);
			ractive.set('appstate.units.areaUnits', 'Acres');  			
			ractive.set('appstate.units.areaConversion', 1);
		} else if (buttonid === 'metric') {
			ractive.set('appstate.units.distanceUnits', 'Km'); 
			ractive.set('appstate.units.distanceConversion', 1.60934);
			ractive.set('appstate.units.areaUnits', 'Ha'); 
			ractive.set('appstate.units.areaConversion', 0.404686);  			
		}
	})
};


function changeData (ractive) {
  ractive.on('data-change', function (event) {
    var buttonid = event.node.id;
    console.log(buttonid);
    ractive.set('appstate.projectScope', buttonid);
  })
};

function changeNetworkStatus (ractive) {
  ractive.on('network-change', function (event) {
    var buttonid = event.node.id;
    console.log(buttonid);
    ractive.set('networkStatus', buttonid);
  })
};


function popupOnScroll (markerLayerGroup) {
	var narrative = document.getElementById('results'),
	    sections = narrative.getElementsByTagName('dd'),
	    currentId = '';

			function setId(newId) {
		    if (newId === currentId) return;
		    for (var i = 0; i < sections.length; i++) {
		        sections[i].className = sections[i].id === newId ? 'pos-left clearfix active-project' : 'pos-left clearfix';
		    }
		    currentId = newId;
			}

	narrative.onscroll = _.debounce(function(e) {
	    var narrativeHeight = narrative.offsetHeight;
	    var newId = currentId;
	    for (var i = sections.length - 1; i >= 0; i--) {
	        var rect = sections[i].getBoundingClientRect();
	        if (rect.top >= 0 && rect.top <= narrativeHeight) {
	            newId = sections[i].id;
	        }
	    };
	    setId(newId);
    	TNC.events.mapHighlight({'unique_id': newId, 'dataname': 'tnclands'}, markerLayerGroup); 
	}, 30);
};


function pageUpdate (ractive) {
  ractive.on( 'page-change', function ( event ) {
    var buttonid = event.node.id;
    var currentIndex = ractive.get('appstate.detailsPageIndex');

    if (buttonid === 'page-up') {
    	ractive.set('appstate.detailsPageIndex', [currentIndex[0]+50, currentIndex[1]+50]);
    } else if (buttonid === 'page-down') {
    	ractive.set('appstate.detailsPageIndex', [currentIndex[0]-50, currentIndex[1]-50]);       	
    }
  });    	
};

function testNetworkStatus (ractive) {
  jQuery.ajax({
      url: 'http://mnspatial.tnc.org/projects/spacer.gif',
      success: function(){
        ractive.set('networkStatus', 'private');               
       },
      error: function(){
        ractive.set('networkStatus', 'public');
        },
      timeout: 1000,
      async: true
   });
};


module.exports = {
	onMapMove : onMapMove,
	resetFilter: resetFilter,
	updateFilterState: updateFilterState,
	getSpatialExtentLayer: getSpatialExtentLayer,
	showDetails: showDetails,
	showDetailsFromPopup: showDetailsFromPopup,
	showPopup: showPopup,
	mapHighlight: mapHighlight,
	showFootprintOnClick: showFootprintOnClick,
	initPopover: initPopover,
	zoomToMarker: zoomToMarker,
	openFilterPane: openFilterPane,
	sectionChange: sectionChange,
	changeUnits: changeUnits,
	changeData: changeData,
  changeNetworkStatus: changeNetworkStatus,
	popupOnScroll: popupOnScroll,
	pageUpdate: pageUpdate,
  testNetworkStatus
}
