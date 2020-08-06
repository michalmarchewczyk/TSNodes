import _Node from './Node';

export const elementContainsPoint = (element:HTMLElement, x:number, y:number):boolean => {
    const rect = element.getBoundingClientRect();
    return x >= rect.left && x <= rect.left + rect.width &&
        y >= rect.top && y <= rect.top + rect.height;

}

export const elementContainsNodes = (element:HTMLElement, nodes:_Node[]):_Node[] => {
    nodes = nodes.filter(node => {
        const centerX = node.element.getBoundingClientRect().left + (node.element.getBoundingClientRect().width) / 2;
        const centerY = node.element.getBoundingClientRect().top + (node.element.getBoundingClientRect().height) / 2;
        const contains = elementContainsPoint(element, centerX, centerY);
        return contains;
    })
    return nodes;
}

export const nodePosAverage = (nodes:_Node[]):[number, number] => {
    let sumX = 0;
    let sumY = 0;
    nodes.forEach(node => {
        sumX += node.nodeBox.pos[0];
        sumY += node.nodeBox.pos[1];
    });
    const avgX = sumX / nodes.length;
    const avgY = sumY / nodes.length;
    return [avgX, avgY];
}
