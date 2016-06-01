import * as fs from 'fs';
import * as path from 'path';
import * as chalk from 'chalk';
import {walk} from 'walk';
import {UpgradeProjectJson} from './upgrade-project-json';

let options = {};
let walker = walk("../", options);
let chalk = chalk.default;

//console.log(JSON.stringify(chalk, null, 2));

let fileNamesToTransformers = {
    'project.json' : UpgradeProjectJson.upgrade,
    'global.json' : (string) => {
        let object = JSON.parse(string);
        object['sdk']['version']= '1.0.0-preview1-002702';
        console.log(object);
        return JSON.stringify(object, null, 2);
    }
}

walker.on("file", function (root, fileStat, next) {
    if (fileStat.name in fileNamesToTransformers) {
        let filePath = path.resolve(root, fileStat.name);
        console.log(chalk.yellow.underline(`Updating ${filePath}`));
        fs.readFile(filePath, 'utf8', (err, buffer) => {
            if (err) throw err;
            //console.log(buffer);
            let output = fileNamesToTransformers[fileStat.name](buffer);
            fs.writeFile(filePath, output, (err) => {
                if (err) throw err;
                console.log('It\'s saved!');
                next();
            });
        });
    }
    else {
        next();
    }
});

walker.on("errors", function (root, nodeStatsArray, next) {
    nodeStatsArray.forEach(function (n) {
        console.error("[ERROR] " + n.name)
        console.error(n.error.message || (n.error.code + ": " + n.error.path));
    });
    next();
});

walker.on("end", function () {
    console.log("all done");
});

