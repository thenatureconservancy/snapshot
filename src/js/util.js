var TNC = TNC || {};

TNC.util = {
  uiConfig: function() {
    // $(document).ready(function() {
    //   $("select.select-search").select2();
    // });
    // $("#project-deepdive").select2({
    //   minimumResultsForSearch: Infinity
    // });
    $(".btn-group > .btn").click(function(){
      $(this).addClass("active").siblings().removeClass("active");
    });
  },

	toTitleCase: function(str) {
	  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
	},

	dualPivotQuicksort: function() {
        var dualPivotQS = {};
    
        dualPivotQS.sort = function(arr, fromIndex, toIndex) {
            if(fromIndex === undefined && toIndex === undefined){
                this.sort(arr, 0, arr.length);
            } else{
                rangeCheck(arr.length, fromIndex, toIndex);
                dualPivotQuicksort(arr, fromIndex, toIndex - 1, 3);
            }
            return arr;
        }
    
        function rangeCheck(length, fromIndex, toIndex) {
            if (fromIndex > toIndex) {
                console.error("fromIndex(" + fromIndex + ") > toIndex(" + toIndex + ")");
            }
            if (fromIndex < 0) {
                console.error(fromIndex);
            }
            if (toIndex > length) {
                console.error(toIndex);
            }
        }
    
        function swap(arr, i, j) {
            var temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    
        function dualPivotQuicksort( arr, left, right, div) {
          var len = right - left;
  
          if (len < 27) { // insertion sort for tiny array
              for (var i = left + 1; i <= right; i++) {
                  for (var j = i; j > left && arr[j] < arr[j - 1]; j--) {
                      swap(arr, j, j - 1);
                  }
              }
              return;
          }
          var third = Math.floor(len / div); //TODO: check if we need to round up or down or just nearest
  
          // "medians"
          var m1 = left  + third;
          var m2 = right - third;
  
          if (m1 <= left) {
              m1 = left + 1;
          }
          if (m2 >= right) {
              m2 = right - 1;
          }
          if (arr[m1] < arr[m2]) {
              swap(arr, m1, left);
              swap(arr, m2, right);
          }
          else {
              swap(arr, m1, right);
              swap(arr, m2, left);
          }
          // pivots
          var pivot1 = arr[left];
          var pivot2 = arr[right];
  
          // pointers
          var less  = left  + 1;
          var great = right - 1;
  
          // sorting
          for (var k = less; k <= great; k++) {
              if (arr[k] < pivot1) {
                  swap(arr, k, less++);
              }
              else if (arr[k] > pivot2) {
                  while (k < great && arr[great] > pivot2) {
                      great--;
                  }
                  swap(arr, k, great--);
  
                  if (arr[k] < pivot1) {
                      swap(arr, k, less++);
                  }
              }
          }
          // swaps
          var dist = great - less;
  
          if (dist < 13) {
              div++;
          }
          swap(arr, less  - 1, left);
          swap(arr, great + 1, right);
  
          // subarrays
          dualPivotQuicksort(arr, left,   less - 2, div);
          dualPivotQuicksort(arr, great + 2, right, div);
  
          // equal elements
          if (dist > len - 13 && pivot1 != pivot2) {
              for (var k = less; k <= great; k++) {
                  if (arr[k] == pivot1) {
                      swap(arr, k, less++);
                  }
                  else if (arr[k] == pivot2) {
                      swap(arr, k, great--);
  
                      if (arr[k] == pivot1) {
                          swap(arr, k, less++);
                      }
                  }
              }
          }
          // subarray
          if (pivot1 < pivot2) {
              dualPivotQuicksort(arr, less, great, div);
          }
      }
      return dualPivotQS;
  }	
}