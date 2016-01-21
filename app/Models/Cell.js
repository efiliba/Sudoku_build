/// <reference path="../Utilities/BitUtilities.ts" />
var Solver;
(function (Solver) {
    (function (SetMethod) {
        SetMethod[SetMethod["loaded"] = 0] = "loaded";
        SetMethod[SetMethod["user"] = 1] = "user";
        SetMethod[SetMethod["calculated"] = 2] = "calculated";
    })(Solver.SetMethod || (Solver.SetMethod = {}));
    var SetMethod = Solver.SetMethod;
    var Cell = (function () {
        function Cell(column, row) {
            this.column = column;
            this.row = row;
            if (typeof column === "number")
                this.reset();
            else {
                var copy = column;
                this.column = copy.column;
                this.row = copy.row;
                this.setMethod = copy.setMethod;
                this.options = copy.options;
                this.setColumn = copy.setColumn;
                this.setRow = copy.setRow;
                this.totalOptionsRemaining = copy.totalOptionsRemaining;
                if (copy.json.rows) {
                    this.json = { rows: [] };
                    for (var row = 0; row < copy.json.rows.length; row++) {
                        this.json.rows[row] = { columns: [] };
                        var jsonColumns = copy.json.rows[row].columns;
                        for (var column = 0; column < jsonColumns.length; column++) {
                            this.json.rows[row].columns[column] = { symbol: jsonColumns[column].symbol };
                            if (jsonColumns[column].strikeOut)
                                this.json.rows[row].columns[column].strikeOut = jsonColumns[column].strikeOut;
                        }
                    }
                }
                else
                    this.json = { symbol: copy.json.symbol, setMethod: copy.json.setMethod };
            }
        }
        Cell.Constructor = function (columns, rows) {
            Cell.symbols = "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0";
            Cell.columns = columns;
            Cell.rows = rows;
        };
        Cell.prototype.reset = function () {
            this.setMethod = null;
            this.options = (1 << Cell.columns * Cell.rows) - 1; // Set all bits
            this.setColumn = -1;
            this.setRow = -1;
            this.totalOptionsRemaining = Cell.columns * Cell.rows;
            this.json = { rows: [] }; // Set JSON representation to all options available 
            for (var row = 0, index = 0; row < Cell.rows; row++) {
                var columns = [];
                for (var column = 0; column < Cell.columns; column++)
                    columns.push({ symbol: Cell.symbols[index++] });
                this.json.rows.push({ columns: columns });
            }
        };
        Cell.prototype.equale = function (cell) {
            return (this.setColumn === cell.setColumn || cell.setColumn === -1) && (this.setRow === cell.setRow || cell.setRow === -1) && this.options === cell.options;
            //return this.options === cell.options;
        };
        Cell.prototype.symbol = function () {
            return Cell.symbols[this.setRow * Cell.columns + this.setColumn];
        };
        Cell.prototype.getColumn = function () {
            return this.column;
        };
        Cell.prototype.getRow = function () {
            return this.row;
        };
        Cell.prototype.solved = function () {
            return this.totalOptionsRemaining === 1;
        };
        Cell.prototype.removeOptionAtPosition = function (column, row) {
            var lastOptionFound = false;
            var bit = 1 << Cell.columns * row + column;
            if (this.options & bit) {
                this.options &= ~bit;
                if (--this.totalOptionsRemaining === 1) {
                    this.setRemainingOption(this.options); // Set last remaining option's column and row 
                    this.json = { symbol: Cell.symbols[Solver.BitUtilities.powerOf2BitPositions[this.options]] };
                    this.setMethod = 2 /* calculated */;
                    lastOptionFound = true;
                }
                else
                    this.json.rows[row].columns[column].strikeOut = true; // Only set strikeOut to true if option removed - else leave empty   
            }
            return lastOptionFound;
        };
        Cell.prototype.removeOption = function (option) {
            var lastOptionFound = false;
            if (this.options & option && this.totalOptionsRemaining > 1) {
                this.options &= ~option;
                if (--this.totalOptionsRemaining === 1) {
                    this.setRemainingOption(this.options); // Set last remaining option's column and row 
                    this.json = { symbol: Cell.symbols[Solver.BitUtilities.powerOf2BitPositions[this.options]] };
                    this.setMethod = 2 /* calculated */;
                    lastOptionFound = true;
                }
                else {
                    var index = Solver.BitUtilities.powerOf2BitPositions[option];
                    this.json.rows[index / Cell.columns >> 0].columns[index % Cell.columns].strikeOut = true;
                }
            }
            return lastOptionFound;
        };
        Cell.prototype.removeOptions = function (remove) {
            var lastOptionFound = false;
            var removeOptions = this.options & remove;
            if (removeOptions && this.totalOptionsRemaining > 1 && this.options & ~remove) {
                this.options -= removeOptions;
                this.totalOptionsRemaining -= Solver.BitUtilities.numberOfBitsSet(removeOptions);
                if (this.totalOptionsRemaining === 1) {
                    this.setRemainingOption(this.options); // Set last remaining option's column and row 
                    this.json = { symbol: Cell.symbols[Solver.BitUtilities.powerOf2BitPositions[this.options]] };
                    this.setMethod = 2 /* calculated */;
                    lastOptionFound = true;
                }
                else
                    while (removeOptions) {
                        var highestBitPos = Solver.BitUtilities.highestBitPosition(removeOptions);
                        this.json.rows[highestBitPos / Cell.columns >> 0].columns[highestBitPos % Cell.columns].strikeOut = true;
                        removeOptions -= 1 << highestBitPos;
                    }
            }
            return lastOptionFound;
        };
        Cell.prototype.setByPosition = function (column, row, setMethod) {
            this.clearAllExceptAtPosition(this.setColumn = column, this.setRow = row, this.setMethod = setMethod);
        };
        Cell.prototype.setByIndex = function (index, setMethod) {
            this.clearAllExceptAtPosition(this.setColumn = index % Cell.columns, this.setRow = index / Cell.columns >> 0, this.setMethod = setMethod);
        };
        Cell.prototype.setByOption = function (option, setMethod) {
            this.setByIndex(Solver.BitUtilities.powerOf2BitPositions[option], setMethod);
        };
        Cell.prototype.setBySymbol = function (symbol, setMethod) {
            this.setByIndex(Cell.symbols.indexOf(symbol), setMethod);
        };
        Cell.prototype.containsOption = function (option) {
            return (this.options & option) > 0;
        };
        Cell.prototype.containsOptionAtPosition = function (column, row) {
            var bit = 1 << row * Cell.columns + column;
            return (this.options & bit) > 0;
        };
        Cell.prototype.containsOptions = function (checkOptions) {
            return (this.options & checkOptions) === checkOptions;
        };
        Cell.prototype.containsSymbol = function (symbol) {
            var index = Cell.symbols.indexOf(symbol);
            return (this.options & 1 << index) > 0;
        };
        Cell.prototype.setRemainingOption = function (options) {
            var index = Solver.BitUtilities.highestBitPosition(options);
            this.setColumn = index % Cell.columns;
            this.setRow = index / Cell.columns >> 0;
        };
        Cell.prototype.clearAllExcept = function (option, fix) {
            this.options = option;
            this.json = { symbol: Cell.symbols[Solver.BitUtilities.powerOf2BitPositions[option]], fixed: fix };
            this.totalOptionsRemaining = 1;
        };
        Cell.prototype.clearAllExceptAtPosition = function (column, row, setMethod) {
            this.options = 1 << Cell.columns * row + column;
            this.json = { symbol: Cell.symbols[Solver.BitUtilities.powerOf2BitPositions[this.options]], setMethod: setMethod };
            this.totalOptionsRemaining = 1;
        };
        Cell.prototype.removedOptionsPerRow = function (row) {
            var removedOptions = [];
            for (var column = 0, bit = 1 << row * Cell.columns; column < Cell.columns; column++, bit <<= 1)
                if (!(this.options & bit))
                    removedOptions.push(column);
            return removedOptions;
        };
        // Remove options iff cell contains other options
        Cell.prototype.removeIfExtraOptions = function (options) {
            return this.totalOptionsRemaining > 1 && (this.options & ~options) > 0 && this.removeOptions(options);
        };
        Cell.prototype.setJson = function (json) {
            if (json.rows) {
                this.options = 0;
                this.totalOptionsRemaining = 0;
                for (var row = 0, option = 1; row < json.rows.length; row++) {
                    var columns = json.rows[row].columns;
                    for (var column = 0; column < columns.length; column++, option <<= 1)
                        if (!columns[column].strikeOut) {
                            this.options += option;
                            this.totalOptionsRemaining++;
                        }
                }
            }
            else
                this.setBySymbol(json.symbol, json.setMethod);
            this.json = json;
        };
        return Cell;
    })();
    Solver.Cell = Cell;
})(Solver || (Solver = {}));
//# sourceMappingURL=Cell.js.map