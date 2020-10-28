const fs = require('fs');
const path = require("path")
const readline = require('readline');
const CMD = require('./cmd');
const utils = require('./utils')

//读取配置文件
function readFileToArr(fReadName, callback) {
    let fRead = fs.createReadStream(fReadName);
    let objReadline = readline.createInterface({
        input: fRead
    });
    let arr = new Array();
    objReadline.on('line', function (line) {
        arr.push(line);
    });
    objReadline.on('close', function () {
        callback(arr);
    });
}
//日志输出
function showLog(cwd, cmd) {
    let time = utils.dateFormat("mm-dd HH:MM:SS", new Date())
    console.log(time + cwd.replace(__dirname, " .") + ' ' + cmd);
}
function startAppPack(realCWD) {
    let setp = -1;
    readFileToArr(path.join(realCWD, "packfile.sh"), function (cmdArr) {
        showLog("  [" + 0 + "]  " + realCWD, "开始打包");
        let getNextCmdCall = function (_step, cmd) {
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
    let cmdArr = initCmd;
    let realCWD = __dirname;
    let setp = -1;
    showLog("  [" + 0 + "]  " + realCWD, "开始初始化");
    let getNextCmdCall = function (_step, cmd) {
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