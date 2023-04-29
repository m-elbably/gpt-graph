import {NodeConfig, IGroup, Item, Shape, Arrow} from '@antv/g6';

const EDGE_WIDTH = 1;
const EDGE_HIGHLIGHT_WIDTH = 3;
const EDGE_COLOR = '#a1a1a1';
const EDGE_HIGHLIGHT_COLOR = '#137bea';

export default class Edge {
    private getEndArrow(color: string): Shape {
        return {
            path: Arrow.triangle(5, 5, 0),
            fill: color,
            stroke: color
        };
    }

    private afterDraw(config: NodeConfig, group: IGroup) {
        const shape = group.get('children')[0];
        shape.attr('endArrow', this.getEndArrow(EDGE_COLOR));
    }

    private setState(name: string, value: any, item: Item) {
        if(name === 'highlight') {
            const edge = item.get('group').getFirst();
            if(value === true) {
                edge.attr('stroke', EDGE_HIGHLIGHT_COLOR);
                edge.attr('lineWidth', EDGE_HIGHLIGHT_WIDTH);
                edge.attr('endArrow', this.getEndArrow(EDGE_HIGHLIGHT_COLOR));
            } else {
                edge.attr('stroke', EDGE_COLOR);
                edge.attr('lineWidth', EDGE_WIDTH);
                edge.attr('endArrow', this.getEndArrow(EDGE_COLOR));
            }
        }
    }

    getShape(): Shape {
        const {afterDraw, setState, getEndArrow} = this;
        return {
            afterDraw,
            setState,
            getEndArrow
        };
    }
}
