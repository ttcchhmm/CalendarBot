'use-strict';

// --- node builtins
const https = require('https');

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