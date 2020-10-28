var process = require('child_process');
const fs = require('fs');
const archiver = require('archiver');
var path = require("path")
var readline = require('readline');

var cmdArr = [];
var realCWD = __dirname;
var setp = 0;

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
    var cmd = cmdArr[setp++];
    if (cmd) {
        var _cmd = cmd.split("#")[0];
        if (_cmd.indexOf('${time}')) {
            _cmd = _cmd.replace('${time}', dateFormat('YYYMMdd_HHmmSS', new Date()))
        }
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
    return cmdArr && cmdArr.length > setp;
}

//执行下一个命令
function doNext() {
    if (!hasNextCmd()) {
        console.log("执行结束");
        return
    }
    let cmd = getNextCmd();
    if (cmd) {
        showLog("  [" + setp + "]  " + realCWD, cmd);
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
    process.exec(cmd, { cwd: cwd }, (error, stdout, stderr) => {
        if (stdout) {
            //  console.log(stdout)
        }
        if (stderr) {
            //  console.log(stderr)
        }
        doNext();
    });
}

function pack(dir) {
    try { fs.mkdirSync(path.join(realCWD, dir.split(" ")[0])) } catch (error) { }
    const archive = archiver('zip');
    const output = fs.createWriteStream(path.join(realCWD, dir.split(" ")[0], dir.split(" ")[1]));
    output.on('close', function () {
        doNext();
    });
    archive.pipe(output);
    archive.directory(path.join(realCWD, 'build'), false);
    archive.finalize();
}
//日志输出
function showLog(cwd, cmd) {
    var time = dateFormat("mm-dd HH:MM:SS", new Date())
    console.log(time + cwd.replace(__dirname, " .") + ' ' + cmd);
}


function _main_() {
    readFileToArr("config/packfile.sh", function (res) {
        cmdArr = res;
        showLog("  [" + 0 + "]  " + realCWD, "开始执行任务");
        doNext();
    })
}
_main_();