var TNC = TNC || {};

TNC.filter = {
	buildSelect: function(lyr, id, fieldArray) {
	  var selectArray = [];
	  for (field in fieldArray) {
	    var dropprop = fieldArray[field];
	    for (var key in lyr.features) {
	      var prop = lyr.features[key].properties[dropprop];
	      if (selectArray.indexOf(prop) === -1 && prop !== '') {
	        selectArray.push(prop); 
	      }
	    }
	  }
	  selectArray.sort();
	  var sel = document.getElementById(id);
	  for(var i = 0; i < selectArray.length; i++) {
	      var opt = document.createElement('option');
	      opt.innerHTML = selectArray[i];
	      opt.value = selectArray[i];
	      sel.appendChild(opt);
	  }
	  // sel.classList.add("selectpicker");
	  $("#"+id).select2({
	    placeholder: "Select a Value"
	  });
	  $('input, textarea, select').placeholder();
	},

  loadFilterOptions: function(cartoDbTable, field, selectID) {
    var query = "http://dmajka.cartodb.com/api/v2/sql?q=SELECT DISTINCT "+ field + " FROM " + cartoDbTable  + " ORDER BY " + field + " ASC";
    $.getJSON(query, function(data) {
      var sel = document.getElementById(selectID);
        for (var i = 0; i < data.rows.length; i++) {
          var opt = document.createElement('option');
          opt.innerHTML = data.rows[i][field];
          opt.value = data.rows[i][field];
          sel.appendChild(opt);
        }
        // sel.classList.add("selectpicker");
        $("#"+selectID).select2({
          placeholder: "Select a Value"
        });
        // $('input, textarea, select').placeholder(); //use placeholder plugin for IE9/10 if necessary
    });    
  },

	buildSelectCartoDb: function(cartoDbTable, field, selectID) {
	  // query cartodb for unique list of values for a field, sorted ascending
	  var query = "http://dmajka.cartodb.com/api/v2/sql?q=SELECT DISTINCT "+ field + " FROM " + cartoDbTable  + " ORDER BY " + field + " ASC";
	  console.log(query);
	  console.log(selectID);
	  // build select by adding each value as an option to a select dropdown
	  $.getJSON(query, function(data) {
	    var sel = document.getElementById(selectID);
	      for (var i = 0; i < data.rows.length; i++) {
	        var opt = document.createElement('option');
	        opt.innerHTML = data.rows[i][field];
	        opt.value = data.rows[i][field];
	        sel.appendChild(opt);
	      }
	      // sel.classList.add("selectpicker");
	      $("#"+selectID).select2({
	        placeholder: "Select a Value"
	      });
	      // $('input, textarea, select').placeholder(); //use placeholder plugin for IE9/10 if necessary
	  });
	},


  buildSpatialSelect: function(filtobject) {
    for (var key in filtobject) {
      // console.log(filtobject);
      // console.log(filtobject[key]);
      var filterType = filtobject[key].filterType;
      if (filtobject.hasOwnProperty(key)) {
        if (filtobject[key].build === 'yes') {
          this.buildSelectCartoDb(filtobject[key].cartoDbTable, filtobject[key].cartoDbField, filtobject[key].selectID);
          ractive.set('appstate.filters.'+filterType+'.'+key, null); //adds filter to either turf or dataquery filter categories       
        }
      }
    }
  },

  spatialIntersect: function(ptsLayer, overlayObject) {
    $("#turftest").click(function(){
      //var pts = omnivore.geojson("http://dmajka.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM tnc_lands_fee_ce_pt ORDER BY areanam ASC", null, L.mapbox.featureLayer());
      //pts.on('ready', function() {
        //ptsjson = pts.getGeoJSON();
        var markers = new L.MarkerClusterGroup();

        //var overlay = omnivore.geojson("http://dmajka.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM whole_systems WHERE name IN ('Longleaf Pine')", null, L.mapbox.featureLayer());
        //var overlay = omnivore.geojson("http://dmajka.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT w.* FROM whole_systems as w, usa_states as s WHERE ST_Intersection(w.the_geom, s.the_geom) AND w.name = 'Longleaf Pine' AND s.name = 'Florida'", null, L.mapbox.featureLayer());
        var overlay = omnivore.geojson("http://dmajka.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT ST_Intersection(whole_systems.the_geom, usa_states.the_geom) As the_geom FROM whole_systems CROSS JOIN usa_states  WHERE whole_systems.name = 'Longleaf Pine' and usa_states.name IN ('Florida', 'Georgia')", null, L.mapbox.featureLayer());
        overlay.on('ready', function() {
          overlayjson = overlay.getGeoJSON();
          var ptsWithin = turf.within(ptsjson, overlayjson);
          var filtered = turf.filter(ptsWithin, "state", "FL");
          var ptsWithinLayer = L.geoJson(filtered).addTo(map);
          //markers.addLayer(ptsWithin);
          map.fitBounds(overlay.getBounds());
          overlay.addTo(map);   
        })
      //});
    });
  },

  buildTimeSlider: function() {
    var slider = document.getElementById('time-slider');
    var currentYear = new Date().getFullYear();

    noUiSlider.create(slider, {
      start: [1950, currentYear],
			tooltips: [true, true],
      connect: true,
      range: {
        'min': 1950,
        'max': currentYear
      },
      pips: {
        mode: 'steps',
        values: [1950, currentYear],
        density: 100,
        stepped: false
      }
    });
  },

  buildThematicFilterQuery: function() {
    console.log('buildFilterQuery');
    ractive.get('appstate.filters');
  }

}


