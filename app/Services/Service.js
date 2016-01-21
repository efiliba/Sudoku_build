// <reference path="../../../../DefinitelyTyped-master/angularjs/angular.d.ts" />
'use strict';
angular.module('sudoku.service', ['ngResource']).factory('Puzzle', function ($resource) {
    return $resource('app/Models/puzzle 2x3.js');
});
//# sourceMappingURL=Service.js.map