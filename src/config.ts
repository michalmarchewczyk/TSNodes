import {updateStyles} from './jssBase';

export interface Config {
    defaultCanvasWidth?: number,
    defaultCanvasHeight?: number,
    zoomMin?: number,
    zoomMax?: number,
    defaultNodeWidth?: number,
    minNodeWidth?: number,
    maxNodeWidth?: number,
    debug?: boolean,
}

const defaultConfig = {
    defaultCanvasWidth: 200000,
    defaultCanvasHeight: 200000,
    zoomMin: 0.6,
    zoomMax: 2,
    defaultNodeWidth: 120,
    minNodeWidth: 100,
    maxNodeWidth: 240,
    debug: true,
}


let userConfig:Config = {};


const setup = (options:Config) => {
    userConfig = options;
    Object.assign(config, userConfig);
    updateStyles();
}

const config = {
    ...defaultConfig,
    ...userConfig,
}

export default config;

export {setup}
