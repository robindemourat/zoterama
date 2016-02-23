'use strict';

describe('Directive: fitheight', function () {

  // load the directive's module
  beforeEach(module('zoteramaApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<fitheight></fitheight>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the fitheight directive');
  }));
});
