var Solver;
(function (Solver) {
    var Combinations = (function () {
        function Combinations(maxItemsSelectFrom) {
            var setBits = this.createSetBitsLookup(maxItemsSelectFrom);
            this.setBitsLookupTable = [];
            for (var index = 1; index < maxItemsSelectFrom; index++) {
                this.setBitsLookupTable[index] = [];
                for (var bit = 0; bit < setBits.length; bit++)
                    if (setBits[bit] === index)
                        this.setBitsLookupTable[index].push(bit);
            }
        }
        Combinations.prototype.select = function (from, pick) {
            var combinations = [];
            // Get bit flags used to select the combinations from the lookup table, up to the number of items to select from
            var setBits = 1 << from.length;
            var lookupTable = this.setBitsLookupTable[pick];
            for (var index = 0; index < lookupTable.length; index++)
                if (lookupTable[index] < setBits)
                    combinations.push(this.selectElements(from, lookupTable[index]));
            return combinations;
        };
        // Return elements where the index is in the select bit flag
        Combinations.prototype.selectElements = function (from, select) {
            //SelectElementsDelegate<T> selectElements = (elements, select) => { return elements.Where((x, i) => (1 << i & select) > 0); };
            var elements = [];
            for (var index = 0; index < from.length; index++)
                if (1 << index & select)
                    elements.push(from[index]);
            return elements;
        };
        // Populate array with the number of bits set i.e. [0] => 0, [1] => 1, [2] => 1, [3] => 2, ..., [333] => 5 (i.e. 101001101 has 5 bits set)
        Combinations.prototype.createSetBitsLookup = function (n) {
            var nextValues;
            nextValues = function (x) { return [x, x + 1, x + 1, x + 2]; };
            var lookupTable = nextValues(0); // Starting values { 0, 1, 1, 2 }
            for (var i = 2, tableSize = 4; i < n; i++, tableSize <<= 1)
                for (var j = 0, offset = tableSize >> 2; j < (tableSize >> 1) - offset; j++)
                    // lookupTable.InsertRange(tableSize + (j << 2), nextValues(lookupTable[j + offset]));
                    Array.prototype.splice.apply(lookupTable, [tableSize + (j << 2), 0].concat(nextValues(lookupTable[j + offset])));
            return lookupTable;
        };
        return Combinations;
    })();
    Solver.Combinations = Combinations;
})(Solver || (Solver = {}));
//# sourceMappingURL=Combinations.js.map