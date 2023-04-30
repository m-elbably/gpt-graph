<script setup lang="ts">
import {onMounted, onBeforeUnmount, ref} from 'vue';
import {TreeGraph, Edge, registerNode, registerEdge, G6GraphEvent, Node, Item, INode, Graph} from '@antv/g6';
import store from '../../store';
import events from '../../events';
import GNode from './common/Node';
import GEdge from "./common/Edge";
import Tooltip from "./common/Tooltip";
import api from "../../plugins/axios";

import DiscoverDialog, {DiscoverDialogState} from './DescoverDialog.vue';
import DetailsDialog, {DetailsDialogState} from "./DetailsDialog.vue";

const CARD_WIDTH = 280;
const CARD_HEIGHT = 180;
const EDGES = {
    HORIZONTAL: 'card-edge-horizontal',
    VERTICAL: 'card-edge-vertical'
};
const LAYOUTS = {
    GENERAL: 'general',
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical'
};
const LAYOUT_CONFIG = {
    GENERAL: {

    },
    HORIZONTAL: {
        type: 'mindmap',
        direction: 'H',
        getHeight: () => {
            return CARD_HEIGHT;
        },
        getWidth: () => {
            return CARD_WIDTH;
        },
        getVGap: () => {
            return 10;
        },
        getHGap: () => {
            return 50;
        },
        getSide: () => {
            return 'right';
        }
    },
    VERTICAL: {
        type: 'dendrogram',
        direction: 'TB',
        nodeSep: CARD_WIDTH + 20,
        rankSep: CARD_HEIGHT + 20
    }
}

const _container = ref<HTMLElement>();
const _graph = ref();
const _root = {
    id: '0',
    title: '',
    description: '',
    url: '',
    children: [],
    prompts: [],
    visible: false,
    loading: false
};

const discoverDialog = ref<DiscoverDialogState>({
    visible: false,
    title: '',
    prompts: [],
    selectedPrompt: '0'
});
const detailsDialog = ref<DetailsDialogState>({
    visible: false,
    title: '',
    description: ''
});
const selectedItem = ref<Item>();

function resizeGraphContainer() {
    const {value: container} = _container;
    const {value: graph} = _graph;

    if (!graph || graph.get('destroyed')) return;
    if (!container || !container.scrollWidth || !container.scrollHeight) return;
    graph.changeSize(container.scrollWidth, container.scrollHeight);
}

function initialize() {
    const {value: container} = _container;

    // Attach listeners
    window.addEventListener('resize', resizeGraphContainer);

    // Register components
    registerNode('card-node', new GNode().getShape());
    registerEdge(EDGES.HORIZONTAL, new GEdge().getShape(), 'cubic-horizontal');
    registerEdge(EDGES.VERTICAL, new GEdge().getShape(), 'cubic-vertical');

    // Initialize Graph
    _graph.value = new TreeGraph({
        container: container as HTMLElement,
        width: container?.scrollWidth,
        height: container?.scrollHeight,
        animate: true,
        plugins: [
            new Tooltip()
        ],
        modes: {
            default: [
                {
                    type: 'zoom-canvas',
                    // enableOptimize: true,
                    // optimizeZoom: 0.1,
                },
                {
                    type: 'drag-canvas',
                    // enableOptimize: true,
                }, 'drag-node'
            ],
        },
        defaultNode: {
            type: 'card-node',
            size: [CARD_WIDTH, CARD_HEIGHT],
        },
        defaultEdge: {
            type: EDGES.HORIZONTAL
        },
        layout: LAYOUT_CONFIG.HORIZONTAL
    });
}

function onDiscoverDialogSubmitted(prompt: string) {
    selectedItem.value?.refresh();
    fetchPrompt(selectedItem.value as Item, prompt);
}

