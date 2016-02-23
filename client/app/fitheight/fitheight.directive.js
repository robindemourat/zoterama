'use strict';

angular.module('zoteramaApp')
  .directive('fitHeight', function ($window, $timeout, $document) {
    return {
      restrict: 'AC',
      scope : {
        parentSelector : "@fitHeight",
        marginBottom : "@"
      },
      link: function postLink(scope, element, attrs) {
        var elementTop,
            elementHeight,
            next,
            nextTop,
            parent,
            parentHeight,
            resizeCount;

        var resize = function(){
          if(scope.parentSelector){
            $timeout(function(){
              parent = angular.element($document).find(scope.parentSelector);
              element.height(parent.height());
            });
          }else if(angular.isDefined(attrs['fitToParent'])){
            elementTop = element.position().top;
            parentHeight = element.parent().height();
            element.height(parentHeight - elementTop);
          }else{
            elementTop = element.position().top;
            elementHeight = element.height();
            next = (angular.isDefined(attrs['nextSelector']))?angular.element($document).find(attrs['nextSelector']):element.next();
            if(next.position()){
              nextTop = next.position().top;
            }else{
              nextTop = element.parent().height();
            }

            if(nextTop == 0 && resizeCount == 0){
              resizeCount ++;
              return $timeout(resize);
            }else if(nextTop == 0){
              nextTop = angular.element($document).height();
            }else{
              resizeCount = 0;
            }

            element.height(nextTop - elementTop);
          }
        }

        angular.element($window).on('resize', resize);

        resize();

        scope.$on('$destroy', function(){
          angular.element($window).off('resize', resize);
        });

        scope.$watch(function(){
          next = (angular.isDefined(attrs['nextSelector']))?angular.element($document).find(attrs['nextSelector']):element.next();
          var n = next && next.position();
          if(n){
            return next.position().top;
          }else{
            return undefined;
          }
        }, resize);

        scope.$watch(function(){
          return element.position().top;
        }, resize);

      }
    };
  });
