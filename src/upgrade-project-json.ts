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
        //"netcoreapp1.0": FRAMEWORK_NETCOREAPP
        //"net46": {},
        "net452" : {}
    };

    // includes "common packages" from https://docs.efproject.net/en/latest/miscellaneous/rc1-rc2-upgrade.html
    const ASSEMBLY_NAME_CHANGES = {
        'EntityFramework.SqlServer': 'Microsoft.EntityFrameworkCore.SqlServer',
        'EntityFramework.MicrosoftSqlServer': 'Microsoft.EntityFrameworkCore.SqlServer',
        'EntityFramework.SQLite': 'Microsoft.EntityFrameworkCore.SQLite',
        'EntityFramework7.Npgsql': 'NpgSql.EntityFrameworkCore.Postgres',
        'EntityFramework.SqlServerCompact35': 'EntityFrameworkCore.SqlServerCompact35',
        'EntityFramework.SqlServerCompact40': 'EntityFrameworkCore.SqlServerCompact40',
        'EntityFramework.InMemory': 'Microsoft.EntityFrameworkCore.InMemory',
        'EntityFramework.Commands': 'Microsoft.EntityFrameworkCore.Tools',
        'EntityFramework.MicrosoftSqlServer.Design': 'Microsoft.EntityFrameworkCore.SqlServer.Design',
        'Microsoft.AspNet.Identity.EntityFramework': 'Microsoft.AspNetCore.Identity.EntityFrameworkCore',
        'Microsoft.AspNet.IISPlatformHandler': 'Microsoft.AspNetCore.Server.IISIntegration',
        'Microsoft.AspNet.Diagnostics.Entity': 'Microsoft.AspNetCore.Diagnostics.EntityFrameworkCore',
        'Microsoft.AspNet.Tooling.Razor': 'Microsoft.AspNetCore.Razor.Tools',
        'Microsoft.Extensions.CodeGenerators.Mvc': 'Microsoft.VisualStudio.Web.CodeGenerators.Mvc',
        'Microsoft.Extensions.Configuration.FileProviderExtensions': 'Microsoft.Extensions.Configuration.FileExtensions',
        //WebApi is gone
        //'Microsoft.AspNet.WebApi.Owin': 'Microsoft.AspNetCore.Mvc.WebApiCompatShim',
        //'Microsoft.AspNet.WebApi.Core': 'Microsoft.AspNetCore.Mvc.WebApiCompatShim',
        //'Microsoft.AspNet.WebApi.Client': 'Microsoft.AspNetCore.Mvc.WebApiCompatShim',
        //'Microsoft.AspNet.WebApi.WebHost': 'Microsoft.AspNetCore.Mvc.WebApiCompatShim',
        //'Microsoft.AspNet.WebApi.Cors': 'Microsoft.AspNetCore.Mvc.WebApiCompatShim',

    };

    // these are here to keep the program from
    // altering the assembly name based on other patterns
    const ASSEMBLY_NAME_LOCKED = [
        'Microsoft.AspNet.Web.Optimization'
    ];

    const VERSION_OVERRIDES = {
        'Microsoft.EntityFrameworkCore.SqlServer': '1.0.0-rc2-final',
        'Microsoft.EntityFrameworkCore.SQLite': '1.0.0-rc2-final',
        'NpgSql.EntityFrameworkCore.Postgres': '1.0.0-rc2-final',
        'EntityFrameworkCore.SqlServerCompact35': '1.0.0-rc2-final',
        'EntityFrameworkCore.SqlServerCompact40': '1.0.0-rc2-final',
        'Microsoft.EntityFrameworkCore.InMemory': '1.0.0-rc2-final',
        'Microsoft.EntityFrameworkCore.Tools': '1.0.0-preview1-final',
        'Microsoft.EntityFrameworkCore.SqlServer.Design': '1.0.0-rc2-final',
        'Microsoft.AspNetCore.Diagnostics.EntityFrameworkCore': '1.0.0-rc2-final',
        'Microsoft.AspNetCore.Razor.Tools': '1.0.0-preview1-final',
        'Microsoft.AspNetCore.Identity.EntityFrameworkCore': '1.0.0-rc2-final',
        'Microsoft.AspNetCore.Server.WebListener': '0.1.0-rc2-final',
        'Microsoft.VisualStudio.Web.CodeGenerators.Mvc': '1.0.0-preview1-final',
        'Microsoft.AspNetCore.SignalR.Server': '0.1.0-rc2-*',
        'Microsoft.VisualStudio.Web.BrowserLink.Loader': '14.0.0-rc2-final',
        'Newtonsoft.Json': '8.0.4',
        'Microsoft.AspNetCore.Owin': '1.0.0-rc2-final'
    };

    function renameKeyIfExists(object:{}, oldName:string, newName:string):void {
        if (oldName in object) {
            object[newName] = object[oldName];
            delete object[oldName];
        }
    }

    function packOptions(object:Object) {

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

    function _getNewMicrosoftPackageName(name:string):string {
        if (name in ASSEMBLY_NAME_CHANGES) {
            return ASSEMBLY_NAME_CHANGES[name];
        }
        if (name in ASSEMBLY_NAME_LOCKED) {
            return name;
        }
        return name.replace('Microsoft.AspNet.', 'Microsoft.AspNetCore.');
    }

    function _getNewMicrosoftPackageVersion(name:string, version:any):string {
        if (typeof version === 'string') {
            if (name.startsWith('Microsoft.AspNetCore.Mvc')) {
                return '1.0.0-rc2-final';
            } else {
                return version.replace('-rc1-', '-rc2-');
            }
        } else return version;
    }


    function upgradeMicrosoftDependencies(object:{dependencies:{}}) {
        let outputDependencies = {};
        for (let key in object.dependencies) {
            let value = object.dependencies[key];
            if (key.startsWith('Microsoft.')) {
                //WebApi
                if (key.startsWith('Microsoft.AspNet.WebApi')) {
                    key = key;
                    outputDependencies['Microsoft.AspNetCore.Mvc.WebApiCompatShim'] =
                        '1.0.0-rc2-final';
                }
                else {
                    key = _getNewMicrosoftPackageName(key);
                }
                value = _getNewMicrosoftPackageVersion(key, value);
            }
            if (key in VERSION_OVERRIDES) {
                value = VERSION_OVERRIDES[key];
            }
            outputDependencies[key] = value;
        }
        object.dependencies = outputDependencies;
    }

    function upgradeXunitDependencies(object:{dependencies:{}}) {
        if (object.dependencies['xunit']) {
            object.dependencies['xunit'] = "2.1.0-rc2-*";
        }
        if (object.dependencies['xunit.runner.dnx']) {
            object.dependencies['dotnet-test-xunit'] = "1.0.0-rc2-*";
            delete object.dependencies['xunit.runner.dnx'];
        }
    }

    export function upgrade(input:string):string {

        //strip trailing commas before parsing JSON
        input = input.replace(/,[ \t\r\n]+}/g, "}");
        input = input.replace(/,[ \t\r\n]+\]/g, "]");
        var object = JSON.parse(input);

        // upgrade dependencies
        upgradeMicrosoftDependencies(object);
        upgradeXunitDependencies(object);

        // update the frameworks section
        object.frameworks = FRAMEWORKS

        // move test runner
        if (object.commands && object.commands.test) {
            delete object.commands.test;
        }
        object.testRunner = "xunit";

        // move tags, etc. into "packOptions"
        packOptions(object);

        // rename compilation options
        renameKeyIfExists(object, 'compilationOptions', 'buildOptions');

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