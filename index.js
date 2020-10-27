var process = require('child_process');
var fs = require("fs")
var path = require("path")
var fileData = fs.readFileSync("packfile");
var cmdArr = fileData.toString().split("\r\n");
var realCWD = __dirname;
var i = 0;
//获取下一个命令
function getNextCmd() {
    var cmd = cmdArr[i++];
    if (cmd) {
        return cmd.trim()
    } else {
        if (hasNextCmd()) {
            return getNextCmd();
        } else {
            return null
        }
    }
}
function hasNextCmd() {
    return cmdArr && cmdArr.length > i;
}
function doNext() {
    if (!hasNextCmd()) {
        console.log("执行结束");
        return
    }
    let cmd = getNextCmd();
    if (cmd) {
        if (cmd.startsWith("cd")) {
            realCWD = path.join(realCWD, cmd.replace("cd", "").trim())
            doNext();
        } else {
            doCMD(cmd, realCWD)
        }

    }
}

function doCMD(cmd, cwd) {
    console.log(cwd, cmd);
    process.exec(cmd, { cwd: cwd }, function (error, stdout, stderr) {
        
        doNext();
    });
}
doNext();