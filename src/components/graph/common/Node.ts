import {NodeConfig, IGroup, Item, Marker, Util, Shape} from '@antv/g6';
import progressImage from '../../../assets/fetching.svg';
import openLinkImage from '../../../assets/open-outline.svg';
import discoverImage from '../../../assets/telescope-outline.svg';

const COLOR = '#6d9cfd';
const DARK_COLOR = '#9fbeff';
const Highlight_Color = '#5189ff';
const Highlight_Shadow_Color = '#b0b0b0';

const Header_Height = 28;
const HEADER_FONT_SIZE = 14;
const DESCRIPTION_FONT_SIZE = 12;

const LOADER_WIDTH = 103;
const LOADER_HEIGHT = 80;

const Header_Color = '#719ffd';
const Header_Separator_Color = '#84aeff';
const Footer_Separator_Color = '#eeeded';
const Marker_Color = '#5188fd';
export default class Node {
    private wrapText(text: string, fontSize: number, maxWidth: number): string {
        const maxLines = 6;
        const textSize = Util.getTextSize(text, fontSize);
        if (textSize[0] <= maxWidth) {
            return text;
        }

        const words = text.split(/([\s+|\n])/g).filter((e) => e != ' ');
        let lines = [];
        let line = '';
        let result = '';

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const testSize = Util.getTextSize(testLine, fontSize);

            if (testSize[0] > maxWidth || words[i] === '\n') {
                lines.push(line.trim());
                line = words[i] + ' ';
            } else {
                line = testLine;
            }
        }

        lines.push(line.trim());
        if(lines.length >= maxLines) {
            lines[maxLines-1] = lines[maxLines-1] + '...';
            result = lines.slice(0, maxLines).join('\n');
        } else {
            result = lines.join('\n');
        }

