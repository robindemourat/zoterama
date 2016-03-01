'use strict';


angular.module('zoteramaApp')
  .controller('MainCtrl', function ($scope, $cookieStore, $log, $http, $timeout, ZoteroQueryHandler, ZoteroQueryBuilder, FileDownload, Angularytics, $sce, ZoteroVisualizationPrep) {
    var query;

    var initVariables = function(){

      $scope.overallItems = [];
      $scope.selectedItems = [];

      $scope.inputAPIkey = "";
      $scope.inputUserId = "";

      $scope.connectingZotero = true;


      var retrievedUserId = $cookieStore.get('zoteroUserId');
      var retrievedAPIkey = $cookieStore.get('zoteroAPIkey');


      if(retrievedUserId && retrievedAPIkey){
        Angularytics.trackEvent("Zotero connection", "zotero credentials fetched from cookies");
        $scope.userId = retrievedUserId;
        $scope.apiKey = retrievedAPIkey;
        $scope.inputUserId = $scope.userId;
        $scope.inputAPIkey = $scope.apiKey;
        $scope.rememberCredentials = true;
        $scope.setZoteroCredentials($scope.apiKey, $scope.userId);
      }else{
        $scope.rememberCredentials = false;
      }
        //Interface;
        $scope.asides = {
          left : false,
          right : false
        }

        $scope.searchMode = false;

        $scope.visualizationParameters = {
          mode : 'graph',//graph or time
          connectors : [
            {
              name : 'creators',
              active : true
            },
            {
              name : 'tags',
              active : true
            },
            /*{
              name : 'connections',
              active : false
            },*/
            {
              name : 'publisher',
              active : true
            },
            {
              name : 'place',
              active : true
            }
          ],
          showReferences : true
        }

        $scope.outputMode = 'visualize';
        $scope.browsedItemIndex = 0;

        $scope.templateChoose = true;
        $scope.leftMenuMode = 'about';

        $scope.sortAscending = true;
        $scope.sortMode = 'title';
        $scope.headerStyles = ".moving-header{height:500px;line-height:500px}"
    };

    $scope.setLeftMenuContent = function(mode){
      if(mode === 'about'){
        return 'assets/html/menu-about.html';
      }else if(mode === 'connect'){
        return 'assets/html/menu-help-connect.html';
      }
    }

    $scope.setZoteroCredentials = function(apiKey, userId, fromInterface){
      if(apiKey.length === 0 || !userId.length === 0){
        return;
      }
      if($scope.userId === userId && $scope.apiKey === apiKey && $scope.overallItems.length){
        $scope.connectingZotero = false;
        return;
      }


      $scope.connectingZotero = true;
      $scope.zoteroPending = true;
      $scope.zoteroStatus = 'Connecting to zotero ...';
      query = ZoteroQueryBuilder.init(apiKey, userId).searchItemType('-attachment');
      $scope.overallQueryStart = 0;
      $scope.getMore(function(err, data){
        $scope.zoteroPending = false;
        $scope.zoteroStatus = undefined;
        if(err){
          $scope.zoteroStatus = 'Could not connect to Zotero : '+err;
        }else{
          if(fromInterface){
            Angularytics.trackEvent("Zotero connection", "set new zotero credentials from form");
          }
          $scope.userId = userId;
          $scope.apiKey = apiKey;
          $scope.inputUserId = userId;
          $scope.inputAPIkey = apiKey;
          if($scope.rememberCredentials){
            $cookieStore.put('zoteroUserId', userId);
            $cookieStore.put('zoteroAPIkey', apiKey);
          }else{
            $cookieStore.remove('zoteroUserId');
            $cookieStore.remove('zoteroAPIkey');
          }

          $scope.alerts = [];
          $scope.connectingZotero = false;
          setTimeout(function(){
            $scope.$apply();
          });

          $scope.getCollectionsList();
        }
      });
    }

    $scope.setDefaultZoteroCredentials = function(){
      $http.get('assets/default-credentials/zotero-credentials.default.json')
        .success(function(credentials){
          Angularytics.trackEvent("Zotero connection", "Set Zotero default account");
          $scope.setZoteroCredentials(credentials.apiKey, credentials.userId);
        }).error(function(){
            $log.error('credentials not found. Write them in root/credentials/credentials.json with an object containing properties userId and apiKey, or paste your API in the interface.')
        });
    }

    $scope.toggleLeftMenuMode = function(val){
      $scope.leftMenuMode = val;
    }

    $scope.toggleSearchMode = function(val){
      $scope.searchMode = val;
    }

    $scope.toggleOutputMode = function(val){
      $scope.outputMode = val;

      if(val === 'browse'){
        $scope.browsedItemIndex = 0;
      }else if(val === 'visualize'){
        $scope.updateVisData();
      }
    }

    $scope.toggleVisMode = function(mode){
      if($scope.visualizationParameters.mode !== mode){
        $scope.visualizationParameters.mode = mode;
        $scope.updateVisData();
      }
    }

    $scope.toggleZoteroConnect = function(){
      if($scope.connectingZotero && $scope.apiKey && $scope.userId){
        $scope.connectingZotero = false;
      }else if(!$scope.connectingZotero){
        $scope.connectingZotero = !$scope.connectingZotero;
      }
    }

    $scope.toggleAside = function(side){
      var otherSide = (side === 'left')?'right' : 'left';
      $scope.asides[side] = !$scope.asides[side];
      if($scope.asides[side]){
        $scope.asides[otherSide] = false;
      }


      setTimeout(function(){
        $scope.$apply();
      });
    }

    $scope.toggleConnectorActivity = function(connector){
      connector.active = !connector.active;
      $scope.updateVisData();
      setTimeout(function(){
        $scope.$apply();
      })
    }

    $scope.toggleShowReferences = function(){
      $scope.visualizationParameters.showReferences = !$scope.visualizationParameters.showReferences;
      if($scope.outputMode === 'visualize'){
          $scope.updateVisData();
        }
      setTimeout(function(){
        $scope.$apply();
      })
    }

    $scope.setZoteroItemIcon = function(type){
      switch(type){
        case 'book':
        return 'glyphicon-book';
        break;

        case 'bookSection':
        return 'glyphicon-bookmark';
        break;

        case 'journalArticle':
        return 'glyphicon-calendar';
        break;

        case 'thesis':
        return 'glyphicon-education';
        break;

        case 'conferencePaper':
        return 'glyphicon-comment';
        break;

        case 'webpage':
        return 'glyphicon-globe';
        break;

        default:
        return 'glyphicon-file';
        break;
      }
    }

    $scope.setBigContainerClass = function(){
      var clas = '';
      if($scope.asides.left){
        clas += 'left';
      } else if ( $scope.asides.right ){
        clas += 'right';
      }
      return clas;
    }

    $scope.setOutputModeHtml = function(){
      switch($scope.outputMode){
        case 'browse':
          return 'assets/html/output-browse.html';
        break;

        case 'visualize':
          return 'assets/html/output-visualize.html';
        break;

        case 'full-search':
        break;
      }
    }

    var initWatchers = function(){
      $scope.$watchCollection('selectedItems', function(){
        if($scope.outputMode === 'visualize'){
          $scope.updateVisData();
        }
      });
      // $scope.$watchCollection('overallItems', updatePreview);
    };

    var itemExists = function(item, collection){
      for(var i in collection){
        if(collection[i].key === item.key)
          return true;
      }
      return false;
    };

    var findItem = function(item, collection){
      for(var i in collection){
        if(collection[i].key === item.key)
          return i;
      }
    };

    var appendToListOfItems = function(err, d){
      $scope.zoteroPending = false;
      for(var i in d){
        var item = d[i];
        if(!itemExists(item, $scope.overallItems))
          $scope.overallItems.push(item);
      }
    }

    var prependToListOfItems = function(err, d){
      $scope.zoteroPending = false;
      for(var i in d){
        var item = d[i];
        if(!itemExists(item, $scope.overallItems)){
          if($scope.overallItems)
            $scope.overallItems.unshift(item);
        }
      }
    };


    var sortSelectedItems = function(){
      if(!angular.isDefined($scope.sortMode) || !angular.isDefined($scope.sortAscending)){
        return;
      }else{
        var before = $scope.sortAscending,
            after = !$scope.sortAscending,
            equal = 0;

        $scope.selectedItems = $scope.selectedItems.sort(function(a,b){
          switch($scope.sortMode){
            case 'title':
              var title1 = a.data.title,
                  title2 = b.data.title;

              if(title1 > title2){
                return before;
              }else if(title1 < title2){
                return after;
              }else return equal;
            break;

            case 'firstAuthor':
              var author1 = a.data.creators[0],
                  author2 = b.data.creators[0];

              if(!author1){
                return after;
              }else if(!author2){
                return before;
              }

              author1 = author1.lastName;
              author2 = author2.lastName;

              if(author1 > author2){
                return after;
              }else if(author1 < author2){
                return before;
              }else return equal;
            break;

            case 'year':
              var date1 = a.data.date,
                  date2 = b.data.date;

              if(!date1){
                return after;
              }else if(!date2){
                return before;
              }

              var year1 = date1.match(/[\d]{4}/),
                  year2 = date2.match(/[\d]{4}/);

              if(!year1){
                return after;
              }else if(!year2){
                return before;
              }

              if(+year1[0] > +year2[0]){
                return before;
              }else if(+year1[0] < +year2[0]){
                return after;
              }else return equal;
            break;

            default:
              return 1;
            break;
          }
        });
      }
    }

    $scope.setSortMode = function(mode){
      $scope.sortMode = mode;
      Angularytics.trackEvent("Output", "Set sort mode to ", mode);
      console.log('new sort mode : ', $scope.sortMode, ', sort ascending :', $scope.sortAscending);
      sortSelectedItems();
      setTimeout(function(){
        $scope.$apply();
      });
    }

    $scope.setSortAscending = function(ascending){
      $scope.sortAscending = ascending;
      setTimeout(function(){
        $scope.$apply();
        console.info('sort ascending mode : ', $scope.sortAscending);
        sortSelectedItems();
      });
    }

    $scope.updateBrowsedItem = function(){
      var ok = $scope.selectedItems[$scope.browsedItemIndex] && $scope.selectedItems[$scope.browsedItemIndex].data;
      if(ok){
        $scope.browsedItem = $scope.selectedItems[$scope.browsedItemIndex];
        $scope.browsedItemUrl = $sce.trustAsResourceUrl($scope.browsedItem.data.url);
      }
      setTimeout(function(){
        $scope.$apply();
      })
    }

    $scope.setBrowsedItemIndex = function(index){
      if(index >= 0 && index <= $scope.selectedItems.length){
        var ok = $scope.selectedItems[index] && $scope.selectedItems[index].data;
        if(!ok)
          return;

        $scope.browsedItemIndex = index;
        $scope.updateBrowsedItem();
        setTimeout(function(){
          $scope.$apply();
        })
      }
    }

    $scope.addToSelected = function(item){
      if(!itemExists(item, $scope.selectedItems)){
        $scope.selectedItems.push(item);
        sortSelectedItems();
        $scope.updateBrowsedItem();
      }
    };

    $scope.removeFromSelected = function(index){
      $scope.selectedItems.splice(index, 1);
      sortSelectedItems();
    };

    $scope.clearAllSelected = function(){
      $scope.selectedItems = [];
    }

    $scope.addCollectionItemsToSelected = function(collection, callback){
      ZoteroQueryHandler.getCollectionItems(query.get(), collection.key, function(err, data){
        if(data){
          $scope.selectedItems = $scope.selectedItems.concat(data);
          sortSelectedItems();
          $scope.updateBrowsedItem();
          setTimeout(function(){
            $scope.$apply();
          });
          // appendToListOfItems(err, data);
        }
        if(callback){
          callback(err, data);
        }
      });
    }

    $scope.getCollectionsList = function(callback){
      console.log('get collections list', query);
      ZoteroQueryHandler.getCollections(query.get(), function(err, data){
        if(data){
          $scope.collectionsList = data.filter(function(collection){
            return collection.meta.numItems > 0;
          });
          setTimeout(function(){
            $scope.$apply();
          });
        }
        if(callback){
          callback(err, data);
        }
      });
    }

    $scope.getMore = function(callback){
      $scope.zoteroPending = true;

      if($scope.searchQuery){
        if($scope.searchQuery.length == 0){
          query.quickSearch(null);
        }
        else{
          $scope.newZoteroQuery($scope.searchQuery);
        }
      }
      console.log($scope.overallQueryStart);
      query.start($scope.overallQueryStart);
      ZoteroQueryHandler.getItems(query.get(), function(err, data){
        if(data){
          appendToListOfItems(err, data);
        }
        if(callback){
          callback(err, data);
        }
      });
      $scope.overallQueryStart += 100;
    };

    $scope.addAllMatching = function(){
      Angularytics.trackEvent("Interaction", "Used add all functionality");
      var matching = $scope.overallItems.filter($scope.searchInItem);
      for(var i in matching){
        var index = findItem(matching[i], $scope.overallItems);
        if(index){
          $scope.addToSelected(matching[i]);
        }
      }
    };

    $scope.searchInItem = function(item){
      var match = false;
      if($scope.searchQuery && item.data){
        $scope.searchQuery = $scope.searchQuery.toLowerCase();
        for(var i in item.data){
          var val = item.data[i];
          if(!val)
            continue;
          else if(typeof val == 'object' && val.length){
            for(var k in val){
              var val2 = val[k];
              if(typeof val2 == 'object'){
                for(var j in val2){
                  if((""+val2[j]).toLowerCase().indexOf($scope.searchQuery.toLowerCase()) > -1){
                    match = true;
                    break;
                }
                }
              }else if((""+val2[j]).toLowerCase().indexOf($scope.searchQuery.toLowerCase()) > -1){
                  match = true;
                  break;
            }
            }
          }else if(typeof val == 'object'){
            for(var j in val){
              if((""+val[j]).toLowerCase().indexOf($scope.searchQuery.toLowerCase()) > -1){
                match = true;
                break;
            }
            }
          }else if((""+val).toLowerCase().indexOf($scope.searchQuery.toLowerCase()) > -1){
                match = true;
                break;
          }
        }
        return match;
      }
      else return true;
    };

    $scope.updateVisData = function(){
      $scope.visData = ZoteroVisualizationPrep.prepareData($scope.selectedItems, $scope.visualizationParameters);
    }

    $scope.newZoteroQuery = function(expression, callback){
      Angularytics.trackEvent("Zotero connection", "launched Zotero query");
      $scope.zoteroPending = true;
      query.quickSearch(expression).start(0);
      $log.info('new query to zotero', expression);
      ZoteroQueryHandler.getItems(query.get(), prependToListOfItems);
      // $scope.addAlert('', 'fetching items in zotero, please wait')
    };

    $scope.changeAPIKey = function(apiKey){
      $log.info('new api key', apiKey);
      query.apiKey(apiKey);
    };

    $scope.switchExportAsList = function(exp){
      $scope.exportAsList = exp;
      setTimeout(function(){
        $scope.$apply();
      })
    };

    var downloadFile = function(content, filename){
      FileDownload.download(filename, 'txt', content);
    }

    $scope.downloadItems = function(items){
      Angularytics.trackEvent("Output", "Downloaded items");
      if($scope.exportAsList){
        var output = '';
        for(var i in items){
          output += ZoteroTemplateParser.parseZoteroItemWithTemplate($scope.activeTemplate, items[i]).body + '\n\n';
        }
        downloadFile(output, 'zotero_items_list');
      }else{
        for(var i in items){
          var item = items[i];
          var output = ZoteroTemplateParser.parseZoteroItemWithTemplate($scope.activeTemplate, item);
          $timeout(function(){
              $log.info('downloading file'+output.filename);
              downloadFile(output.body, output.filename)
          }, i*5000);
        }
      }
    };

    $scope.copyToClipboard = function(items){
      Angularytics.trackEvent("Output", "Copied items to clipboard");
      console.info('copying items to clipboard ', items);
      var output = "";
      for(var i in items){
        output += ZoteroTemplateParser.parseZoteroItemWithTemplate($scope.activeTemplate, items[i]).body + '\n\n';
      }

      $log.info('processed result copied to clipboard');
      return output;
    };


    /*
    API Dialog
    */


    initVariables();
    initWatchers();
  });