function updateEdges() {
    const {value: graph} = _graph;

    graph.setAutoPaint(false);
    graph.getEdges().forEach((edge: Edge) => {
        graph.updateItem(edge, {
            style: graph.get('defaultEdge').style,
            type: graph.get('defaultEdge').type
        });
    });
    graph.paint();
    graph.setAutoPaint(true);
}
function changeLayout(layout: string) {
    const {value: graph} = _graph;

    let edgeType = EDGES.HORIZONTAL;
    let layoutConfig: any = LAYOUT_CONFIG.HORIZONTAL;
    switch (layout) {
        case 'horizontal':
            edgeType = EDGES.HORIZONTAL;
            layoutConfig = LAYOUT_CONFIG.HORIZONTAL;
            break;
        case 'vertical':
            edgeType = EDGES.VERTICAL;
            layoutConfig = LAYOUT_CONFIG.VERTICAL;
            break;
    }

    if(graph.get('defaultEdge')) {
        graph.get('defaultEdge').type = edgeType;
    }
    updateEdges();
    graph.updateLayout(layoutConfig);
    graph.fitCenter();
}

function getParentNode(node: INode) {
    const pEdge = node.getEdges().find((e) => e.getTarget().getID() === node.getID());
    if(pEdge != null) {
        return pEdge.getSource();
    }

    return null;
}

function getChildrenNodes(node: INode): INode[] {
    const pEdges = node.getEdges();
    const children: INode[] = [];

    for(let i=0; i < pEdges.length; i++){
        children.push(pEdges[i].getTarget());
    }

    return children;
}

function highlightPath(item: INode) {
    const {value: graph} = _graph;

    graph.setAutoPaint(false);

    // Nodes
    graph.getNodes().forEach(function (node: Node) {
        graph.clearItemStates(node, ['dark', 'highlight']);
        graph.setItemState(node, 'dark', true);
    });

    // Edges
    graph.getEdges().forEach(function (edge: Edge) {
        graph.setItemState(edge, 'highlight', false);
    });

    let parent = item;
    while (parent != null) {
        const parentEdge = parent.getEdges().find((e) => e.getTarget().getID() === parent.getID());
        graph.setItemState(parent, 'dark', false);
        graph.setItemState(parent, 'highlight', true);
        parent.toFront();
        if(parentEdge == null) {
            break;
        }

        parent = parentEdge.getSource();
        graph.setItemState(parentEdge, 'highlight', true);
        parentEdge.toFront();
    }

    graph.paint();
    graph.setAutoPaint(true);
}

function normalizeChildren(node: {[k: string]: any}, startId: number): number {
    let currentId = startId;
    node['id'] = String(currentId++);
    node['visible'] = true;
    node['loading'] = false;
    if(!node.children){
        node['children'] = [];
    }
    if(!node.prompts) {
        node['prompts'] = [];
    }

    if (node.children) {
        for (const child of node.children) {
            currentId = normalizeChildren(child, currentId);
        }
    }

    return currentId;
}

function addNodes(node: Item, data: {[k: string]: any}, overwriteParent = false) {
    const {value: graph} = _graph;
    const nextId = graph.getNodes().length === 1 ? 0 : graph.getNodes().length;

    normalizeChildren(data, nextId);
    if(overwriteParent) {
        const {title, description, url, children, prompts} = data;
        graph.updateChild({
            id: '0',
            title,
            description,
            url,
            children,
            prompts,
            visible: true,
            loading: false
        }, node);
    } else {
        graph.addChild(data, node);
    }

    graph.setItemState(node, 'marker');

    if(overwriteParent) {
        graph.fitCenter();
    }
}

async function fetchPrompt(parent: Item, prompt: string) {
    const {value: graph} = _graph;

    parent.getModel().loading = true;
    graph.setItemState(parent, 'loading', true);

    try {
        const data = await api.fetchData(prompt);
        const overwriteParent = graph.getNodes().length === 1;
        addNodes(parent, data as any, overwriteParent);
    } catch (e) {
        // TODO - Handle Error
        console.log(e);
        graph.fitCenter();
    }

    parent.getModel().loading = false;
    graph.setItemState(parent, 'loading', false);
}

function hideTooltip() {
    const {value: graph} = _graph;
    const tooltip = graph.get('plugins')[0];
    tooltip.hide();
}

