module.exports = {
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
    isPowerOfTwo: function(n){
        // Another idea would be isInteger( logBase(2, n) )
        // @see http://www.graphics.stanford.edu/~seander/bithacks.html#DetermineIfPowerOf2
        return ( n != 0 && ( n & (n - 1) ) === 0 );
    },
    logBase: function(base,n) {
        return Math.log(n) / Math.log(base);
    },
    
    debounce: require("lodash.debounce"),
    findKey:  require("lodash.findkey"),
    fraction: require("frac"),
    values:   require("lodash.values")
}