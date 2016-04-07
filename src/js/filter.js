var noUiSlider = require('nouislider');

function buildSelect (lyr, id, fieldArray) {
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
};


function loadFilterOptions (cartoDbTable, field, selectID) {
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
};


function buildSelectCartoDb (cartoDbTable, field, selectID) {
  var query = "http://dmajka.cartodb.com/api/v2/sql?q=SELECT DISTINCT "+ field + " FROM " + cartoDbTable  + " ORDER BY " + field + " ASC";
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
};



function buildSpatialSelect (filtobject) {
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
};



function buildTimeSlider () {
  var slider = document.getElementById('time-slider');
  var currentYear = new Date().getFullYear();

  noUiSlider.create(slider, {
    start: [1950, currentYear],
		tooltips: [false, false],
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
};



module.exports = {
	buildSelect: buildSelect,
	loadFilterOptions: loadFilterOptions,
	buildSelectCartoDb: buildSelectCartoDb,
	buildSpatialSelect: buildSpatialSelect,
	buildTimeSlider: buildTimeSlider

}



