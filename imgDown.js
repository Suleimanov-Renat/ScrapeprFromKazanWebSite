let fs = require('fs');
let request = require('request');

 module.exports = class ImgDown{

  download (uri, filename, callback) {
    request.head(uri, function(err, res, body){
       request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
  };
}