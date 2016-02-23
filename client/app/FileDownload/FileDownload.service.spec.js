'use strict';

describe('Service: FileDownload', function () {

  // load the service's module
  beforeEach(module('zoteramaApp'));

  // instantiate service
  var FileDownload;
  beforeEach(inject(function (_FileDownload_) {
    FileDownload = _FileDownload_;
  }));

  it('should do something', function () {
    expect(!!FileDownload).toBe(true);
  });

});
