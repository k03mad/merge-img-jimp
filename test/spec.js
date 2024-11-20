import mergeImg from '../src/index.js';
import assert from 'assert/strict';

const PICTURE_PATH = './test/example.png';

const PICTURE_WIDTH = 2953;
const PICTURE_HEIGHT = 1911;

const MERGE_COUNT = 10;

const merged = await mergeImg(
    Array.from({length: MERGE_COUNT}, () => PICTURE_PATH),
);

assert(Buffer.isBuffer(merged.bitmap.data));
assert.equal(merged.bitmap.width, PICTURE_WIDTH * MERGE_COUNT);
assert.equal(merged.bitmap.height, PICTURE_HEIGHT);
