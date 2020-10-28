const fs = require('fs');
var path = require("path")
var readline = require('readline');
var CMD = require('./cmd');
var utils = require('./utils')

//读取配置文件
function readFileToArr(fReadName, callback) {
    var fRead = fs.createReadStream(fReadName);
    var objReadline = readline.createInterface({
        input: fRead
    });
    var arr = new Array();
    objReadline.on('line', function (line) {
        arr.push(line);
    });
    objReadline.on('close', function () {
        callback(arr);
    });
}

//日志输出
function showLog(cwd, cmd) {
    var time = utils.dateFormat("mm-dd HH:MM:SS", new Date())
    console.log(time + cwd.replace(__dirname, " .") + ' ' + cmd);
}
function startAppPack(realCWD) {
    var setp = -1;
    readFileToArr(path.join(realCWD, "packfile.sh"), function (cmdArr) {
        showLog("  [" + 0 + "]  " + realCWD, "开始打包");
        var getNextCmdCall = function (_step, cmd) {
            setp = _step;
            if (_step != -1) {
                showLog("  [" + _step + "]  " + realCWD, cmd);
                CMD.doCMD(cmd, realCWD, function (res) {
                    realCWD = res.realCWD;
                    CMD.getNextCmd(cmdArr, setp, getNextCmdCall)
                })
            } else {
                showLog("  [" + _step + "]  " + realCWD, "打包完成");
            }
        }
        CMD.getNextCmd(cmdArr, setp, getNextCmdCall)
    })
}
function startPack(initCmd) {
    var cmdArr = initCmd;
    var realCWD = __dirname;
    var setp = -1;
    showLog("  [" + 0 + "]  " + realCWD, "开始初始化");
    var getNextCmdCall = function (_step, cmd) {
        setp = _step;
        if (_step != -1) {
            showLog("  [" + _step + "]  " + realCWD, cmd);
            CMD.doCMD(cmd, realCWD, function (res) {
                realCWD = res.realCWD;
                CMD.getNextCmd(cmdArr, setp, getNextCmdCall)
            })
        } else {
            showLog("  [" + _step + "]  " + realCWD, "初始化完成");
            startAppPack(realCWD);
        }
    }
    CMD.getNextCmd(cmdArr, setp, getNextCmdCall)
}
//startPack
module.exports = startPack;
//startPack(["mkdir source", "cd source", "git clone https://git8.c2cloud.cn/intelli-park/intelli-park-app-h5.git", "cd intelli-park-app-h5"])