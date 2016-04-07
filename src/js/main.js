var mapbox = require('mapbox.js');
var ractive = require('ractive');
window.$ = window.jQuery = require('jquery');
var bootstrap = require('bootstrap'); 
//var bootflat = require('bootflat');

// require('leaflet.markercluster');
//var miniMap = require('leaflet-minimap'); //currently having probs requiring this.

var _ = require('lodash');
var moment = require('moment');
var select2 = require('select2');


// app modules
var TNC = {};
TNC.config = require('./config.js');
TNC.map = require('./map.js');
TNC.filter = require('./filter.js');
TNC.events = require('./events.js');
TNC.graph = require('./graph.js');
TNC.util = require('./util.js');
var mapboxToken = 'pk.eyJ1IjoiZG1hamthIiwiYSI6IlNuSHVNb0UifQ.zIkArM4rtyvdtMZjZEesBA';
var cartoDbAccount = 'dmajka';



var MyRactive = ractive.extend({
  getComputed: function() {
    var out = {},
        comp = this.viewmodel.computations
    for ( c in comp ) {
        out[c] = comp[c].value
    }
    return out;
  }
});


TNC.app = ractive({
  el: '#results',
  template: '#template',
  partials: {
    summaryLands: TNC.config.inputData.tnclands.template.summary,
    summaryCoastal: TNC.config.inputData.coastalprojects.template.summary,
    summaryFreshwater: TNC.config.inputData.freshwater.template.summary,
    cardLands: TNC.config.inputData.tnclands.template.card, 
    cardCoastal: TNC.config.inputData.coastalprojects.template.card,
    cardFreshwater: TNC.config.inputData.freshwater.template.card,      
    detailsLands: TNC.config.inputData.tnclands.template.details,
    detailsCoastal: TNC.config.inputData.coastalprojects.template.details, 
    detailsFreshwater: TNC.config.inputData.freshwater.template.details                
  },
  data: {
    appstate: {
      activeTab: 'button-summary', // summary, projects, or details
      activeDetails: null,
      projectScope: 'completed', // past, active, fundraising.
      projectTour: false,
      units: {
      	distanceUnits: 'Miles',
      	distanceConversion: 1,
      	areaUnits: 'Acres',
      	areaConversion: 1
      },
      detailsPageIndex: [0, 50],
      sortBy: 'year', //year, distance
      sortOrder: null, // time, name
      searchWithinMap: true,
      filters: {
        dataquery: {},
        turf: {
          name: null
        },
        time: [1950, 2020]
      },
      mapCenter: null,
      mapZoom: null,
      scrollPosition: null
    },
    inputData: {},
    derivedData: {},

    fundraisingData: {
    	data: null,
    	package: null,
    	country: null,
    	crossCuttingInitiative: null,
    	globalChallenge: null,
    	keyword: null,
    	region: null
    },

    sumAttribute: function(pointArray, fieldName) {
	    var itemSum = 0;
	    var reportingProjects = 0;
	    for (var i = 0; i < pointArray.length; i++) {
	      if (pointArray[i][fieldName]) {
	        itemSum += +pointArray[i][fieldName];
	        reportingProjects +=1;     
	      }
	    }
	    return Math.floor(itemSum);     	
    },

    sumProjectAttributes: function(fieldArray) {
      // console.log(fieldArray);
      // var activeProject = ractive.get('appstate.activeDetails');
      // for (var i = 0; i < fieldArray.length; i++) {
      //   console.log(activeProject[i]);
      // }

      //return .sum(TNC.coastalprojects.fields.acresRestored)
    },

    sumMultiAttributes: function(pointArray, fieldArray) {
      var itemSum = 0;
      var reportingProjects = [];
      // for each project in the map bounds
      for (var i = 0; i < pointArray.length; i++) {
        // for every column in dataAttributeArray
        for (var j = 0; j < fieldArray.length; j++){
          // if there's a value for project -> variable, sum it
          var habitat = fieldArray[j];
          if (pointArray[i][habitat]) {
            itemSum += pointArray[i][habitat];
            // code for summing reporting projects. 
            if (reportingProjects.indexOf(pointArray[i]['projectname']) === -1 && pointArray[i]['projectname'] !== '') {
              reportingProjects.push(pointArray[i]['projectname']);
            }
          }
        }
      } 
      return Math.round(itemSum);
      //return {'sum': Math.round(itemSum), 'reporting': reportingProjects};
    },

    lookupProjectsByYear: function(projectsByYear, year) {
      var projects = this.get('derivedData.byYear');
    	return projects[year];
    },

    uniqueYears: function () {
	    var markersInBounds = _.orderBy(this.get('derivedData.combinedMarkersInBounds'), ['date_n'],['desc']);
	    var uniqueYears = _.uniq(_.map(markersInBounds, 'date_year'));
	    if (uniqueYears[0] === 'Invalid date') {
	      uniqueYears.push(uniqueYears.shift());      
	    }
	    this.set('derivedData.timelineYears', uniqueYears);
	    return uniqueYears;
    },

    projectsByYear: function () {
  		this.set('derivedData.byYear', _.groupBy(markersInBounds, 'date_year'));
    },

    paginateProjects: function() {
    	// returns an array of unique years from all markers in map bounds
    	// Get all markers in bounds and sort them in descending order
    	var pageIndex = this.get('appstate.detailsPageIndex');
	    var markersInBounds = _.orderBy(this.get('derivedData.combinedMarkersInBounds'), ['date_n'],['desc']);
	    // Markers w/ 'Invalid date' get stuck at top. Need to remove these in a separate array
	    var invalidMarkers = _.filter(markersInBounds, function(o){return o.date_year === 'Invalid date'});
	    var datedMarkers = _.filter(markersInBounds, function(o){return o.date_year !== 'Invalid date'});
	    // Now join Invalid date markers to end of array		    
	    var rejoined = _.concat(datedMarkers, invalidMarkers);
	    // Slice array using appstate.detailsPageIndex
	    var slicedMarkers = rejoined.slice(pageIndex[0], pageIndex[1]);
	    // Get list of unique years in sliced array and add 
			var uniqueYears = _.uniq(_.map(slicedMarkers, 'date_year'));
			//console.log(uniqueYears);
	    this.set('derivedData.timelineYears', uniqueYears);
	    // Break out projects into an object w/ year: [Array of projects]
	    var groupedProjects = _.groupBy(slicedMarkers, 'date_year');
	    this.set('derivedData.byYear', groupedProjects);
	    //console.log(groupedProjects);
	    return groupedProjects;
    },

    landProtectMech: function (protType) {
      var protMechType = {
        'Fee-simple ownership': 'Fee ownership is the state or fact of exclusive rights and control over land/real estate involving multiple rights, collectively referred to as title, which may be separated and held by different parties.',
        'Fee Ownership': 'Fee ownership is the state or fact of exclusive rights and control over land/real estate involving multiple rights, collectively referred to as title, which may be separated and held by different parties.',
        'Conservation Easement': 'A conservation easement is a legally binding agreement restricting the use of real property for conservation purposes. It may additionally provide the holder with affirmative rights, such as the rights to monitor species or to manage the land. It may run forever or for an expressed term of years.',
        'Deed Restrictions': 'A deed restriction is a provision placed in a deed restricting or limiting the use of the property in some manner.',
        'Agreement': 'A management agreement between a landowner and a managing entity generally provides the grantee (the managing entity) the right to enter the land and perform certain conservation management tasks.',
        'Grazing Permit': 'A permis is a document issued by a government authority giving permission to proceed with some action. Ex. An environmental permit for erosion and siltation control on land about to be disturbed.',
        'Grazing Lease': 'A lease is an agreement between two parties whereby one party allows the other to use his/her property for a certain period of time in exchange for a periodic fee.',
        'Transferred': 'Transferred properties are conserved through cooperation with other conservation organizations including aquiring and transferring land and conservation easements and direct grants to partner conservation projects.'
      }
      return protMechType[protType];
    }

  }, // end data
  computed: {
    returnProjects: function () {
      console.log('yeah');
    }
  } 
});



