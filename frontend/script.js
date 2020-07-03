d3.json("./json/foodLanding.json").then(function(data) {
  network(data);
});

function network(data) {

  var nodes = data.nodes;

  var links = data.links;

  var position = data.position;

  var pattern = data.pattern;

  var width = 800;
  var height = 700;
  var hl_r = 8;
  var reg_r = 5;

  var color_node = d3.scaleOrdinal().domain(["faculty","non-profit"])
        .range(['rgb(72,169,197)', 'rgb(117,102,160)',]);

  var svg = d3.select("svg");

  var config = {
    "size": 200
  };

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

  pattern.forEach(function(faculty) {
    defs.append("svg:pattern")
        .attr("id", faculty["name"])
        .attr("width", config.size)
        .attr("height", config.size)
        .attr("x", -125)
        .attr("y", 0)
        .attr("patternUnits", "userSpaceOnUse")
        .append("svg:image")
        .attr("xlink:href", "./faculty/"+faculty["name"]+".jpg")
        .attr("width", config.size)
        .attr("height", config.size)
        .attr("x", 0)
        .attr("y", 0)
  });

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
                  return d.radius;
                })
                .attr("fill", function(d) {
                  if (d.type === "faculty") {
                    var patternName = d.label.split(" ")[0].toLowerCase();
                    return "url(#"+patternName+")";
                  }
                  if (d.type === "non-profit") {
                    return color_node(d.type);
                  }
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
           return (position[d.id].x);
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
        .attr("x", -2200)
        .attr("y", 850)
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
          return (-2204 + (textLength/2));   })
        .attr("y", 910);

    rect.on('click', function() {
      mouseevent3();
    });

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
        return e.radius;
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
              return e1.radius;
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
              return e1.radius;
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
            return e1.radius;
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

      e.type = "in";

      var cx = d3.selectAll("#_"+e.source.id).attr("cx");
      var cy = d3.selectAll("#_"+e.source.id).attr("cy");

      svg.append("g").append("text").attr("class","labels").text(e.source.label).attr("x", cx).attr("y", cy);

      })
      .attr("marker-end", function(e) {
        return "url(#"+e.type+")";
      })
      .style("stroke", line_in_color)
      .transition()
      .duration(500)
      .style("stroke-opacity", line_opacity);

    d3.selectAll("line.from"+d.id).each(function(e) {

      var cx = d3.selectAll("#_"+e.target.id).attr("cx");
      var cy = d3.selectAll("#_"+e.target.id).attr("cy");

      svg.append("g").append("text").attr("class", "labels").text(e.target.label).attr("dx", cx).attr("dy", cy);

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
        return e.radius;
      })
      .style("opacity", dot_selected_opacity)
      .style("stroke-width", dot_self_stroke_width);

      d3.selectAll("line.from" + d.id).filter(function(e) {
        return e.target.id !== e.source.id
      }).each(function(e) {
            d3.select("circle#_"+e.target.id)
            .style("stroke", dot_other_color)
            .attr("r", function(e1) {
              return e1.radius;
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
            return e1.radius;
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

     svg.selectAll("text.labels").remove();

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
