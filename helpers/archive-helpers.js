var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var request = require('request');
/*
 * You will need to reuse the same paths many times over in the course of this sprint.
 * Consider using the `paths` object below to store frequently used file paths. This way,
 * if you move any files, you'll only need to change your code in one place! Feel free to
 * customize it in any way you wish.
 */

exports.paths = {
  siteAssets: path.join(__dirname, '../web/public'),
  archivedSites: path.join(__dirname, '../archives/sites'),
  list: path.join(__dirname, '../archives/sites.txt')
};

// Used for stubbing paths for tests, do not modify
exports.initialize = function(pathsObj) {
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};

// The following function names are provided to you to suggest how you might
// modularize your code. Keep it clean!

exports.readListOfUrls = function(cb) {
  fs.readFile(exports.paths.list, function(err, data) {
    if (err) {
      cb(err, null);
    } else {
      data = data.toString();
      var urlArray = data.split('\n');
      urlArray.pop(); //remove final empty string;
      cb(null, urlArray);
    }
  });
};

exports.isUrlInList = function(url, cb) {
  exports.readListOfUrls(function(err, urlArray) {
    if (err) {
      cb(err, null);
    } else {
      cb(null, _.reduce(urlArray, function(result, val) {
        if (val === url || result) {
          return true;
        } else {
          return false;
        }
      }, false));
    }
  });
};

exports.addUrlToList = function(url, cb) {
  exports.isUrlInList(url, function(err, exists) {
    if (err) {
      cb(err);
    } else {
      if (exists) {
        cb(null);
      } else {
        fs.appendFile(exports.paths.list, url + '\n', function() {
          cb(null);
        });
      }
    }
  });
};

exports.isUrlArchived = function(url, cb) {
  console.log('Preparing to read: ', path.join(exports.paths.archivedSites, url));
  fs.readFile(path.join(exports.paths.archivedSites, url), function(err, data) {
    if (err) {
      if (err.code === 'ENOENT') { //file is not archieved
        cb(null, false);
      } else {
        cb(err, null); //other errors
      }
    } else {
      cb(null, true); //file is archived
    }
  });
};

exports.downloadUrls = function(urlArray) {
  _.each(urlArray, function(url) {
    //ajax request to get html from url
    request({
      uri: 'http://' + url
    }, function(error, response, body) {
      if (error) {
        console.log(error);
      } else {
      //success: write to file
        fs.writeFile(path.join(exports.paths.archivedSites, url), body, function(err) {
          if (err) {
            // fs.writeFile(path.join(exports.paths.archivedSites, '../errors.txt'), err, function() {});
            console.log('Failed to write file', err);
          }
        });
      }
    });
  });
};
