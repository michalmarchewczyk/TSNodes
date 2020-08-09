import jss from 'jss';
import preset from 'jss-preset-default';
import config from './config';


const createGenerateId = () => {
    return (rule:any) => `TSNodes_${rule.key}`;
}

jss.setup({...preset(), createGenerateId});


const styles = {
    view: {
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
    },
    canvas: {
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
        width: () => config.defaultCanvasWidth,
        height: () => config.defaultCanvasHeight,
        backgroundColor: '#444444',
        transform: 'scale(1)',
        transformOrigin: 'top left',
        overflow: 'hidden',
    },
    background: {
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        '& line': {
            stroke: 'rgba(255,255,255,0.7)',
            strokeWidth: 2,
        }
    },
    foreground: {
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        '& line': {
            stroke: 'white',
            strokeWidth: 2,
        },
        zIndex: 100,
        pointerEvents: 'none',
    },
    nodeElement: {
        display: 'block',
        position: 'relative',
        outline: (() => config.debug ? '1px solid red' : 'none'),
    },
    graphElement: {
        display: 'block',
        position: 'relative',
        outline: (() => config.debug ? '1px solid red' : 'none'),
    },
    graphSelected: {
        fontWeight: 'bold',
    },
    selectBox: {
        display: 'block',
        position: 'absolute',
        border: '1px dashed rgba(255,255,255,0.8)',
    },
    node: {
        display: 'block',
        position: 'absolute',
        background: '#777777',
        outline: (() => config.debug ? '1px solid blue' : 'none'),
        minHeight: 40,
        height: 'auto',
    },
    nodeCollapsed: {
        maxHeight: 25,
        minHeight: 25,
        overflow: 'hidden',
        '& $name button': {
            borderStyle: 'solid',
            borderWidth: '6px 0 6px 10px',
            borderColor: 'transparent transparent transparent white',
            top: '-4px',
        },
        '& $nodeContainer': {
            visibility: 'hidden',
            marginTop: 5,
            '& div': {
                height: 0,
                minHeight: 0,
                maxHeight: 0,
                marginTop: 0,
                marginBottom: 0,
            }
        }
    },
    nodeSelected: {
        outline: '1px solid white',
    },
    nodeActive: {
        outline: '2px solid white',
    },
    handleLeft: {
        display: 'block',
        position: 'absolute',
        top: 20,
        left: -8,
        width: 16,
        height: 'calc(100% - 20px)',
        outline: (() => config.debug ? '1px solid green' : 'none'),
        cursor: 'ew-resize',
        zIndex: 20,
    },
    handleRight: {
        display: 'block',
        position: 'absolute',
        top: 20,
        right: -8,
        width: 16,
        height: 'calc(100% - 20px)',
        outline: (() => config.debug ? '1px solid green' : 'none'),
        cursor: 'ew-resize',
        zIndex: 20,
    },
    name: {
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 20,
        cursor: 'default',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        '& button': {
            display: 'inline-block',
            position: 'relative',
            width: 0,
            height: 0,
            outline: 'none',
            background: 'transparent',
            padding: '0',
            borderStyle: 'solid',
            borderWidth: '10px 6px 0 6px',
            borderColor: 'white transparent transparent transparent',
            margin: '4px',
            top: 0,
        }
    },
    nodeContainer: {
        display: 'block',
        position: 'relative',
        marginTop: 30,
        marginBottom: 8,
        left: 0,
        width: '100%',
        height: 'auto',
        outline: (() => config.debug ? '2px solid orange' : 'none'),
        zIndex: 30,
    },
    inputElement: {
        display: 'block',
        position: 'relative',
        top: 0,
        left: 0,
        minHeight: 20,
        height: 20,
        maxHeight: 20,
        outline: (() => config.debug ? '1px solid red' : 'none'),
        marginTop: 5,
        marginBottom: 5,
        paddingLeft: 10,
        paddingRight: 8,
        '& > span': {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            position: 'absolute',
            maxWidth: 'calc(100% - 20px)',
            width: 'calc(100% - 20px)',
        }
    },
    inputSnap: {
        display: 'block',
        position: 'absolute',
        top: 2,
        left: -8,
        width: 16,
        height: 16,
        outline: (() => config.debug ? '1px solid cyan' : 'none'),
    },
    inputDot: {
        display: 'block',
        position: 'absolute',
        top: 4,
        left: 4,
        width: 8,
        height: 8,
        background: '#eeeeee',
        borderRadius: 10,
    },
    fieldElement: {
        display: 'flex',
        position: 'absolute',
        width: 'calc(100% - 16px)',
        height: '100%',
        overflow: 'hidden',
        '& span': {
            flex: '0 1 auto',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            '&::after': {
                content: '":\\00a0"',
            }
        },
        '& input': {
            display: 'inline-block',
            position: 'relative',
            flex: '1 1 20px',
            minWidth: 20,
            outline: 'none',
            border: 'none',
        }
    },
    fieldElementNumber: {
        display: 'inline-block',
        position: 'absolute',
        width: 'calc(100% - 18px)',
        height: '100%',
        overflow: 'hidden',
        '& div': {
            display: 'flex',
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: '#555555',
            overflow: 'hidden',
            '& button:first-child': {
                flex: '0 0 20px',
                background: 'transparent',
                border: 'none',
                '&::before': {
                    content: '""',
                    display: 'block',
                    width: 0,
                    height: 0,
                    borderStyle: 'solid',
                    borderWidth: '6px 9px 6px 0',
                    borderColor: 'transparent white transparent transparent',
                }
            },
            '& span': {
                flex: '0 1 auto',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                '&::after': {
                    content: '":\\00a0"',
                }
            },
            '& input': {
                '-moz-appearance': 'textfield',
                '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
                    '-webkit-appearance': 'none',
                    margin: 0,
                },
                flex: '1 1 20px',
                minWidth: 20,
                border: 'none',
                outline: 'none',
            },
            '& button:last-child': {
                flex: '0 0 20px',
                background: 'transparent',
                border: 'none',
                '&::before': {
                    content: '""',
                    display: 'block',
                    width: 0,
                    height: 0,
                    borderStyle: 'solid',
                    borderWidth: '6px 0 6px 9px',
                    borderColor: 'transparent transparent transparent white',
                }
            },
        },
    },
    fieldElementBoolean: {
        display: 'flex',
        position: 'absolute',
        width: 'calc(100% - 16px)',
        height: '100%',
        overflow: 'hidden',
        '& span': {
            flex: '0 1 auto',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            '&::after': {
                content: '":\\00a0"',
            }
        },
        '& input': {
            display: 'inline-block',
            position: 'relative',
            flex: '0 1 20px',
            minWidth: 20,
        }
    },
    outputElement: {
        display: 'block',
        position: 'relative',
        top: 0,
        left: 0,
        minHeight: 20,
        outline: (() => config.debug ? '1px solid red' : 'none'),
        marginTop: 5,
        marginBottom: 5,
        textAlign: 'right',
        paddingRight: 10,
        paddingLeft: 8,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        '& span': {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            position: 'absolute',
            left: 8,
            maxWidth: 'calc(100% - 18px)',
            width: 'calc(100% - 18px)',
        }
    },
    outputSnap: {
        display: 'block',
        position: 'absolute',
        top: 2,
        right: -8,
        width: 16,
        height: 16,
        outline: (() => config.debug ? '1px solid cyan' : 'none'),
    },
    outputDot: {
        display: 'block',
        position: 'absolute',
        top: 4,
        left: 4,
        width: 8,
        height: 8,
        background: '#eeeeee',
        borderRadius: 10,
    }
}


const sheet = jss.createStyleSheet(styles, {link: true}).attach();
const {classes} = sheet;

const updateStyles = () => {
    sheet.update(config);
}

export default classes;

export {
    updateStyles
}
