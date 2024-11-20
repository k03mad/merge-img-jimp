import Jimp from 'jimp';

import alignImage from './utils/alignImage.js';
import calcMargin from './utils/calcMargin.js';

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

/**
 * @param {Array} images
 * @param {object} opts
 * @param {boolean} [opts.direction]
 * @param {number} [opts.color]
 * @param {string} [opts.align]
 * @param {number} [opts.offset]
 * @param {number} [opts.margin]
 */
export default async (images, {
    direction = false,
    color = 0x00_00_00_00,
    align = 'start',
    offset = 0,
    margin,
} = {}) => {
    if (!Array.isArray(images)) {
        throw new TypeError('"images" must be an array with images');
    }

    if (images.length <= 1) {
        throw new Error('"images" must contain more than one image');
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

    const baseImage = new Jimp(
        totalWidth + marginRightLeft,
        totalHeight + marginTopBottom,
        color,
    );

    for (const [index, {img, x, y, offsetX, offsetY}] of imgData.entries()) {
        const {bitmap: {width, height}} = img;

        const [px, py] = direction
            ? [alignImage(totalWidth, width, align) + offsetX, y + index * offset]
            : [x + index * offset, alignImage(totalHeight, height, align) + offsetY];

        baseImage.composite(img, px + left, py + top);
    }

    return baseImage;
};
