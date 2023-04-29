import G6, {IG6GraphEvent} from '@antv/g6';

export default class Tooltip {
    constructor() {
        return new G6.Tooltip({
            offsetX: 30,
            offsetY: 30,
            className: 'g6-tooltip',
            shouldBegin: (e: IG6GraphEvent | undefined): boolean => {
                const target = e?.target;
                switch (target?.get('name')) {
                    case 'explore':
                    case 'link':
                        return true;
                }
                return false;
            },
            getContent(e: IG6GraphEvent | undefined): string {
                let content = '';
                const target = e?.target;
                const model = e?.item?.getModel();

                switch (target?.get('name')) {
                    case 'link':
                        content = `<div>Open link about <b>${model?.title}</b></div>`;
                        break;
                    case 'explore':
                        content = `<div>Explore more about:</div><b>${model?.title}</b>`;;
                        break;
                }

                return content;
            },
            itemTypes: ['node']
        });
    }
}
