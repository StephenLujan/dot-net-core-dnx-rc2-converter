import * as Glob from 'glob';


// (typings and jspm weren't playing nice with npm:glob-promise so I copied it)
/** file glob that returns a promise */
export function glob (pattern: string, options: Object): Promise<any> {
    return new Promise(function (_resolve, _reject) {
        Glob.glob(pattern, options, function (err, files) {
            return err === null ? _resolve(files) : _reject(err)
        })
    })
};