        return result;
    }

    private getTitle(value: string, fontSize: number, maxWidth: number) {
        let title = value || '';
        const titleSegments = this.wrapText(title, fontSize, maxWidth).split(/\n/);
        if(titleSegments.length > 1) {
            title = titleSegments[0] +  '...';
        }

        return title;
    }

    private draw(config: NodeConfig, group: IGroup): Shape {
        const r = 4;
        const padding = 8;

        const [w, h] = config.size as number[];

        let yPos = 0;
        const title = this.getTitle(config.title as string, HEADER_FONT_SIZE, w - (padding * 2 ));
        const description = this.wrapText(config.description as string || '', 12, w - padding);
        const url = config.url as string;

        const shape = group.addShape('rect', {
            name: 'main-box',
            attrs: {
                x: 0,
                y: 0,
                width: w,
                height: h,
                stroke: COLOR,
                fill: '#fff',
                radius: r,
            },
            draggable: true
        });

        group.addShape('rect', {
            name: 'title-box',
            attrs: {
                x: 0,
                y: 0,
                width: w,
                height: Header_Height,
                fill: COLOR,
                radius: [r, r, 0, 0],
            },
            draggable: true,
        });

        yPos += Header_Height;

        group.addShape('polygon', {
            name: 'title-separator',
            attrs: {
                points: [
                    [0, 28],
                    [w, 28]
                ],
                stroke: Header_Separator_Color
            }
        });

        group.addShape('text', {
            name: 'title',
            attrs: {
                x: padding,
                y: padding,
                maxWidth: w - (padding * 2),
                textAlign: 'left',
                textBaseline: 'top',
                fontSize: HEADER_FONT_SIZE,
                fontWeight: 600,
                text: title || '',
                fill: '#fff'
            },
            draggable: true
        });

        group.addShape('text', {
            name: `description`,
            attrs: {
                x: padding,
                y: yPos + padding,
                maxWidth: w - (padding * 2),
                maxHeight: h - yPos,
                fontSize: DESCRIPTION_FONT_SIZE,
                textBaseline: 'top',
                lineHeight: 20,
                text: description || '',
                textOverflow: 'ellipsis',
                fill: 'rgba(0,0,0, 1)'
            }
        });

        group.addShape('image', {
            name: 'loader',
            attrs: {
                x: (w - LOADER_WIDTH) / 2,
                y: (h - LOADER_HEIGHT) / 2 + Header_Height / 2,
                height: LOADER_HEIGHT,
                width: LOADER_WIDTH,
                img: `${progressImage}`,
                opacity: 0.0
            },
        });

        const link = group.addShape('image', {
            name: 'link',
            attrs: {
                x: w - 58,
                y: h - 28,
                height: 24,
                width: 24,
                img: `${openLinkImage}`,
                cursor: 'pointer',
                opacity: 0.4
            },
        });

        const explore = group.addShape('image', {
            name: 'explore',
            attrs: {
                x: w - 28,
                y: h - 28,
                height: 24,
                width: 24,
                img: `${discoverImage}`,
                cursor: 'pointer',
                opacity: 0.4
            },
        });

        // cfg.children.length > 0 &&
        const marker = group.addShape('marker', {
            name: 'collapse-icon',
            attrs: {
                x: w,
                y: h / 2,
                r: 6,
                cursor: 'pointer',
                symbol: config.collapsed ? Marker.expand : Marker.collapse,
                stroke: Marker_Color,
                lineWidth: 1,
                fill: '#fff'
            }
        });

        if (!config.children?.length) {
            marker.hide();
        }

        if(!url || url.length === 0) {
            link.set('visible', false);
        }

        return shape;
    }

    setLoadingState(config: NodeConfig, group: IGroup, state: boolean)
    {
        if(group.destroyed) {
            return;
        }

        const { url } = config;
        const loader = group.find((e: Item) => e.get('name') === 'loader');
        const description = group.find((e: Item) => e.get('name') === 'description');
        const link = group.find((e: Item) => e.get('name') === 'link');
        const explore = group.find((e: Item) => e.get('name') === 'explore');

        if(state) {
            description.set('visible', false);
            link.set('visible', false);
            explore.set('visible', false);
            loader.set('visible', true);

            loader.animate(
                (r: number) => {
                    const op = 0.5 + Math.sin(r * Math.PI * 2) * 0.40;
                    return {
                        opacity: op
                    };
                },
                {
                    duration: 2000,
                    easing: 'easeCubic',
                    repeat: true
                },
            );
        } else {
            loader.stopAnimate();

            loader.set('visible', false);
            description.set('visible', true);
            if(url && (url as string).length > 0) {
                link.set('visible', true);
            }
            explore.set('visible', true);
        }
    }

    private setState(name: string, value: any, item: Item) {
        const model = item.getModel();

        if (name === 'highlight') {
            const frame = item.get('group').find((e: Item) => e.get('name') === 'main-box');
            const title = item.get('group').find((e: Item) => e.get('name') === 'title-box');

            frame.attr('stroke', Highlight_Color);
            frame.attr('shadowColor', Highlight_Shadow_Color);
            frame.attr('shadowBlur', 10);
            title.attr('fill', Highlight_Color);
        }

        if (name === 'dark') {
            const frame = item.get('group').find((e: Item) => e.get('name') === 'main-box');
            const title = item.get('group').find((e: Item) => e.get('name') === 'title-box');

            frame.attr('stroke', DARK_COLOR);
            frame.attr('shadowBlur', 0);
            title.attr('fill', DARK_COLOR);
        }

        if (name === 'marker') {
            const marker = item.get('group').find((e: Item) => e.get('name') === 'collapse-icon');
            if ((model.children as Item[]).length > 0) {
                marker.show();
            }
        }

        if (name === 'collapsed') {
            const marker = item.get('group').find((e: Item) => e.get('name') === 'collapse-icon');
            const icon = value ? Marker.expand : Marker.collapse;
            marker.attr('symbol', icon);
        }

        if (name === 'title') {
            const title = item.get('group').find((e: Item) => e.get('name') === 'title');
            const mWidth = title.attrs.maxWidth;
            const mFontSize = title.attrs.fontSize;
            const mTitle = this.getTitle(value, mFontSize, mWidth);
            title.attr('text', mTitle);
        }

        if (name === 'description') {
            const description = item.get('group').find((e: Item) => e.get('name') === 'description');
            const mWidth = description.attrs.maxWidth;
            const mFontSize = description.attrs.fontSize;
            const mDescription = this.wrapText(value, mFontSize, mWidth);
            description.attr('text', mDescription);
        }

        if (name === 'loading') {
            const loadingState = model.loading || value;
            this.setLoadingState(model as NodeConfig, item.get('group'), loadingState);
        }
    }

    public getShape(): Shape {
        const {draw, setState, getTitle, wrapText, setLoadingState} = this;
        return {
            draw,
            setState,
            getTitle,
            wrapText,
            setLoadingState
        };
    }
}
