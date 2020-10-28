const express = require('express')
const app = express()
const logger = require('morgan');
const path = require('path');
const bodyParser = require('body-parser')
const packServer = require('./pack');
const port = 7001

app.use(logger('dev'));
app.use(bodyParser.json());// 添加json解析
app.use(express.static(path.join(process.cwd(), 'html')));
app.post('/', (req, res) => {
    console.log(req.body)
    let git_http_url = req.body.repository.git_http_url;
    let projectName = req.body.repository.name;
    packServer(initCmd(git_http_url, projectName));
    res.send('ok')
})
app.listen(port, function () {
    console.log(`Example app listening on port ${port}!`)
})

function initCmd(git_http_url, projectName) {
    return ["mkdir source", "cd source", "git clone " + git_http_url, "cd " + projectName,"git pull"]
}