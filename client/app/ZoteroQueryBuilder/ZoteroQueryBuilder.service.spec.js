'use strict';

describe('Service: ZoteroQueryBuilder', function () {

  // load the service's module
  beforeEach(module('zoteramaApp'));

  // instantiate service
  var ZoteroQueryBuilder;
  beforeEach(inject(function (_ZoteroQueryBuilder_) {
    ZoteroQueryBuilder = _ZoteroQueryBuilder_;
  }));

  it('should do something', function () {
    expect(!!ZoteroQueryBuilder).toBe(true);
  });

});
