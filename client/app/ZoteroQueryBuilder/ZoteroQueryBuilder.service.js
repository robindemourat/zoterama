'use strict';

angular.module('zoteramaApp')
  .factory('ZoteroQueryBuilder', function ($log) {
    var query = {};

      //querybuilder getters-setters
      query.init = function(apiKey, userId){
        query.params = {};
        query.options = {};
        if(apiKey)
          query.params.key = apiKey;
        if(userId){
          query.params.entityType = 'user';
          query.params.entityId = userId;
        }
        query.options.limit = 100;
        return query;
      }
      query.apiKey = function(d){
        if(arguments.length){
          query.params.key = d;
          return query;
        }else return d;
      };
      //type and id of the entity inspected (user or group)
      query.entity = function(type, id){
        if(arguments.length >= 2){
          query.params.entityType = type;
          query.params.entityId = id;
          return query;
        }else return {entityType : query.params.entityType, entityId : query.params.entityId};
      }

      query.entityId = function(d){
        if(arguments.length){
          query.params.entityId = d;
          return query;
        }else return query.params.entityId;
      }

      query.entityType = function(d){
        if(arguments.length){
          query.params.entityType = d;
          return query;
        }else return query.params.entityType;
      }

      /*API : SORTING AND PAGINATION */

      //query limit of items retrieved. default : 25, max : 100
      query.limit = function(d){
        if(arguments.length){
          query.options.limit = d;
          return query;
        }else return query.options.limit;
      }
      //index of start for the retrieve of element
      query.start = function(d){
        if(arguments.length){
          query.options.start = d;
          return query;
        }else return query.options.start;
      }
      //values : asc, desc
      query.direction = function(d){
        if(arguments.length){
          query.options.direction = d;
          return query;
        }else return query.options.direction;
      }
      //values : dateAdded, dateModified, title, creator, type, date, publisher, publicationTitle, journalAbbreviation, language, accessDate, libraryCatalog, callNumber, rights, addedBy, numItems (tags)
      query.sort = function(d){
        if(arguments.length){
          query.options.sort = d;
          return query;
        }else return query.options.sort;
      }

      /*FORMAT*/
      //atom, bib, json, keys, versions
      query.format = function(d){
        if(arguments.length){
          query.options.format = d;
          return query;
        }else return query.options.format;
      }

      /* FILTERS */
      query.searchItemKey = function(d){
        if(arguments.length){
          query.options.itemKey = d;
          return query;
        }else return query.options.itemKey;
      }
      query.searchItemType = function(d){
        if(arguments.length){
          query.options.itemType = d;
          return query;
        }else return query.options.itemType;
      }
      query.quickSearch = function(d){
        if(arguments.length){
          query.options.q = d;
          return query;
        }else return query.options.q;
      }
      //values : titleCreatorYear, everything
      query.searchMode = function(d){
        if(arguments.length){
          query.options.qmode = d;
          return query;
        }else return query.options.qmode;
      }
      //value : integer (modifed after this library version)
      query.since = function(d){
        if(arguments.length){
          query.options.since = d;
          return query;
        }else return query.options.since;
      }

      //update : clean null values
      query.update = function(){
        for(var i in query.params){
          if(!query.params[i])
            delete query.params[i];
        }
        for(var i in query.options){
          if(!query.options[i])
            delete query.options[i];
        }

        return query;
      };

      query.get = function(){
        query = query.update();
        return {params : query.params,options : query.options}
      }


      return query;
  });
