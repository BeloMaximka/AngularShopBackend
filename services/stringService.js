const forbiddenWordsPattern = /кокос|банан|плохой|@/gi

function replaceWithEqualSymbols(string, symbol, pattern) {
    return string.replaceAll(pattern, (element) => {
        return symbol.repeat(element.length);
    });
}

module.exports = { replaceWithEqualSymbols, forbiddenWordsPattern };