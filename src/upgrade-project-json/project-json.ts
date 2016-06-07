import {Dictionary} from '../dictionary-tools'
export interface ProjectJson extends Dictionary {
    dependencies?: Dictionary;
    frameworks: Dictionary;
}