'use strict';
var Sudoku;
(function (Sudoku) {
    var SettingsDirective = (function () {
        function SettingsDirective() {
            var directive = {
                restrict: 'E',
                scope: {},
                templateUrl: 'settingsTemplate.html',
                controller: ['$scope', 'SettingsService', function ($scope, settings) {
                    $scope.settings = settings;
                    $scope.viewModel = this;
                    $scope.viewModel.columnValues = [1, 2, 3, 4];
                    $scope.viewModel.rowValues = [1, 2, 3];
                }]
            };
            return directive;
        }
        SettingsDirective.$inject = [];
        return SettingsDirective;
    })();
    Sudoku.SettingsDirective = SettingsDirective;
})(Sudoku || (Sudoku = {}));
//# sourceMappingURL=SettingsDirective.js.map