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

const FRAMEWORKS = {
    "netcoreapp1.0": FRAMEWORK_NETCOREAPP
    //"net46": {},
    //"net452" : {}
};

export function upgrade(object:{dependencies:{}, frameworks:{}}):void {
    // move dependencies out of old frameworks
    let frameworkAssemblies = {};
    for (let frameworkName in object.frameworks) {
        if (frameworkName.includes('dnx')) {
            let framework = object.frameworks[frameworkName];
            if (framework['dependencies']) {
                if (!object.dependencies) {
                    object.dependencies = {};
                }
                Object.assign(object.dependencies, (framework['dependencies']));
            }
            if (framework['frameworkAssemblies']) {
                Object.assign(frameworkAssemblies, framework['frameworkAssemblies']);
                console.log(`Stray framework assemblies ${
                    JSON.stringify(framework['frameworkAssemblies'])}`);
            }
        }
    }

    // update the frameworks section
    object.frameworks = FRAMEWORKS;
}