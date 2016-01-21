'use strict';
var Sudoku;
(function (Sudoku) {
    var CellDirective = (function () {
        function CellDirective($templateCache, $compile) {
            var directive = {
                restrict: 'EA',
                replace: true,
                scope: {
                    grid: '=',
                    column: '@',
                    row: '@',
                    displayStikeOut: '@'
                },
                templateUrl: 'cellTemplate.html',
                link: function (scope, element, attributes) {
                    scope.viewModel = {
                        selectSymbol: function (symbol) {
                            scope.viewModel.symbol = symbol; // Add scope value used in compiled template
                            scope.viewModel.symbolSelected = function () {
                                alert('Symbol Selected');
                            };
                            var template = $templateCache.get('symbolTemplate.html');
                            element.replaceWith($compile(template)(scope));
                            scope.$emit('subGridSymbolSelected', scope.column, scope.row, symbol); // Propagate event to parent
                        },
                        displayStikeOut: scope.displayStikeOut === 'true'
                    };
                    element.on('contextmenu', function (event) {
                        try {
                            scope.grid[event.target.parentNode.rowIndex].columns[event.target.cellIndex].strikeOut = true;
                        }
                        catch (e) {
                        }
                        event.preventDefault();
                    });
                }
            };
            return directive;
        }
        CellDirective.$inject = ['$templateCache', '$compile'];
        return CellDirective;
    })();
    Sudoku.CellDirective = CellDirective;
})(Sudoku || (Sudoku = {}));
//# sourceMappingURL=CellDirective.js.map