'use strict';




angular.module('zoteramaApp')
  .directive('zoteroGraph', function () {
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
                zoom = d3.behavior.zoom().scaleExtent([min_zoom,max_zoom]),
                svg = d3.select(element[0]),
                g = svg.append('g'),
                linksContainer = g.append('g').attr('class', 'links-container'),
                nodesContainer = g.append('g').attr('class', 'nodes-container'),
                node = svg.selectAll(".node"),
                link = svg.selectAll(".link"),
                enterNode,exitNode,
                enterLink,exitLink,
                force = d3.layout.force()
                            .linkDistance(function(d){
                                return 60/d.value;
                            })
                            .charge(-300)
                            ;

            force.on("tick", function() {

                node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
                // text.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

                link.attr("x1", function(d) { return d.source.x; })
                  .attr("y1", function(d) { return d.source.y; })
                  .attr("x2", function(d) { return d.target.x; })
                  .attr("y2", function(d) { return d.target.y; });
            });

            zoom.on("zoom", function() {
                g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
            });

            svg.call(zoom);

            var onNodeMouseOver = function(){

            }

            var onNodeMouseOut = function(){

            }

            var onNodeMouseClick = function(){

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

            var update = function(){


                console.log('updating graph : ', scope.data);
                w = element.width();
                h = element.height();

                force
                    .nodes(scope.data.nodes).links(scope.data.links)
                    .size([w,h])
                    .start();

                link = linksContainer.selectAll('.link').data(force.links(), function(d){
                    return d.source.hashKey + d.target.hashKey;
                });
                enterLink = link.enter();
                exitLink = link.exit();

                node = nodesContainer.selectAll('.node').data(force.nodes(), function(d){
                    return d.hashKey;
                });

                enterNode = node.enter();
                exitNode = node.exit();


                enterLink
                    .append('line')
                        .attr('class', 'link')
                            .attr('opacity', 0e-1)
                            .attr("x1", function(d) { return d.source.x; })
                      .attr("y1", function(d) { return d.source.y; })
                        .attr("x2", function(d) { return d.target.x; })
                            .attr("y2", function(d) { return d.target.y; })
                                .transition()
                                    .duration(1000)
                                        .attr('opacity', 1)


                enterNode = enterNode
                    .append('g')
                        .attr('class', 'node')
                enterNode
                    .attr('opacity', 0e-1)
                        .transition()
                            .duration(1000)
                            .attr('opacity', 1)

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
                        .text(processText)
                            .attr("dy", 2)
                            .attr("dx", 7)
                            .style('font-size', '0.5em');


                enterNode.call(force.drag);



                /*.on("dblclick.zoom", function(d) { d3.event.stopPropagation();
                    var dcx = (window.innerWidth/2-d.x*zoom.scale());
                    var dcy = (window.innerHeight/2-d.y*zoom.scale());
                    zoom.translate([dcx,dcy]);
                     g.attr("transform", "translate("+ dcx + "," + dcy  + ")scale(" + zoom.scale() + ")");
                });*/




                link
                    .attr('class', function(d){
                        return "link "+d.type;
                    })
                    .attr('stroke-width', function(d){
                        return d.value;
                    });

                exitLink.remove();
                exitNode.remove();
            }


            scope.$watch('data', update);
            scope.$watch(function(){
                return {
                    width : element.width(),
                    height : element.height()
                }
            }, function(dims){
                force.size([force.size()[0]+(dims.width-w)/zoom.scale(),force.size()[1]+(dims.height-h)/zoom.scale()]).resume();
            }, true);
        }
    }
  });
