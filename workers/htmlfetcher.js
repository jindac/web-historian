// Use the code in `archive-helpers.js` to actually download the urls
// that are waiting.
var helpers = require('../helpers/archive-helpers');
var _ = require('underscore');

var toBeDownloaded = [];
console.log('Started worker');

helpers.readListOfUrls(function (err, urlArray) {
  if (err) {
    console.log(err);
  } else {
    _.each(urlArray, function(url) {
      helpers.isUrlArchived(url, function (err, exists) {
        if (err) {
          console.log(err);
        } else if (!exists) {
          console.log(url, ' is not archived! Archiving now!');
          toBeDownloaded.push(url);
        }
      });
    });
  }
});

setTimeout(function() {
  if (toBeDownloaded.length > 0) {
    console.log('Preparing to download ' + toBeDownloaded.length + ' URLs.');
    helpers.downloadUrls(toBeDownloaded);
  }
}, 1000);


// cron job:
// */1 * * * * /usr/local/bin/node /Users/student/Desktop/WebHistorian/workers/htmlfetcher.js
