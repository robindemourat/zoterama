'use strict';

angular.module('zoteramaApp')
  .factory('ZoteroVisualizationPrep', function () {
    var factory = {};

    //I check if a link is present in data.links, then create or update it
    var createOrUpdateLink = function(data, index1, index2, type){
      var index;

      data.links.some(function(link, i){
        if(link.source === index1 && link.target === index2){
          index = i;
          return link.value++;
        }
      });

      if(!index){
        data.links.push({
          source : index1,
          target : index2,
          value : 1,
          type : type
        })
      }

      data.nodes[index1].nodeValue = (data.nodes[index1].nodeValue)?data.nodes[index1].nodeValue+1:1;
      data.nodes[index2].nodeValue = (data.nodes[index2].nodeValue)?data.nodes[index2].nodeValue+1:1;

      return data;
    }

    //I check or create nodes and links related to the given properties of an item
    var checkOrCreateNodes = function(items, data, propertyName, properties, linkToItems, index, comparator){
      var hashKey;
      //array of objects case
      if(Array.isArray(properties)){
        //loop in the properties to integrate as nodes in order to check get/set them
        properties.forEach(function(property){
          var propertyIndex;
          hashKey = '';
          // loop in node data to fetch existing
          data.nodes.some(function(node, nodeIndex){
            if(nodeIndex != index && !node[propertyName]){
                // var miniExists = true;
                var miniExists = comparator(property, node);


                if(miniExists){
                  return propertyIndex = nodeIndex;
                }
            }
        });
        //case not found : set new node
        if(!propertyIndex){
          hashKey = '';
          for(var i in property){
            if(typeof property[i]+'' === 'string'){
                if(property[i].length > 10){
                  hashKey += (property[i]+'').substr(0,9);
                }else hashKey += (property[i] + '');
              }
          }
          property.visItemType = propertyName;
          property.appearsInItems = [];
          property.hashKey = hashKey;
          data.nodes.push(property);
          propertyIndex = data.nodes.length - 1;
        }

        //update the items indexes in which the property appears
        items.forEach(function(item, i){
          if(!item.data[propertyName]){
            return;
          }
          var exists;
          item.data[propertyName].some(function(otherProperty){
            var miniExists = comparator(otherProperty, property);

            if(miniExists){
              return exists = true;
            }
           });
          if(exists){
            var hasIt;
            data.nodes[propertyIndex].appearsInItems.some(function(ind){
              if(ind === i){
                return hasIt = true;
              }
            });
            if(!hasIt){
              data.nodes[propertyIndex].appearsInItems.push(i);
            }
          }
        });
        //make a connection to item if specified in params
        if(linkToItems){
          data = createOrUpdateLink(data, index, propertyIndex, 'propertyToItem');
        }
      });

      //single prop (number or string)
      }else{
        if(!properties){
          return data;
        }
        if(!(properties + '').length){
          return;
        }
        var hashKey = properties, propertyIndex, property = properties;

        data.nodes.some(function(node, nodeIndex){
            if(nodeIndex != index && node.visItemType === 'reference'){
                var miniExists = comparator(property, node);
                if(miniExists){
                  property = node;
                  return propertyIndex = nodeIndex;
                }
            }
        });


        if(!propertyIndex){
          property = {
            name : property
          };
          property.visItemType = propertyName;
          property.appearsInItems = [];
          property.hashKey = hashKey;
          var exists;
          data.nodes.some(function(node){
            if(node.visItemType === propertyName && node.name === property.name){
              return exists = true;
            }
          })
          if(!exists){
            data.nodes.push(property);
          }
          // console.log('push ', property);
          propertyIndex = data.nodes.length - 1;
        }



        //update the items indexes in which the property appears
        items.forEach(function(item, i){
          if(!item.data[propertyName]){
            return;
          }
          var exists = comparator(item.data[propertyName], property);

          if(exists){
            var hasIt;
            data.nodes[propertyIndex].appearsInItems.some(function(ind){
              if(ind === i){
                return hasIt = true;
              }
            });
            if(!hasIt){
              data.nodes[propertyIndex].appearsInItems.push(i);
            }
          }
        });
        //make a connection to item if specified in params
        if(linkToItems){
          data = createOrUpdateLink(data, index, propertyIndex, 'propertyToItem');
        }

      }
      return data;
    }

    //I update network data according to a specific connector
    var createNodesAndLinks = function(items, data, connector, linkToItems){
      //first, create new nodes with item values
      items.forEach(function(item, i){
        switch(connector.name){
          case 'creators':
            data = checkOrCreateNodes(items, data, 'creators', item.data.creators, linkToItems, i, function(a,b){
              if(a.lastName && b.lastName)
                return a.lastName.toLowerCase() == b.lastName.toLowerCase() && a.firstName.substr(0,1) === b.firstName.substr(0,1);
              else return false;
            });
          break;

          case 'tags':
            data = checkOrCreateNodes(items, data, 'tags', item.data.tags, linkToItems, i, function(a,b){
              return a.tag === b.tag;
            });
          break;

          case 'publisher':
            data = checkOrCreateNodes(items, data, 'publisher', item.data.publisher, linkToItems, i, function(a,b){
              if(a.name){
                a = a.name;
              }
              return a === b.name;
            });
          break;

          case 'place':
            data = checkOrCreateNodes(items, data, 'place', item.data.place, linkToItems, i, function(a,b){
              if(a.name){
                a = a.name;
              }
              return a === b.name;
            });
          break;
        }
      });

      return data;
    }

    var linkNonReferenceNodes = function(data){

      var node1, node2;
      for(var i = 0 ; i < data.nodes.length ; i++){
        node1 = data.nodes[i];
        if(node1.visItemType === 'reference'){
          continue;
        }
        for(var j = i + 1 ; j  < data.nodes.length ; j++){
          node2 = data.nodes[j];
          node1.appearsInItems.forEach(function(index1){
            node2.appearsInItems.forEach(function(index2){
              if(index1 === index2){
                data = createOrUpdateLink(data, i, j, 'propertyToProperty');
              }
            })
          })
        }
      }
      return data;
    }

    //I bootstrap and centralize the processing of network data, in d3-friendly style
    var makeGraphData = function(items, parameters){
      var data = {
                  nodes : [],
                  links : []
                }
        , activeConnectors = parameters.connectors.filter(function(connector){
                                return connector.active;
                              });

      if(parameters.showReferences){
        var i;
        data.nodes = items.map(function(item){
          i = angular.copy(item.data);
          i.visItemType = 'reference';
          i.hashKey = item.key;
          return i;
        });

      }

      //first, create node-level links
      activeConnectors.forEach(function(connector){
        data = createNodesAndLinks(items, data, connector, parameters.showReferences);
      });

      //then create links between non-reference nodes
      data = linkNonReferenceNodes(data);


      return data;
    }

    var makeTimeCrossingsData = function(items, parameters){

      var data = {
        entities : [],
        events : []
      }, activeConnectors = parameters.connectors.filter(function(connector){
                                return connector.active;
                              });

      data.events = items.filter(function(item){
        var hasYear = item.data.date && item.data.date.match(/[+\d]{4}/);
        if(hasYear){
          item.data.year = +hasYear[0];
          item.data.visItemType = 'reference';
        }
        return hasYear;
      })/*.map(function(item){
        return item.data;
      })*/.sort(function(a, b){
        if(a.data.year > b.data.year){
          return 1;
        }else if(a.data.year < b.data.year){
          return -1;
        }else return 0;
      });

      var tempNetwork = {
        nodes : [],
        links : []
      }

      //first, create node-level networks
      activeConnectors.forEach(function(connector){
        tempNetwork = createNodesAndLinks(data.events, tempNetwork, connector, false);
      });

      data.entities = tempNetwork.nodes.map(function(node){
        node.path = node.appearsInItems;
        delete node.appearsInItems;
        return node;
      });

      data.events = data.events.map(function(event){
        return event.data;
      })


      return data;
    }


    factory.prepareData = function(items, parameters){
      var visData;
      switch(parameters.mode){
        case 'graph':
          visData = makeGraphData(items, parameters);
        break;

        case 'time':
          visData = makeTimeCrossingsData(items,parameters);
        break;
      }
      return visData;
    }


    return factory;
  });
