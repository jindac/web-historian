var path = require('path');
var archive = require('../helpers/archive-helpers');
var fs = require('fs');
// require more modules/folders here!
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};
//
exports.handleRequest = function (req, res) {
  var statusCode = 404;
  var data;
  var headers = defaultCorsHeaders;
  console.log('url =================>', req.url);
  console.log('method =================>', req.method);
  headers['Content-Type'] = 'text/html; charset=utf-8';
  if (req.url === '/' && req.method === 'GET') {
    fs.readFile(path.join(archive.paths.siteAssets, 'index.html'), function(err, page) {
      if (err) {
        console.log('Failed to read file', err);
      } else {
        statusCode = 200;
        console.log('statusCode ========> ', statusCode);
        data = page.toString();
        console.log('datatostring =========>', data);
        res.writeHead(statusCode, headers);
        res.end(data);
      }
    });
  }
};
