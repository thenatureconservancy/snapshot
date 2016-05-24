
var spatialOverlay = {
  usa_states: {
    table: 'usa_states',
    field: 'postal',
    field2: 'name',
    label: 'Select states',
    name: 'operating unit(s)'
  },
  countries: {
    table: 'countries',
    field: 'name',
    label: 'Select countries',
    name: 'countries'
  },
  congressional_districts: {
    table: 'congressional_districts',
    field: 'cd_abbrev',
    field2: 'districtid',
    label: 'Select Congressional Districts',
    name: 'Congressional Districts'
  },
  tnc_ecoregions_terrestrial: {
    table: 'tnc_ecoregions_terrestrial',
    field: 'eco_name',
    label: 'Select terrestrial ecoregion',
    name: 'ecoregion(s)'
  },
  tnc_ecoregions_marine: {
    table: 'tnc_ecoregions_marine',
    field: 'ecoregion',
    label: 'Select marine ecoregion',
    name: 'ecoregion(s)'
  },
  tnc_ecoregions_freshwater: {
    table: 'tnc_ecoregions_freshwater',
    field: 'ecoregion',
    label: 'Select freshwater ecoregion',
    name: 'ecoregion(s)'
  },
  wri_world_basins: {
    table: 'wri_world_basins',
    field: 'name',
    label: 'Select basin',
    name: 'basin(s)'
  },
  whole_systems: {
    table: 'whole_systems',
    field: 'name',
    field_cat: 'type',
    label: 'Select whole system',
    name: 'whole system(s)'
  },
  huc2: {
    table: 'huc2',
    field: 'hucnamelong',
    field2: 'huc2name',
    label: 'Select HUC2 watershed',
    name: 'watershed'
  },
  huc4: {
    table: 'huc4',
    field: 'hucnamelong',
    field2: 'huc4name',
    label: 'Select HUC4 watershed',
    name: 'watershed'
  },
  huc6: {
    table: 'huc6',
    field: 'hucnamelong',
    field2: 'huc6name',
    label: 'Select HUC6 watershed',
    name: 'watershed'
  },
  huc8: {
    table: 'huc8',
    field: 'hucnamelong',
    field2: 'huc8name',
    label: 'Select HUC8 watershed',
    name: 'watershed'
  },
  tnc_lands_poly: {
    table: 'tnc_lands_poly',
    field: 'orig_fid',
    label: 'Select TNC Land',
    name: 'tnc land'
  },
  tncregion: {
    
  }
};


var filters = {
  spatial: {
    whole_systems: {
      build: 'no',
      cartoDbTable: 'whole_systems',
      cartoDbField: 'name',
      selectID: 'whole_systems',
      filterType: 'turf'        
    },
    congressional_districts: {
      build: 'no',
      cartoDbTable: 'congressional_districts',
      cartoDbField: 'cd_abbrev',
      selectID: 'congressional_districts',
      filterType: 'turf'           
    },
    countries: {
      build: 'no',
      cartoDbTable: 'countries',
      cartoDbField: 'name',
      selectID: 'countries',
      filterType: 'dataquery'                   
    },
    tnc_regions: {
      build: 'no',
      cartoDbTable: 'tnc_regions',
      cartoDbField: 'name',
      selectID: 'tnc_regions',
      filterType: 'turf'               
    },
    state: {
      build: 'yes',
      cartoDbTable: 'usa_states',
      cartoDbField: 'postal',
      selectID: 'state',
      filterType: 'dataquery'   
    }       
  },
  thematic: {
    usa_states: {
      build: 'yes',
      cartoDbTable: 'usa_states',
      cartoDbField: 'postal',
      selectID: 'operating-unit'
    },
    tnc_priority: {
      options: ['one', 'two']
    }
  }
};


