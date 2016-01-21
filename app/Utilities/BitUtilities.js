var Solver;
(function (Solver) {
    var BitUtilities = (function () {
        function BitUtilities() {
        }
        // Population count
        BitUtilities.numberOfBitsSet = function (bits) {
            var count = 0;
            while (bits) {
                bits &= bits - 1;
                count++;
            }
            return count;
        };
        // Return bits set within all passed elements (not XOR)
        BitUtilities.bitwiseOR = function (elements) {
            var totalOred = 0;
            for (var index = 0; index < elements.length; index++)
                totalOred |= elements[index];
            return totalOred;
        };
        // XOR all the values passed in to find an only option
        BitUtilities.onlyOption = function (options) {
            var option = 0;
            var filled = 0;
            for (var index = 0; index < options.length; index++)
                if (options[index] & options[index] - 1) {
                    filled |= option & options[index];
                    option ^= options[index]; // XOR
                }
            option &= ~filled;
            return {
                found: option && !(option & option - 1),
                bit: option
            };
        };
        // Index of first item in array containing bit
        BitUtilities.containingBitIndex = function (array, bit) {
            var index = 0;
            while (!(array[index] & bit) && index < array.length)
                index++;
            return index;
        };
        BitUtilities.highestBitPosition = function (v) {
            v |= v >> 1; // first round down to one less than a power of 2 
            v |= v >> 2;
            v |= v >> 4;
            v |= v >> 8;
            v |= v >> 16;
            return BitUtilities.multiplyDeBruijnBitPosition[(v * 0x07C4ACDD >> 27) + 32];
        };
        BitUtilities.multiplyDeBruijnBitPosition = [0, 9, 1, 10, 13, 21, 2, 29, 11, 14, 16, 18, 22, 25, 3, 30, 8, 12, 20, 28, 15, 17, 24, 7, 19, 27, 23, 6, 26, 5, 4, 31, 0, 9, 1, 10, 13, 21, 2, 29, 11, 14, 16, 18, 22, 25, 3, 30, 8, 12, 20, 28, 15, 17, 24, 7, 19, 27, 23, 6, 26, 5, 4, 31]; // Duplicated
        //private static multiplyDeBruijnBitPosition2 = [0, 1, 28, 2, 29, 14, 24, 3, 30, 22, 20, 15, 25, 17, 4, 8, 31, 27, 13, 23, 21, 19, 16, 7, 26, 12, 18, 6, 11, 5, 10, 9,
        //    0, 1, 28, 2, 29, 14, 24, 3, 30, 22, 20, 15, 25, 17, 4, 8, 31, 27, 13, 23, 21, 19, 16, 7, 26, 12, 18, 6, 11, 5, 10, 9];
        //public static powerOf2BitPosition(v: number): number {
        //    return BitUtilities.multiplyDeBruijnBitPosition2[(v * 0x77CB531 >> 27) + 32];
        //}
        BitUtilities.powerOf2BitPositions = {
            1: 0,
            2: 1,
            4: 2,
            8: 3,
            16: 4,
            32: 5,
            64: 6,
            128: 7,
            256: 8,
            512: 9,
            1024: 10,
            2048: 11,
            4096: 12,
            8192: 13,
            16384: 14,
            32768: 15,
            65536: 16,
            131072: 17,
            262144: 18,
            524288: 19,
            1048576: 20,
            2097152: 21,
            4194304: 22,
            8388608: 23,
            16777216: 24,
            33554432: 25,
            67108864: 26,
            134217728: 27,
            268435456: 28,
            536870912: 29,
            1073741824: 30,
            2147483648: 31
        };
        return BitUtilities;
    })();
    Solver.BitUtilities = BitUtilities;
})(Solver || (Solver = {}));
//# sourceMappingURL=BitUtilities.js.map