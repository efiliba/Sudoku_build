/// <reference path="../Utilities/Combinations.ts" />
/// <reference path="SubGrid.ts" />
var Solver;
(function (Solver) {
    var Grid = (function () {
        function Grid() {
            this.reset();
        }
        Grid.Constructor = function (columns, rows) {
            Grid.combinations = new Solver.Combinations(columns * rows);
            Solver.SubGrid.Constructor(rows, columns); // Swop columns and rows
            Grid.columns = columns;
            Grid.rows = rows;
        };
        Grid.prototype.reset = function () {
            this.subGrids = [];
            for (var row = 0; row < Grid.rows; row++) {
                this.subGrids[row] = [];
                for (var column = 0; column < Grid.columns; column++)
                    this.subGrids[row][column] = new Solver.SubGrid(column, row);
            }
            this.totalSet = 0;
        };
        Grid.prototype.get = function (column, row) {
            return this.subGrids[row][column];
        };
        Grid.prototype.toJson = function () {
            var json = { rows: [] };
            for (var row = 0; row < Grid.rows; row++) {
                var jsonSubGrids = [];
                for (var column = 0; column < Grid.columns; column++)
                    jsonSubGrids.push(this.subGrids[row][column].toJson());
                json.rows.push({ columns: jsonSubGrids });
            }
            return json;
        };
        Grid.prototype.setJson = function (json) {
            for (var subGridRow = 0; subGridRow < Grid.rows; subGridRow++) {
                var jsonColumns = json.rows[subGridRow].columns;
                for (var subGridColumn = 0; subGridColumn < Grid.columns; subGridColumn++)
                    this.subGrids[subGridRow][subGridColumn].setJson(jsonColumns[subGridColumn]);
            }
            // Strike out set cells
            this.totalSet = 0;
            for (var subGridRow = 0; subGridRow < Grid.rows; subGridRow++)
                for (var subGridColumn = 0; subGridColumn < Grid.columns; subGridColumn++) {
                    var subGrid = this.subGrids[subGridRow][subGridColumn];
                    for (var cellRow = 0; cellRow < Grid.columns; cellRow++)
                        for (var cellColumn = 0; cellColumn < Grid.rows; cellColumn++) {
                            var cell = subGrid.get(cellColumn, cellRow);
                            if (cell.setMethod) {
                                this.totalSet++;
                                this.strikeOut(subGridColumn, subGridRow, cellColumn, cellRow, cell.options);
                            }
                        }
                }
        };
        Grid.prototype.compare = function (items) {
            var match = true;
            var row = Grid.rows;
            while (match && row--) {
                var column = Grid.columns;
                while (match && column--)
                    match = this.subGrids[row][column].compare(items[row][column].getCellsMatrix());
            }
            return match;
        };
        Grid.prototype.solve = function (eliminateAfter, maxRecursionLevel) {
            if (eliminateAfter === void 0) { eliminateAfter = 0; }
            if (maxRecursionLevel === void 0) { maxRecursionLevel = 1; }
            do {
                while (this.simplify())
                    ;
            } while (this.totalSet > eliminateAfter && maxRecursionLevel && this.eliminate(Grid.columns * Grid.rows, maxRecursionLevel));
            return this.solved(); // totalSet === columns * rows * columns * rows;
        };
        Grid.prototype.solved = function () {
            var solved = true;
            var row = Grid.rows;
            while (solved && row--) {
                var column = Grid.columns;
                while (solved && column--)
                    solved = this.subGrids[row][column].solved();
            }
            return solved;
        };
        Grid.prototype.removeOptionAtPosition = function (subGridColumn, subGridRow, cellColumn, cellRow, optionColumn, optionRow) {
            var cell = this.subGrids[subGridRow][subGridColumn].get(cellColumn, cellRow);
            if (cell.removeOptionAtPosition(optionColumn, optionRow)) {
                this.totalSet++;
                this.strikeOut(subGridColumn, subGridRow, cellColumn, cellRow, cell.options); // Remaining option
                return true;
            }
            else
                return false;
        };
        Grid.prototype.removeOption = function (subGridColumn, subGridRow, cellColumn, cellRow, option) {
            var cell = this.subGrids[subGridRow][subGridColumn].get(cellColumn, cellRow);
            if (cell.removeOption(option)) {
                this.totalSet++;
                this.strikeOut(subGridColumn, subGridRow, cellColumn, cellRow, cell.options); // Remaining option
                return true;
            }
            else
                return false;
        };
        Grid.prototype.simplify = function () {
            var onlyOptionFound = false;
            while (this.removeOnlyOptions() || this.checkLimitedOptions())
                onlyOptionFound = true;
            return onlyOptionFound;
        };
        Grid.prototype.isValid = function () {
            var valid = this.matrixValid(this.getTransposedCellsMatrix()) && this.matrixValid(this.getCellsMatrix()); // Check columns and rows contain all options and no set cell duplicted 
            return valid;
        };
        Grid.prototype.matrixValid = function (matrix) {
            var valid = true;
            var size = Grid.columns * Grid.rows;
            var index = size;
            while (valid && index--) {
                var setOptions = this.setDistinctOptions(matrix[index]); // Get unique set cells
                var unsetOptions = this.unsetOptions(matrix[index]);
                valid = setOptions.length + unsetOptions.length === size && (Solver.BitUtilities.bitwiseOR(setOptions) | Solver.BitUtilities.bitwiseOR(unsetOptions)) === (1 << size) - 1; // totalSetOptions | totalUnsetOptions must contain all the options
            }
            return valid;
        };
        Grid.prototype.setDistinctOptions = function (cells) {
            // cells.Where(x => x.IsSet).GroupBy(x => x.Options).Where(x => x.Count() == 1).Select(x => x.Key);
            var distinct = [];
            var hash = {};
            for (var index = 0; index < cells.length; index++) {
                var options = cells[index].options;
                if (cells[index].setMethod && !hash[options]) {
                    distinct.push(options);
                    hash[options] = true;
                }
            }
            return distinct;
        };
        Grid.prototype.unsetOptions = function (cells) {
            // cells.Where(x => !x.IsSet).Select(x => x.Options)
            var options = [];
            for (var index = 0; index < cells.length; index++)
                if (!cells[index].setMethod)
                    options.push(cells[index].options);
            return options;
        };
        Grid.prototype.load = function (cells) {
            var subGrid = [];
            for (var row = 0; row < Grid.columns; row++)
                subGrid[row] = [];
            var size = Grid.columns * Grid.rows;
            for (var subGridRow = 0; subGridRow < Grid.rows; subGridRow++)
                for (var subGridColumn = 0; subGridColumn < Grid.columns; subGridColumn++) {
                    for (var cellRow = 0; cellRow < Grid.columns; cellRow++)
                        for (var cellColumn = 0; cellColumn < Grid.rows; cellColumn++)
                            subGrid[cellRow][cellColumn] = cells[subGridRow * size * Grid.columns + subGridColumn * Grid.rows + cellRow * size + cellColumn];
                    this.subGrids[subGridRow][subGridColumn].setCells(subGrid);
                }
        };
        Grid.prototype.save = function () {
            var size = Grid.columns * Grid.rows;
            var cells = [];
            for (var subGridRow = 0; subGridRow < Grid.rows; subGridRow++)
                for (var subGridColumn = 0; subGridColumn < Grid.columns; subGridColumn++) {
                    var subMatrix = this.subGrids[subGridRow][subGridColumn].getCellsMatrix();
                    for (var cellRow = 0; cellRow < Grid.columns; cellRow++)
                        for (var cellColumn = 0; cellColumn < Grid.rows; cellColumn++)
                            cells[subGridRow * size * Grid.columns + subGridColumn * Grid.rows + cellRow * size + cellColumn] = subMatrix[cellRow][cellColumn];
                }
            return cells;
        };
        Grid.prototype.eliminate = function (unsetOptionsDepth, recursionLevel) {
            var cells = this.save(); // Save current state
            var saveTotalSet = this.totalSet;
            var valid = true;
            var totalUnsetOptions = 1;
            while (valid && ++totalUnsetOptions < unsetOptionsDepth) {
                var row = Grid.rows;
                while (valid && row-- > 0) {
                    var column = Grid.columns;
                    while (valid && column-- > 0) {
                        var unsetCells = this.unsetCells(column, row, totalUnsetOptions); // May reduce column and row indices
                        column = unsetCells.column;
                        row = unsetCells.row;
                        var index = unsetCells.cells.length;
                        while (valid && index--) {
                            var cell = unsetCells.cells[index];
                            var options = cell.options;
                            var cellColumn = cell.getColumn();
                            var cellRow = cell.getRow();
                            var tryOption = options & ~(options - 1); // lowest set bit value
                            while (tryOption && valid) {
                                this.setByOption(column, row, cellColumn, cellRow, tryOption, 2 /* calculated */);
                                this.solve(unsetOptionsDepth, recursionLevel - 1);
                                valid = this.isValid();
                                this.load(cells); // Reset
                                this.totalSet = saveTotalSet;
                                if (valid) {
                                    options -= tryOption; // remove tried option
                                    tryOption = options & ~(options - 1);
                                }
                                else
                                    this.removeOption(column, row, cellColumn, cellRow, tryOption); // Remove tryOption i.e. resulted in an invalid state
                            }
                        }
                    }
                }
            }
            return !valid; // Option removed?
        };
        Grid.prototype.unsetCells = function (column, row, totalUnsetOptions) {
            var cells = [];
            var set = false;
            while (!set && row >= 0) {
                while (!set && column >= 0) {
                    cells = this.subGrids[row][column].unsetCells(totalUnsetOptions);
                    if (!(set = cells.length > 0))
                        column--;
                }
                if (!set && row--)
                    column = Grid.columns - 1;
            }
            return { column: column, row: row, cells: cells };
        };
        Grid.prototype.strikeOut = function (subGridColumn, subGridRow, cellColumn, cellRow, option) {
            var struckOutCells = this.subGrids[subGridRow][subGridColumn].strikeOutCell(cellColumn, cellRow, option);
            var removeOption;
            var index = struckOutCells.removedOptionsFromColumn.length; // Distinct
            while (index--) {
                removeOption = struckOutCells.removedOptionsFromColumn[index];
                this.join(struckOutCells.lastOptionsFound, this.removeOptionFromOtherColumns(removeOption.subGridColumn, removeOption.subGridRow, removeOption.cellColumn, removeOption.bits));
            }
            index = struckOutCells.removedOptionsFromRow.length;
            while (index--) {
                removeOption = struckOutCells.removedOptionsFromRow[index];
                this.join(struckOutCells.lastOptionsFound, this.removeOptionFromOtherRows(removeOption.subGridColumn, removeOption.subGridRow, removeOption.cellRow, removeOption.bits));
            }
            this.join(struckOutCells.lastOptionsFound, this.removeOptionsFromColumn(subGridColumn, subGridRow, cellColumn, option));
            this.join(struckOutCells.lastOptionsFound, this.removeOptionsFromRow(subGridColumn, subGridRow, cellRow, option));
            var lastOption;
            index = struckOutCells.lastOptionsFound.length;
            while (index--) {
                lastOption = struckOutCells.lastOptionsFound[index];
                this.strikeOut(lastOption.subGridColumn, lastOption.subGridRow, lastOption.cellColumn, lastOption.cellRow, lastOption.bits);
            }
            this.totalSet += struckOutCells.lastOptionsFound.length;
        };
        Grid.prototype.isStruckOut = function (subGridColumn, subGridRow, cellColumn, cellRow, symbol) {
            return this.subGrids[subGridRow][subGridColumn].isStruckOut(cellColumn, cellRow, symbol);
            ;
        };
        Grid.prototype.fixByPosition = function (subGridColumn, subGridRow, cellColumn, cellRow, optionColumn, optionRow) {
            if (this.subGrids[subGridRow][subGridColumn].setByPosition(cellColumn, cellRow, optionColumn, optionRow, 0 /* loaded */))
                this.totalSet++;
            this.strikeOut(subGridColumn, subGridRow, cellColumn, cellRow, 1 << Grid.columns * optionRow + optionColumn);
        };
        Grid.prototype.setByOption = function (subGridColumn, subGridRow, cellColumn, cellRow, option, setMethod) {
            if (this.subGrids[subGridRow][subGridColumn].setByOption(cellColumn, cellRow, option, setMethod))
                this.totalSet++;
            this.strikeOut(subGridColumn, subGridRow, cellColumn, cellRow, option);
        };
        Grid.prototype.setBySymbol = function (subGridColumn, subGridRow, cellColumn, cellRow, symbol, setMethod) {
            var option;
            if (option = this.subGrids[subGridRow][subGridColumn].setBySymbol(cellColumn, cellRow, symbol, setMethod))
                this.totalSet++;
            this.strikeOut(subGridColumn, subGridRow, cellColumn, cellRow, option);
        };
        Grid.prototype.fixByOptions = function (fixedOptions) {
            var option;
            for (var subGridRow = 0; subGridRow < Grid.rows; subGridRow++)
                for (var subGridColumn = 0; subGridColumn < Grid.columns; subGridColumn++)
                    for (var cellRow = 0; cellRow < Grid.columns; cellRow++)
                        for (var cellColumn = 0; cellColumn < Grid.rows; cellColumn++)
                            if (option = fixedOptions[(subGridRow * Grid.columns + cellRow) * Grid.columns * Grid.rows + subGridColumn * Grid.rows + cellColumn]) {
                                this.totalSet++;
                                this.subGrids[subGridRow][subGridColumn].get(cellColumn, cellRow).setByOption(option, 0 /* loaded */);
                                this.strikeOut(subGridColumn, subGridRow, cellColumn, cellRow, option);
                            }
        };
        Grid.prototype.fixByCsv = function (options) {
            var option;
            for (var subGridRow = 0; subGridRow < Grid.rows; subGridRow++)
                for (var subGridColumn = 0; subGridColumn < Grid.columns; subGridColumn++)
                    for (var cellRow = 0; cellRow < Grid.columns; cellRow++)
                        for (var cellColumn = 0; cellColumn < Grid.rows; cellColumn++) {
                            //                int.TryParse(options.Substring((subGridRow * columns + cellRow) * columns * rows + subGridColumn * rows + cellColumn, 1), out option);
                            if (option) {
                                this.totalSet++;
                                option = 1 << (option - 1);
                                this.subGrids[subGridRow][subGridColumn].get(cellColumn, cellRow).setByOption(option, 0 /* loaded */);
                                this.strikeOut(subGridColumn, subGridRow, cellColumn, cellRow, option);
                            }
                        }
        };
        Grid.prototype.unfix = function (subGridColumn, subGridRow, cellColumn, cellRow) {
            this.subGrids[subGridRow][subGridColumn].get(cellColumn, cellRow).reset();
            var fixedCells;
            var cells = this.getCellsArray();
            for (var index = 0; index < cells.length; index--)
                fixedCells.push(cells[index].setMethod === 0 /* loaded */ || cells[index].setMethod === 1 /* user */ ? cells[index].options : 0);
            this.reset();
            this.fixByOptions(fixedCells);
            this.solve();
        };
        Grid.prototype.getCellsArray = function () {
            var array = [];
            var subGridRow = Grid.rows;
            while (subGridRow--) {
                var subGridColumn = Grid.columns;
                while (subGridColumn--) {
                    var subMatrix = this.subGrids[subGridRow][subGridColumn].getCellsMatrix();
                    var cellColumn = Grid.rows;
                    while (cellColumn--) {
                        var cellRow = Grid.columns;
                        while (cellRow--)
                            array[(subGridRow * Grid.columns + cellRow) * Grid.columns * Grid.rows + subGridColumn * Grid.rows + cellColumn] = subMatrix[cellRow][cellColumn];
                    }
                }
            }
            return array;
        };
        // Remove option from the other sub grid's columns / rows when the option must belong in a specific sub grid's column / row
        Grid.prototype.removeUnavailableOptionsAtPosition = function (subGridColumn, subGridRow, cellColumn, cellRow, optionColumn, optionRow) {
            return this.removeUnavailableOptions(subGridColumn, subGridRow, cellColumn, cellRow, 1 << Grid.columns * optionRow + optionColumn);
        };
        Grid.prototype.removeUnavailableOptions = function (subGridColumn, subGridRow, cellColumn, cellRow, option) {
            var lastOptions = [];
            // Check sub grid's column and if found remove option from other columns
            if (this.subGrids[subGridRow][subGridColumn].optionRemovedFromColumn(cellColumn, cellRow, option))
                lastOptions = this.removeOptionFromOtherColumns(subGridColumn, subGridRow, cellColumn, option);
            // Check sub grid's row and if found remove option from other rows
            if (this.subGrids[subGridRow][subGridColumn].optionRemovedFromRow(cellColumn, cellRow, option))
                lastOptions = this.removeOptionFromOtherRows(subGridColumn, subGridRow, cellRow, option);
            var lastOption;
            var index = lastOptions.length;
            while (index--) {
                lastOption = lastOptions[index];
                this.strikeOut(lastOption.subGridColumn, lastOption.subGridRow, lastOption.cellColumn, lastOption.cellRow, lastOption.bits);
            }
            return lastOptions !== null;
        };
        // Check for mulitipe options limited to a certain number of related cells i.e. 2 cells in a row can only contain 1 or 2 => remove from other cells in row
        Grid.prototype.checkLimitedOptions = function () {
            var limitedOptions = this.findOptionsLimitedToMatrix(this.getTransposedCellsMatrix()); // Columns
            var limitedOptionFound = this.removeIfExtraOptionsFromColumn(limitedOptions); // Remove options iff the cell contains other options
            if (!limitedOptionFound) {
                limitedOptions = this.findOptionsLimitedToMatrix(this.getCellsMatrix()); // Rows
                limitedOptionFound = this.removeIfExtraOptionsFromRow(limitedOptions);
            }
            if (!limitedOptionFound) {
                limitedOptions = this.findOptionsLimitedToSubGrids();
                limitedOptionFound = this.removeIfExtraOptionsFromSubGrid(limitedOptions);
            }
            return limitedOptionFound;
        };
        Grid.prototype.findOptionsLimitedToMatrix = function (cells) {
            var limitedOptions = [];
            var unsetCells = [];
            var pickOptions = [];
            var combinationOptions = [];
            for (var cellIndex = 0; cellIndex < Grid.columns * Grid.rows; cellIndex++) {
                while (unsetCells.length)
                    unsetCells.pop();
                // IEnumerable<Cell> unsetCells = cells[index].Where(x => !x.IsSet);                // Get cells that are still to be set
                var checkCells = cells[cellIndex];
                var index = checkCells.length;
                while (index--) {
                    if (!checkCells[index].setMethod)
                        unsetCells.push(checkCells[index]);
                }
                var totalUnsetCells = unsetCells.length;
                // Find max remaining options, less than totalUnsetCells
                // int maxRemainingOptions = unsetCells.Where(x => x.TotalOptionsRemaining < totalUnsetCells).Max(x => (int?) x.TotalOptionsRemaining) ?? 0;    // Max < totalUnsetCells
                var maxRemainingOptions = 0;
                index = totalUnsetCells;
                while (index--) {
                    var totalOptionsRemaining = unsetCells[index].totalOptionsRemaining;
                    if (totalOptionsRemaining < totalUnsetCells && totalOptionsRemaining > maxRemainingOptions)
                        maxRemainingOptions = totalOptionsRemaining;
                }
                var found = false;
                var pick = 1;
                while (!found && pick++ < maxRemainingOptions) {
                    while (combinationOptions.length)
                        combinationOptions.pop();
                    while (pickOptions.length)
                        pickOptions.pop();
                    // Get options with at least the number of bits to pick set
                    // IEnumerable <Cell> options = unsetCells.Where(x => x.TotalOptionsRemaining <= pick); // Get options with at least the number of bits to pick set
                    index = totalUnsetCells;
                    while (index--)
                        if (unsetCells[index].totalOptionsRemaining <= pick)
                            pickOptions.push(unsetCells[index]);
                    var combinations = Grid.combinations.select(pickOptions, pick);
                    index = combinations.length;
                    while (!found && index--) {
                        // int removeOptions = BitUtilities.BitwiseOR(enumerator.Current.Select(x => x.Options));
                        var combinationsIndex = combinations[index].length;
                        while (combinationsIndex--)
                            combinationOptions.push(combinations[index][combinationsIndex].options);
                        var removeOptions = Solver.BitUtilities.bitwiseOR(combinationOptions);
                        if (found = Solver.BitUtilities.numberOfBitsSet(removeOptions) <= pick)
                            limitedOptions.push({ column: cellIndex, row: cellIndex, options: removeOptions });
                    }
                }
            }
            return limitedOptions;
        };
        Grid.prototype.findOptionsLimitedToSubGrids = function () {
            var limitedOptions = [];
            var pickOptions = [];
            var combinationOptions = [];
            for (var row = 0; row < Grid.rows; row++)
                for (var column = 0; column < Grid.columns; column++) {
                    var unsetCells = this.subGrids[row][column].getUnsetCells();
                    var totalUnsetCells = unsetCells.length;
                    // int maxRemainingOptions = unsetCells.Where(x => x.TotalOptionsRemaining < totalUnsetCells).Max(x => (int?) x.TotalOptionsRemaining) ?? 0;    // Max < totalUnsetCells
                    var maxRemainingOptions = 0;
                    var index = totalUnsetCells;
                    while (index--) {
                        var totalOptionsRemaining = unsetCells[index].totalOptionsRemaining;
                        if (totalOptionsRemaining < totalUnsetCells && totalOptionsRemaining > maxRemainingOptions)
                            maxRemainingOptions = totalOptionsRemaining;
                    }
                    var found = false;
                    var pick = 1;
                    while (!found && pick++ < maxRemainingOptions) {
                        while (combinationOptions.length)
                            combinationOptions.pop();
                        while (pickOptions.length)
                            pickOptions.pop();
                        // Get options with at least the number of bits to pick set
                        // IEnumerable <Cell> options = unsetCells.Where(x => x.TotalOptionsRemaining <= pick); // Get options with at least the number of bits to pick set
                        index = totalUnsetCells;
                        while (index--)
                            if (unsetCells[index].totalOptionsRemaining <= pick)
                                pickOptions.push(unsetCells[index]);
                        var combinations = Grid.combinations.select(pickOptions, pick);
                        index = combinations.length;
                        while (!found && index--) {
                            // int removeOptions = BitUtilities.BitwiseOR(enumerator.Current.Select(x => x.Options));
                            var combinationsIndex = combinations[index].length;
                            while (combinationsIndex--)
                                combinationOptions.push(combinations[index][combinationsIndex].options);
                            var removeOptions = Solver.BitUtilities.bitwiseOR(combinationOptions);
                            if (found = Solver.BitUtilities.numberOfBitsSet(removeOptions) <= pick)
                                limitedOptions.push({ column: column, row: row, options: removeOptions });
                        }
                    }
                }
            return limitedOptions;
        };
        Grid.prototype.removeIfExtraOptionsFromColumn = function (limitedOptions) {
            var lastOptions = [];
            var limitedOption;
            var index = limitedOptions.length;
            while (index--) {
                limitedOption = limitedOptions[index];
                for (var row = 0; row < Grid.rows; row++)
                    this.join(lastOptions, this.subGrids[row][limitedOption.column / Grid.rows >> 0].removeIfExtraOptionsFromColumn(limitedOption.column % Grid.rows, limitedOption.options));
            }
            var lastOption;
            index = lastOptions.length;
            while (index--) {
                lastOption = lastOptions[index];
                this.strikeOut(lastOption.subGridColumn, lastOption.subGridRow, lastOption.cellColumn, lastOption.cellRow, lastOption.bits);
            }
            this.totalSet += lastOptions.length;
            return lastOptions.length > 0;
        };
        Grid.prototype.removeIfExtraOptionsFromRow = function (limitedOptions) {
            var lastOptions = [];
            var limitedOption;
            var index = limitedOptions.length;
            while (index--) {
                limitedOption = limitedOptions[index];
                for (var column = 0; column < Grid.columns; column++)
                    this.join(lastOptions, this.subGrids[limitedOption.row / Grid.columns >> 0][column].removeIfExtraOptionsFromRow(limitedOption.row % Grid.columns, limitedOption.options));
            }
            var lastOption;
            index = lastOptions.length;
            while (index--) {
                lastOption = lastOptions[index];
                this.strikeOut(lastOption.subGridColumn, lastOption.subGridRow, lastOption.cellColumn, lastOption.cellRow, lastOption.bits);
            }
            this.totalSet += lastOptions.length;
            return lastOptions.length > 0;
        };
        Grid.prototype.removeIfExtraOptionsFromSubGrid = function (limitedOptions) {
            var lastOptions = [];
            var limitedOption;
            var index = limitedOptions.length;
            while (index--) {
                limitedOption = limitedOptions[index];
                this.join(lastOptions, this.subGrids[limitedOption.row][limitedOption.column].removeIfExtraOptions(limitedOption.options));
            }
            var lastOption;
            index = lastOptions.length;
            while (index--) {
                lastOption = lastOptions[index];
                this.strikeOut(lastOption.subGridColumn, lastOption.subGridRow, lastOption.cellColumn, lastOption.cellRow, lastOption.bits);
            }
            this.totalSet += lastOptions.length;
            return lastOptions.length > 0;
        };
        Grid.prototype.removeOptionsFromColumn = function (subGridColumn, subGridRow, cellColumn, options) {
            var lastOptions = [];
            // Ignore subGridRow
            var row = Grid.rows;
            while (--row > subGridRow)
                this.join(lastOptions, this.subGrids[row][subGridColumn].removeOptionsFromColumn(cellColumn, options));
            while (row--)
                this.join(lastOptions, this.subGrids[row][subGridColumn].removeOptionsFromColumn(cellColumn, options));
            return lastOptions;
        };
        Grid.prototype.removeOptionsFromRow = function (subGridColumn, subGridRow, cellRow, options) {
            var lastOptions = [];
            // Ignore subGridColumn
            var column = Grid.columns;
            while (--column > subGridColumn)
                this.join(lastOptions, this.subGrids[subGridRow][column].removeOptionsFromRow(cellRow, options));
            while (column--)
                this.join(lastOptions, this.subGrids[subGridRow][column].removeOptionsFromRow(cellRow, options));
            return lastOptions;
        };
        Grid.prototype.removeOnlyOptions = function () {
            return this.removeOnlyColumnOptions() || this.removeOnlyRowOptions() || this.removeOnlySubGridOptions();
        };
        Grid.prototype.removeOnlyColumnOptions = function () {
            var onlyOptionFound = false;
            var matrix = this.getTransposedAvailableOptionsMatrix();
            // Check for only options in each column
            var column = Grid.rows * Grid.columns;
            while (!onlyOptionFound && column--) {
                var onlyOption = Solver.BitUtilities.onlyOption(matrix[column]);
                if (onlyOption.found) {
                    onlyOptionFound = true;
                    var matrixRow = Solver.BitUtilities.containingBitIndex(matrix[column], onlyOption.bit); // Row within grid where only option found                     
                    this.setByOption(column / Grid.rows >> 0, matrixRow / Grid.columns >> 0, column % Grid.rows, matrixRow % Grid.columns, onlyOption.bit, 2 /* calculated */);
                }
            }
            return onlyOptionFound;
        };
        Grid.prototype.removeOnlyRowOptions = function () {
            var onlyOptionFound = false;
            var matrix = this.getAvailableOptionsMatrix();
            // Check for only options in each row
            var row = Grid.rows * Grid.columns;
            while (!onlyOptionFound && row--) {
                var onlyOption = Solver.BitUtilities.onlyOption(matrix[row]);
                if (onlyOption.found) {
                    onlyOptionFound = true;
                    var matrixColumn = Solver.BitUtilities.containingBitIndex(matrix[row], onlyOption.bit); // Column within grid where only option found                     
                    this.setByOption(matrixColumn / Grid.rows >> 0, row / Grid.columns >> 0, matrixColumn % Grid.rows, row % Grid.columns, onlyOption.bit, 2 /* calculated */);
                }
            }
            return onlyOptionFound;
        };
        Grid.prototype.removeOnlySubGridOptions = function () {
            var onlyOptionFound = false;
            // Check for only options in each sub grid
            var row = Grid.rows;
            while (!onlyOptionFound && row--) {
                var column = Grid.columns;
                while (!onlyOptionFound && column--) {
                    var values = this.subGrids[row][column].getAvailableOptions();
                    var onlyOption = Solver.BitUtilities.onlyOption(values);
                    if (onlyOption.found) {
                        onlyOptionFound = true;
                        var arrayIndex = Solver.BitUtilities.containingBitIndex(values, onlyOption.bit); // Index within array where only option found                     
                        this.setByOption(column, row, arrayIndex % Grid.rows, arrayIndex / Grid.rows >> 0, onlyOption.bit, 2 /* calculated */);
                    }
                }
            }
            return onlyOptionFound;
        };
        // Check options removed from other columns (n - 1) columns must have the options removed i.e. option must exist in only 1 columns
        Grid.prototype.removeOptionFromOtherColumns = function (subGridColumn, subGridRow, cellColumn, option) {
            var lastOptions = [];
            var totalExistingColumns = 0;
            var totalExistingRows = 0;
            var existingColumn = -1;
            var column = Grid.rows; // Use SubGrid's number of columns i.e. swopped rows
            while (totalExistingColumns < 2 && --column > cellColumn)
                if (this.subGrids[subGridRow][subGridColumn].optionExistsInColumn(column, option)) {
                    existingColumn = column;
                    totalExistingColumns++;
                }
            while (totalExistingColumns < 2 && column-- > 0)
                if (this.subGrids[subGridRow][subGridColumn].optionExistsInColumn(column, option)) {
                    existingColumn = column;
                    totalExistingColumns++;
                }
            if (totalExistingColumns === 1)
                lastOptions = this.removeOptionsFromColumn(subGridColumn, subGridRow, existingColumn, option);
            else {
                // Check other sub grids in same column
                var existingRow = -1;
                var row = Grid.rows;
                while (totalExistingRows < 2 && --row > subGridRow)
                    if (this.subGrids[row][subGridColumn].optionExistsInColumn(cellColumn, option)) {
                        existingRow = row;
                        totalExistingRows++;
                    }
                while (totalExistingRows < 2 && row-- > 0)
                    if (this.subGrids[row][subGridColumn].optionExistsInColumn(cellColumn, option)) {
                        existingRow = row;
                        totalExistingRows++;
                    }
                if (totalExistingRows === 1)
                    lastOptions = this.subGrids[existingRow][subGridColumn].removeOptionsExceptFromColumn(cellColumn, option);
            }
            return lastOptions;
        };
        // Check options removed from other rows (n - 1) rows must have the options removed i.e. option must exist in only 1 row
        Grid.prototype.removeOptionFromOtherRows = function (subGridColumn, subGridRow, cellRow, option) {
            var lastOptions = [];
            var totalExistingColumns = 0;
            var totalExistingRows = 0;
            var existingRow = -1;
            var row = Grid.columns; // Use SubGrid's number of rows i.e. swopped columns
            while (totalExistingRows < 2 && --row > cellRow)
                if (this.subGrids[subGridRow][subGridColumn].optionExistsInRow(row, option)) {
                    existingRow = row;
                    totalExistingRows++;
                }
            while (totalExistingRows < 2 && row-- > 0)
                if (this.subGrids[subGridRow][subGridColumn].optionExistsInRow(row, option)) {
                    existingRow = row;
                    totalExistingRows++;
                }
            if (totalExistingRows === 1)
                lastOptions = this.removeOptionsFromRow(subGridColumn, subGridRow, existingRow, option);
            else {
                // Check other sub grids in same row
                var existingColumn = -1;
                var column = Grid.columns;
                while (totalExistingColumns < 2 && --column > subGridColumn)
                    if (this.subGrids[subGridRow][column].optionExistsInRow(cellRow, option)) {
                        existingColumn = column;
                        totalExistingColumns++;
                    }
                while (totalExistingColumns < 2 && column-- > 0)
                    if (this.subGrids[subGridRow][column].optionExistsInRow(cellRow, option)) {
                        existingColumn = column;
                        totalExistingColumns++;
                    }
                if (totalExistingColumns == 1)
                    lastOptions = this.subGrids[subGridRow][existingColumn].removeOptionsExceptFromRow(cellRow, option);
            }
            return lastOptions;
        };
        ////////////////////////////////////////////////////////////////////////////////////////////
        // Convert sub grids to coluns * rows matrix
        ////////////////////////////////////////////////////////////////////////////////////////////
        Grid.prototype.getAvailableOptionsMatrix = function () {
            var subGridRow = Grid.rows;
            var matrixRow = subGridRow * Grid.columns; // Use SubGrid's number of rows i.e. swopped columns
            var matrix = [];
            var subGridColumns = Grid.columns;
            var matrixColumns = subGridColumns * Grid.rows; // Use SubGrid's number of columns i.e. swopped rows
            while (matrixRow--)
                matrix[matrixRow] = [];
            while (subGridRow--) {
                var subGridColumn = subGridColumns;
                while (subGridColumn--) {
                    var subMatrix = this.subGrids[subGridRow][subGridColumn].getAvailableOptionsMatrix();
                    var cellColumn = Grid.rows;
                    while (cellColumn--) {
                        var cellRow = Grid.columns;
                        while (cellRow--)
                            matrix[subGridRow * Grid.columns + cellRow][subGridColumn * Grid.rows + cellColumn] = subMatrix[cellRow][cellColumn];
                    }
                }
            }
            return matrix;
        };
        Grid.prototype.getTransposedAvailableOptionsMatrix = function () {
            var subGridColumn = Grid.columns;
            var matrixColumn = subGridColumn * Grid.rows; // Use SubGrid's number of rows i.e. swopped columns
            var matrix = [];
            var subGridRows = Grid.rows;
            var matrixRows = subGridRows * Grid.columns;
            while (matrixColumn--)
                matrix[matrixColumn] = [];
            while (subGridColumn--) {
                var subGridRow = subGridRows;
                while (subGridRow--) {
                    var subMatrix = this.subGrids[subGridRow][subGridColumn].getAvailableOptionsMatrix();
                    var cellRow = Grid.columns;
                    while (cellRow--) {
                        var cellColumn = Grid.rows;
                        while (cellColumn--)
                            matrix[subGridColumn * Grid.rows + cellColumn][subGridRow * Grid.columns + cellRow] = subMatrix[cellRow][cellColumn];
                    }
                }
            }
            return matrix;
        };
        Grid.prototype.getCellsMatrix = function () {
            var subGridRow = Grid.rows;
            var matrixRow = subGridRow * Grid.columns; // Use SubGrid's number of rows i.e. swopped columns
            var matrix = [];
            var subGridColumns = Grid.columns;
            var matrixColumns = subGridColumns * Grid.rows; // Use SubGrid's number of columns i.e. swopped rows
            while (matrixRow--)
                matrix[matrixRow] = [];
            while (subGridRow--) {
                var subGridColumn = subGridColumns;
                while (subGridColumn--) {
                    var subMatrix = this.subGrids[subGridRow][subGridColumn].getCellsMatrix();
                    var cellColumn = Grid.rows;
                    while (cellColumn--) {
                        var cellRow = Grid.columns;
                        while (cellRow--)
                            matrix[subGridRow * Grid.columns + cellRow][subGridColumn * Grid.rows + cellColumn] = subMatrix[cellRow][cellColumn];
                    }
                }
            }
            return matrix;
        };
        Grid.prototype.getTransposedCellsMatrix = function () {
            var subGridColumn = Grid.columns;
            var matrixColumn = subGridColumn * Grid.rows; // Use SubGrid's number of rows i.e. swopped columns
            var matrix = [];
            var subGridRows = Grid.rows;
            var matrixRows = subGridRows * Grid.columns;
            while (matrixColumn--)
                matrix[matrixColumn] = [];
            while (subGridColumn--) {
                var subGridRow = subGridRows;
                while (subGridRow--) {
                    var subMatrix = this.subGrids[subGridRow][subGridColumn].getCellsMatrix();
                    var cellRow = Grid.columns;
                    while (cellRow--) {
                        var cellColumn = Grid.rows;
                        while (cellColumn--)
                            matrix[subGridColumn * Grid.rows + cellColumn][subGridRow * Grid.columns + cellRow] = subMatrix[cellRow][cellColumn];
                    }
                }
            }
            return matrix;
        };
        Grid.prototype.join = function (a, b) {
            Array.prototype.splice.apply(a, [0, 0].concat(b)); // Add first 2 arguments sent to splice i.e. start index and number of values to delete  
        };
        return Grid;
    })();
    Solver.Grid = Grid;
})(Solver || (Solver = {}));
//# sourceMappingURL=Grid.js.map