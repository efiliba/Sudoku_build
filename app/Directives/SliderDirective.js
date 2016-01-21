/// <reference path="../../../../DefinitelyTyped-master/angularjs/angular.d.ts" />
/// <reference path="../../../../DefinitelyTyped-master/greensock/greensock.d.ts" />
'use strict';
var Sudoku;
(function (Sudoku) {
    var SliderDirective = (function () {
        function SliderDirective($animate) {
            var directive = {
                restrict: 'EA',
                replace: false,
                transclude: true,
                templateUrl: 'sliderTemplate.html',
                controller: ['$scope', function ($scope) {
                    $scope.viewModel = this;
                    $scope.viewModel.sliderOpen = false;
                    $scope.viewModel.slide = function () {
                        $scope.viewModel.sliderOpen = !$scope.viewModel.sliderOpen;
                    };
                }],
                link: function (scope, element, attributes) {
                    scope.$on('closeSlider', function (event) {
                        $animate.removeClass(element, "sliderOpen");
                        scope.viewModel.sliderOpen = false;
                    });
                }
            };
            return directive;
        }
        SliderDirective.$inject = ['$animate'];
        return SliderDirective;
    })();
    Sudoku.SliderDirective = SliderDirective;
    var SliderOpenAnimation = (function () {
        function SliderOpenAnimation() {
            return {
                addClass: function (element) {
                    TweenMax.set(element.find('settings').eq(0), { css: { marginLeft: '0px', opacity: '1' } });
                    TweenMax.to(element, 1, {
                        right: '0px',
                        backgroundColor: 'gray',
                        onComplete: function () {
                            element.find('input').eq(0).val('»');
                        }
                    });
                },
                removeClass: function (element) {
                    TweenMax.set(element, { width: '194px' }); // Increase width to accommodate margin
                    var timeline = new TimelineMax({
                        tweens: [new TweenMax(element, 1, { right: '-177px', backgroundColor: 'transparent' }),]
                    });
                    timeline.insert(new TweenMax(element.find('settings').eq(0), 0.5, { opacity: '0' }), 0.5);
                    timeline.addCallback(function () {
                        element.find('input').eq(0).val('«');
                        TweenMax.set(element, { width: '177px', right: '-160px' });
                        TweenMax.set(element.find('settings').eq(0), { marginLeft: '17px' });
                    }, 1);
                }
            };
        }
        SliderOpenAnimation.$inject = [];
        return SliderOpenAnimation;
    })();
    Sudoku.SliderOpenAnimation = SliderOpenAnimation;
})(Sudoku || (Sudoku = {}));
//# sourceMappingURL=SliderDirective.js.map