import assert from 'node:assert/strict';

import {log} from '@k03mad/simple-log';

import mergeImg from '../src/index.js';

const PICTURE_PATH = './test/example.png';

const PICTURE_WIDTH = 2953;
const PICTURE_HEIGHT = 1911;

const MERGE_COUNT = 3;

const now = Date.now();

const merged = await mergeImg(
    Array.from({length: MERGE_COUNT}, () => PICTURE_PATH),
);

log(`Merged: ${Date.now() - now}ms`);

assert(Buffer.isBuffer(merged.bitmap.data));
assert.equal(merged.bitmap.width, PICTURE_WIDTH * MERGE_COUNT);
assert.equal(merged.bitmap.height, PICTURE_HEIGHT);
