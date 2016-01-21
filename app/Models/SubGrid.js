/// <reference path="Cell.ts" />
var Solver;
(function (Solver) {
    var SubGrid = (function () {
        function SubGrid(column, row) {
            this.column = column;
            this.row = row;
            this.reset();
        }
        //        private remainingCells: number;                                                             // Track how many unset cells are left
        SubGrid.Constructor = function (columns, rows) {
            Solver.Cell.Constructor(rows, columns); // Swop columns and rows
            SubGrid.columns = columns;
            SubGrid.rows = rows;
        };
        SubGrid.prototype.reset = function () {
            this.cells = [];
            for (var row = 0; row < SubGrid.rows; row++) {
                this.cells[row] = [];
                for (var column = 0; column < SubGrid.columns; column++)
                    this.cells[row][column] = new Solver.Cell(column, row);
            }
            //            this.remainingCells = SubGrid.columns * SubGrid.rows;
        };
        SubGrid.prototype.get = function (column, row) {
            return this.cells[row][column];
        };
        SubGrid.prototype.toJson = function () {
            var json = { rows: [] };
            for (var row = 0; row < SubGrid.rows; row++) {
                var jsonCells = [];
                for (var column = 0; column < SubGrid.columns; column++)
                    jsonCells.push(this.cells[row][column].json);
                json.rows.push({ columns: jsonCells });
            }
            return json;
        };
        SubGrid.prototype.setJson = function (json) {
            //            this.remainingCells = SubGrid.columns * SubGrid.rows;
            for (var row = 0; row < json.rows.length; row++) {
                var columns = json.rows[row].columns;
                for (var column = 0; column < columns.length; column++) {
                    this.cells[row][column].setJson(columns[column]);
                }
            }
        };
        SubGrid.prototype.setByPosition = function (column, row, optionColumn, optionRow, setMethod) {
            var cell = this.cells[row][column];
            if (!cell.setMethod) {
                cell.setByPosition(optionColumn, optionRow, setMethod);
                return true;
            }
            else
                return false;
        };
        SubGrid.prototype.setByOption = function (column, row, option, setMethod) {
            var cell = this.cells[row][column];
            if (!cell.setMethod) {
                cell.setByOption(option, setMethod);
                return true;
            }
            else
                return false;
        };
        SubGrid.prototype.setBySymbol = function (column, row, symbol, setMethod) {
            var cell = this.cells[row][column];
            if (!cell.setMethod) {
                cell.setBySymbol(symbol, setMethod);
                return cell.options;
            }
            else
                return 0;
        };
        SubGrid.prototype.compare = function (items) {
            var match = true;
            var row = SubGrid.rows;
            while (match && row--) {
                var column = SubGrid.columns;
                while (match && column--)
                    match = this.cells[row][column].equale(items[row][column]);
            }
            return match;
        };
        SubGrid.prototype.simplify = function () {
            var changed = true;
            while (changed) {
                changed = false;
                var row = SubGrid.rows;
                while (!changed && row--) {
                    var column = SubGrid.columns;
                    while (!changed && column--)
                        changed = this.cells[row][column].setMethod && this.removeIfExtraOptions(this.cells[row][column].options).length > 0;
                }
            }
        };
        SubGrid.prototype.solved = function () {
            var solved = true;
            var row = SubGrid.rows;
            while (solved && row--) {
                var column = SubGrid.columns;
                while (solved && column--)
                    solved = this.cells[row][column].solved();
            }
            return solved;
            //return !this.remainingCells;
        };
        SubGrid.prototype.getAvailableOptionsMatrix = function () {
            var matrix = [];
            var row = SubGrid.rows;
            while (row--) {
                matrix[row] = [];
                var column = SubGrid.columns;
                while (column--)
                    matrix[row][column] = this.cells[row][column].options;
            }
            return matrix;
        };
        SubGrid.prototype.getCellsMatrix = function () {
            var matrix = [];
            var row = SubGrid.rows;
            while (row--) {
                matrix[row] = [];
                var column = SubGrid.columns;
                while (column--)
                    matrix[row][column] = new Solver.Cell(this.cells[row][column]);
            }
            return matrix;
        };
        SubGrid.prototype.getUnsetCells = function () {
            var unsetCells = [];
            for (var row = 0; row < SubGrid.rows; row++)
                for (var column = 0; column < SubGrid.columns; column++)
                    if (!this.cells[row][column].setMethod)
                        unsetCells.push(new Solver.Cell(this.cells[row][column]));
            return unsetCells;
        };
        SubGrid.prototype.unsetCells = function (totalUnsetOptions) {
            var cells = this.getUnsetCells();
            var unset = [];
            for (var index = 0; index < cells.length; index++)
                if (cells[index].totalOptionsRemaining === totalUnsetOptions)
                    unset.push(cells[index]);
            return unset;
        };
        SubGrid.prototype.getAvailableOptions = function () {
            var array = [];
            var row = SubGrid.rows;
            while (row--) {
                var column = SubGrid.columns;
                while (column--)
                    array[row * SubGrid.columns + column] = this.cells[row][column].options;
            }
            return array;
        };
        // Remove option from all other cells in this sub grid - return array of last options found and options removed from all columns / rows in the sub grid
        SubGrid.prototype.strikeOutCell = function (cellColumn, cellRow, option) {
            var lastOptions = [];
            var removedOptionsFromColumn = [];
            var removedOptionsFromRow = [];
            var column;
            var row = SubGrid.rows;
            while (--row > cellRow) {
                column = SubGrid.columns;
                while (column--)
                    if (this.cells[row][column].removeOption(option))
                        lastOptions.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: column, cellRow: row, bits: this.cells[row][column].options });
                    else {
                        if (this.optionRemovedFromColumn(column, row, option))
                            removedOptionsFromColumn.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: column, cellRow: -1, bits: option });
                        if (this.optionRemovedFromRow(column, row, option))
                            removedOptionsFromRow.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: -1, cellRow: row, bits: option });
                    }
            }
            column = SubGrid.columns;
            while (--column > cellColumn)
                if (this.cells[row][column].removeOption(option))
                    lastOptions.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: column, cellRow: row, bits: this.cells[row][column].options });
                else {
                    if (this.optionRemovedFromColumn(column, row, option))
                        removedOptionsFromColumn.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: column, cellRow: -1, bits: option });
                    if (this.optionRemovedFromRow(column, row, option))
                        removedOptionsFromRow.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: -1, cellRow: row, bits: option });
                }
            while (column--)
                if (this.cells[row][column].removeOption(option))
                    lastOptions.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: column, cellRow: row, bits: this.cells[row][column].options });
                else {
                    if (this.optionRemovedFromColumn(column, row, option))
                        removedOptionsFromColumn.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: column, cellRow: -1, bits: option });
                    if (this.optionRemovedFromRow(column, row, option))
                        removedOptionsFromRow.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: -1, cellRow: -1, bits: option });
                }
            while (row--) {
                column = SubGrid.columns;
                while (column--)
                    if (this.cells[row][column].removeOption(option))
                        lastOptions.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: column, cellRow: row, bits: this.cells[row][column].options });
                    else {
                        if (this.optionRemovedFromColumn(column, row, option))
                            removedOptionsFromColumn.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: column, cellRow: -1, bits: option });
                        if (this.optionRemovedFromRow(column, row, option))
                            removedOptionsFromRow.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: -1, cellRow: row, bits: option });
                    }
            }
            return { lastOptionsFound: lastOptions, removedOptionsFromColumn: removedOptionsFromColumn, removedOptionsFromRow: removedOptionsFromRow };
        };
        SubGrid.prototype.isStruckOut = function (cellColumn, cellRow, symbol) {
            return !this.cells[cellRow][cellColumn].containsSymbol(symbol);
        };
        SubGrid.prototype.removeOptionsFromColumn = function (cellColumn, options) {
            var lastOptions = [];
            for (var row = 0; row < SubGrid.rows; row++)
                if (this.cells[row][cellColumn].removeOptions(options)) {
                    lastOptions.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: cellColumn, cellRow: row, bits: this.cells[row][cellColumn].options });
                }
            return lastOptions;
        };
        SubGrid.prototype.removeOptionsFromRow = function (cellRow, options) {
            var lastOptions = [];
            for (var column = 0; column < SubGrid.columns; column++)
                if (this.cells[cellRow][column].removeOptions(options)) {
                    lastOptions.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: column, cellRow: cellRow, bits: this.cells[cellRow][column].options });
                }
            return lastOptions;
        };
        SubGrid.prototype.removeOptionsExceptFromColumn = function (excludeColumn, options) {
            var lastOptions = [];
            var row;
            var column = SubGrid.columns;
            while (--column > excludeColumn) {
                row = SubGrid.rows;
                while (row--)
                    if (this.cells[row][column].removeOptions(options)) {
                        lastOptions.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: column, cellRow: row, bits: this.cells[row][column].options });
                    }
            }
            while (column--) {
                row = SubGrid.rows;
                while (row--)
                    if (this.cells[row][column].removeOptions(options)) {
                        lastOptions.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: column, cellRow: row, bits: this.cells[row][column].options });
                    }
            }
            return lastOptions;
        };
        SubGrid.prototype.removeOptionsExceptFromRow = function (excludeRow, options) {
            var lastOptions = [];
            var column;
            var row = SubGrid.rows;
            while (--row > excludeRow) {
                column = SubGrid.columns;
                while (column--)
                    if (this.cells[row][column].removeOptions(options)) {
                        lastOptions.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: column, cellRow: row, bits: this.cells[row][column].options });
                    }
            }
            while (row--) {
                column = SubGrid.columns;
                while (column--)
                    if (this.cells[row][column].removeOptions(options)) {
                        lastOptions.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: column, cellRow: row, bits: this.cells[row][column].options });
                    }
            }
            return lastOptions;
        };
        SubGrid.prototype.removeIfExtraOptionsFromColumn = function (column, options) {
            var lastOptions = [];
            for (var row = 0; row < SubGrid.rows; row++)
                if (this.cells[row][column].removeOptions(options)) {
                    lastOptions.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: column, cellRow: row, bits: this.cells[row][column].options });
                }
            return lastOptions;
        };
        SubGrid.prototype.removeIfExtraOptionsFromRow = function (row, options) {
            var lastOptions = [];
            for (var column = 0; column < SubGrid.columns; column++)
                if (this.cells[row][column].removeOptions(options)) {
                    lastOptions.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: column, cellRow: row, bits: this.cells[row][column].options });
                }
            return lastOptions;
        };
        SubGrid.prototype.removeIfExtraOptions = function (options) {
            var lastOptions = [];
            for (var row = 0; row < SubGrid.rows; row++)
                for (var column = 0; column < SubGrid.columns; column++)
                    if (this.cells[row][column].removeOptions(options)) {
                        lastOptions.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: column, cellRow: row, bits: this.cells[row][column].options });
                    }
            return lastOptions;
        };
        SubGrid.prototype.optionExistsInColumn = function (column, option) {
            var found = false;
            var row = SubGrid.rows;
            while (!found && row--)
                found = this.cells[row][column].containsOption(option);
            return found;
        };
        SubGrid.prototype.optionExistsInRow = function (row, option) {
            var found = false;
            var column = SubGrid.columns;
            while (!found && column-- > 0)
                found = this.cells[row][column].containsOption(option);
            return found;
        };
        SubGrid.prototype.optionRemovedFromColumn = function (cellColumn, cellRow, option) {
            // Check if option removed from column
            var optionFound = false;
            var row = SubGrid.rows;
            while (!optionFound && --row > cellRow)
                optionFound = (this.cells[row][cellColumn].options & option) > 0;
            while (!optionFound && row--)
                optionFound = (this.cells[row][cellColumn].options & option) > 0;
            return !optionFound; // If option not found then it was removed from this sub grid's column
        };
        SubGrid.prototype.optionRemovedFromRow = function (cellColumn, cellRow, removedOption) {
            // Check if option removed from row
            var optionFound = false;
            var column = SubGrid.columns;
            while (!optionFound && --column > cellColumn)
                optionFound = (this.cells[cellRow][column].options & removedOption) > 0;
            while (!optionFound && column--)
                optionFound = (this.cells[cellRow][column].options & removedOption) > 0;
            return !optionFound; // If option not found then it was removed from this sub grid's row
        };
        SubGrid.prototype.setCells = function (subGrid) {
            for (var row = 0; row < SubGrid.rows; row++)
                for (var column = 0; column < SubGrid.columns; column++)
                    this.cells[row][column] = new Solver.Cell(subGrid[row][column]);
        };
        return SubGrid;
    })();
    Solver.SubGrid = SubGrid;
})(Solver || (Solver = {}));
//# sourceMappingURL=SubGrid.js.map