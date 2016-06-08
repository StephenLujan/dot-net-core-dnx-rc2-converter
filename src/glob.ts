import * as baseGlob from 'glob';

// (typings and jspm weren't playing nice with npm:glob-promise so I copied it)
/** file glob that returns a promise */
export function glob (pattern: string, options: {}): Promise<any> {
    return new Promise(function (_resolve, _reject) {
        baseGlob(pattern, options, function (err, files) {
            return err === null ? _resolve(files) : _reject(err)
        })
    })
}