export module UpgradeXproj {
    export function upgrade(input: string): string {
        input = input.replace(/\\DNX\\Microsoft\.DNX\.Props/g, "\\DotNet\\Microsoft.DotNet.Props");
        input = input.replace(/\\DNX\\Microsoft\.DNX\.targets/g, "\\DotNet.Web\\Microsoft.DotNet.Web.targets");
        input = input.replace(/<Project ToolsVersion="[0-9\.]*"/, '<Project ToolsVersion="14.0.25123"');
        input = input.replace(/<VisualStudioVersion Condition="'\$\(VisualStudioVersion\)' == ''">[0-9\.]*<\/VisualStudioVersion>/,
            `<VisualStudioVersion Condition="'$(VisualStudioVersion)' == ''\">14.0.25123</VisualStudioVersion>`);
        // TODO: change the BaseIntermediateOutputPath to:
        // <BaseIntermediateOutputPath Condition="'$(BaseIntermediateOutputPath)'=='' ">.\obj</BaseIntermediateOutputPath>
        // TODO:  add target framework just after the OutputPath:
        // <TargetFrameworkVersion>v4.5.2</TargetFrameworkVersion>
        return input;
    }
}