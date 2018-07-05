const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////
// rewrite the functions so that they talk to filesystem rather than changing in memory
exports.create = (text, callback) => {
  return counter.getNextUniqueId((err, counterString) => {
    fs.writeFile(`${exports.dataDir}/${counterString}.txt`, text.toString(), (err) => {
      callback(null, {id: counterString, text: text});
    })
  })
};

exports.readOne = (id, callback) => {

  fs.readFile(`${exports.dataDir}/${id}.txt`, (err, fileData) => {
    if (err) {
      callback(err, fileData);
    } else {
      callback(null, {id: id, text: fileData.toString()})
    }
  })
};

exports.readAll = (callback) => {
  // var arr = [];
  // fs.readdir(exports.dataDir, (err, files) => {
  //   _.each(files, (file) => {
  //     arr.push({id: file.substr(0, 5), text: file.substr(0, 5)})
  //   });
  //   callback(null, arr);
  // });

  fs.readdir(exports.dataDir, (err, fileNames) => {
    let arr = [];
    // console.log(fileNames);
    fileNames.forEach((file) => {
      let parkersPromise = new Promise ((resolve, reject) => {
        fs.readFile(`${exports.dataDir}/${file}`, (err, text) => {
          resolve({id: file.substr(0, 5), text: text.toString()})
        })
      })
      arr.push(parkersPromise);
    })

    Promise.all(arr).then((data) => {
      // console.log(data)
      callback(null, data)
    }).catch((err) => {
      // console.log(err);
    })

  })
}

exports.update = (id, text, callback) => {
  exports.readOne(id, (err, fileData) => {
    if (err) {
      callback(err);
    } else {
      fs.writeFile(`${exports.dataDir}/${id}.txt`, text.toString(), (err) => {
        callback(null, {id: id, text: text});
      })
    }
  })
};

exports.delete = (id, callback) => {
  fs.unlink(`${exports.dataDir}/${id}.txt`, (err) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`))
    } else {
      callback();
    }
  })
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
