var path = require('path');
var archive = require('../helpers/archive-helpers');
var fs = require('fs');
var url = require('url');
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
  console.log('req.url ======>', req.url);
  console.log('req.method ======>', req.method);
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
  } else if (req.url === '/loading.html' && req.method === 'GET') {
    fs.readFile(path.join(archive.paths.siteAssets, '/loading.html'), function(err, page) {
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
            console.log('just read ===>', path.join(archive.paths.archivedSites, req.url));
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

            statusCode = 302;
            headers['Location'] = '/loading.html';
            res.writeHead(statusCode, headers);
            res.end();
            // fs.readFile(path.join(archive.paths.siteAssets, '/loading.html'), function(err, page) {
            //   if (err) {
            //     console.log('Failed to read file', err);
            //   } else {
            //     statusCode = 200;
            //     // console.log('statusCode ========> ', statusCode);
            //     data = page.toString();
            //     // console.log('datatostring =========>', data);
            //     res.writeHead(statusCode, headers);
            //     res.end(data);
            //   }
            // });
            // if url is not in list, send back 404
          } else {
            res.writeHead(statusCode, headers);
            res.end();
          }  
        });   
      }
    });
  } else if (req.method === 'POST') {
    var body = '';
    req.on('data', function(chunk) {
      body += chunk;
    });
    req.on('end', function() {
      console.log('body ============> ', body);
      body = body.slice(4);
      archive.addUrlToList(body, function(err) {
        if (err) {
          console.log(err);
        } else {
          statusCode = 302;
          headers['Location'] = '/' + body;
          res.writeHead(statusCode, headers);
          res.end();
        }
      });
    });
  }
};
