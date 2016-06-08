import * as Dependencies from './dependencies';
import * as Frameworks from './frameworks';
import * as BuildOptions from './build-options';
import {ProjectJson} from './project-json';

export module UpgradeProjectJson {

    const PACK_OPTIONS = [
        'tags', 'projectUrl', 'licenseUrl', "repository"
    ];

    const TOOLS = {
        "Microsoft.AspNetCore.Razor.Tools": {
            "version": "1.0.0-preview1-final",
            "imports": "portable-net45+win8+dnxcore50"
        },
        "Microsoft.AspNetCore.Server.IISIntegration.Tools": {
            "version": "1.0.0-preview1-final",
            "imports": "portable-net45+win8+dnxcore50"
        },
        "Microsoft.EntityFrameworkCore.Tools": {
            "version": "1.0.0-preview1-final",
            "imports": [
                "portable-net45+win8+dnxcore50",
                "portable-net45+win8"
            ]
        },
        "Microsoft.Extensions.SecretManager.Tools": {
            "version": "1.0.0-preview1-final",
            "imports": "portable-net45+win8+dnxcore50"
        },
        "Microsoft.VisualStudio.Web.CodeGeneration.Tools": {
            "version": "1.0.0-preview1-final",
            "imports": [
                "portable-net45+win8+dnxcore50",
                "portable-net45+win8"
            ]
        }
    };

    function packOptions(object:ProjectJson) {

        if (!('packOptions' in object)) {
            object['packOptions'] = {};
        }
        for (var tag of PACK_OPTIONS) {
            if (tag in object) {
                object['packOptions'][tag] = object[tag];
                delete object[tag];
            }
        }
    }

    export function upgrade(input:string):string {
        //strip trailing commas before parsing JSON
        input = input.replace(/,[ \t\r\n]+}/g, "}");
        input = input.replace(/,[ \t\r\n]+\]/g, "]");
        var object = JSON.parse(input);

        // update the frameworks section
        Frameworks.upgrade(object);

        // upgrade the dependencies section
        Dependencies.upgrade(object);

        BuildOptions.upgrade(object);

        // move test runner
        if (object.commands && object.commands.test) {
            delete object.commands.test;
        }
        object.testRunner = "xunit";

        // move tags, etc. into "packOptions"
        packOptions(object);


        // replace tooling
        if (object.commands) {
            //delete this.commands;
        }
        object['tools'] = TOOLS;

        // publish is now a whitelist not a blacklist
        delete object.publishExclude;
        object["publishOptions"] = {
            "include": [
                "wwwroot",
                "Views",
                "appsettings.json",
                "web.config"
            ]
        };

        // output as string
        return JSON.stringify(object, null, 2);
    }

}