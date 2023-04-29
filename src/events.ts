import mitt from 'mitt';

type Events = {
    layoutChanged: string;
    startDiscovery?: string;
    searchTextChanged: string;
    setApiKey: undefined;
};
export default mitt<Events>();
