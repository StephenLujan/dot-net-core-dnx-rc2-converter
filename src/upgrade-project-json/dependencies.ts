import {ProjectJson} from './project-json';

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
const ASSEMBLY_NAME_OBSOLETE = new Set([
    'Microsoft.AspNet.Web.Optimization',
    'Microsoft.AspNetCore.Web.Optimization'
]);

const VERSION_OVERRIDES = {
    'Microsoft.EntityFrameworkCore.SqlServer': '1.0.0-rc2-final',
    'Microsoft.EntityFrameworkCore.SQLite': '1.0.0-rc2-final',
    'NpgSql.EntityFrameworkCore.Postgres': '1.0.0-rc2-final',
    'EntityFrameworkCore.SqlServerCompact35': '1.0.0-rc2-final',
    'EntityFrameworkCore.SqlServerCompact40': '1.0.0-rc2-final',
    'Microsoft.EntityFrameworkCore.InMemory': '1.0.0-rc2-final',
    'Microsoft.EntityFrameworkCore.Tools': '1.0.0-preview1-final',
    'Microsoft.EntityFrameworkCore.SqlServer.Design': '1.0.0-rc2-final',
    'Microsoft.AspNetCore.Razor.Tools': '1.0.0-preview1-final',
    'Microsoft.AspNetCore.Server.WebListener': '0.1.0-rc2-final',
    'Microsoft.VisualStudio.Web.CodeGenerators.Mvc': '1.0.0-preview1-final',
    'Microsoft.AspNetCore.SignalR.Server': '0.1.0-rc2-*',
    'Microsoft.VisualStudio.Web.BrowserLink.Loader': '14.0.0-rc2-final',
    'Newtonsoft.Json': '8.0.4',
};


function _getNewMicrosoftPackageName(name:string):string {
    if (name in ASSEMBLY_NAME_CHANGES) {
        return ASSEMBLY_NAME_CHANGES[name];
    }
    return name.replace('Microsoft.AspNet.', 'Microsoft.AspNetCore.');
}

function _getNewMicrosoftPackageVersion(name:string, version:any):string {
    if (typeof version === 'string') {
        if (name.startsWith('Microsoft.AspNetCore')) {
            return '1.0.0-rc2-final';
        } else {
            return version.replace('-rc1-', '-rc2-');
        }
    } else return version;
}


function upgradeMicrosoftDependencies(object:ProjectJson):void {
    let outputDependencies = {};
    for (let key in object.dependencies) {
        if (ASSEMBLY_NAME_OBSOLETE.has(key)) {
            console.log(key);
            continue;
        }
        let value = object.dependencies[key];
        if (key.startsWith('Microsoft.')) {
            // WebApi is no longer a separate package
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

function upgradeXunitDependencies(object:ProjectJson):void {
    if (object.dependencies['xunit']) {
        object.dependencies['xunit'] = "2.1.0-rc2-*";
    }
    if (object.dependencies['xunit.runner.dnx']) {
        object.dependencies['dotnet-test-xunit'] = "1.0.0-rc2-*";
        delete object.dependencies['xunit.runner.dnx'];
    }
}

export function upgrade(object:ProjectJson):void {
    upgradeMicrosoftDependencies(object);
    upgradeXunitDependencies(object);
}