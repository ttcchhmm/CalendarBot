'use-strict';

exports.pretty = function(nb) {
    if(nb < 10) {
        return "0" + nb;
    } else {
        return nb;
    }
}