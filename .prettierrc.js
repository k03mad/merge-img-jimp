export default {
    tabWidth: 4,
    singleQuote: true,
    quoteProps: 'consistent',
    bracketSpacing: false,
    arrowParens: 'avoid',
    overrides: [
        {
            files: ['*.json'],
            options: {
                tabWidth: 2,
            },
        },
    ],
};
