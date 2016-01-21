'use strict';
angular.module('sudoku.boardCellDirective', []).directive('cell', function ($templateCache, $compile) {
    return {
        restrict: 'EA',
        replace: true,
        scope: {
            grid: '=',
            column: '@',
            row: '@',
            displayStikeOut: '@'
        },
        templateUrl: 'cellTemplate.html',
        link: function (scope, element, attrs) {
            scope.viewModel = {};
            scope.viewModel.selectSymbol = function (symbol) {
                scope.viewModel.symbol = symbol;
                scope.viewModel.symbolSelected = function () {
                    //                        if (!scope.displayStikeOut)
                    alert('Symbol Selected _' + scope.displayStikeOut + '_');
                };

                var template = $templateCache.get('symbolTemplate.html');
                element.replaceWith($compile(template)(scope));

                scope.$emit('subGridSymbolSelected', scope.column, scope.row, symbol);
            };

            scope.viewModel.displayStikeOut = scope.displayStikeOut === "true";

            element.on('contextmenu', function (event) {
                try  {
                    scope.grid[event.target.parentNode.rowIndex].columns[event.target.cellIndex].strikeOut = true;
                } catch (e) {
                }

                event.preventDefault();
            });
        }
    };
});
//# sourceMappingURL=BoardCellDirective.js.map
