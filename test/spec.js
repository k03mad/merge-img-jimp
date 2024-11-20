import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import mergeImg from '../src/index.js';

const PICTURE_PATH = './test/example.png';

const PICTURE_WIDTH = 2953;
const PICTURE_HEIGHT = 1911;

const MERGE_COUNT = 3;

const OFFSET_TEST = 27;
const MARGIN_TEST = 66;

const OUTPUT_KEYS = [
    '_events',
    '_eventsCount',
    '_maxListeners',
    'bitmap',
    '_background',
    '_originalMime',
    '_exif',
    '_rgba',
    'writeAsync',
    'getBase64Async',
    'getBuffer',
    'getBufferAsync',
    'getPixelColour',
    'setPixelColour',
];

const OUTPUT_KEYS_BITMAP = [
    'data',
    'width',
    'height',
];

const tests = [
    {
        assertWidth: PICTURE_WIDTH * MERGE_COUNT,
    },
    {
        arrayImages: {},
        assertWidth: PICTURE_WIDTH * MERGE_COUNT,
    },
    {
        arrayImages: {offsetX: OFFSET_TEST},
        assertWidth: PICTURE_WIDTH * MERGE_COUNT,
        assertHeight: PICTURE_HEIGHT + OFFSET_TEST,
    },
    {
        arrayImages: {offsetY: OFFSET_TEST},
        assertWidth: (PICTURE_WIDTH + OFFSET_TEST) * MERGE_COUNT,
        assertHeight: PICTURE_HEIGHT,
    },
    {
        arrayImages: {offsetX: OFFSET_TEST + 2, offsetY: OFFSET_TEST},
        assertWidth: (PICTURE_WIDTH + OFFSET_TEST) * MERGE_COUNT,
        assertHeight: PICTURE_HEIGHT + OFFSET_TEST + 2,
    },
    {
        opts: {color: '#ffffff'},
        assertWidth: PICTURE_WIDTH * MERGE_COUNT,
        assertBackground: 4_294_967_295,
    },
    {
        opts: {color: 123},
        assertWidth: PICTURE_WIDTH * MERGE_COUNT,
        assertBackground: 123,
    },
    {
        opts: {color: 0x25_40_00_00},
        assertWidth: PICTURE_WIDTH * MERGE_COUNT,
        assertBackground: 624_951_296,
    },
    {
        opts: {direction: true},
        assertHeight: PICTURE_HEIGHT * MERGE_COUNT,
    },
    {
        opts: {direction: false},
        assertWidth: PICTURE_WIDTH * MERGE_COUNT,
    },
    {
        opts: {align: 'start'},
        assertWidth: PICTURE_WIDTH * MERGE_COUNT,
    },
    {
        opts: {align: 'center'},
        assertWidth: PICTURE_WIDTH * MERGE_COUNT,
    },
    {
        opts: {align: 'end'},
        assertWidth: PICTURE_WIDTH * MERGE_COUNT,
    },
    {
        opts: {align: 'qq'},
        assertWidth: PICTURE_WIDTH * MERGE_COUNT,
    },
    {
        opts: {offset: OFFSET_TEST},
        assertWidth: (PICTURE_WIDTH + OFFSET_TEST) * MERGE_COUNT - OFFSET_TEST,
    },
    {
        opts: {margin: MARGIN_TEST},
        assertHeight: PICTURE_HEIGHT + MARGIN_TEST * (MERGE_COUNT - 1),
        assertWidth: (PICTURE_WIDTH + MARGIN_TEST) * MERGE_COUNT - MARGIN_TEST,
    },
    {
        opts: {margin: {top: MARGIN_TEST * 3, right: MARGIN_TEST * 3, bottom: MARGIN_TEST * 3, left: MARGIN_TEST * 3}},
        assertHeight: PICTURE_HEIGHT + (MARGIN_TEST * 3) * (MERGE_COUNT - 1),
        assertWidth: (PICTURE_WIDTH + (MARGIN_TEST * 3)) * MERGE_COUNT - (MARGIN_TEST * 3),
    },
    {
        opts: {margin: String(MARGIN_TEST * 2)},
        assertHeight: PICTURE_HEIGHT + (MARGIN_TEST * 2) * (MERGE_COUNT - 1),
        assertWidth: (PICTURE_WIDTH + (MARGIN_TEST * 2)) * MERGE_COUNT - (MARGIN_TEST * 2),
    },
    {
        opts: {offset: OFFSET_TEST, margin: MARGIN_TEST},
        assertHeight: PICTURE_HEIGHT + MARGIN_TEST * (MERGE_COUNT - 1),
        assertWidth: (PICTURE_WIDTH + MARGIN_TEST + OFFSET_TEST) * MERGE_COUNT - MARGIN_TEST - OFFSET_TEST,
    },
];

describe('merge', () => {
    tests.forEach(test => {
        const name = JSON.stringify({
            ...test,
            // arrayImages: Buffer.isBuffer(test.arrayImages?.src)
            //     ? {src: '<buffer>'}
            //     : test.arrayImages,
        });

        let merged;

        it(`[merge]\n${name}`, async () => {
            merged = await mergeImg(
                test.arrayImages
                    ? Array.from({length: MERGE_COUNT}, () => ({src: PICTURE_PATH, ...test.arrayImages}))
                    : Array.from({length: MERGE_COUNT}, () => PICTURE_PATH),
                test.opts,
            );
        });

        it(`[keys]\n${name}`, () => {
            assert.deepEqual(Object.keys(merged), OUTPUT_KEYS);
        });

        it(`[keys][bitmap]\n${name}`, () => {
            assert.deepEqual(Object.keys(merged.bitmap), OUTPUT_KEYS_BITMAP);
        });

        it(`[_events]\n${name}`, () => {
            assert.equal(typeof merged._events, 'object');
        });

        it(`[_eventsCount]\n${name}`, () => {
            assert.equal(merged._eventsCount, 0);
        });

        it(`[_maxListeners]\n${name}`, () => {
            assert.equal(merged._maxListeners, undefined);
        });

        it(`[_background]\n${name}`, () => {
            assert.equal(merged._background, test.assertBackground || 0);
        });

        it(`[_exif]\n${name}`, () => {
            assert.equal(merged._exif, null);
        });

        it(`[_rgba]\n${name}`, () => {
            assert.equal(merged._rgba, true);
        });

        it(`[_originalMime]\n${name}`, () => {
            assert.equal(merged._originalMime, 'image/png');
        });

        OUTPUT_KEYS
            .filter(key => (/^(get|set|write)/).test(key))
            .forEach(elem => {
                it(`[${elem}]\n${name}`, () => {
                    assert.equal(typeof merged[elem], 'function');
                });
            });

        it(`[buffer]\n${name}`, () => {
            assert(Buffer.isBuffer(merged.bitmap.data));
        });

        it(`[width]\n${name}`, () => {
            assert.equal(merged.bitmap.width, test.assertWidth || PICTURE_WIDTH);
        });

        it(`[height]\n${name}`, () => {
            assert.equal(merged.bitmap.height, test.assertHeight || PICTURE_HEIGHT);
        });
    });
});
