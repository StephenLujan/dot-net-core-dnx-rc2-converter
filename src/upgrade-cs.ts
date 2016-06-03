export module UpgradeCs {
    export function upgrade(input: string): string {
        let output = input.replace(/^using Microsoft\.AspNet\./g, 'using Microsoft.AspNetCore.');
        return output;
    }
}