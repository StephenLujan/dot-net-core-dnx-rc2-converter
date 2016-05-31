import * as fs from 'fs';
import * as path from 'path';
import {walk} from 'walk';
import {UpgradeProjectJson} from './upgrade-project-json';

let options = {};
let walker = walk("../", options);

walker.on("file", function (root, fileStat, next) {
    if (fileStat.name == "project.json") {
        let filePath = path.resolve(root, fileStat.name);
        console.log(`Updating ${filePath}`);
        fs.readFile(filePath, 'utf8', (err, buffer) => {
            if (err) throw err;
            //console.log(buffer);
            let output = UpgradeProjectJson.upgrade(buffer);
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

