import * as fs from 'fs';
import * as path from 'path';
import * as chalk from 'chalk';
import {UpgradeProjectJson} from './upgrade-project-json';
import {UpgradeXproj} from './upgrade-xproj';
import {UpgradeCs} from './upgrade-cs';
import {UpgradeGlobalJson} from './upgrade-global-json'
import {glob} from './glob'


let chalk = chalk.default;

/** map of globs to transform functions for that file type */
let globsToTransformers:{[s: string]: (s:string)=>string } = {
    'project.json': UpgradeProjectJson.upgrade,
    'global.json': UpgradeGlobalJson.upgrade,
    '*.xproj': UpgradeXproj.upgrade,
    '*.cs': UpgradeCs.upgrade,
    '*.cshtml': UpgradeCs.upgrade
}

/** rewrites a file by passing it through a transform function */
async function rewriteFile(filePath:string, transformFunction:(input:string)=> string):Promise<void> {
    //console.log(`Updating ${filePath}`);
    let input:string = fs.readFileSync(filePath, 'utf8');
    let output = transformFunction(input);
    if (output === input){
        console.log(`No changes to ${filePath}`);
    } else {
        fs.writeFileSync(filePath, output, 'utf8');
        console.log(chalk.yellow(`Saved ${filePath}`));
    }
}

function main() {
    let errors:{[s: string]: any} = {};
    let promises:Array<Promise<any>> = [];
    for (let pattern in globsToTransformers) {
        errors[pattern] = {};

        promises.push(
            glob(`../**/${pattern}`, {})
                .then((matches:Array<string>) => {
                    for (let path of matches) {
                        rewriteFile(path, globsToTransformers[pattern])
                            .catch((err) => {
                                errors[pattern][path] = err.toString();
                            });
                    }
                })
                .catch((err) => {
                    errors[pattern] = err.toString();
                    return;
                })
        );
    }
    Promise.all(promises).then(() => {
        let totalErrors = 0;
        console.log('Finished.');
        for (let pattern in errors) {
            if (typeof errors[pattern] === 'string') {
                totalErrors++;
            } else {
                let length = Object.keys(errors[pattern]).length;
                if (length === 0) {
                    errors[pattern] = 0;
                } else {
                    totalErrors += length;
                }
            }
        }
        console.error(`Errors by file type: ${JSON.stringify(errors, null, 4)}`);
        console.error(totalErrors ? chalk.red.bold(`Total Errors: ${totalErrors}`) : `Total Errors: ${totalErrors}`);
        console.log('Try running "dotnet restore -v Error" at the solution directory');
    })
}

main();