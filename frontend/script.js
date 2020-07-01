// fetch("./json/foodViz.json").then(res => res.json()).then(json => {  network(json);  });

d3.json("./json/foodViz.json").then(function(data) {
  network(data);
});

function network(data) {

  var nodes = data.nodes;

  var links = data.links;

  var position = data.position;

  var clusters = data.clusters;

  var width = 800;
  var height = 700;
  var hl_r = 8;
  var reg_r = 5;

  var node_r = d3.scaleLinear().range([9,20]);

  var color_node = d3.scaleOrdinal().domain(["faculty","non-profit"])
        .range(['rgb(72,169,197)', 'rgb(117,102,160)',]);

  var svg = d3.select("svg");

//   svg.selectAll("circle")
//    .data(nodes)
//    .join("circle")
//    .attr("cx", function(d) { return d.x; })
//    .attr("cy", function(d) { return d.y; })
//    .attr("r", 14)
//    .attr("fill", function(d) { return color_node(d.type); })
//    .on("mouseover", function(d) {
//      div.transition()
//         .duration(200)
//         .style("opacity", .9);
//      div.html("x: " + d.x+ "<br>y: "+ d.y + "<br> id: " + d.id + "<br> type: " + d.type + "<br> label: " + d.label)
//         .style("left", (d3.event.pageX) + "px")
//         .style("top", (d3.event.pageY - 28) + "px");
//    })
//    .on("mouseout", function(d) {
//       div.transition()
//          .duration(500)
//          .style("opacity", 0);
// })
// .on("click", click);
//
// function click() {
//   d3.select(this).attr("fill", "gold");
// };

  function gravity(alpha) {
    return function(d) {
      d.y += (d.cy - d.y) * alpha;
      d.x += (d.cx - d.x) * alpha;
    };
  };

  var simulation = d3.forceSimulation()
                     .force("link", d3.forceLink().id(function(d){
                       return d.id;
                     }).strength(3))
                     .force("center", d3.forceCenter(width/2, height/2))
                     .alphaMin(0.0001);

  node_r.domain(d3.extent(nodes, function(d) { return d.tot_original; }));

  svg.append("defs")
     .append("marker")
     .attr("id", "out")
     .attr("viewBox", "0 , -5, 10, 10")
     .attr("refX", 23)
     .attr("refY", 0)
     .attr("markerWidth", 7)
     .attr("markerHeight", 15)
     .attr("orient", "auto")
     .append("path")
     .attr("d", "M0,-5L10,0L0,5");

  svg.append("defs")
     .append("marker")
     .attr("id", "in")
     .attr("viewBox", "0, -5, 10, 10")
     .attr("refX", 23)
     .attr("refY", 0)
     .attr("markerWidth", 7)
     .attr("markerHeight", 15)
     .attr("orient", "auto")
     .append("path")
     .attr("d", "M0,-5L10,0L0,5")
     .attr("fill", "rgb(218,41,28)");

  var defs = svg.append("defs");

  var filter = defs.append("filter")
                   .attr("id", "drop-shadow")
                   .attr("height", "130%");

  // SourceAlpha refers to opacity of graphic that this filter will be applied to
  // convolve that with a Gaussian with standard deviation 3 and store result
  // in blur

  filter.append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 5)
      .attr("result", "blur");

  // translate output of Gaussian blur to the right and downwards with 2px
  // store result in offsetBlur

  filter.append("feOffset")
      .attr("in", "blur")
      .attr("dx", 5)
      .attr("dy", 5)
      .attr("result", "offsetBlur");

  // overlay original SourceGraphic over translated blurred opacity by using
  // feMerge filter. Order of specifying inputs is important!
  var feMerge = filter.append("feMerge");

  feMerge.append("feMergeNode")
      .attr("in", "offsetBlur")
  feMerge.append("feMergeNode")
      .attr("in", "SourceGraphic");

  var link = svg.append("g")
                 .attr("class", "links")
                 .selectAll("line")
                 .data(links)
                 .enter()
                 .append("line");

  var node = svg.append("g")
                .selectAll("circle")
                .data(nodes)
                .enter()
                .append("circle")
                .attr("class", function(d) {
                  return "nodes" + " _" + d.in_out;
                })
                .attr("r", function(d) {
                  // if (d.type === "non-profit") { return d.radius; }
                  return d.radius;
                  // if (d.type === "faculty") { return d.radius * 2; }
                })
                .attr("fill", function(d) {
                  return color_node(d.type);
                })
                .style("stroke-opacity", 0.9);

   node.append("title")
       .text(function(d) {
         return d.label;
       });

   node.on("mouseover", function(d) { mouseevent(d, "mouseover"); })
       .on("click", function(d) { mouseevent2(d); });


   svg.on("mouseover", function(d) { d3.select(this).style("cursor", "pointer"); });

   link.attr("stroke", "rgb(208,211,212)")
       .style("stroke-opacity", 0.3);

   simulation.nodes(nodes).on("tick", ticked);

   simulation.force("link").links(links);

   function ticked() {

     node.attr("cx", function(d) {
           return (position[d.id].x );
         })
         .attr("cy", function(d) {
           return (position[d.id].y );
         })
         .attr("id", function(d) {
           return "_" + (d.id);
         });

     link.attr("x1", function(d) {
       return position[d.source.id].x;
     })
     .attr("y1", function(d) {
       return position[d.source.id].y;
     })
     .attr("x2", function(d) {
       return position[d.target.id].x;
     })
     .attr("y2", function(d) {
       return position[d.target.id].y;
     })
     .attr("class", function(d) {
       return ("from"+d.source.id+" to"+d.target.id);
     });

   }

    var rect = svg.append("g");

    rect.append("rect")
        .attr("x", -1000)
        .attr("y", 700)
        .attr("rx", 20)
        .attr("ry", 20)
        .attr("width", "200px")
        .attr("height", "100px")
        .attr("fill", "steelblue")
        .style("filter", "url(#drop-shadow)");

    rect.append("text").text("reset").style("fill", "#fff").style("font-size", "46px")
        .attr("x", function(d) {
          var textSelection = d3.selectAll("text");
          var textLength = textSelection._groups[0][textSelection._groups[0].length-1].getComputedTextLength();
          return (-1006 + (textLength/2));   })
        .attr("y", 760);

    rect.on('click', function() {
      mouseevent3();
    });

   function cluster(alpha) {
     return function(d) {
       var cluster = clusters[d.cluster];
       if (cluster === d) return;
       var x = d.x - cluster.x,
           y = d.y - cluster.y,
           l = Math.sqrt(x*x + y*y),
           r = d.radius + cluster.radius;

       if (l !== r) {
         l = (l-r) / l* alpha;
         d.x -= x *= l;
         d.y -= y *= l;
         cluster.x += x;
         cluster.y += y;
       }
     };
   }

   function dragstarted(d) {
     if (!d3.event.active) simulation.alphaTarget(0.3).restart();
     d.fx = d.x;
     d.fx = d.y;
   }

   function dragged(d) {
     d.fx = d3.event.x;
     d.fy = d3.event.y;
   }

   function dragended(d) {
     if (!d3.event.active) simulation.alphaTarget(0);
     d.fx = null;
     d.fy = null;
   }

   function mouseevent(d, event) {

     var line_out_color = (event === "mouseover") ? "rgb(61, 65, 66)" : "rgb(208, 211, 212)",
         line_in_color = (event === "mouseover") ? "rgb(218, 41, 28)" : "rgb(208, 211, 212)",
         line_opacity = (event === "mouseover") ? 1: 0.3,
         line_stroke_out = (event === "mouseover") ? 2 : 1,
         dot_self_color = (event === "mouesover") ? "rgb(218, 41, 28)" : "#fff",
         dot_other_color = (event === "mouseover") ? "black" : "#fff",
         dot_selected_opacity = 1,
         dot_other_opacity = (event === "mouseover") ? 0.1 : 1,
         dot_self_stroke_width = (event === "mouseover") ? 2 : 1;

    d3.selectAll("circle.nodes").attr("r", function(e) {

      return e.radius;

    }).style("stroke", "#fff").style("stroke-width", dot_self_stroke_width);

    d3.selectAll("line").attr("marker-end", "none").style("stroke", "rgb(208,211,212)").style("stroke-opacity", 0.3);

    d3.selectAll("text.background-text").style("fill", "rgb(208,211,212)").style("stroke","rgb(208,211,212)");

    d3.selectAll("line.to" + d.id).each(function(e) {

      // console.log("in", e);

      e.type = "in";

      })
      .attr("marker-end", function(e) {
        return (event === "mouseover") ? "url(#"+e.type+")" : "none";
      })
      .style("stroke", line_in_color)
      .transition()
      .duration(500)
      .style("stroke-opacity", line_opacity);

    d3.selectAll("line.from"+d.id).each(function(e) {

      // console.log("out", e);

      e.type = "out";

      })
      .attr("marker-end", function(e) {
        return (event === "mouseover") ? "url(#"+e.type+")" : "none";
      })
      .style("stoke", line_out_color)
      .style("stroke-width", line_stroke_out)
      .transition()
      .duration(500)
      .style("stroke-opacity", line_opacity);

    d3.selectAll("circle.nodes").transition().style("opacity", dot_other_opacity);

    d3.selectAll("circle#_" + d.id)
      .style("stroke", dot_self_color)
      .transition()
      .duration(800)
      .attr("r", function(e) {
        return (event === "mouseover") ? node_r(e.highlight_mode) : node_r(e.normal_mode)
      })
      .style("opacity", dot_selected_opacity)
      .style("stroke-width", dot_self_stroke_width);

      d3.selectAll("line.from" + d.id).filter(function(e) {
        return e.target.id !== e.source.id
      }).each(function(e) {
        if (event === "mouseover") {
            d3.select("circle#_"+e.target.id)
            .style("stroke", dot_other_color)
            .attr("r", function(e1) {
              return (event === "mouseover") ? node_r(e.count) : e1.radius
            })
            .each(function(e1) {
              e1.select_radius = d3.select(this).attr("r");
            })
            .transition()
            .duration(300)
            .style("opacity", dot_selected_opacity);
        } else {
          d3.select("circle#_"+e.target.id)
            .attr("r", function(e1) {
              return e1.radius
            })
            .style("stroke", dot_other_color)
            .style("opacity", dot_selected_opacity);
        }
      });

      d3.selectAll("line.to"+d.id).filter(function(e) {
        return e.target.id !== e.source.id
      }).each(function(e) {
        d3.select("circle#_"+e.source.id)
          .attr("r", function(e1) {
            return (event === "mouseover") ? node_r(e.count) : e1.radius
          })
          .each(function(e1) {
            e1.select_radius = d3.select(this).attr("r");
          })
          .style("stroke", dot_other_color)
          .transition()
          .duration(300)
          .style("opacity", dot_selected_opacity);
      });

   }

   function mouseevent2(d) {

     node.attr('pointer-events', 'none');

     var line_out_color = "rgb(61, 65, 66)",
         line_in_color = "rgb(218, 41, 28)",
         line_opacity = 1,
         line_stroke_out = 2,
         dot_self_color = "rgb(218, 41, 28)",
         dot_other_color = "black",
         dot_selected_opacity = 1,
         dot_other_opacity = 0.1,
         dot_self_stroke_width = 2;

    d3.selectAll("circle.nodes").attr("r", function(e) {

      return e.radius;

    }).style("stroke", "#fff").style("stroke-width", dot_self_stroke_width);

    d3.selectAll("line").attr("marker-end", "none").style("stroke", "rgb(208,211,212)").style("stroke-opacity", 0.3);

    d3.selectAll("text.background-text").style("fill", "rgb(208,211,212)").style("stroke","rgb(208,211,212)");

    d3.selectAll("line.to" + d.id).each(function(e) {

      // console.log("in", e);
      // console.log(e.source.id);

      e.type = "in";

      var cx = d3.selectAll("#_"+e.source.id).attr("cx");
      var cy = d3.selectAll("#_"+e.source.id).attr("cy");

      svg.append("g").append("text").attr("class","labels").text(e.source.label).attr("x", cx).attr("y", cy).style("font-size","23px").style("fill", "black");

      // console.log(d3.selectAll("#_"+e.source.id).attr("cx"));

      })
      .attr("marker-end", function(e) {
        return "url(#"+e.type+")";
      })
      .style("stroke", line_in_color)
      .transition()
      .duration(500)
      .style("stroke-opacity", line_opacity);

    d3.selectAll("line.from"+d.id).each(function(e) {

      console.log("out", e);
      console.log(e.target.id);

      var cx = d3.selectAll("#_"+e.target.id).attr("cx");
      var cy = d3.selectAll("#_"+e.target.id).attr("cy");

      console.log(cx);

      svg.append("g").append("text").attr("class", "labels").text(e.target.label).attr("dx", cx).attr("dy", cy).style("font-size", "23px").style("fill", "black");

      e.type = "out";

      })
      .attr("marker-end", function(e) {
        return "url(#"+e.type+")";
      })
      .style("stoke", line_out_color)
      .style("stroke-width", line_stroke_out)
      .transition()
      .duration(500)
      .style("stroke-opacity", line_opacity);

    d3.selectAll("circle.nodes").transition().style("opacity", dot_other_opacity);

    d3.selectAll("circle#_" + d.id)
      .style("stroke", dot_self_color)
      .transition()
      .duration(800)
      .attr("r", function(e) {
        return node_r(e.highlight_mode);
      })
      .each(function(d) {

        console.log("this is d", d);
        console.log(d.id);

      })
      .style("opacity", dot_selected_opacity)
      .style("stroke-width", dot_self_stroke_width);

      d3.selectAll("line.from" + d.id).filter(function(e) {
        return e.target.id !== e.source.id
      }).each(function(e) {
            d3.select("circle#_"+e.target.id)
            .style("stroke", dot_other_color)
            .attr("r", function(e1) {
              return node_r(e.count);
            })
            .each(function(e1) {
              e1.select_radius = d3.select(this).attr("r");
            })
            .transition()
            .duration(300)
            .style("opacity", dot_selected_opacity);
      });

      d3.selectAll("line.to"+d.id).filter(function(e) {
        return e.target.id !== e.source.id
      }).each(function(e) {
        d3.select("circle#_"+e.source.id)
          .attr("r", function(e1) {
            return node_r(e.count);
          })
          .each(function(e1) {
            e1.select_radius = d3.select(this).attr("r");
          })
          .style("stroke", dot_other_color)
          .transition()
          .duration(300)
          .style("opacity", dot_selected_opacity);
      });

   }

   function mouseevent3() {

     node.attr('pointer-events', 'all');

     var line_out_color = "rgb(208, 211, 212)",
         line_in_color = "rgb(208, 211, 212)",
         line_opacity = 0.3,
         line_stroke_out = 1,
         dot_self_color = "#fff",
         dot_other_color = "#fff",
         dot_selected_opacity = 1,
         dot_other_opacity = 1,
         dot_self_stroke_width = 1;

    d3.selectAll("circle.nodes").attr("r", function(e) {

      return e.radius;

    }).style("stroke", "#fff").style("stroke-width", dot_self_stroke_width);

    d3.selectAll("line").attr("marker-end", "none").style("stroke", "rgb(208,211,212)").style("stroke-opacity", line_opacity).style("stroke-width", line_stroke_out);

    d3.selectAll("text.background-text").style("fill", "rgb(208,211,212)").style("stroke","rgb(208,211,212)");

    d3.selectAll("line.to").style("stroke", "rgb(208,211,212)").style("stroke-opacity", 0);

    d3.selectAll("circle.nodes").transition().style("opacity", dot_other_opacity);

   }

};
