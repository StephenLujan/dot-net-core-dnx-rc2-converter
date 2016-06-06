

export module UpgradeCs {
   function replaceAll(target: string, search: string, replacement: string): string {
        return target.split(search).join(replacement);
    };

    const STRING_REPLACEMENTS = {
        'using Microsoft.AspNet.': 'using Microsoft.AspNetCore.',
        'using Microsoft.Data.Entity': 'using Microsoft.EntityFrameworkCore',
        'using Microsoft.AspNetCore.Identity.EntityFramework': 'using Microsoft.AspNetCore.Identity.EntityFrameworkCore',
        'Microsoft.Data.Entity.Metadata': 'Microsoft.EntityFrameworkCore.Metadata',
        'Microsoft.Data.Entity.Migrations': 'Microsoft.EntityFrameworkCore.Migrations',
        'Microsoft.Data.Entity.Infrastructure': 'Microsoft.EntityFrameworkCore.Infrastructure',
        'HttpNotFound': 'NotFound',
        'HttpBadRequest': 'BadRequest'
    };

    export function upgrade(input:string):string {
        for (let change in STRING_REPLACEMENTS) {
            input = replaceAll(input, change, STRING_REPLACEMENTS[change]);
        }
        return input;
    }
}