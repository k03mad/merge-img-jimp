import {Jimp} from 'jimp';

const isPlainObj = value => {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const prototype = Object.getPrototypeOf(value);
    return (
        (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null)
        && !(Symbol.toStringTag in value)
        && !(Symbol.iterator in value)
    );
};

const processImg = async img => {
    if (img instanceof Jimp) {
        return {img};
    }

    if (isPlainObj(img)) {
        const {src, offsetX, offsetY} = img;

        return {
            img: await Jimp.read(src),
            offsetX,
            offsetY,
        };
    }

    return {img: await Jimp.read(img)};
};

const countTotalMax = (imgData, type) => Math.max(
    ...imgData.map(({img: {bitmap}, offsetX}) => bitmap[type] + offsetX),
);

const countTotalReduce = (imgData, type, offset) => imgData.reduce(
    (res, {img: {bitmap}, offsetY}, index) => res
        + bitmap[type]
        + offsetY
        + Number(index > 0) * offset,
    0,
);

const calcMargin = (obj = {}) => {
    if (Number.isInteger(obj)) {
        return {
            top: obj,
            right: obj,
            bottom: obj,
            left: obj,
        };
    }

    if (typeof obj === 'string') {
        const [top, right = top, bottom = top, left = right] = obj.split(' ');

        return {
            top: Number(top),
            right: Number(right),
            bottom: Number(bottom),
            left: Number(left),
        };
    }

    const {top = 0, right = 0, bottom = 0, left = 0} = obj;
    return {top, right, bottom, left};
};

const alignImage = (total, size, align) => {
    if (align === 'center') {
        return (total - size) / 2;
    }

    if (align === 'end') {
        return total - size;
    }

    return 0;
};

/**
 * @param {Array<string|{src:string|Buffer,offsetX?:number,offsetY?:number}|Buffer|Jimp>} images
 * @param {object} [opts]
 * @param {boolean} [opts.direction]
 * @param {number} [opts.color]
 * @param {'start'|'center'|'end'} [opts.align]
 * @param {number} [opts.offset]
 * @param {string|number|{top:string|number,right:string|number,bottom:string|number,left:string|number}} [opts.margin]
 */
export default async (images, {
    direction = false,
    color = 0x00_00_00_00,
    align = 'start',
    offset = 0,
    margin,
} = {}) => {
    if (!Array.isArray(images)) {
        throw new TypeError('First arg should be an array with images');
    }

    if (images.length <= 1) {
        throw new Error('First arg array must contain more than one image');
    }

    const imgs = await Promise.all(images.map(processImg));

    let totalX = 0;
    let totalY = 0;

    const imgData = imgs.reduce((res, {
        img,
        offsetX = 0,
        offsetY = 0,
    }) => {
        const {bitmap: {width, height}} = img;

        res.push({
            img,
            x: totalX + offsetX,
            y: totalY + offsetY,
            offsetX,
            offsetY,
        });

        totalX += width + offsetX;
        totalY += height + offsetY;

        return res;
    }, []);

    const {top, right, bottom, left} = calcMargin(margin);
    const marginTopBottom = top + bottom;
    const marginRightLeft = right + left;

    const totalWidth = direction
        ? countTotalMax(imgData, 'width')
        : countTotalReduce(imgData, 'width', offset);

    const totalHeight = direction
        ? countTotalReduce(imgData, 'height', offset)
        : countTotalMax(imgData, 'height');

    const baseImage = new Jimp({
        width: totalWidth + marginRightLeft,
        height: totalHeight + marginTopBottom,
        color,
    });

    for (const [index, {img, x, y, offsetX, offsetY}] of imgData.entries()) {
        const {bitmap: {width, height}} = img;

        const [px, py] = direction
            ? [alignImage(totalWidth, width, align) + offsetX, y + index * offset]
            : [x + index * offset, alignImage(totalHeight, height, align) + offsetY];

        baseImage.composite(img, px + left, py + top);
    }

    return baseImage;
};
