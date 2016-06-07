/*
 * Code for high level manipulation of javascript objects as key, value maps or "Dictionaries"
 * useful for restructuring json
 */


export interface Dictionary extends Object {
    [key: string]:any
}

function isObject(value) {
    return (!Array.isArray(value) && typeof value === 'object');
}

export function renameKeyIfExists(object:Dictionary, oldName:string, newName:string):void {
    if (oldName in object) {
        object[newName] = object[oldName];
        delete object[oldName];
    }
}

/**
 * gets a value deeply nested in an object and removes it from the object
 * @returns {any} the value extracted from the object or null if the path could not be resolved
 */
export function extractFrom(object:Dictionary, fullPath:Array<string>):any {
    let lastObject = object;
    for (let it = 0; it < fullPath.length; it++) {
        let segment = fullPath[it];
        if (lastObject[segment]) {
            if (it == fullPath.length - 1) {
                let found = lastObject[segment];
                delete lastObject[segment];
                return found;
            }
            lastObject = lastObject[segment];
        } else {
            return null; // oldPath didn't resolve so exit early
        }
    }
}

/**
 * insert a value deeply nested into an object, if an object already exists
 * at the path and the value is an object, they will be merged
 */
export function insert(object:Dictionary, fullPath:Array<string>, toInsert:any) {
    let lastObject = object;
    for (let it = 0; it < fullPath.length; it++) {
        let segment = fullPath[it];
        let current = lastObject[segment];

        // on the last iteration we've reached the path
        if (it == fullPath.length - 1) {
            // if an object is already here merge the new data
            // if nothing is here just add the new data
            // if some non-object value that doesn't match our data is here we have a problem
            if (current != null) {
                if (isObject(current)) {
                    Object.assign(current, toInsert);
                } else if (toInsert !== current) {
                    throw new Error(`Tried to insert value ${toInsert} at ${fullPath}, but it already had the value ${current}`)
                }
            } else {
                lastObject[segment] = toInsert;
            }
        } else {
            if (!current) {
                current = lastObject[segment] = {};
            }
            if (!isObject(current)) {
                throw new Error(`Tried to insert value in object at path ${fullPath}, but ${segment} was a non-object`);
            }
            lastObject = current;
        }
    }
}

/**
 * moves a deeply nested value within an object to another deeply nested location within the same object
 * @returns {any} the value moved within the object or null if it's path could not be resolved
 */
export function treeMove(object:Dictionary, oldPath:Array<string>, newPath:Array<string>):any {
    //console.log(`${oldPath}: ${newPath}`);

    let target = extractFrom(object, oldPath);
    if (target == null) {
        return null;
    }
    insert(object, newPath, target);
    return target;
}