const process = require('child_process');
const archiver = require('archiver');
const utils = require('./utils')
const path = require("path")
const fs = require('fs');

//执行命令
var doEXEC = function (cmd, realCWD, finshCall) {
    process.exec(cmd, { cwd: realCWD }, (error, stdout, stderr) => {
        if (stdout) {
            console.log(stdout)
        }
        if (stderr) {
            //  console.log(stderr)
        }
        finshCall && finshCall({
            "realCWD": realCWD
        });
    });
}
//打包
var doPack = function (dir, realCWD, finshCall) {
    try { fs.mkdirSync(path.join(realCWD, dir.split(" ")[0])) } catch (error) { }
    const archive = archiver('zip');
    const output = fs.createWriteStream(path.join(realCWD, dir.split(" ")[0], dir.split(" ")[1]));
    output.on('close', function () {
        finshCall && finshCall({
            "realCWD": realCWD
        });
    });
    archive.pipe(output);
    archive.directory(path.join(realCWD, 'build'), false);
    archive.finalize();
}
//执行下一个命令
var doCMD = function (cmd, realCWD, finshCall) {
    if (cmd) {
        if (cmd.startsWith("cd")) {
            var realCWD = path.join(realCWD, cmd.replace("cd", "").trim())
            finshCall && finshCall({
                "realCWD": realCWD
            });
        } else if (cmd.startsWith("pack")) {
            doPack(cmd.replace("pack", "").trim(), realCWD, finshCall)
        } else {
            doEXEC(cmd, realCWD, finshCall)
        }
    } else {
        finshCall && finshCall({
            "realCWD": realCWD
        });
    }
}
//获取下一个命令
var getNextCmd = function (cmdArr, _step, finshCall) {
    var setp = _step + 1;
    if (cmdArr && cmdArr.length > setp) {
        var cmd = cmdArr[setp];
        if (cmd) {
            var _cmd = cmd.split("#")[0];
            if (_cmd.indexOf('${time}')) {
                _cmd = _cmd.replace('${time}', utils.dateFormat('YYYMMdd_HHmmSS', new Date()))
            }
            finshCall && finshCall(setp, _cmd.trim())
        } else {
            getNextCmd(cmdArr, setp + 1, finshCall);
        }
    } else {
        finshCall && finshCall(-1);
    }
}
exports.doEXEC = doEXEC;
exports.doPack = doPack;
exports.doCMD = doCMD;
exports.getNextCmd = getNextCmd;