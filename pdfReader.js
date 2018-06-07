let pdfreader = require('pdfreader');
module.exports = class ImgDown{
      constructor(data) {
                          
var rows = {}; // indexed by y-position

function printRows() {
    let docParse = [];
  Object.keys(rows) // => array of y-positions (type: float)
    .sort((y1, y2) => parseFloat(y1) - parseFloat(y2)) // sort float positions
    .forEach((y) => docParse.push((rows[y] || []).join('')));
    return docParse;
}

new Promise((resolve, reject) => new pdfreader.PdfReader().parseFileItems(data.toString(), function(err, item){
  if (!item ) {
      if(err) reject(err)
        resolve(printRows())
    //return printRows();
  }
  else if (item.text) {
    // accumulate text items into rows object, per line
    (rows[item.y] = rows[item.y] || []).push(item.text);
  }
})).then(m => {return console.log(m)})                              
}}