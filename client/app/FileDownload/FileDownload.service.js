'use strict';

angular.module('zoteramaApp')
  .service('FileDownload', function () {
    var fileDownload = {};


    fileDownload.download = function(name, type, content){
      var mimetype = 'text/'+type,
        blob = new Blob([content], {type : mimetype});

        var a = document.createElement("a");
        document.body.appendChild(a);
        //a.style = "display: none";
        var url = window.URL.createObjectURL(blob);
        a.href = url;
        if(!name || name.trim().length === 0)
            name = "export";
        var hasExtension = name.split('.')[name.split('.').length - 1] == type;
        if(hasExtension)
          a.download = name.trim();
        else a.download = name.trim() +'.'+ type;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    return fileDownload;
  });
