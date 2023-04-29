
export interface ModelNode {
    id: string;
    title: string;
    description: string;
    url: string;
    children: ModelNode[];
    visible: boolean;
}
