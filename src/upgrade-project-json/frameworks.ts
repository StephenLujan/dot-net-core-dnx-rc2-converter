import {ProjectJson} from './project-json';

const FRAMEWORK_NETCOREAPP = {
    "imports": [
        "dotnet5.6",
        "dnxcore50",
        "portable-net45+win8"
    ],
    "dependencies": {
        "Microsoft.NETCore.App": {
            "type": "platform",
            "version": "1.0.0-rc2-*"
        }
    }
};
const FRAMEWORK_NET46 = {};
const FRAMEWORK_NET452 = {
    //"imports": [
    //    "dnx45",
    //    "dnx451",
    //    "dnx452"
    //]
};
const FRAMEWORK_NET45 = {};

const FRAMEWORKS = {
    "netcoreapp1.0": FRAMEWORK_NETCOREAPP,
    "net46": FRAMEWORK_NET46,
    "net452": FRAMEWORK_NET452,
    "net45": FRAMEWORK_NET45
};

const OLD_TO_NEW_FRAMEWORK_MAP = {
    "dnx451": "net452",
    "dnx45": "net45",
    "dnx46 ": "net46",
    "dnxcore50": "netcoreapp1.0"
};

export function upgrade(object:{dependencies:{}, frameworks:{}}):void {
    // move dependencies out of old frameworks

    let newFrameworks = {};
    for (let frameworkName in object.frameworks) {
        if (frameworkName in OLD_TO_NEW_FRAMEWORK_MAP) {
            let framework = object.frameworks[frameworkName];
            let newFrameworkName = OLD_TO_NEW_FRAMEWORK_MAP[frameworkName];
            let newFramework = FRAMEWORKS[newFrameworkName];
            if (framework['dependencies']) {
                newFramework.dependencies = Object.assign(
                    newFramework.dependencies || {}, (framework['dependencies']));
            }
            if (framework['frameworkAssemblies']) {
                newFramework.frameworkAssemblies = Object.assign(
                    newFramework.frameworkAssemblies || {}, framework['frameworkAssemblies']);
            }
            newFrameworks[newFrameworkName]= newFramework;
        } else {
            if (!frameworkName.startsWith('net')) {
                throw new Error(`unmapped framework used: ${frameworkName}`);
            }
        }
    }
    object.frameworks = newFrameworks;
}