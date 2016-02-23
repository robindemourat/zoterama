'use strict';

describe('Directive: zoteroGraph', function () {

  // load the service's module
  beforeEach(module('zoteramaApp'));

  // instantiate service
  var zoteroGraph;
  beforeEach(inject(function (_zoteroGraph_) {
    zoteroGraph = _zoteroGraph_;
  }));

  it('should do something', function () {
    expect(!!zoteroGraph).toBe(true);
  });

});
