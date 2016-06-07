import {ProjectJson} from './project-json';
import {treeMove, renameKeyIfExists} from '../dictionary-tools'

// TODO: find out where 'namedResource' is moving
const OLD_TO_NEW_PATH_MAP = {
    'compilerName':['buildOptions', 'compilerName'],
    'compile': ['buildOptions','compile', 'include'],
    'compileExclude': ['buildOptions','compile', 'exclude'],
    'compileFiles ': ['buildOptions','compile', 'includeFiles'],
    'compileBuiltIn ': ['buildOptions','compile', 'builtIns'],
    'resource': ['buildOptions', 'embed', 'include'],
    'resourceExclude': ['buildOptions', 'embed', 'exclude'],
    'resourceFiles': ['buildOptions', 'embed', 'includeFiles'],
    'resourceBuiltIn': ['buildOptions', 'embed', 'builtIns'],
    'content': ['buildOptions', 'copyToOutput', 'include'],
    'contentExclude': ['buildOptions', 'copyToOutput', 'exclude'],
    'contentFiles': ['buildOptions', 'copyToOutput', 'includeFiles'],
    'contentBuiltIn': ['buildOptions', 'copyToOutput', 'builtIns'],
};

export function upgrade(object:ProjectJson):void {
    // rename compilation options
    renameKeyIfExists(object, 'compilationOptions', 'buildOptions');

    for (let old_path in OLD_TO_NEW_PATH_MAP) {
        treeMove(object, [old_path], OLD_TO_NEW_PATH_MAP[old_path])
    }
}