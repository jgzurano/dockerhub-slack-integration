#!/usr/bin/node

var express  = require('express'),
    app      = express(),
    bodyParser = require('body-parser'),
    slackUrl = 'https://hooks.slack.com',
    http = require('http'),
    server = http.createServer(app),
    request = require('request');
    exec = require('child_process').exec;

app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.urlencoded({
      limit: '100mb',
      extended: true
}));
app.use(bodyParser.json());
app.use(bodyParser.json({limit: '100mb'}));

function hookAction(req) {

  var body = req.body;
  slackUrl += req.url;

  var data = body.push_data,
    repo = body.repository,
    tag = data.tag,
    pusher = data.pusher,
    pushedAt = data.pushed_at,
    created = repo.date_created,
    repoName = repo.repo_name,
    repoURL = repo.repo_url,
    pushedDate = new Date(pushedAt * 1000);

    payload = {
      "text":"New image build complete" + 
      "\nRepository: <" + repoURL + ">" +
      "\nTag: " + tag +
      "\nPushed: " + pushedDate,
      "icon_url":"https://www.docker.com/sites/default/files/legal/small_v.png",
      "username":"Docker Hub"
    }

  var options = {
    uri: slackUrl,
    method: 'POST',
    json: payload
  }

  request(options, function(err,res,body) {
    if (!err && res.statusCode == 200) {
      console.log(res.statusCode);
    } else {
        console.log('err:' + err);
        console.log('res:' + res);
        console.log('code:' + res.statusCode);
      }
  });

  console.log(payload);
  console.log(slackUrl);
  return 200;

}

app.post(new RegExp('/services\/.*'), function(req, res) { res.sendStatus(hookAction(req)); });
app.get('/', function(req, res) { res.sendStatus(200); });

server.listen(app.get(port),function(){
  console.log("Server listening on port " + app.get(port));
});
