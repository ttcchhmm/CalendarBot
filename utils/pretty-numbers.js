'use-strict';

// Add a zero to the start of a number if it equals less than 10. Used to show prettier minutes.
exports.pretty = function(nb) {
    if(nb < 10) {
        return "0" + nb;
    } else {
        return nb;
    }
}