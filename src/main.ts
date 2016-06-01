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

async function rewrite(filePath:string, transformFunction:(input:string)=> string) {
    console.log(chalk.yellow(`Updating ${filePath}`));
    let buffer:string = fs.readFileSync(filePath, 'utf8');
    let output = transformFunction(buffer);
    fs.writeFileSync(filePath, output, 'utf8');
    console.log(chalk.yellow(`Saved ${filePath}`));
}

async function main() {
    let totalErrors = 0;
    for (let pattern in globsToTransformers) {
        function callBack(err:Error, matches:Array<String>) {
            if (err) {
                totalErrors++;
                console.error(chalk.red(`error processing ${matches}: ${err}`));
                return;
            }
            for (let path of matches) {
                rewrite(path, globsToTransformers[pattern])
                    .catch((err) => {
                        totalErrors++;
                        console.error(chalk.red.bold(`error processing ${path}:\n   ${err}`));
                    });
            }
        };
        let glob = new Glob(`../**/${pattern}`, {}, callBack);
    }
    console.log(chalk.white.bold(`Finished with ${totalErrors} errors.`));
}

main();