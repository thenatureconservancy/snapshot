var Chartist = require('chartist');

function buildHistogram (ractive, inKeyPath, outKeyPath, yearField, sumFields) {
	var inArray = ractive.get(inKeyPath),
				removeInvalid = _.reject(inArray, [yearField, 'Invalid date'] ),
	      projectsByYear = _.groupBy(removeInvalid, yearField),					
	      // projectsByYear = _.groupBy(inArray, yearField),
	      field,
	      projectsSummary,
	      key,
	      yearArray,
	      yearSum,
	      yearCount,
	      yearAverage,
	      sortByYear,
	      sortCumul;

	  for (field in sumFields) {
		  projectsSummary = [];

		  for (key in projectsByYear) {
		    yearArray = projectsByYear[key];
		    yearSum = _.sumBy(yearArray, sumFields[field]);
		    yearCount = yearArray.length;	    
		    yearAverage = yearSum/yearCount;
		    projectsSummary.push({'year': key, 'sum': yearSum, 'avg': yearAverage, 'count': yearCount });
		  }

	    sortByYear = _.sortBy(projectsSummary, 'year');

	    // calculates cumulative sum and adds to projectsSummary array
	    sortCumul = sortByYear.reduce(function(sum, d){
	      d.cumul = sum + d.sum;
	      return sum + d.sum;
	    }, 0);

		  //console.log(projectsSummary);
		  ractive.set(outKeyPath+'.'+sumFields[field], _.sortBy(projectsSummary, 'year'));	
	  };


		var data = ractive.get(outKeyPath+'.'+sumFields[field]);
		var y = _.map(data, 'sum');

    // new Chartist.Line('#tnclands-cumul', {
    //   labels: _.map(data, 'year'),
    //   series: [_.map(data, 'cumul')]
    //   },
    //   {
    //   fullWidth: true,
    //   chartPadding: {
    //     right: 10
    //   },
    //   axisX: {
    //           labelInterpolationFnc: function(value, index) {
    //             console.log('series', this);
    //             return index % 5 === 0 ? value : null;
    //           }
    //         }
    // }); 

    new Chartist.Bar('#tnclands-peryear', {
      labels: _.map(data, 'year'),
      series: [_.map(data, 'sum')]
    }, {
      fullWidth: true,
      seriesBarDistance: 10,
      chartPadding: {
        right: 30,
        left: 20
      },
      axisX: {
        labelInterpolationFnc: function(value, index) {
          return index % 5 === 0 ? value : null;
        }
      }
    });       
};


module.exports = {
  buildHistogram: buildHistogram
}
