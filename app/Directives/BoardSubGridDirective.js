/// <reference path="../Models/Cell.ts" />
'use strict';
angular.module('sudoku.boardSubGridDirective', []).directive('subGrid', function () {
    return {
        restrict: 'EA',
        replace: true,
        scope: {
            grid: '=',
            column: '@',
            row: '@',
            displayStikeOut: '@'
        },
        templateUrl: 'subGridTemplate.html',
        link: function (scope, element, attrs) {
            scope.$on('subGridSymbolSelected', function (event, column, row, symbol) {
                scope.$emit('symbolSelected', scope.column, scope.row, column, row, symbol);
            });

            element.on('contextmenu', function (event) {
                event.preventDefault();
            });

            scope.viewModel = {
                symbolSelected: function (fixed) {
                    alert('Symbol Selected fixed: ' + fixed);
                },
                setMethodClasses: ['loaded', 'user', 'calculated']
            };
        }
    };
});
//# sourceMappingURL=BoardSubGridDirective.js.map