TNC.init = function () {
	var map,
			osm2,
			miniMap,
			projectOverlayGroup,
			turfOverlayGroup,
			markerLayerGroup;
  // L.mapbox.accessToken = mapboxToken;
  map = TNC.map.setupMap({center: [23, -93], zoom: 3, token: mapboxToken});
  // osm2 = new L.mapbox.tileLayer('mapbox.streets', {minZoom: 0, maxZoom: 7});
  // miniMap = new L.Control.MiniMap(osm2).addTo(map);
  projectOverlayLayerGroup = new L.FeatureGroup();
  turfOverlayLayerGroup = new L.FeatureGroup();  
  projectOverlayLayerGroup.addTo(map);
  turfOverlayLayerGroup.addTo(map);
  TNC.app.set('inputData',TNC.config.inputData);
  markerLayerGroup = TNC.map.loadMarkers(TNC.app.get('inputData'), map, TNC.app);

  TNC.filter.buildTimeSlider();    
  TNC.util.uiConfig();
  TNC.events.zoomToMarker(map);
  TNC.events.showDetails(TNC.app);
  TNC.events.showDetailsFromPopup(map, TNC.app);  
  TNC.events.showPopup(TNC.app, markerLayerGroup);
  TNC.events.showFootprintOnClick(TNC.app, map, projectOverlayLayerGroup);  // FLAGGING THIS  
  TNC.events.getSpatialExtentLayer(TNC.app, 'spatial-select', 'spatial-select-options');
  TNC.events.sectionChange(TNC.app);
  TNC.events.pageUpdate(TNC.app); 
  TNC.events.updateFilterState(map, TNC.app, markerLayerGroup, turfOverlayLayerGroup);
  TNC.events.onMapMove(map, TNC.app, markerLayerGroup, turfOverlayLayerGroup);
  TNC.events.resetFilter(map, TNC.app, markerLayerGroup, turfOverlayLayerGroup);
  TNC.events.changeUnits(TNC.app);
  // TNC.events.changeData(TNC.app);
  TNC.graph.buildHistogram(TNC.app, 'inputData.tnclands.markers.inBounds', 'derivedData', 'date_year', ['gis_ac']);
  //TNC.events.popupOnScroll(); 
};

TNC.init();

TNC.app.decorators.select2 = function ( node ) {
  var ractive = this;
  
  $(node).select2().on( 'change', function () {
    ractive.updateModel();
  });
  
  return {
    teardown: function () {
      $(node).select2( 'destroy' );
    }
  };
};

