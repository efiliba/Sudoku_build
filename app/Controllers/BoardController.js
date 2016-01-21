/// <reference path="../../../../DefinitelyTyped-master/angularjs/angular.d.ts" />
'use strict';
var Sudoku;
(function (Sudoku) {
    var BoardController = (function () {
        function BoardController($scope, settings) {
            this.$scope = $scope;
            this.settings = settings;
            $scope.settings = settings;
            $scope.viewModel = this;
            Solver.Grid.Constructor(settings.selectedColumns, settings.selectedRows);
            var grid = new Solver.Grid();
            //grid.setByOption(0, 0, 0, 0, 1, Solver.SetMethod.loaded);
            //grid.setByOption(0, 0, 1, 1, 2, Solver.SetMethod.loaded);
            //grid.setByOption(1, 1, 0, 0, 4, Solver.SetMethod.loaded);
            //grid.setByOption(1, 1, 1, 1, 8, Solver.SetMethod.loaded);
            //            grid.setByOption(1, 0, 1, 0, 2, Solver.SetMethod.loaded);
            //grid.setByOption(1, 0, 1, 0, 1, Solver.SetMethod.loaded);
            //grid.setByOption(1, 0, 0, 1, 2, Solver.SetMethod.loaded);
            //grid.setByOption(0, 1, 1, 0, 2, Solver.SetMethod.loaded);
            //grid.setByOption(0, 1, 0, 1, 4, Solver.SetMethod.loaded);
            //this.hard2x3(grid);
            //this.test3x2(grid);
            //this.diabolical3x3(grid);
            //this.unsolved3x3(grid);       // http://www.efamol.com/uploads/2012sudoku-solved.jpg
            //grid.solve(0, 2);
            $scope.viewModel.board = grid.toJson();
            $scope.$on('symbolSelected', function (event, subGridColumn, subGridRow, cellColumn, cellRow, symbol) {
                if (settings.autoSolve && !grid.isStruckOut(subGridColumn, subGridRow, cellColumn, cellRow, symbol)) {
                    grid.setBySymbol(subGridColumn, subGridRow, cellColumn, cellRow, symbol, 1 /* user */);
                    var solved = grid.solve(17, 1);
                    $scope.viewModel.board = grid.toJson();
                }
            });
            $scope.$on('resetSelected', function (event) {
                Solver.Grid.Constructor(settings.selectedColumns, settings.selectedRows);
                grid.reset();
                $scope.viewModel.board = grid.toJson();
                $scope.$apply();
            });
        }
        BoardController.prototype.test3x2 = function (grid) {
            grid.setByOption(0, 0, 0, 0, 1, 0 /* loaded */);
            grid.setByOption(0, 0, 1, 1, 2, 0 /* loaded */);
            grid.setByOption(1, 0, 0, 2, 4, 0 /* loaded */);
            grid.setByOption(1, 1, 1, 0, 8, 0 /* loaded */);
            grid.setByOption(2, 1, 0, 1, 16, 0 /* loaded */);
            grid.setByOption(2, 1, 1, 2, 32, 0 /* loaded */);
            grid.setByOption(2, 0, 1, 0, 2, 0 /* loaded */);
            grid.setByOption(2, 0, 0, 1, 4, 0 /* loaded */);
        };
        BoardController.prototype.hard2x3 = function (grid) {
            grid.setByOption(0, 0, 0, 1, 1, 0 /* loaded */);
            grid.setByOption(0, 0, 2, 0, 32, 0 /* loaded */);
            grid.setByOption(0, 1, 0, 0, 4, 0 /* loaded */);
            grid.setByOption(0, 1, 0, 1, 16, 0 /* loaded */);
            grid.setByOption(0, 2, 1, 0, 16, 0 /* loaded */);
            grid.setByOption(0, 2, 1, 1, 8, 0 /* loaded */);
            grid.setByOption(1, 0, 1, 0, 4, 0 /* loaded */);
            grid.setByOption(1, 0, 1, 1, 2, 0 /* loaded */);
            grid.setByOption(1, 1, 2, 0, 32, 0 /* loaded */);
            grid.setByOption(1, 1, 2, 1, 2, 0 /* loaded */);
            grid.setByOption(1, 2, 0, 1, 2, 0 /* loaded */);
            grid.setByOption(1, 2, 2, 0, 4, 0 /* loaded */);
        };
        BoardController.prototype.diabolical3x3 = function (grid) {
            grid.setByOption(0, 0, 1, 1, 2, 0 /* loaded */);
            grid.setByOption(1, 0, 0, 0, 64, 0 /* loaded */);
            grid.setByOption(1, 0, 2, 0, 8, 0 /* loaded */);
            grid.setByOption(1, 0, 1, 1, 1, 0 /* loaded */);
            grid.setByOption(1, 0, 1, 2, 128, 0 /* loaded */);
            grid.setByOption(2, 0, 2, 0, 16, 0 /* loaded */);
            grid.setByOption(2, 0, 1, 1, 64, 0 /* loaded */);
            grid.setByOption(2, 0, 2, 2, 2, 0 /* loaded */);
            grid.setByOption(0, 1, 1, 0, 256, 0 /* loaded */);
            grid.setByOption(0, 1, 0, 1, 32, 0 /* loaded */);
            grid.setByOption(0, 1, 1, 2, 16, 0 /* loaded */);
            grid.setByOption(0, 1, 2, 2, 4, 0 /* loaded */);
            grid.setByOption(1, 1, 2, 0, 32, 0 /* loaded */);
            grid.setByOption(1, 1, 1, 1, 64, 0 /* loaded */);
            grid.setByOption(1, 1, 0, 2, 2, 0 /* loaded */);
            grid.setByOption(2, 1, 0, 0, 2, 0 /* loaded */);
            grid.setByOption(2, 1, 1, 0, 16, 0 /* loaded */);
            grid.setByOption(2, 1, 2, 1, 128, 0 /* loaded */);
            grid.setByOption(2, 1, 1, 2, 1, 0 /* loaded */);
            grid.setByOption(0, 2, 0, 0, 8, 0 /* loaded */);
            grid.setByOption(0, 2, 1, 1, 4, 0 /* loaded */);
            grid.setByOption(0, 2, 0, 2, 2, 0 /* loaded */);
            grid.setByOption(1, 2, 1, 0, 256, 0 /* loaded */);
            grid.setByOption(1, 2, 1, 1, 32, 0 /* loaded */);
            grid.setByOption(1, 2, 0, 2, 8, 0 /* loaded */);
            grid.setByOption(1, 2, 2, 2, 64, 0 /* loaded */);
            grid.setByOption(2, 2, 1, 1, 256, 0 /* loaded */);
        };
        BoardController.prototype.unsolved3x3 = function (grid) {
            grid.setByOption(0, 0, 0, 0, 128, 0 /* loaded */);
            grid.setByOption(0, 0, 2, 1, 4, 0 /* loaded */);
            grid.setByOption(0, 0, 1, 2, 64, 0 /* loaded */);
            grid.setByOption(1, 0, 0, 1, 32, 0 /* loaded */);
            grid.setByOption(1, 0, 1, 2, 256, 0 /* loaded */);
            grid.setByOption(2, 0, 0, 2, 2, 0 /* loaded */);
            grid.setByOption(0, 1, 1, 0, 16, 0 /* loaded */);
            grid.setByOption(1, 1, 2, 0, 64, 0 /* loaded */);
            grid.setByOption(1, 1, 1, 1, 8, 0 /* loaded */);
            grid.setByOption(1, 1, 2, 1, 16, 0 /* loaded */);
            grid.setByOption(1, 1, 0, 2, 1, 0 /* loaded */);
            grid.setByOption(2, 1, 0, 1, 64, 0 /* loaded */);
            grid.setByOption(2, 1, 1, 2, 4, 0 /* loaded */);
            grid.setByOption(0, 2, 2, 0, 1, 0 /* loaded */);
            grid.setByOption(0, 2, 2, 1, 128, 0 /* loaded */);
            grid.setByOption(0, 2, 1, 2, 256, 0 /* loaded */);
            grid.setByOption(1, 2, 0, 1, 16, 0 /* loaded */);
            grid.setByOption(2, 2, 1, 0, 32, 0 /* loaded */);
            grid.setByOption(2, 2, 2, 0, 128, 0 /* loaded */);
            grid.setByOption(2, 2, 1, 1, 1, 0 /* loaded */);
            grid.setByOption(2, 2, 0, 2, 8, 0 /* loaded */);
        };
        BoardController.$inject = ['$scope', 'SettingsService'];
        return BoardController;
    })();
    Sudoku.BoardController = BoardController;
})(Sudoku || (Sudoku = {}));
//# sourceMappingURL=BoardController.js.map