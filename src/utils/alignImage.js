/**
 * @param {number} total
 * @param {number} size
 * @param {string} align
 */
export default (total, size, align) => {
    if (align === 'center') {
        return (total - size) / 2;
    }

    if (align === 'end') {
        return total - size;
    }

    return 0;
};
