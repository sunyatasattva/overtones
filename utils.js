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
    rgbToHex: function(rgb) {
        if (/^#[0-9A-F]{6}$/i.test(rgb)) return rgb;

        rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        function hex(x) {
            return ( "0" + parseInt(x).toString(16) ).slice(-2);
        }
        return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    },
    
    debounce: require("lodash.debounce"),
    findKey:  require("lodash.findkey"),
    fraction: require("frac"),
    values:   require("lodash.values")
}