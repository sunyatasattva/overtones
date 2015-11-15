module.exports = {
    logBase: function(base,n) {
        return Math.log(n) / Math.log(base);
    },
    binarySearch: function(target, array) {
        var highestIndex = array.length - 1,
            lowestIndex  = 0,
            middlePoint;
        
        while(highestIndex - lowestIndex > 1) {
            middlePoint = Math.floor( (lowestIndex + highestIndex) / 2);
            
            if(array[middlePoint] < target) {
                lowestIndex = middlePoint;
            } else {
                highestIndex = middlePoint;
            }
        }

        if( target - array[lowestIndex] <= array[highestIndex] - target ) {
            return array[lowestIndex];
        }
        
        return array[highestIndex];
    },
    
    debounce: require("lodash.debounce"),
    findKey:  require("lodash.findkey"),
    values:   require("lodash.values")
}