/**
 *  Utility functions
 *
 * @module
 */

module.exports = {
    /**
     * Searches within an array the value closest to a target value.
     *
     * @param  {number}  target  A target value
     * @param  {array}   array   An array of values to search within
     *
     * @return {number}  The closest value to the target
     */
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
    /**
     * Checks if a number is a power of two
     *
     * @param  {number}  n  The number to check
     *
     * @return  {bool}
     */
    isPowerOfTwo: function(n){
        // Another idea would be isInteger( logBase(2, n) )
        // @see http://www.graphics.stanford.edu/~seander/bithacks.html#DetermineIfPowerOf2
        return ( n != 0 && ( n & (n - 1) ) === 0 );
    },
    /**
     * Calculates a logarithm of a number in an arbitrary base
     *
     * @param  {number}  base  The logarithm base
     * @param  {number}  n     The number
     *
     * @return {number}  log<sub>base</sub>(n)
     */
    logBase: function(base,n) {
        return Math.log(n) / Math.log(base);
    },
    /**
     * Transforms an rgb value into an hex value
     *
     * @param  {string}  rgb  The rgb value, must be in format `rgb(r,g,b)`
     *
     * @return {string}  The hex value of the color
     */
    rgbToHex: function(rgb) {
        if (/^#[0-9A-F]{6}$/i.test(rgb)) return rgb;

        rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        function hex(x) {
            return ( "0" + parseInt(x).toString(16) ).slice(-2);
        }
        return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    },
    
    /**
     * @see  {@link  https://lodash.com/docs#debounce|lodash.debounce}
     */
    debounce: require("lodash.debounce"),
    /**
     * @see  {@link  https://lodash.com/docs#findkey|lodash.findkey}
     */
    findKey:  require("lodash.findkey"),
    /**
     * @see  {@link  https://www.npmjs.com/package/frac|SheetJS's frac}
     */
    fraction: require("frac"),
    /**
     * @see  {@link  https://lodash.com/docs#debounce|lodash.values}
     */
    values:   require("lodash.values")
}