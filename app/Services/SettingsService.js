'use strict';
var Sudoku;
(function (Sudoku) {
    var SettingsService = (function () {
        function SettingsService($rootScope) {
            var settings = {
                selectedColumns: 3,
                selectedRows: 3,
                autoSolve: true,
                displayStikeOut: true,
                reset: function () {
                    $rootScope.$broadcast('resetSelected');
                    $rootScope.$broadcast('closeSlider');
                }
            };
            return settings;
        }
        SettingsService.$inject = ['$rootScope'];
        return SettingsService;
    })();
    Sudoku.SettingsService = SettingsService;
})(Sudoku || (Sudoku = {}));
//# sourceMappingURL=SettingsService.js.map