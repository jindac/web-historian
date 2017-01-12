var path = require('path');
var archive = require('../helpers/archive-helpers');
var fs = require('fs');
// require more modules/folders here!
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};
//
exports.handleRequest = function (req, res) {
  var statusCode = 404;
  var data;
  var headers = defaultCorsHeaders;
  // console.log('url =================>', req.url);
  // console.log('method =================>', req.method);
  headers['Content-Type'] = 'text/html; charset=utf-8';
  if (req.url === '/' && req.method === 'GET') {
    fs.readFile(path.join(archive.paths.siteAssets, 'index.html'), function(err, page) {
      if (err) {
        console.log('Failed to read file', err);
      } else {
        statusCode = 200;
        // console.log('statusCode ========> ', statusCode);
        data = page.toString();
        // console.log('datatostring =========>', data);
        res.writeHead(statusCode, headers);
        res.end(data);
      }
    });             
  } else if (req.method === 'GET') {
    archive.isUrlArchived(req.url, function (err, exists) {
      if (err) {
        console.log(err);
      } else if (exists) { // page is in archive
        fs.readFile(path.join(archive.paths.archivedSites, req.url), function(err, page) {
          if (err) {
            console.log('Failed to read file', err);
          } else {
            statusCode = 200;
            // console.log('statusCode ========> ', statusCode);
            data = page.toString();
            // console.log('datatostring =========>', data);
            res.writeHead(statusCode, headers);
            res.end(data);
          }
        });            
      } else { // page is not in archive -- may or may not be in list
        archive.isUrlInList(req.url.slice(1), function(err, exists) {
          if (err) {
            console.log(err);
          } else if (exists) {
            // if url is in list,
            // take user to loading.html 
            fs.readFile(path.join(archive.paths.siteAssets, 'loading.html'), function(err, page) {
              if (err) {
                console.log('Failed to read file', err);
              } else {
                statusCode = 200;
                // console.log('statusCode ========> ', statusCode);
                data = page.toString();
                // console.log('datatostring =========>', data);
                res.writeHead(statusCode, headers);
                res.end(data);
              }
            });
            // if url is not in list, send back 404
          } else {
            res.writeHead(statusCode, headers);
            res.end();
          }  
        });   
      }
    });
  } else if (req.url === '/' && req.method === 'POST') {
    var body = '';
    req.on('data', function(chunk) {
      body += chunk;
    });
    req.on('end', function() {
      body = JSON.parse(body);
      // console.log('body ============>', body.url);
      archive.addUrlToList(body.url, function(err) {
        if (err) {
          console.log(err);
        } else {
          statusCode = 302;
          headers['Content-Type'] = 'application/json';
          res.writeHead(statusCode, headers);
          res.end(JSON.stringify({}));
        }
      });
    });
  }
};
