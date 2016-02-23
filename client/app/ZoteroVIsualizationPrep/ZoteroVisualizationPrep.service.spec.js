'use strict';

describe('Service: ZoteroVisualizationPrep', function () {

  // load the service's module
  beforeEach(module('zoteramaApp'));

  // instantiate service
  var ZoteroVisualizationPrep;
  beforeEach(inject(function (_ZoteroQueryBuilder_) {
    ZoteroVisualizationPrep = ZoteroVisualizationPrep;
  }));

  it('should do something', function () {
    expect(!!ZoteroVisualizationPrep).toBe(true);
  });

});