function attachGraphListeners() {
    const {value: graph} = _graph;

    graph.on('node:mouseenter', (e: G6GraphEvent) => {
        graph.setItemState(e.item, 'active', true);
    });

    graph.on('node:mouseleave', (e: G6GraphEvent) => {
        graph.setItemState(e.item, 'active', false);
    });

    graph.on('node:click', async (e: G6GraphEvent) => {
        highlightPath(e.item as INode);

        if (e.target.get('name') === 'collapse-icon') {
            e.item.getModel().collapsed = !e.item.getModel().collapsed;
            graph.setItemState(e.item, 'collapsed', e.item.getModel().collapsed);
            graph.layout();
        }

        if (e.target.get('name') === 'link') {
            const model = e.item.getModel();

            hideTooltip();
            window.open(model.url as string, '_blank');
        }

        if (e.target.get('name') === 'explore') {
            hideTooltip();

            selectedItem.value = e.item;
            discoverDialog.value.title = e.item.getModel().title as string;
            discoverDialog.value.prompts = e.item.getModel().prompts as string[] || [];
            if(discoverDialog.value.prompts.length > 0) {
                discoverDialog.value.selectedPrompt = '0';
            } else {
                discoverDialog.value.selectedPrompt = '_';
            }
            discoverDialog.value.visible = true;
        }
    });

    graph.on('node:dblclick', (e: G6GraphEvent) => {
        const model = e.item.getModel();

        detailsDialog.value.title = model.title as string;
        detailsDialog.value.description = model.description as string;
        detailsDialog.value.visible = true;
    });
}

function attachEventListeners() {
    events.on('startDiscovery', () => {
        const {value: graph} = _graph;
        const root = graph.getNodes()[0];

        const center = graph.getViewPortCenterPoint();

        const nodeBBox = root.getBBox();
        const x = center.x - (nodeBBox.width / 2);
        const y = center.y - (nodeBBox.height / 2);
        root.updatePosition({x , y});

        root.setState('highlight', true);
        root.toFront();

        root.changeVisibility(true);
        fetchPrompt(root, store.initialPrompt);
    });

    events.on('layoutChanged', (e: string) => {
        changeLayout(e);
    });

    events.on('searchTextChanged', (e: string) => {
        const {value: graph} = _graph;
        let item = null;
        let i = 0;

        while (i < graph.getNodes().length) {
            const nTitle = graph.getNodes()[i].getModel().title;
            const nDescription = graph.getNodes()[i].getModel().description;
            if(nTitle.toLowerCase().indexOf(e.toLowerCase().trim()) >= 0 ||
                nDescription.toLowerCase().indexOf(e.toLowerCase().trim()) >= 0) {
                item = graph.getNodes()[i];
                break;
            }

            i++;
        }

        if(item != null) {
            highlightPath(item);
            graph.focusItem(item, true, {
                easing: 'easeCubic',
                duration: 500,
            });
        }
    });
}

function render() {
    const {value: graph} = _graph;

    graph.data(_root);
    graph.render();
    graph.moveTo(10, 10);
}

function cleanUp() {
    const {value: gGraph} = _graph;
    window.removeEventListener('resize', resizeGraphContainer)
    gGraph.destroy();
}

onMounted(() => {
    initialize();
    attachGraphListeners();
    attachEventListeners();
    render();
});

onBeforeUnmount(() => {
    cleanUp();
});
</script>

<template>
    <div ref="_container" class="graph">
        <DiscoverDialog
            v-model:visible="discoverDialog.visible"
            :title="discoverDialog.title"
            :prompts="discoverDialog.prompts"
            v-model:selected-prompt="discoverDialog.selectedPrompt"
            @submit="onDiscoverDialogSubmitted"
        />
        <DetailsDialog
            v-model:visible="detailsDialog.visible"
            :title="detailsDialog.title"
            :description="detailsDialog.description"
        />
    </div>
</template>

<style scoped>
.graph {
    width: 100%;
    height: 100%;
    position: absolute;
    overflow: hidden;
}
</style>