var inputData = {
  tnclands: {
    //src: 'data/tnc_lands_fee_ce_pt.geojson',
    src: "http://dmajka.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM tnc_lands_pt ORDER BY clstransda DESC",
    // src: "data/tnclands.geojson",      
    datatype: 'geojson',	    
    name: 'TNC Lands',
    shortName: 'tnclands',
    divId: 'lands-output',
    countId: 'lands-count',
    markerOptions: {
	    disableClusteringAtZoom: 10,
	    maxClusterRadius: 70,
	    markerIcon: 'park',
	    markerColor: '47AA42'	    	
    },
    fields: {
      uniqueID: 'cartodb_id',
      date: 'clstransda',
      name: 'areanam',
      name2: 'mabr_name',
      abstract: 'protmech',
      state: 'state',
      country: '', //none right now
      overlayTable: 'polytable',
      overlayID: 'orig_fid'       
    },
    popupfield: 'areanam',
    uniqueID: '',
    template: {
    	summary: 
        '<div id="tnclands" class="card-summary">' +
          '<h3 class="lands"><img class="summary-icon" src="img/Land_Icon.png"> Lands</h3>' +
          	'<div class="row summary-row">' +
          		'<div class="col-xs-6 col-sm-6 summary-metric">' +
          			'<h4>Parcels ({{inputData.tnclands.markers.complete._geojson.features.length}})</h4>' +
          			'<span class="summary-number">{{inputData.tnclands.markers.inBounds.length}}</span>' +
          		'</div>' +

          		'<div class="col-xs-6 col-sm-6 summary-metric last">' +
          			'<h4 class="summary-units">{{appstate.units.areaUnits}} Protected</h4>' +
          			'<span class="summary-number">{{(Math.floor(sumAttribute(inputData.tnclands.markers.inBounds, "gis_ac")* appstate.units.areaConversion)).toLocaleString()}}</span>' +
          		'</div>' +
          	'</div>' +

          	// '<div class="row summary-row summary-graph">' +
          	// 	'<div class="col-xs-12">' +
          	// 		'<h4>Cumulative acres conserved</h4>' +
          	// 		'<div id="tnclands-cumul"></div>' +
          	// 	'</div>' +
          	// '</div>' +
            '<div class="row summary-row summary-graph">' +
              '<div class="col-xs-12">' +
                '<h4>Acres conserved per year</h4>' +
                '<div id="tnclands-peryear"></div>' +
              '</div>' +
            '</div>' +
        '</div>',
    	card: 
        '<dd id="{{unique_id}}" class="pos-left clearfix {{dataname}}-card" >' +
          '<div class="circ lands"></div>' +
          '<div class="time">{{#if date_year === "Invalid date"}} {{else}} {{date_short}}<br/>{{date_year}} {{/if}}</div>' +
          '<div class="events">' +
            '<div class="events-body project-card">' +
              '<span class="project-date"></span>' +
              '<span class="project-state">{{state}}</span>' +
              '<h4 class="events-heading">{{areanam}}</h4>' +
              '<p class="project-type">{{protmech}}</p>' +
              '<p>{{(gis_ac * appstate.units.areaConversion).toFixed(1)}} {{appstate.units.areaUnits}}</p>' +
              '<ul class="project-links">' +
                '<li><a href="#" id="{{unique_id}}" on-click="show-popup"><i class="fa fa-map-marker"></i> Highlight on map</a></li>' + 
                '<li><a href="#" id="{{unique_id}}" on-click="show-details"><i class="fa fa-table"></i> View details</a></li> ' +                        
              '</ul>' +                    
            '</div>' +
          '</div>' +
        '</dd>',
    	details:
        '<div class="card-detail">' +
          '<img class="details-icon" src="img/Land_Icon.png"> <h2 class="lands-detail">{{areanam}}</h2>' +
          '<p>{{#state}}{{state}} &bull;{{/state}} {{#if date_year === "Invalid date"}} Unknown year {{else}} {{date_short}}, {{date_year}} {{/if}} &bull; {{(gis_ac * appstate.units.areaConversion).toLocaleString()}} {{appstate.units.areaUnits}}</p>' +
          '<hr/>' +
          '<p><em>{{protmech}}{{#prothold}}, {{prothold}} {{/prothold}}</em></p>' + 

          '<p>{{landProtectMech(protmech)}}</p>' +
          '<ul>'+
            '{{#gapcat}}<li><strong>GAP Status: </strong> {{gapcat}}</li>{{/gapcat}}'+              
            '{{#tract_name}}<li><strong>Tract name: </strong> {{tract_name}}</li>{{/tract_name}}'+
            '{{#data_src}}<li><strong>Status: </strong> Transferred to {{owner}}</li>{{/data_src}}'+
            '{{#ma_ifms_id}}<li><strong>Managed Areas IFMS ID: </strong>{{ma_ifms_id}}</li>{{/ma_ifms_id}}'+
            '{{#tr_ifms_id}}<li><strong>Tract IFMS ID: </strong>{{tr_ifms_id}}</li>{{/tr_ifms_id}}'+                                           
          '</ul>' +
          '<hr/>' +
          '<p><a href="#" id="{{unique_id}}" on-click="show-popup"><i class="fa fa-map-marker"></i> Highlight on map</a> &nbsp; &nbsp; &nbsp; &nbsp; ' +
          '<a href="#" id="{{unique_id}}" on-click="show-footprint"><i class="fa fa-map-o"></i> Show footprint</a></p>' +
        '</div>',
    	popup: function (feature) {
    			// console.log(feature);
    			var template = '<div class="popup-title popup-tnclands">'+feature.properties.areanam+'</div>' + 
        '<div class="popup-body">'+
        	'<p>'+feature.properties.protmech+', '+ feature.properties.gis_ac+' ac</p>' +
        	'<ul class="popup-links">'+
            '<li><a href="#" class="popup-zoom-footprint"><i class="fa fa-map-o"></i> Show footprint</a></li>'+
        		'<li><a href="#" class="popup-details"><i class="fa fa-table"></i> View details</a></li>' +
        	'</ul>' +
        '</div>';
    			return template;
    	}
    },
    suppl_data: ''
  }
  , freshwater: {
    //src: 'data/tnc_lands_fee_ce_pt.geojson',
    src: "http://dmajka.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM freshwater_accomplishments ORDER BY completion_date DESC",
    datatype: 'geojson',	    
    name: 'Freshwater Accomplishments',
    shortName: 'freshwater',
    divId: 'freshwater-output',
    countId: 'freshwater-count',
    markerOptions: {
	    disableClusteringAtZoom: 2,
	    maxClusterRadius: 60,
	    markerIcon: 'water',
	    markerColor: '009ECB'	    	
    },
    fields: {
      uniqueID: 'cartodb_id',
      date: 'completion_date',
      dateFormat: 'YYYY',
      name: 'project_name',
      name2: 'water_body',
      abstract: 'project_abstract',
      state: 'project_state',
      country: 'project_country', //none right now
      overlayTable: 'extent_table',
      overlayID: 'extent_feature'      
    },
    popupfield: 'project_name',
    template: {
    	summary: 
        '<div id="tncfreshwater" class="card-summary">' +
          '<h3 class="freshwater"><img class="summary-icon" src="img/Water_Icon.png"> Freshwater</h3>' +
          	'<div class="row summary-row">' +
          		'<div class="col-xs-6 col-sm-6 summary-metric">' +
          			'<h4>Parcels ({{inputData.freshwater.markers.complete._geojson.features.length}})</h4>' +
          			'<span class="summary-number">{{inputData.freshwater.markers.inBounds.length}}</span>' +
          		'</div>' +

          		'<div class="col-xs-6 col-sm-6 summary-metric last">' +
          			'<h4 class="summary-units">{{appstate.units.distanceUnits}} Impacted</h4>' +
          			'<span class="summary-number">{{(Math.floor(sumAttribute(inputData.freshwater.markers.inBounds, "river_miles_impacted")* appstate.units.distanceConversion)).toLocaleString()}}</span>' +
          		'</div>' +

          	'</div>' +

          	'<div class="row summary-row summary-graph">' +
          		'<div class="col-xs-12">' +
          			'<!-- <h4>Acres conserved over time</h4> -->' +
          			'<div id="freshwater-histogram"></div>' +
          		'</div>' +
          	'</div>' +
        '</div>',
    	card: 
        '<dd class="pos-left clearfix {{dataname}}-card">' +
          '<div class="circ freshwater"></div>' +
          '<div class="time">{{date_short}}<br/>{{date_year}}</div>' +
          '<div class="events">' +
            '<div class="events-body project-card">' +
              '<span class="project-date"></span>' +
              '<span class="project-state">{{project_state}}</span>' +
              '<h4 class="events-heading">{{project_name}}</h4>' +
              '<p class="project-type"></p>' +
              '<p>{{(river_miles_impacted * appstate.units.distanceConversion).toFixed(1)}} {{appstate.units.distanceUnits}}</p>' +
              '<ul class="project-links">' +
                '<li><a href="#" id="{{unique_id}}" on-click="show-popup"><i class="fa fa-map-marker"></i> Highlight on map</a></li>' + 
                '<li><a href="#" id="{{unique_id}}" on-click="show-details"><i class="fa fa-table"></i> View details</a></li> ' +                        
              '</ul>' +                    
            '</div>' +
          '</div>' +
        '</dd>',
    	details:
        '<div class="card-detail">' +
          '<img class="details-icon" src="img/Water_Icon.png"> <h2 class="freshwater-detail">{{project_name}}</h2>' +
          '<p>{{project_state}} &bull; {{completion_date}} &bull; {{(river_miles_impacted * appstate.units.distanceConversion).toFixed(1)}} {{appstate.units.distanceUnits}}</p>' +
          '<hr/>' +
          '<p><em></em></p>' + 

          '<p>{{project_abstract}}</p>' +

	        '{{#partner1}}' +
	        '<h3>Partners</h3>' +
	          '<ul>' +
	            '{{#partner1}}<li>{{partner1}}</li>{{/partner1}}{{#partner2}}<li>{{partner2}}</li>{{/partner2}}{{#partner3}}<li>{{partner3}}</li>{{/partner3}}{{#partner4}}<li>{{partner4}}</li>{{/partner4}}{{#partner5}}<li>{{partner5}}</li>{{/partner5}}{{#partner6}}<li>{{partner6}}</li>{{/partner6}}{{#partner7}}<li>{{partner7}}</li>{{/partner7}}{{#partner8}}<li>{{partner8}}</li>{{/partner8}}{{#partner9}}<li>{{partner9}}</li>{{/partner9}}{{#partner10}}<li>{{partner10}}</li>{{/partner10}}' +
	          '</ul>' +
	        '{{/partner1}}' +

          '<hr/>' +
          '<p><a href="#" id="{{unique_id}}" on-click="show-popup"><i class="fa fa-map-marker"></i> Highlight on map</a> &nbsp; &nbsp; &nbsp; &nbsp; ' +
          '<a href="#" id="{{unique_id}}" on-click="show-footprint"><i class="fa fa-map-o"></i> Show footprint</a></p>' +
        '</div>',
    	popup: function (feature) {
    			// console.log(feature);
    			var template = '<div class="popup-title popup-freshwater">'+feature.properties.project_name+'</div>' + 
        '<div class="popup-body">'+
        	'<p>'+ feature.properties.river_miles_impacted+' mi impacted</p>' +
        	'<ul class="popup-links">'+
            '<li><a href="#" class="popup-zoom-footprint"><i class="fa fa-map-o"></i> Show footprint</a></li>'+
        		'<li><a href="#" class="popup-details"><i class="fa fa-table"></i> View details</a></li>' +
        	'</ul>' +
        '</div>';
    			return template;
    	}
    },
    suppl_data: ''
  }
  , coastalprojects: {
    src: "http://dmajka.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM habitat_restoration_survey_public",
    datatype: 'geojson',
    name: 'Coastal Projects',
    shortName: 'coastalprojects',
    countId: 'coastal-count',
    divId: 'coastal-output',
    markerOptions: {
	    disableClusteringAtZoom: 7,
	    maxClusterRadius: 40,
	    markerIcon: 'harbor',
	    markerColor: '23487a'
    },
    fields: {
      uniqueID: 'cartodb_id',
      date: 'enddate',
      name: 'projectname',
      name2: 'projectshortname',
      abstract: 'projectabstract',
      state: 'state', // 2 letter abbrev
      country: 'countryorterritory',
      acresRestored: ['acresofagric_land','acresofbeach','acresofcoralreef','acresofdune','acresofforest','acresofforestedwetlands','acresoffreshwaterwetland','acresofhardbottom','acresin_stream','acresofkelp','acresofmangrove','acresofoysterreef_shellbtm','acresofpond','acresinriparianzone','acresofrockyshoreline','acresofsoftbtm_mud_sand','acresofsav','acresoftidalwetland','acresofupland','acresofwatercolumn'],
      milesRestored: ['milesofagric_land','milesofbeach','milesofcoralreef','milesofdune','milesofforest','milesofforestedwetlands','milesoffreshwaterwetland','milesofhardbottom','milesofin_stream','milesofkelp','milesofmangrove','milesofoysterreef_shellbtm','milesofpond','milesofriparianzone','milesofrockyshoreline','milesofsoftbtm_mud_sand','milesofsav','milesoftidalwetland','milesofupland','milesofwatercolumn']       
    },
    popupfield: 'projectname',
    template: {
    	summary: 
        '<div class="card-summary">' +
          '<h3 class="oceans"><img class="summary-icon" src="img/Ocean_Icon.png"> Oceans <span class="amp"> &amp;</span> Coasts</h3>' +
          	'<div class="row summary-row">' +
          		'<div class="col-sm-4 col-md-4 summary-metric">' +
          			'<h4>Projects ({{inputData.coastalprojects.markers.complete._geojson.features.length}})</h4>' +
          			'<span class="summary-number">{{inputData.coastalprojects.markers.inBounds.length}}</span>' +
          		'</div>' +
          		'<div class="col-xs-6 col-sm-4 col-md-4 summary-metric">' +
          			'<h4>{{appstate.units.areaUnits}} Restored</h4>' +
          			'<span class="summary-number">{{Math.floor((sumMultiAttributes(inputData.coastalprojects.markers.inBounds, inputData.coastalprojects.fields.acresRestored)* appstate.units.areaConversion)).toLocaleString()}}</span>' +
          		'</div>' +

          		'<div class="col-xs-6 col-sm-4 col-md-4 summary-metric last">' +
          			'<h4>{{appstate.units.distanceUnits}} Restored</h4>' +
          			'<span class="summary-number">{{Math.floor((sumMultiAttributes(inputData.coastalprojects.markers.inBounds, inputData.coastalprojects.fields.milesRestored)* appstate.units.distanceConversion)).toLocaleString()}}</span>' +
          		'</div>' +
          	'</div>' +
          	'<div class="row summary-row">' +
          		'<div class="col-xs-6 col-sm-6 col-md-6 summary-metric">' +
          			'<h4>Total Volunteers</h4>' +
          			'<span class="summary-number">{{sumAttribute(inputData.coastalprojects.markers.inBounds, "totalnumberofvolunteersengaged").toLocaleString()}}</span>' +
          		'</div>' +

          		'<div class="col-xs-6 col-sm-6 col-md-6 summary-metric last">' +
          			'<h4>Volunteer Hours</h4>' +
          			'<span class="summary-number">{{sumAttribute(inputData.coastalprojects.markers.inBounds, "totalnumberofvolunteerhours").toLocaleString()}}</span>' +
          		'</div>' +
          	'</div>' +
        '</div>',
    	card: 
        '<dd class="pos-left clearfix {{dataname}}-card">' +
            '<div class="circ oceans"></div>' +
            '<div class="time">{{#if date_year === "Invalid date"}} {{else}} {{date_short}}<br/>{{date_year}} {{/if}}</div>' +
            '<div class="events">' +
              '<div class="events-body project-card">' +
                '<span class="project-date"></span>' +
                '<span class="project-state">{{state}}</span>' +
                '<h4 class="events-heading">{{projectname}}</h4>' +
                '<p class="project-type"><em>{{projecttype}}</em></p>' +
                '<ul class="project-links">' +
                  '<li><a href="#" id="{{unique_id}}" on-click="show-popup"><i class="fa fa-map-marker"></i> Highlight on map</a></li>' +
                  '<li><a href="#" id="{{unique_id}}" on-click="show-details"><i class="fa fa-table"></i> View details</a></li> ' +
                '</ul>' +
              '</div>' +
            '</div>' +
          '</dd>',
    	details: 
        '<div class="card-detail">' +
          '<img class="details-icon" src="img/Ocean_Icon.png"> <h2 class="oceans-detail">{{projectname}}</h2>' +
          '<p>{{state}} | {{#if date_year === "Invalid date"}} {{else}} {{date_short}}, {{date_year}} | {{/if}} {{sumProjectAttributes(inputData.coastalprojects.fields.acresRestored)}}  {{appstate.units.areaUnits}} | <a href="#" id="{{unique_id}}" on-click="show-popup"><i class="fa fa-map-marker"></i> Highlight on map</a></p>' +
          '<hr/>' +
          '<p>{{projectabstract}}</p>' +
          '{{#jpg1}}<img src="http://projects.tnc.org/coastal/assets/{{assetspath}}/{{jpg1}}" class="img-responsive"/>{{/jpg1}}' +
					'<h3>Overview</h3>' +
					        '<ul>' +
					          '<li><strong>Project Type:</strong> {{projecttype}}</li>' +

					          '<li><strong>Project Status:</strong> {{projectstatus}}</li>' +
					          '{{#startdate}}<li><strong>Project start date:</strong> {{startdate}}</li>{{/startdate}}' +
					          '{{#enddate}}<li><strong>Project completion date:</strong> {{enddate}}</li>{{/enddate}}' +          

					          '<li><strong>Site Name:</strong> {{sitename}}</li>' +
					          '<li><strong>Water Body:</strong> {{waterbody_river}}</li>' +

					          '{{#largerrestorationundertakingname}}' +
					          '  <li><strong>Larger undertaking name:</strong> {{largerrestorationundertakingname}}</li>' +
					          '{{/largerrestorationundertakingname}}' +

					          '<li><strong>Risk reduction demonstration site:</strong> {{riskreductionandresiliencydemonstrationsite}}</li>' +
					        '</ul>' +

					        '{{#primaryobjective}}' +
					        '<h3>Objectives</h3>' +
					          '<ul>' +
					            '<li>{{primaryobjective}}</li>' +
					            '<li>{{secondaryobjective1}}</li>' +
					            '<li>{{secondaryobjective2}}</li>' +
					          '</ul>' +
					         '{{/primaryobjective}}' +

					        '<h3>Contact Info</h3>' +
					          '<ul>' +
					            '<li>Project Manager: <a href="mailto:{{contactemailaddress}}">{{projectmanager}}</a>, {{tncoperatingunit}}</li>' +
					          '</ul>' +

									'<hr/>' +
									'<h3>Habitats &amp; Species</h3>' +
				          '{{#species1}}' +
				          '<h4>Species</h4>' +
				            '<ul class="report">' +
				              '{{#species1}}<li>{{species1}}</li>{{/species1}}{{#species2}}<li>{{species2}}</li>{{/species2}}{{#species3}}<li>{{species3}}</li>{{/species3}}{{#species4}}<li>{{species4}}</li>{{/species4}}{{#species5}}<li>{{species5}}</li>{{/species5}}{{#species6}}<li>{{species6}}</li>{{/species6}}{{#species7}}<li>{{species7}}</li>{{/species7}}{{#species8}}<li>{{species8}}</li>{{/species8}}{{#species9}}<li>{{species9}}</li>{{/species9}}{{#species10}}<li>{{species10}}</li>{{/species10}}' +
				            '</ul>' +
				          '{{/species1}}' +


					        '{{#partner1}}' +
					        '<h3>Partners</h3>' +
					          '<ul>' +
					            '{{#partner1}}<li>{{partner1}}</li>{{/partner1}}{{#partner2}}<li>{{partner2}}</li>{{/partner2}}{{#partner3}}<li>{{partner3}}</li>{{/partner3}}{{#partner4}}<li>{{partner4}}</li>{{/partner4}}{{#partner5}}<li>{{partner5}}</li>{{/partner5}}{{#partner6}}<li>{{partner6}}</li>{{/partner6}}{{#partner7}}<li>{{partner7}}</li>{{/partner7}}{{#partner8}}<li>{{partner8}}</li>{{/partner8}}{{#partner9}}<li>{{partner9}}</li>{{/partner9}}{{#partner10}}<li>{{partner10}}</li>{{/partner10}}{{#partner11}}<li>{{partner11}}</li>{{/partner11}}{{#partner12}}<li>{{partner12}}</li>{{/partner12}}{{#partner13}}<li>{{partner13}}</li>{{/partner13}}{{#partner14}}<li>{{partner14}}</li>{{/partner14}}{{#partner15}}<li>{{partner15}}</li>{{/partner15}}{{#partner16}}<li>{{partner16}}</li>{{/partner16}}' +
					          '</ul>' +
					        '{{/partner1}}' +

					        '{{#totalnumberofvolunteersengaged}}{{#totalnumberofvolunteerhours}}' +
					        '<h3>Volunteers</h3>' +
					          '<ul>' +
					            '{{#totalnumberofvolunteersengaged}}<li>{{totalnumberofvolunteersengaged}} volunteers engaged</li>{{/totalnumberofvolunteersengaged}}' +
					            '{{#totalnumberofvolunteerhours}}<li>{{totalnumberofvolunteerhours}} total volunteer hours</li>{{/totalnumberofvolunteerhours}}' +
					          '</ul>' +
					          '{{/totalnumberofvolunteerhours}}{{/totalnumberofvolunteersengaged}}' +


          '{{#pdf1}}' +
          '<h3>Related Files</h3>' +
            '<ul>' +
              '{{#pdf1}}<li><a href="http://projects.tnc.org/coastal/assets/{{assetspath}}/{{pdf1}}" target="_blank">File 1</a></li>{{/pdf1}}' +
              '{{#pdf2}}<li><a href="http://projects.tnc.org/coastal/assets/{{assetspath}}/{{pdf2}}" target="_blank">File 2</a></li>{{/pdf2}}' +
              '{{#pdf3}}<li><a href="http://projects.tnc.org/coastal/assets/{{assetspath}}/{{pdf3}}" target="_blank">File 3</a></li>{{/pdf3}}' +
              '{{#pdf4}}<li><a href="http://projects.tnc.org/coastal/assets/{{assetspath}}/{{pdf4}}" target="_blank">File 4</a></li>{{/pdf4}}' +
              '{{#pdf5}}<li><a href="http://projects.tnc.org/coastal/assets/{{assetspath}}/{{pdf5}}" target="_blank">File 5</a></li>{{/pdf5}}' +
              '{{#pdf6}}<li><a href="http://projects.tnc.org/coastal/assets/{{assetspath}}/{{pdf6}}" target="_blank">File 6</a></li>{{/pdf6}}' +
            '</ul>' +
           '{{/pdf1}}' +
        '</div>',
    	popup: function (feature) {
    			var template = '<div class="popup-title popup-coastal">'+feature.properties.projectname+', '+ feature.properties.state+'</div>' + 
        '<div class="popup-body">'+
        '<p>'+feature.properties.projecttype+'</p>' +
        	'<ul class="popup-links">'+
            '<li><a href="#" class="popup-zoom"><i class="fa fa-search-plus"></i> Zoom to location</a></li>'+
        		'<li><a href="#" class="popup-details"> <i class="fa fa-table"></i> View details</a></li>' +
        	'</ul>' +
        '</div>';
    			return template;
    	}
    },
    suppl_data: ''
  }		
};




module.exports = {
	spatialOverlay: spatialOverlay,
	filters: filters,
	inputData: inputData
}

