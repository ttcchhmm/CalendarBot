'use-strict';

exports.eventSort = function(first, second) {
    if(first.start < second.start) {
        return -1;
    } else if (first.start > second.start) {
        return 1;
    } else {
        return 0;
    }
}