'use strict';
var Sudoku;
(function (Sudoku) {
    var SubGridDirective = (function () {
        function SubGridDirective() {
            var directive = {
                restrict: 'EA',
                replace: true,
                scope: {
                    grid: '=',
                    column: '@',
                    row: '@',
                    displayStikeOut: '@'
                },
                templateUrl: 'subGridTemplate.html',
                link: function (scope, element, attributes) {
                    scope.$on('subGridSymbolSelected', function (event, column, row, symbol) {
                        scope.$emit('symbolSelected', scope.column, scope.row, column, row, symbol); // Add the subGrids row and column and propagate to parent
                    });
                    element.on('contextmenu', function (event) {
                        alert('clicked');
                        event.preventDefault();
                    });
                    scope.viewModel = {
                        setMethodClasses: ['loaded', 'user', 'calculated'],
                        symbolSelected: function (fixed) {
                            alert('Symbol Selected fixed: ' + fixed);
                        }
                    };
                }
            };
            return directive;
        }
        SubGridDirective.$inject = [];
        return SubGridDirective;
    })();
    Sudoku.SubGridDirective = SubGridDirective;
})(Sudoku || (Sudoku = {}));
//# sourceMappingURL=SubGridDirective.js.map