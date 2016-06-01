import * as fs from 'fs';
import * as path from 'path';
import * as chalk from 'chalk';
import {UpgradeProjectJson} from './upgrade-project-json';
import * as Glob from 'glob';

let options = {};
let chalk = chalk.default;


String.prototype['replaceAll'] = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

// (typings and jspm weren't playing nice with npm:glob-promise so I copied it)
/** file glob that returns a promise */
function glob (pattern: string, options: Object): Promise {
    return new Promise(function (_resolve, _reject) {
        Glob.glob(pattern, options, function (err, files) {
            return err === null ? _resolve(files) : _reject(err)
        })
    })
};

/** map of globs to transform functions for that file type */
let globsToTransformers = {
    'project.json': UpgradeProjectJson.upgrade,
    'global.json': (contents:string) => {
        let object = JSON.parse(contents);
        object['sdk']['version'] = '1.0.0-preview1-002702';
        return JSON.stringify(object, null, 2);
    },
    '*.xproj': (contents:string) => {
        contents = contents.replaceAll("\\DNX\\Microsoft.DNX.Props", "\\DotNet\\Microsoft.DotNet.Props");
        contents = contents.replaceAll("\\DNX\\Microsoft.DNX.targets", "\\DotNet.Web\\Microsoft.DotNet.Web.targets");
        // TODO: change the BaseIntermediateOutputPath to:
        // <BaseIntermediateOutputPath Condition="'$(BaseIntermediateOutputPath)'=='' ">.\obj</BaseIntermediateOutputPath>
        // TODO:  add target framework just after the OutputPath:
        // <TargetFrameworkVersion>v4.5.2</TargetFrameworkVersion>
        return contents;
    }
}

/** rewrites a file by passing it through a transform function */
async function rewrite(filePath:string, transformFunction:(input:string)=> string):void {
    console.log(chalk.yellow(`Updating ${filePath}`));
    let input:string = fs.readFileSync(filePath, 'utf8');
    let output = transformFunction(input);
    fs.writeFileSync(filePath, output, 'utf8');
    console.log(chalk.yellow(`Saved ${filePath}`));
}

function main() {
    let errors = {};
    let promises = [];
    for (let pattern in globsToTransformers) {
        errors[pattern] = {};

        promises.push(
            glob(`../**/${pattern}`, {})
                .then((matches:Array<String>) => {
                    for (let path of matches) {
                        rewrite(path, globsToTransformers[pattern])
                            .catch((err) => {
                                errors[pattern][path] = err.toString();
                                //console.error(chalk.red(`error processing ${path}:\n   ${err}`));
                            });
                    }
                })
                .catch((err) => {
                    //console.error(chalk.red(`error processing ${matches}: ${err}`));
                    errors[pattern] = err.toString();
                    return;
                })
        );
    }
    Promise.all(promises).then(() => {
        console.log('Finished.');
        console.error(chalk.red.bold(`Errors ${JSON.stringify(errors, null, 4)}`));
    })
}

main();