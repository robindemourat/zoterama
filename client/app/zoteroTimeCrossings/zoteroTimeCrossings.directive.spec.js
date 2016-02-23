'use strict';

describe('Directive: zoteroTimeCrossings', function () {

  // load the service's module
  beforeEach(module('zoteramaApp'));

  // instantiate service
  var zoteroTimeCrossings;
  beforeEach(inject(function (_zoteroTimeCrossings_) {
    zoteroTimeCrossings = _FileDownload_;
  }));

  it('should do something', function () {
    expect(!!zoteroTimeCrossings).toBe(true);
  });

});
