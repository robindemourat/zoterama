'use strict';

describe('Service: ZoteroQueryHandler', function () {

  // load the service's module
  beforeEach(module('zoteramaApp'));

  // instantiate service
  var ZoteroQueryHandler;
  beforeEach(inject(function (_ZoteroQueryHandler_) {
    ZoteroQueryHandler = _ZoteroQueryHandler_;
  }));

  it('should do something', function () {
    expect(!!ZoteroQueryHandler).toBe(true);
  });

});
