var process = require('child_process');
var compressing = require('compressing')
var fs = require("fs")
var path = require("path")
var fileData = fs.readFileSync("config/packfile.sh");
var cmdArr = fileData.toString().split("\r\n");
var realCWD = __dirname;
var i = 0;
function dateFormat(fmt, date) {
    let ret;
    const opt = {
        "Y+": date.getFullYear().toString(),        // 年
        "m+": (date.getMonth() + 1).toString(),     // 月
        "d+": date.getDate().toString(),            // 日
        "H+": date.getHours().toString(),           // 时
        "M+": date.getMinutes().toString(),         // 分
        "S+": date.getSeconds().toString()          // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        };
    };
    return fmt;
}
//获取下一个命令
function getNextCmd() {
    var cmd = cmdArr[i++];
    if (cmd) {
        var _cmd = cmd.split("#")[0]
        console.log(_cmd)
        return _cmd.trim()
    } else {
        if (hasNextCmd()) {
            return getNextCmd();
        } else {
            return null
        }
    }
}
//判断是否 执行完成
function hasNextCmd() {
    return cmdArr && cmdArr.length > i;
}
//执行下一个命令
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
        } else if (cmd.startsWith("pack")) {
            pack(cmd.replace("pack", "").trim())
        } else {
            doCMD(cmd, realCWD)
        }

    }
}
//执行命令
function doCMD(cmd, cwd) {
    showLog(cwd, cmd);
    process.exec(cmd, { cwd: cwd }, function (error, stdout, stderr) {
        if (stdout) {
            console.log(stdout)
        }
        if (stderr) {
            console.log(stderr)
        }
        doNext();
    });
}

function pack(dir) {
    compressing.zip.compressDir(path.join(realCWD, 'build'), path.join(realCWD, dir))
        .then(() => {
            console.log('success');
        })
        .catch(err => {
            console.error(err);
        });
}
//日志输出
function showLog(cwd, cmd) {
    var time = dateFormat("mm-dd HH:MM:SS", new Date())
    console.log(time + cwd.replace(__dirname, " .") + ' ' + cmd);
}
doNext();