export module UpgradeGlobalJson {
    const PREVIEW_1 = '1.0.0-preview1-002702';
    const PREVIEW_2 = '1.0.0-preview2-002867';

    export function upgrade(input:string):string {
        let object = JSON.parse(input);
        object['sdk']['version'] = PREVIEW_1;
        return JSON.stringify(object, null, 2);
    }
}