'use strict';




angular.module('zoteramaApp')
  .directive('zoteroTimeCrossings', function () {
    return {
        restrict : 'C',
        scope : {
            data : '=data',
            getIcon : '&getIcon'
        },
        link : function postLink(scope, element, attrs){

            var w,h,
                min_zoom = 0.5,
                max_zoom = 7,
                zoom = d3.behavior.zoom().scaleExtent([min_zoom,max_zoom]).on('zoom', zoomed),
                svg = d3.select(element[0]),
                g = svg.append('g'),
                linksContainer = g.append('g').attr('class', 'links-container'),
                nodesContainer = g.append('g').attr('class', 'nodes-container'),
                node = svg.selectAll(".node"),
                link = svg.selectAll(".link"),
                enterNode,exitNode,
                enterLink,exitLink,
                scaleX = d3.scale.linear(),
                scaleY = d3.scale.linear(),
                extentX,
                margin = {
                    left : 200,
                    right : 100,
                    top : 30,
                    bottom : 30
                };

            svg.call(zoom);


            function zoomed(){

                g.transition().duration(100)
                    .attr('transform', function(){
                        return 'translate('+zoom.translate().join(',')+')scale('+zoom.scale()+')';
                    });
            }



            var onLinkMouseClick = function(d, i){
                if(!d.selected){
                    d.selected = true;
                    link/*.filter(function(d,ind){
                        return ind !== i;
                    })*/.style('opacity', .1);
                    d3.select(this).style('opacity', 1);

                    node.style('opacity', 1);
                    node.filter(function(dat, ind){
                        var hasIt;
                        d.path.some(function(inde){
                            if(inde === ind){
                                return hasIt = true;
                            }
                        });
                        return !hasIt;
                    }).style('opacity', .1);
                }else{
                    d.selected = false;
                    link.style('opacity', 1).each(function(datum){
                        datum.selected = false;
                    });
                    node.style('opacity', 1);
                }

            }

            var onNodeMouseClick = function(d, i){
                if(!d.selected){
                    d.selected = true;
                    link.filter(function(d){
                        var hasIt;
                        d.path.some(function(ind){
                            if(ind === i){
                                return hasIt = true;
                            }
                        });
                        return !hasIt;
                    }).style('opacity', .1);

                    d3.select(this).style('opacity', 1);
                    node.filter(function(d, ind){
                        return ind != i;
                    }).style('opacity', .1);
                }else{
                    d.selected = false;
                    link.filter(function(d){
                        var hasIt;
                        d.path.some(function(ind){
                            if(ind === i){
                                return hasIt = true;
                            }
                        });
                        return !hasIt;
                    }).style('opacity', 1);

                    node.filter(function(d, ind){
                        return ind != i;
                    }).style('opacity', 1);

                    node.each(function(datum){
                        datum.selected = false;
                    })
                }
            }

            var processText = function(d){
                if(d.title){
                    return d.title;
                }else if(d.tag){
                    return d.tag;
                }else if(d.lastName){
                    return d.firstName + ' ' + d.lastName;
                }else if(d.name){
                    return d.name;
                }else return 'unknown';
            }

            var processIcon = function(d){

                if(d.visItemType == 'tags'){
                    return "node-icon glyphicon glyphicon-tag";
                }else if(d.visItemType == 'creators'){
                    return "node-icon glyphicon glyphicon-user";
                }else if(d.visItemType == 'publisher'){
                    return "node-icon glyphicon glyphicon-home";
                }else if(d.visItemType == 'publisher'){
                    return "node-icon glyphicon glyphicon-briefcase";
                }else{
                    var clas = scope.getIcon({type : d.itemType});
                    return 'node-icon glyphicon ' + clas;
                }
                return "node-icon glyphicon glyphicon-book";
            }


            var makePath = function(d, i){
                var path = '', x, y, currentX = (margin.left - 10), currentY = (scaleY(i)), x1, x2, y1, y2, distX, distY;

                path += 'M' + currentX + ',' + currentY;

                d.path.forEach(function(index, i){
                    x = scope.data.events[index].year;
                    y = scope.data.events[index].y;
                    if(scaleX(x) > currentX && y != currentY){
                        distX = Math.abs(scaleX(x) - currentX);
                        distY = Math.abs(scaleY(y) - currentY);

                        x1 = currentX + distX/2;
                        x2 = (currentX + distX) - distX/2;
                        y1 = currentY;
                        y2 = scaleY(y);

                        path += ' C'+x1 + ',' + y1 + ' ' + x2 + ',' + y2 + ' ' + scaleX(x) + ',' + scaleY(y);
                    }else{
                        path += ' L' + scaleX(x) + ',' + scaleY(y);
                    }

                    currentX = scaleX(x);
                    currentY = scaleY(y);
                });
                return path;
            }

            var update = function(){

                w = element.width();
                h = element.height();

                margin.right = w * (2/12);//handling options margin

                extentX = d3.extent(scope.data.events, function(event){
                    return event.year;
                });

                scaleX.domain(extentX).range([margin.left, w - margin.right]);
                scaleY.domain([0, scope.data.entities.length]).range([margin.top, h - margin.bottom]);

                //sort entities by path similarity
                scope.data.entities = scope.data.entities.sort(function(a, b){
                    var similarityScore = 0;
                    a.path.forEach(function(index1){
                        b.path.forEach(function(index2){
                            if(index1 === index2){
                                similarityScore ++;
                            }
                        })
                    });
                    var aIsBest = !a.bestSimScore || similarityScore > a.bestSimScore;
                    var bIsBest = !b.bestSimScore || similarityScore > b.bestSimScore;
                    if(aIsBest){
                        a.bestSimScore = similarityScore;
                    }
                    if(bIsBest){
                        b.bestSimScore = similarityScore;
                    }

                    if(aIsBest && bIsBest){
                        return -1;
                    }else return 1;
                });

                //compute events entities ranking (float) through mean of elements
                scope.data.events.forEach(function(event){
                    event.entitiesIndexes = [];
                })
                scope.data.entities.forEach(function(entity, entityIndex){
                    entity.path.forEach(function(eventIndex){
                        scope.data.events[eventIndex].entitiesIndexes.push(entityIndex);
                    });
                });
                //attribute y and handle collisions
                scope.data.events.forEach(function(event, index){

                    event.y = (event.entitiesIndexes)?d3.mean(event.entitiesIndexes):0;
                    if(!event.y){
                        event.y = 0;
                    }

                    //collisions -- to improve
                    for(var i = 0 ; i < index; i++){
                        var event2 = scope.data.events[i];
                        if(event.year === event2.year && event.y - event2.y < 2){
                            event.y -= 1;
                            event2.y += 1;
                        }
                    }
                });

                console.log('updating time crossings : ', scope.data);

                node = nodesContainer.selectAll('.node').data(scope.data.events, function(d){
                    return d.key;
                });
                enterNode = node.enter();
                exitNode = node.exit();

                link = linksContainer.selectAll('.link').data(scope.data.entities, function(d){
                    return d.hashKey;
                });
                enterLink = link.enter();
                exitLink = link.exit();

                enterLink = enterLink
                    .append('g')
                        .attr('class', function(d){
                            return 'link ' + d.visItemType;
                        });

                enterLink.append('path');

                var label = enterLink.append('g').attr('class', 'cross-label');


                enterLink.append('title').text(processText);

                enterLink
                    .on('click', onLinkMouseClick);

                enterLink.style('opacity', 0.01)
                    .transition().duration(500)
                        .style('opacity', 1);

                label.attr('transform', function(d, i){
                    return 'translate(0,'+scaleY(i) + ')';
                });

                label
                    .append('text')
                            .attr('y', 0)
                                .text(processText);


                label
                    .append("svg:foreignObject")
                    .attr("width", 10)
                    .attr("height", 10)
                    .attr("y", "-5px")
                    .attr("x", function(d){
                        return margin.left - 20;
                    })
                    .append("xhtml:span")
                    .attr("class", processIcon);


                //links update
                link
                    .select('.cross-label')
                        .transition().duration(500)
                            .attr('transform', function(d, i){
                                return 'translate(0,'+scaleY(i) + ')';
                            });

                link.select('.cross-label text')
                    .transition().duration(500)
                        .attr('x', function(d){
                            return margin.left - 30;
                            // return (scaleX(scope.data.events[d.path[0]].year) - 20);
                        });

                link.select('path')
                    .transition().duration(500)
                    .attr('d', makePath);


                enterNode = enterNode
                    .append('g')
                        .attr('class', 'node');

                enterNode.on('click', onNodeMouseClick);

                var annotation = enterNode
                    .append('g')
                    .attr('class', 'annotation')
                    .attr('transform', 'translate(5, 0)')

                annotation
                    .append('rect')
                        .attr('class', 'annotation-background')
                        .attr('fill', 'white')
                            .attr('x', -5).attr('y', -5)
                            .attr('width', function(d){
                                var text = processText(d);
                                return text.length * 5;
                            })
                            .attr('height', 9);

                enterNode
                    .append('circle')
                        .attr('cx', 0)
                            .attr('cy', 0)
                                .attr('r', 5)
                                    .attr('class', function(d){
                                        return d.visItemType;
                                    });

                enterNode
                    .append("svg:foreignObject")
                    .attr("width", 10)
                    .attr("height", 10)
                    .attr("y", "-5px")
                    .attr("x", "-5px")
                    .append("xhtml:span")
                    .attr("class", processIcon);


                enterNode
                    .append('text')
                        .text(function(d){
                            return processText(d) + ' ('+d.year+ ')';
                        })
                            .attr("dy", 2)
                            .attr("dx", 7)
                            .style('font-size', '0.5em');



                node.transition()
                    .duration(500)
                    .attr('transform', function(d){
                        var x = scaleX(d.year);
                        // var y = scaleY(scope.data.entities.length / 2);
                        var y = scaleY(d.y);
                        return 'translate('+x+','+y+')';
                    });



                exitNode.remove();
                exitLink.remove();

            }


            scope.$watch('data', update);
            scope.$watch(function(){
                return {
                    width : element.width(),
                    height : element.height()
                }
            }, update, true);
        }
    }
  });
