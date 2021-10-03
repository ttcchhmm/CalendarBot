'use-strict';

// --- node builtins
const https = require('https');

// Download the provided URL, and run the success callback with the body. If an error occurs, the error callback is ran instead
exports.download = function(url, success, error) {
    https.get(url, (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            success(data);
        });
    }).on('error', (err) => {
        error(err);
    });
}