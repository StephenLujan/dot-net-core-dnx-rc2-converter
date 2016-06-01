import * as fs from 'fs';
import * as path from 'path';
import * as chalk from 'chalk';
import {UpgradeProjectJson} from './upgrade-project-json';
import {Glob} from 'glob';

let options = {};
let chalk = chalk.default;


let globsToTransformers = {
    'project.json': UpgradeProjectJson.upgrade,
    'global.json': (string:string) => {
        let object = JSON.parse(string);
        object['sdk']['version'] = '1.0.0-preview1-002702';
        return JSON.stringify(object, null, 2);
    },
    '*.xproj': (string:string) => {
        throw new Error('TODO: *.xproj');
    }
}

function rewrite(filePath:string, transformFunction:(input:string)=> string) {
    console.log(chalk.yellow(`Updating ${filePath}`));
    fs.readFile(filePath, 'utf8', (err, buffer) => {
        if (err) throw err;
        //console.log(buffer);
        let output = transformFunction(buffer);
        fs.writeFile(filePath, output, (err) => {
            if (err) throw err;
            console.log(chalk.yellow(`Saved ${filePath}`));
        });
    });
}

for (let pattern in globsToTransformers) {
    let func = (err:Error, matches:Array<String>) => {
        if (err) {
            console.error(chalk.red(`error processing ${matches}: ${err}`));
            return;
        }
        for (let path of matches) {
            try {
                rewrite(path, globsToTransformers[pattern]);
            } catch(err) {
                console.error(chalk.red(`error processing ${path}: ${err}`));
            }
        }
    };
    let glob = new Glob(`../**/${pattern}`, {}, func);
}