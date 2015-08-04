var express = require('express');
var app = express();
var url = require('url');
var loremIpsum = require('lorem-ipsum');
var loremArr = loremIpsum({ count: 100 }).split(" ");
var shortid = require('shortid');
var resArr;
var flatTree;


// Used to get random word from LoremIpsum text
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Make object copy without children property
function objectCopy(secondObject, firstObject){
  for (var prop in firstObject) {
    if (firstObject.hasOwnProperty(prop) && prop !== "children") {
      secondObject[prop] = firstObject[prop];
    }
  }
  return secondObject;
}

function generateLevel(parentId){
  var treeEl = {};
  treeEl.name = loremArr[getRandomInt(0, 100)];
  treeEl._id = shortid.generate();
  if(parentId){
    treeEl.parentId = parentId;
  }
  return treeEl;
}

app.get('/activeNodeId', function (req, res) {
  var activeNode,
      activeNodeId;

  if(flatTree && flatTree.length){
   activeNode = flatTree[getRandomInt(0, flatTree.length)];
   activeNodeId = activeNode._id;
  }

  res.json({"activeNodeId": activeNodeId});
});

app.get('/', function (req, res) {
  var url_parts = url.parse(req.url, true),
      query = url_parts.query,
      roots = query.roots || 5,
      levels = query.levels || 3,
      children = query.children || 2;

  resArr = [];
  flatTree = [];

  for(var i = 0, l = roots; i < l; i++){
    var rootEl = generateLevel(),
        level = rootEl,
        deepCount = levels;

    flatTree.push(objectCopy({}, rootEl));

    while(deepCount - 1 > 0){
      level.children = [];
      for(var k = 0, z = children; k < z; k++){
        level.children.push(generateLevel(level._id));
        flatTree.push(objectCopy({}, level.children[k]));
      }

      level = level.children[getRandomInt(0, children - 1)];
      deepCount--;
    }

    resArr.push(rootEl);
  }

  query.treeView ? res.json(resArr) : res.json(flatTree);
});

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

var server = app.listen(server_port, server_ip_address, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});