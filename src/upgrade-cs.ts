

export module UpgradeCs {
   function replaceAll(target: string, search: string, replacement: string): string {
        return target.split(search).join(replacement);
    };

    const RC2_MAIN =     
    `public static void Main(string[] args)
        {
            var host = new WebHostBuilder()
                .UseKestrel()
                .UseContentRoot(Directory.GetCurrentDirectory())
                .UseIISIntegration()
                .UseStartup<Startup>()
                .Build();

            host.Run();
        }`

    const STRING_REPLACEMENTS = {
        'using Microsoft.AspNet.': 'using Microsoft.AspNetCore.',
        'using Microsoft.Data.Entity': 'using Microsoft.EntityFrameworkCore',
        'using Microsoft.AspNetCore.Identity.EntityFramework': 'using Microsoft.AspNetCore.Identity.EntityFrameworkCore',
        'Microsoft.Data.Entity.Metadata': 'Microsoft.EntityFrameworkCore.Metadata',
        'Microsoft.Data.Entity.Migrations': 'Microsoft.EntityFrameworkCore.Migrations',
        'Microsoft.Data.Entity.Infrastructure': 'Microsoft.EntityFrameworkCore.Infrastructure',
        'HttpNotFound': 'NotFound',
        'HttpBadRequest': 'BadRequest',
        'public static void Main(string[] args) => WebApplication.Run<Startup>(args);': RC2_MAIN

    };

    export function upgrade(input:string):string {
        for (let change in STRING_REPLACEMENTS) {
            input = replaceAll(input, change, STRING_REPLACEMENTS[change]);
        }
        return input;
    }
}