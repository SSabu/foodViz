d3.json("./json/foodLanding.json").then(function(data) {
  network(data);
});

d3.json("./json/foodFac.json").then(function(data) {
  network1(data);
});

d3.json("./json/foodOrg.json").then(function(data) {
  network2(data);
});

function network(data) {

  var nodes = data.nodes;

  var links = data.links;

  var position = data.position;

  var pattern = data.pattern;

  var agNodes = [];
  var ag = data.filters.agriculture.matched;
  var agUnmatched = data.filters.agriculture.unmatched;

  var nutNodes = [];
  var nut = data.filters.nutrition.matched;
  var nutUnmatched = data.filters.nutrition.unmatched;

  var polNodes = [];
  var pol = data.filters.policy.matched;
  var polUnmatched = data.filters.policy.unmatched;

  var envNodes = [];
  var env = data.filters.environment.matched;
  var envUnmatched = data.filters.environment.unmatched;

  nodes.forEach(function(node) {

    ag.forEach(function(id) {
      if (id === node.id) {
        agNodes.push(node);
      }
    });

    nut.forEach(function(id) {
      if (id === node.id) {
        nutNodes.push(node);
      }
    });

    pol.forEach(function(id) {
      if (id === node.id) {
        polNodes.push(node);
      }
    })

    env.forEach(function(id) {
      if (id === node.id) {
        envNodes.push(node);
      }
    })
  });

  var width = 800;
  var height = 700;
  var hl_r = 8;
  var reg_r = 5;

  var color_node = d3.scaleOrdinal().domain(["faculty","non-profit"])
        .range(['rgb(72,169,197)', 'rgb(117,102,160)',]);

  var svg = d3.select("#network svg");

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

  // svg.append("defs")
  //    .append("marker")
  //    .attr("id", "out")
  //    .attr("viewBox", "0 , -5, 10, 10")
  //    .attr("refX", 23)
  //    .attr("refY", 0)
  //    .attr("markerWidth", 7)
  //    .attr("markerHeight", 15)
  //    .attr("orient", "auto")
  //    .append("path")
  //    .attr("d", "M0,-5L10,0L0,5");
  //
  // svg.append("defs")
  //    .append("marker")
  //    .attr("id", "in")
  //    .attr("viewBox", "0, -5, 10, 10")
  //    .attr("refX", 23)
  //    .attr("refY", 0)
  //    .attr("markerWidth", 7)
  //    .attr("markerHeight", 15)
  //    .attr("orient", "auto")
  //    .append("path")
  //    .attr("d", "M0,-5L10,0L0,5")
  //    .attr("fill", "rgb(218,41,28)");

  var defs = svg.append("defs");

  var filter = defs.append("filter")
                   .attr("id", "drop-shadow")
                   .attr("height", "130%");

  filter.append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 5)
      .attr("result", "blur");

  filter.append("feOffset")
      .attr("in", "blur")
      .attr("dx", 5)
      .attr("dy", 5)
      .attr("result", "offsetBlur");

  var feMerge = filter.append("feMerge");

  feMerge.append("feMergeNode")
      .attr("in", "offsetBlur")

  feMerge.append("feMergeNode")
      .attr("in", "SourceGraphic");

  var filter1 = defs.append("filter")
                    .attr("id","glow");

  filter1.append("feGaussianBlur")
         .attr("in", "SourceAlpha")
         .attr("stdDeviation","8")
         .attr("result","coloredBlur");

  filter1.append("feOffset")
         .attr("in", "blur")
         .attr("dx", 0)
         .attr("dy", 0)
         .attr("result", "offsetBlur");

  var feMerge1 = filter1.append("feMerge");

  feMerge1.append("feMergeNode")
          .attr("in","coloredBlur");

  feMerge1.append("feMergeNode")
          .attr("in","SourceGraphic");

  pattern.forEach(function(faculty) {
    defs.append("svg:pattern")
        .attr("id", faculty["name"])
        .attr("width", config.size)
        .attr("height", config.size)
        .attr("x", -125)
        .attr("y", 15)
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
                  if (d.type === "faculty") {   return "nodes" + " _" + d.in_out + " faculty"; }
                  if (d.type === "non-profit") {   return "nodes" + " _" + d.in_out + " nonProfit"; }
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
       .on("mouseout", function(d) { mouseevent(d, "mouseout"); })
       .on("click", function(d) { mouseevent2(d); });

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
        .attr("x", -2400)
        .attr("y", 830)
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
          return (-2403 + (textLength/2));   })
        .attr("y", 895);

    rect.on("mouseover", function(d) { d3.select(this).style("cursor", "pointer")})
        .on('click', function() { mouseevent3(); });

    var legend = svg.append("g");

    legend.append("rect")
          .attr("x", 2100)
          .attr("y", 800)
          .attr("width", "400px")
          .attr("height", "200px")
          .style("fill", "none")
          .style("stroke", "black")
          .style("stroke-width", 0.75);

    legend.append("circle")
          .attr("cx", 2150)
          .attr("cy", 900)
          .attr("r", 20)
          .attr("fill", color_node("non-profit"));

    legend.append("text")
          .text("Non-Profit")
          .style("fill", "black")
          .style("font-size", "48px")
          .attr("x", 2200)
          .attr("y", 910);

    var buttonRow = svg.append("g").on("mouseover", function(d) { d3.select(this).style("cursor", "pointer")});

    buttonRow.append("rect")
             .attr("x", -1150)
             .attr("y", -1150)
             .attr("width", "3000px")
             .attr("height", "100px")
             .attr("fill", "white")
             .style("filter", "url(#glow)");

    var buttonOne = buttonRow.append("g");

    buttonOne.append("rect")
             .attr("x", -1150)
             .attr("y", -1150)
             .attr("width", "750px")
             .attr("height", "100px")
             .attr("fill", "white")
             .attr("stroke", "black")
             .attr("stroke-width", "1px");

    buttonOne.append("text")
             .text("Agribusiness & Agriculture")
             .style("fill", "#000")
             .style("font-size", "44px")
             .attr("font-family", "Monospace")
             .attr("x", -1090)
             .attr("y", -1090);

    var buttonTwo = buttonRow.append("g");

    buttonTwo.append("rect")
             .attr("x", -400)
             .attr("y", -1150)
             .attr("width", "750px")
             .attr("height", "100px")
             .attr("fill", "white")
             .attr("stroke", "black")
             .attr("stroke-width", "1px");

    buttonTwo.append("text")
               .text("Environmental Resilience")
               .style("fill", "#000")
               .style("font-size", "44px")
               .attr("font-family", "Monospace")
               .attr("x", -345)
               .attr("y", -1090);

    var buttonThree = buttonRow.append("g");

    buttonThree.append("rect")
               .attr("x", 350)
               .attr("y", -1150)
               .attr("width", "750px")
               .attr("height", "100px")
               .attr("fill", "white")
               .attr("stroke", "black")
               .attr("stroke-width", "1px");

    buttonThree.append("text")
             .text("Nutrition & Health")
             .style("fill", "#000")
             .style("font-size", "44px")
             .attr("font-family", "Monospace")
             .attr("x", 450)
             .attr("y", -1090);

    var buttonFour = buttonRow.append("g");

    buttonFour.append("rect")
              .attr("x", 1100)
              .attr("y", -1150)
              .attr("width", "750px")
              .attr("height", "100px")
              .attr("fill", "white")
              .attr("stroke", "black")
              .attr("stroke-width", "1px");

    buttonFour.append("text")
             .text("Policy, Justice, & Culture")
             .style("fill", "#000")
             .style("font-size", "44px")
             .attr("font-family", "Monospace")
             .attr("x", 1170)
             .attr("y", -1090);

    buttonOne.on('click', function() {
      mouseevent4(agNodes, agUnmatched);
    });

    buttonTwo.on("click", function() {
      mouseevent4(envNodes, envUnmatched);
    });

    buttonThree.on("click", function() {
      mouseevent4(nutNodes, nutUnmatched);
    });

    buttonFour.on("click", function() {
      mouseevent4(polNodes, polUnmatched);
    });

   function mouseevent(d, event) {

     var line_out_color = (event === "mouseover") ? "rgb(61, 65, 66)" : "rgb(208, 211, 212)",
         line_in_color = (event === "mouseover") ? "rgb(218, 41, 28)" : "rgb(208, 211, 212)",
         line_opacity = (event === "mouseover") ? 1: 0.3,
         line_stroke_out = (event === "mouseover") ? 3 : 1,
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
      // .attr("marker-end", function(e) {
      //   return "url(#"+e.type+")";
      // })
      .style("stroke", line_in_color)
      .transition()
      .duration(500)
      .style("stroke-opacity", line_opacity);

    d3.selectAll("line.from"+d.id).each(function(e) {
      e.type = "out";
      })
      // .attr("marker-end", function(e) {
      //   return "url(#"+e.type+")";
      // })
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
        if (event === "mouseover") {
          if (e.type === "non-profit") { return e.radius; }
          if (e.type === "faculty") { return 1.25 * e.radius; }
        } else {
          return e.radius;
        }
      })
      .style("opacity", dot_selected_opacity)
      .style("stroke-width", function(d) {
        if (event === "mouseover") {
          return 6;
        } else {
          return 1;
        }
      })
      .style("stroke", "black");

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
              // console.log(e1);
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

     node.on("mouseout", function() { return; })
         .on("mouseover", function() { return; });

     var line_out_color = "rgb(61, 65, 66)",
         line_in_color = "rgb(218, 41, 28)",
         line_opacity = 1,
         line_stroke_out = 3,
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

      })
      // .attr("marker-end", function(e) {
      //   return "url(#"+e.type+")";
      // })
      .style("stroke", line_in_color)
      .transition()
      .duration(500)
      .style("stroke-opacity", line_opacity);

    d3.selectAll("line.from"+d.id).each(function(e) {

      e.type = "out";

      })
      // .attr("marker-end", function(e) {
      //   return "url(#"+e.type+")";
      // })
      .style("stoke", line_out_color)
      .style("stroke-width", line_stroke_out)
      .transition()
      .duration(500)
      .style("stroke-opacity", line_opacity);

    d3.selectAll("circle#_" + d.id)
      .each(function(e) {
        if (e.type === "faculty") {
          d3.select("circle#_"+e.id)
            .style("stroke", dot_self_color)
            .attr("r", function(e) { return 1.25*e.radius; })
            .style("opacity", 1)
            .style("stroke-width", 6)
            .style("stroke", "black");
        }
        if (e.type === "non-profit") {
          d3.select("circle#_"+e.id)
            .style("stroke", dot_self_color)
            .transition()
            .duration(800)
            .attr("r", function(e) { return e.radius; })
            .style("opacity", 1)
            .style("stroke-width", 6)
            .style("stroke", "black");
        }
      });

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
          return 1.25*e1.radius;
        })
        .each(function(e1) {
          e1.select_radius = d3.select(this).attr("r");
        })
        .style("stroke", dot_other_color)
        .style("stroke-width", 6)
        .transition()
        .duration(300)
        .style("opacity", dot_selected_opacity);
    });

   }

   function mouseevent3() {

     node.attr('pointer-events', 'all');

     node.on("mouseover", function(d) { mouseevent(d, "mouseover"); })
         .on("mouseout", function(d) { mouseevent(d, "mouseout"); })
         .on("click", function(d) { mouseevent2(d); });

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

   function mouseevent4(nodeArray, idUnmatched) {

     node.on("mouseout", function() { return; })
         .on("mouseover", function() { return; });

     var line_out_color = "rgb(61, 65, 66)",
         line_in_color = "rgb(218, 41, 28)",
         line_opacity = 1,
         line_stroke_out = 3,
         dot_self_color = "rgb(218, 41, 28)",
         dot_other_color = "black",
         dot_selected_opacity = 1,
         dot_other_opacity = 0.1,
         dot_self_stroke_width = 2;

    nodeArray.forEach(function(d) {

      d3.selectAll("line").attr("marker-end", "none").style("stroke", "rgb(208,211,212)").style("stroke-opacity", 0.3);

      d3.selectAll("text.background-text").style("fill", "rgb(208,211,212)").style("stroke","rgb(208,211,212)");

      d3.selectAll("line.to" + d.id).each(function(e) {

        e.type = "in";

      })
      // .attr("marker-end", function(e) {
      //   return "url(#"+e.type+")";
      // })
      .style("stroke", line_in_color)
      .transition()
      .duration(500)
      .style("stroke-opacity", line_opacity);

      d3.selectAll("line.from"+d.id).each(function(e) {

        e.type = "out";

      })
      // .attr("marker-end", function(e) {
      //   return "url(#"+e.type+")";
      // })
      .style("stoke", line_out_color)
      .style("stroke-width", line_stroke_out)
      .transition()
      .duration(500)
      .style("stroke-opacity", line_opacity);

      d3.selectAll("circle#_" + d.id)
        .each(function(e) {
          if (e.type === "faculty") {
            d3.select("circle#_"+e.id)
              .style("stroke", dot_self_color)
              .attr("r", function(e) { return 1.25*e.radius; })
              .style("opacity", 1)
              .style("stroke-width", 6)
              .style("stroke", "black");
          }
          if (e.type === "non-profit") {
            d3.select("circle#_"+e.id)
              .style("stroke", dot_self_color)
              .transition()
              .duration(800)
              .attr("r", function(e) { return e.radius; })
              .style("opacity", 1)
              .style("stroke-width", 6)
              .style("stroke", "black");
          }
        });

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

    });

    idUnmatched.forEach(function(id) {
      d3.select("circle#_"+id).transition().style("opacity", dot_other_opacity);
    })

   }

};

function network1(data) {

  var nodes = data.nodes;

  var links = data.links;

  var position = data.position;

  var pattern = data.pattern;

  var labels = data.dropdown.facultyLabel;

  var linkages = Array.from(new Array(10), (x,i) => i+2);

  var weight2 = data.linkage_filters.weight2;

  var weight3 = data.linkage_filters.weight3;

  var weight4 = data.linkage_filters.weight4;

  var weight5 = data.linkage_filters.weight5;

  var weight6 = data.linkage_filters.weight6;

  var weight7 = data.linkage_filters.weight7;

  var weight8 = data.linkage_filters.weight8;

  var weight9 = data.linkage_filters.weight9;

  var weight10 = data.linkage_filters.weight10;

  var weight11 = data.linkage_filters.weight11;

  var nodesWeight2 = [];

  var nodesWeight3 = [];

  var nodesWeight4 = [];

  var nodesWeight5 = [];

  var nodesWeight6 = [];

  var nodesWeight7 = [];

  var nodesWeight8 = [];

  var nodesWeight9 = [];

  var nodesWeight10 = [];

  var nodesWeight11 = [];

  nodes.forEach(function(node) {

    weight2.matched.forEach(function(id) {
      if (node.id === id) {
        nodesWeight2.push(node);
      }
    });

    weight3.matched.forEach(function(id) {
      if (node.id === id) {
        nodesWeight3.push(node);
      }
    });

    weight4.matched.forEach(function(id) {
      if (node.id === id) {
        nodesWeight4.push(node);
      }
    });

    weight5.matched.forEach(function(id) {
      if (node.id === id) {
        nodesWeight5.push(node);
      }
    });

    weight6.matched.forEach(function(id) {
      if (node.id === id) {
        nodesWeight6.push(node);
      }
    });

    weight7.matched.forEach(function(id) {
      if (node.id === id) {
        nodesWeight7.push(node);
      }
    });

    weight8.matched.forEach(function(id) {
      if (node.id === id) {
        nodesWeight8.push(node);
      }
    });

    weight9.matched.forEach(function(id) {
      if (node.id === id) {
        nodesWeight9.push(node);
      }
    });

    weight10.matched.forEach(function(id) {
      if (node.id === id) {
        nodesWeight10.push(node);
      }
    });

    weight11.matched.forEach(function(id) {
      if (node.id === id) {
        nodesWeight11.push(node);
      }
    });

  });

  $(document).ready(function() {

    $('.select2-Fac').select2({
      placeholder : { id:'0', text:'Please select a faculty member...'}
    });

    $('.select2-Fac-Links').select2({
      placeholder : { id:'0', text:'Please select an edge weight...'}
    });

  });

  labels.forEach(function(option) {
    $(".select2-Fac").append(`<option value=${option.id}>${option.value}</option>`);
  });

  linkages.forEach(function(id) {
    $(".select2-Fac-Links").append(`<option value=${id}>${id}</option>`);
  });

  $(".select2-Fac").on("select2:select select2:unselecting", function() {

    var value = $(".select2-Fac").select2().val();

    var selection = nodes.filter(function(node) {
      return node.id === value;
    });

    var data = mouseevent2(selection[0]);
    createTable(data);

  });

  $(".select2-Fac-Links").on("select2:select select2:unselecting", function() {

    var value = $(".select2-Fac-Links").select2().val();

    if (value === "2") {
      var data2 = mouseevent4(nodesWeight2, weight2.unmatched, 2);
      createTable(data2);
    }

    if (value === "3") {
      var data3 = mouseevent4(nodesWeight3, weight3.unmatched, 3);
      createTable(data3);
    }

    if (value === "4") {
      var data4 = mouseevent4(nodesWeight4, weight4.unmatched, 4);
      createTable(data4);
    }

    if (value === "5") {
      var data5 = mouseevent4(nodesWeight5, weight5.unmatched, 5);
      createTable(data5);
    }

    if (value === "6") {
      var data6 = mouseevent4(nodesWeight6, weight6.unmatched, 6);
      createTable(data6);
    }

    if (value === "7") {
      var data7 = mouseevent4(nodesWeight7, weight7.unmatched, 7);
      createTable(data7);
    }

    if (value === "8") {
      var data8 = mouseevent4(nodesWeight8, weight8.unmatched, 8);
      createTable(data8);
    }

    if (value === "9") {
      var data9 = mouseevent4(nodesWeight9, weight9.unmatched, 9);
      createTable(data9);
    }

    if (value === "10") {
      var data10 = mouseevent4(nodesWeight10, weight10.unmatched, 10);
      createTable(data10);
    }

    if (value === "11") {
      var data11 = mouseevent4(nodesWeight11, weight11.unmatched, 11);
      createTable(data11);
    }

  });

  var width = 800;
  var height = 700;
  var hl_r = 8;
  var reg_r = 5;

  var color_node = d3.scaleOrdinal().domain(["faculty","non-profit"])
        .range(['rgb(72,169,197)', 'rgb(117,102,160)',]);

  var svg = d3.select("#network1 svg");

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

  // svg.append("defs")
  //    .append("marker")
  //    .attr("id", "out_1")
  //    .attr("viewBox", "0 , -5, 10, 10")
  //    .attr("refX", 23)
  //    .attr("refY", 0)
  //    .attr("markerWidth", 7)
  //    .attr("markerHeight", 15)
  //    .attr("orient", "auto")
  //    .append("path")
  //    .attr("d", "M0,-5L10,0L0,5");
  //
  // svg.append("defs")
  //    .append("marker")
  //    .attr("id", "in_1")
  //    .attr("viewBox", "0, -5, 10, 10")
  //    .attr("refX", 23)
  //    .attr("refY", 0)
  //    .attr("markerWidth", 7)
  //    .attr("markerHeight", 15)
  //    .attr("orient", "auto")
  //    .append("path")
  //    .attr("d", "M0,-5L10,0L0,5")
  //    .attr("fill", "rgb(218,41,28)");

  var defs = svg.append("defs");

  var filter = defs.append("filter")
                   .attr("id", "drop-shadow_1")
                   .attr("height", "130%");

  filter.append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 5)
      .attr("result", "blur");

  filter.append("feOffset")
      .attr("in", "blur")
      .attr("dx", 5)
      .attr("dy", 5)
      .attr("result", "offsetBlur");

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
                  if (d.type === "faculty") {   return "nodes" + " _" + d.in_out + " faculty"; }
                  if (d.type === "non-profit") {   return "nodes" + " _" + d.in_out + " nonProfit"; }
                })
                .attr("r", function(d) {
                  return d.radius;
                })
                .attr("fill", function(d) {
                  return color_node(d.type);
                })
                .style("stroke-opacity", 0.9);

   node.append("title")
       .text(function(d) {
         return d.label;
       });

   svg.selectAll(".faculty").on("mouseover", function(d) { mouseevent(d, "mouseover"); })
                            .on("mouseout", function(d) { mouseevent(d, "mouseout")})
                            .on("click", function(d) { mouseevent2(d); });

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
           return "_" + (d.id)+"_1";
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
       return ("from"+d.source.id+" to"+d.target.id + " weight"+d.weight);
     });

   }

    var rect = svg.append("g");

    rect.append("rect")
        .attr("x", -2400)
        .attr("y", 830)
        .attr("rx", 20)
        .attr("ry", 20)
        .attr("width", "200px")
        .attr("height", "100px")
        .attr("fill", "steelblue")
        .style("filter", "url(#drop-shadow_1)");

    rect.append("text").text("reset").style("fill", "#fff").style("font-size", "46px")
        .attr("x", function(d) {
          var textSelection = d3.selectAll("text");
          var textLength = textSelection._groups[0][textSelection._groups[0].length-1].getComputedTextLength();
          return (-2350 + (textLength/2));   })
        .attr("y", 892);

    rect.on("mouseover", function(d) { d3.select(this).style("cursor", "pointer")})
        .on('click', function() { mouseevent3(); });


    var legend = svg.append("g");

    legend.append("rect")
          .attr("x", -2410)
          .attr("y", -1100)
          .attr("width", "400px")
          .attr("height", "250px")
          .style("fill", "none")
          .style("stroke", "black")
          .style("stroke-width", 0.75);

    legend.append("circle")
          .attr("cx", -2360)
          .attr("cy", -1030)
          .attr("r", 20)
          .attr("fill", color_node("faculty"));

    legend.append("text")
          .text("Faculty")
          .style("fill", "black")
          .style("font-size", "48px")
          .attr("x", -2300)
          .attr("y", -1015);

    legend.append("circle")
          .attr("cx", -2360)
          .attr("cy", -920)
          .attr("r", 20)
          .attr("fill", color_node("non-profit"));

    legend.append("text")
          .text("Non-Profit")
          .style("fill", "black")
          .style("font-size", "48px")
          .attr("x", -2300)
          .attr("y", -905);

   function mouseevent(d, event) {

     var line_out_color = (event === "mouseover") ? "rgb(61, 65, 66)" : "rgb(208, 211, 212)",
         line_in_color = (event === "mouseover") ? "rgb(218, 41, 28)" : "rgb(208, 211, 212)",
         line_opacity = (event === "mouseover") ? 1: 0.3,
         line_stroke_out = (event === "mouseover") ? 3 : 1,
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
      // .attr("marker-end", function(e) {
      //   return "url(#"+e.type+"_1)";
      // })
      .style("stroke", line_in_color)
      .transition()
      .duration(500)
      .style("stroke-opacity", line_opacity);

    d3.selectAll("line.from"+d.id).each(function(e) {
      e.type = "out";
      })
      // .attr("marker-end", function(e) {
      //   return "url(#"+e.type+"_1)";
      // })
      .style("stoke", line_out_color)
      .style("stroke-width", line_stroke_out)
      .transition()
      .duration(500)
      .style("stroke-opacity", line_opacity);

    d3.selectAll("circle.nodes").transition().style("opacity", dot_other_opacity);

    d3.selectAll("circle#_" + d.id+"_1")
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
            d3.select("circle#_"+e.target.id+"_1")
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
          d3.select("circle#_"+e.target.id+"_1")
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
        d3.select("circle#_"+e.source.id+"_1")
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

     var tableData = [];

     node.on("mouseout", function() { return; })
         .on("mouseover", function() { return; });

     var line_out_color = "rgb(61, 65, 66)",
         line_in_color = "rgb(218, 41, 28)",
         line_opacity = 1,
         line_stroke_out = 3,
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

      })
      // .attr("marker-end", function(e) {
      //   return "url(#"+e.type+"_1)";
      // })
      .style("stroke", line_in_color)
      .transition()
      .duration(500)
      .style("stroke-opacity", line_opacity);

    d3.selectAll("line.from"+d.id).each(function(e) {

      if (tableData.indexOf(e) === -1) {
        tableData.push(e);
      }

      e.type = "out";

      })
      // .attr("marker-end", function(e) {
      //   return "url(#"+e.type+"_1)";
      // })
      .style("stoke", line_out_color)
      .style("stroke-width", line_stroke_out)
      .transition()
      .duration(500)
      .style("stroke-opacity", line_opacity);

    d3.selectAll("circle.nodes").transition().style("opacity", dot_other_opacity);

    d3.selectAll("circle#_" + d.id+"_1")
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
            d3.select("circle#_"+e.target.id+"_1")
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
        d3.select("circle#_"+e.source.id+"_1")
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

      return tableData;

   }

   function mouseevent3() {

     $("#tableF").empty();

     $('.select2-Fac').val([]);
     $(".select2-Fac").select2({
        placeholder:'Please select a faculty member...'
      });

    $('.select2-Fac-Links').val([]);
    $(".select2-Fac-Links").select2({
       placeholder:'Please select an edge weight...'
     });

     node.attr('pointer-events', 'all');

     node.on("mouseover", function(d) { mouseevent(d, "mouseover"); })
         .on("mouseout", function(d) { mouseevent(d, "mouseout"); })
         .on("click", function(d) { mouseevent2(d); });

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

   function mouseevent4(nodeArray, idUnmatched, weight) {

     var tableData = [];

     node.on("mouseout", function() { return; })
         .on("mouseover", function() { return; });

     var line_out_color = "rgb(61, 65, 66)",
         line_in_color = "rgb(218, 41, 28)",
         line_opacity = 1,
         line_stroke_out = 3,
         dot_self_color = "rgb(218, 41, 28)",
         dot_other_color = "black",
         dot_selected_opacity = 1,
         dot_other_opacity = 0.1,
         dot_self_stroke_width = 2;

    nodeArray.forEach(function(d) {

      d3.selectAll("circle.nodes").attr("r", function(e) {

        return e.radius;

      }).style("stroke", "#fff").style("stroke-width", dot_self_stroke_width);

      d3.selectAll("line").attr("marker-end", "none").style("stroke", "rgb(208,211,212)").style("stroke-opacity", 0.3);

      d3.selectAll("text.background-text").style("fill", "rgb(208,211,212)").style("stroke","rgb(208,211,212)");

      d3.selectAll("line.weight"+weight).each(function(e) {

        // console.log("out", e);

        if (tableData.indexOf(e) === -1) {
          tableData.push(e);
        }

        e.type = "out";

      })
      // .attr("marker-end", function(e) {
      //   return "url(#"+e.type+"_1)";
      // })
      .style("stoke", line_out_color)
      .style("stroke-width", line_stroke_out)
      .transition()
      .duration(500)
      .style("stroke-opacity", line_opacity);

      d3.selectAll("circle#_" + d.id +"_1")
      .style("stroke", dot_self_color)
      .transition()
      .duration(800)
      .attr("r", function(e) {
        return e.radius;
      })
      .style("opacity", dot_selected_opacity)
      .style("stroke-width", dot_self_stroke_width);

    });

    idUnmatched.forEach(function(id) {
      d3.select("circle#_"+id +"_1").transition().style("opacity", dot_other_opacity);
    });

    return tableData;

   }

   function mouseevent5(nodeArray, idUnmatched) {

     node.on("mouseout", function() { return; })
         .on("mouseover", function() { return; });

     var line_out_color = "rgb(61, 65, 66)",
         line_in_color = "rgb(218, 41, 28)",
         line_opacity = 1,
         line_stroke_out = 3,
         dot_self_color = "rgb(218, 41, 28)",
         dot_other_color = "black",
         dot_selected_opacity = 1,
         dot_other_opacity = 0.1,
         dot_self_stroke_width = 2;

    nodeArray.forEach(function(d) {

      d3.selectAll("circle.nodes").attr("r", function(e) {

        return e.radius;

      }).style("stroke", "#fff").style("stroke-width", dot_self_stroke_width);

      d3.selectAll("line").attr("marker-end", "none").style("stroke", "rgb(208,211,212)").style("stroke-opacity", 0.3);

      d3.selectAll("text.background-text").style("fill", "rgb(208,211,212)").style("stroke","rgb(208,211,212)");

      // d3.selectAll("line.weight"+weight).each(function(e) {
      //
      //   // console.log("out", e);
      //
      //   if (tableData.indexOf(e) === -1) {
      //     tableData.push(e);
      //   }
      //
      //   e.type = "out";
      //
      // })
      // .attr("marker-end", function(e) {
      //   return "url(#"+e.type+"_1)";
      // })
      // .style("stoke", line_out_color)
      // .style("stroke-width", line_stroke_out)
      // .transition()
      // .duration(500)
      // .style("stroke-opacity", line_opacity);

      d3.selectAll("circle#_" + d.id +"_1")
      .style("stroke", dot_self_color)
      .transition()
      .duration(800)
      .attr("r", function(e) {
        return e.radius;
      })
      .style("opacity", dot_selected_opacity)
      .style("stroke-width", dot_self_stroke_width);

    });

    idUnmatched.forEach(function(id) {
      d3.select("circle#_"+id +"_1").transition().style("opacity", dot_other_opacity);
    });

   }

   function createTable(dataArray) {

     var indexArray = [];

     var rowArray = [];

     var idArray = [];

     for(var i= 0; i<dataArray.length; i++) {

       var row = {};

       if (indexArray.indexOf(dataArray[i].index) === -1) {

         indexArray.push(dataArray[i].index);

         // idArray.push(dataArray[i].source.id);
         // idArray.push(dataArray[i].target.id);

         row["sourceID"] = dataArray[i].source.id;
         row["targetID"] = dataArray[i].target.id;

         row["source"] = dataArray[i].source.label;
         row["target"] = dataArray[i].target.label;
         row["weight"] = dataArray[i].weight;

         rowArray.push(row);

       } else {
         break;
       }

     };

     rowArray.sort(function(a,b) {
       var textA = a.source.split(" ")[1].toLowerCase();
       var textB = b.source.split(" ")[1].toLowerCase();
       if(textA < textB) { return -1; }
       if(textA > textB) { return 1; }
       return 0;
     });

     $("#tableF").append("<table id='tableSortedF' class='table table-bordered'><thead><tr><th scope='col'>#</th><th scope='col'>Non-Profit</th><th scope='col'>ASU Faculty</th><th scope='col'>Weight</th></tr></thead><tbody></tbody>");

     rowArray.forEach(function(row, i) {

       $("#tableSortedF tr:last").after(`<tr id="${row.targetID} ${row.sourceID}"><th scope='row'>${i+1}</th><td>${ row.target }</td><td>${ row.source }</td><td>${ row.weight }</td></tr>`);

     });

     // $("#tableSortedF tr").hover(function() {
     //
     //   var target = $(this).attr('id').split(" ")[0];
     //
     //   var source = $(this).attr('id').split(" ")[1];
     //
     //   // console.log(target, source);
     //
     //   // console.log(idArray);
     //
     //   var updatedIdArr = removeFromArray(idArray, [target, source]);
     //
     //   // console.log(updatedIdArr);
     //
     //   var selectedNodes = [];
     //
     //   nodes.forEach(function(node) {
     //     if (node.id === target || node.id === source) {
     //       selectedNodes.push(node);
     //     }
     //   });
     //
     //   // console.log(selectedNodes);
     //
     //   // mouseevent5(selectedNodes, updatedIdArr);
     //
     // });

   }

   function removeFromArray(arr, toRemove) {
    return arr.filter(item => toRemove.indexOf(item) === -1)
  }

};

function network2(data) {

  var nodes = data.nodes;

  var links = data.links;

  var position = data.position;

  var pattern = data.pattern;

  var labels = data.dropdown.orgLabel;

  var linkages = Array.from(new Array(10), (x,i) => i+2);

  var weight2 = data.linkage_filters.weight2;

  var weight3 = data.linkage_filters.weight3;

  var weight4 = data.linkage_filters.weight4;

  var weight5 = data.linkage_filters.weight5;

  var weight6 = data.linkage_filters.weight6;

  var weight7 = data.linkage_filters.weight7;

  var weight8 = data.linkage_filters.weight8;

  var weight9 = data.linkage_filters.weight9;

  var weight10 = data.linkage_filters.weight10;

  var weight11 = data.linkage_filters.weight11;

  var nodesWeight2 = [];

  var nodesWeight3 = [];

  var nodesWeight4 = [];

  var nodesWeight5 = [];

  var nodesWeight6 = [];

  var nodesWeight7 = [];

  var nodesWeight8 = [];

  var nodesWeight9 = [];

  var nodesWeight10 = [];

  var nodesWeight11 = [];

  nodes.forEach(function(node) {

    weight2.matched.forEach(function(id) {
      if (node.id === id) {
        nodesWeight2.push(node);
      }
    });

    weight3.matched.forEach(function(id) {
      if (node.id === id) {
        nodesWeight3.push(node);
      }
    });

    weight4.matched.forEach(function(id) {
      if (node.id === id) {
        nodesWeight4.push(node);
      }
    });

    weight5.matched.forEach(function(id) {
      if (node.id === id) {
        nodesWeight5.push(node);
      }
    });

    weight6.matched.forEach(function(id) {
      if (node.id === id) {
        nodesWeight6.push(node);
      }
    });

    weight7.matched.forEach(function(id) {
      if (node.id === id) {
        nodesWeight7.push(node);
      }
    });

    weight8.matched.forEach(function(id) {
      if (node.id === id) {
        nodesWeight8.push(node);
      }
    });

    weight9.matched.forEach(function(id) {
      if (node.id === id) {
        nodesWeight9.push(node);
      }
    });

    weight10.matched.forEach(function(id) {
      if (node.id === id) {
        nodesWeight10.push(node);
      }
    });

    weight11.matched.forEach(function(id) {
      if (node.id === id) {
        nodesWeight11.push(node);
      }
    });

  });

  $(document).ready(function() {
    $('.select2-NP').select2({
      placeholder : { id:'0', text:'Please select a non-profit...'}
    });

    $('.select2-NP-Links').select2({
      placeholder : { id:'0', text:'Please select an edge weight...'}
    });
  });

  labels.forEach(function(option) {
    $(".select2-NP").append(`<option value=${option.id}>${option.value}</option>`);
  });

  linkages.forEach(function(id) {
    $(".select2-NP-Links").append(`<option value=${id}>${id}</option>`);
  });

  $(".select2-NP").on("select2:select select2:unselecting", function() {

    var value = $(".select2-NP").select2().val();

    var selection = nodes.filter(function(node) {
      return node.id === value;
    });

    var data = mouseevent2(selection[0]);
    createTable(data);

  });

  $(".select2-NP-Links").on("select2:select select2:unselecting", function() {

    var value = $(".select2-NP-Links").select2().val();

    if (value === "2") {
      var data2 = mouseevent4(nodesWeight2, weight2.unmatched, 2);
      createTable(data2);
    }

    if (value === "3") {
      var data3 = mouseevent4(nodesWeight3, weight3.unmatched, 3);
      createTable(data3);
    }

    if (value === "4") {
      var data4 = mouseevent4(nodesWeight4, weight4.unmatched, 4);
      createTable(data4);
    }

    if (value === "5") {
      var data5 = mouseevent4(nodesWeight5, weight5.unmatched, 5);
      createTable(data5);
    }

    if (value === "6") {
      var data6 = mouseevent4(nodesWeight6, weight6.unmatched, 6);
      createTable(data6);
    }

    if (value === "7") {
      var data7 = mouseevent4(nodesWeight7, weight7.unmatched, 7);
      createTable(data7);
    }

    if (value === "8") {
      var data8 = mouseevent4(nodesWeight8, weight8.unmatched, 8);
      createTable(data8);
    }

    if (value === "9") {
      var data9 = mouseevent4(nodesWeight9, weight9.unmatched, 9);
      createTable(data9);
    }

    if (value === "10") {
      var data10 = mouseevent4(nodesWeight10, weight10.unmatched, 10);
      createTable(data10);
    }

    if (value === "11") {
      var data11 = mouseevent4(nodesWeight11, weight11.unmatched, 11);
      createTable(data11);
    }

  });

  var width = 800;
  var height = 700;
  var hl_r = 8;
  var reg_r = 5;

  var color_node = d3.scaleOrdinal().domain(["faculty","non-profit"])
        .range(['rgb(72,169,197)', 'rgb(117,102,160)',]);

  var svg = d3.select("#network2 svg");

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

  // svg.append("defs")
  //    .append("marker")
  //    .attr("id", "out_2")
  //    .attr("viewBox", "0 , -5, 10, 10")
  //    .attr("refX", 23)
  //    .attr("refY", 0)
  //    .attr("markerWidth", 7)
  //    .attr("markerHeight", 15)
  //    .attr("orient", "auto")
  //    .append("path")
  //    .attr("d", "M0,-5L10,0L0,5");
  //
  // svg.append("defs")
  //    .append("marker")
  //    .attr("id", "in_2")
  //    .attr("viewBox", "0, -5, 10, 10")
  //    .attr("refX", 23)
  //    .attr("refY", 0)
  //    .attr("markerWidth", 7)
  //    .attr("markerHeight", 15)
  //    .attr("orient", "auto")
  //    .append("path")
  //    .attr("d", "M0,-5L10,0L0,5")
  //    .attr("fill", "rgb(218,41,28)");

  var defs = svg.append("defs");

  var filter = defs.append("filter")
                   .attr("id", "drop-shadow_2")
                   .attr("height", "130%");

  filter.append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 5)
      .attr("result", "blur");

  filter.append("feOffset")
      .attr("in", "blur")
      .attr("dx", 5)
      .attr("dy", 5)
      .attr("result", "offsetBlur");

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
                .attr("class", function(d) {
                  if (d.type === "faculty") { return "nodes" + " _" + d.in_out + " faculty"; }
                  if (d.type === "non-profit") { return "nodes" + " _" + d.in_out + " nonProfit"; }
                })
                .attr("r", function(d) {
                  return d.radius;
                })
                .attr("fill", function(d) {
                  return color_node(d.type);
                })
                .style("stroke-opacity", 0.9);

   node.append("title")
       .text(function(d) {
         return d.label;
       });

   svg.selectAll(".nonProfit").on("mouseover", function(d) { mouseevent(d, "mouseover"); })
                              .on("mouseout", function(d) { mouseevent(d, "mouseout")})
                              .on("click", function(d) { mouseevent2(d); });

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
           return "_" + (d.id)+"_2";
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
       return ("from"+d.source.id+" to"+d.target.id + " weight"+d.weight);
     });

   }

    var rect = svg.append("g");

    rect.append("rect")
        .attr("x", -2400)
        .attr("y", 830)
        .attr("rx", 20)
        .attr("ry", 20)
        .attr("width", "200px")
        .attr("height", "100px")
        .attr("fill", "steelblue")
        .style("filter", "url(#drop-shadow_2)");

    rect.append("text").text("reset").style("fill", "#fff").style("font-size", "46px")
        .attr("x", function(d) {
          var textSelection = d3.selectAll("text");
          var textLength = textSelection._groups[0][textSelection._groups[0].length-1].getComputedTextLength();
          return (-2350 + (textLength/2));   })
        .attr("y", 892);

    rect.on("mouseover", function(d) { d3.select(this).style("cursor", "pointer")})
        .on('click', function() { mouseevent3(); });

    var legend = svg.append("g");

    legend.append("rect")
          .attr("x", -2410)
          .attr("y", -1100)
          .attr("width", "400px")
          .attr("height", "250px")
          .style("fill", "none")
          .style("stroke", "black")
          .style("stroke-width", 0.75);

    legend.append("circle")
          .attr("cx", -2360)
          .attr("cy", -1030)
          .attr("r", 20)
          .attr("fill", color_node("non-profit"));

    legend.append("text")
          .text("Non-Profit")
          .style("fill", "black")
          .style("font-size", "48px")
          .attr("x", -2300)
          .attr("y", -1015);

    legend.append("circle")
          .attr("cx", -2360)
          .attr("cy", -920)
          .attr("r", 20)
          .attr("fill", color_node("faculty"));

    legend.append("text")
          .text("Faculty")
          .style("fill", "black")
          .style("font-size", "48px")
          .attr("x", -2300)
          .attr("y", -905);

   function mouseevent(d, event) {

     var line_out_color = (event === "mouseover") ? "rgb(61, 65, 66)" : "rgb(208, 211, 212)",
         line_in_color = (event === "mouseover") ? "rgb(218, 41, 28)" : "rgb(208, 211, 212)",
         line_opacity = (event === "mouseover") ? 1: 0.3,
         line_stroke_out = (event === "mouseover") ? 3 : 1,
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
      // .attr("marker-end", function(e) {
      //   return "url(#"+e.type+"_2)";
      // })
      .style("stroke", line_in_color)
      .transition()
      .duration(500)
      .style("stroke-opacity", line_opacity);

    d3.selectAll("line.from"+d.id).each(function(e) {
      e.type = "out";
      })
      // .attr("marker-end", function(e) {
      //   return "url(#"+e.type+"_2)";
      // })
      .style("stoke", line_out_color)
      .style("stroke-width", line_stroke_out)
      .transition()
      .duration(500)
      .style("stroke-opacity", line_opacity);

    d3.selectAll("circle.nodes").transition().style("opacity", dot_other_opacity);

    d3.selectAll("circle#_" + d.id+"_2")
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
            d3.select("circle#_"+e.target.id+"_2")
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
          d3.select("circle#_"+e.target.id+"_2")
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
        d3.select("circle#_"+e.source.id+"_2")
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

     var tableData = [];

     node.on("mouseout", function() { return; })
         .on("mouseover", function() { return; });

     var line_out_color = "rgb(61, 65, 66)",
         line_in_color = "rgb(218, 41, 28)",
         line_opacity = 1,
         line_stroke_out = 3,
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

    // controls lines

    d3.selectAll("line.to" + d.id).each(function(e) {

      // console.log(e);

      if (tableData.indexOf(e) === -1) {
        tableData.push(e);
      }

      e.type = "in";

      })
      // .attr("marker-end", function(e) {
      //   return "url(#"+e.type+"_2)";
      // })
      .style("stroke", line_in_color)
      .transition()
      .duration(500)
      .style("stroke-opacity", line_opacity);

    d3.selectAll("line.from"+d.id).each(function(e) {

      e.type = "out";

      })
      // .attr("marker-end", function(e) {
      //   return "url(#"+e.type+"_2)";
      // })
      .style("stoke", line_out_color)
      .style("stroke-width", line_stroke_out)
      .transition()
      .duration(500)
      .style("stroke-opacity", line_opacity);

    d3.selectAll("circle.nodes").transition().style("opacity", dot_other_opacity);

    d3.selectAll("circle#_" + d.id+"_2")
      .style("stroke", dot_self_color)
      .transition()
      .duration(800)
      .attr("r", function(e) {
        return e.radius;
      })
      .style("opacity", dot_selected_opacity)
      .style("stroke-width", dot_self_stroke_width);

      // controls dots

      d3.selectAll("line.from" + d.id).filter(function(e) {
        return e.target.id !== e.source.id
      }).each(function(e) {
            d3.select("circle#_"+e.target.id+"_2")
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
        d3.select("circle#_"+e.source.id+"_2")
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

      return tableData;

   }

   function mouseevent3() {

     $("#tableNP").empty();

     $('.select2-NP').val([]);
     $(".select2-NP").select2({
        placeholder:'Please select a non-profit...'
      });

    $('.select2-NP-Links').val([]);
    $(".select2-NP-Links").select2({
       placeholder:'Please select an edge weight...'
     });

     node.attr('pointer-events', 'all');

     node.on("mouseover", function(d) { mouseevent(d, "mouseover"); })
         .on("mouseout", function(d) { mouseevent(d, "mouseout"); })
         .on("click", function(d) { mouseevent2(d); });

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

   function mouseevent4(nodeArray, idUnmatched, weight) {

     var tableData = [];

     node.on("mouseout", function() { return; })
         .on("mouseover", function() { return; });

     var line_out_color = "rgb(61, 65, 66)",
         line_in_color = "rgb(218, 41, 28)",
         line_opacity = 1,
         line_stroke_out = 3,
         dot_self_color = "rgb(218, 41, 28)",
         dot_other_color = "black",
         dot_selected_opacity = 1,
         dot_other_opacity = 0.1,
         dot_self_stroke_width = 2;

    nodeArray.forEach(function(d) {

      d3.selectAll("circle.nodes").attr("r", function(e) {

        return e.radius;

      }).style("stroke", "#fff").style("stroke-width", dot_self_stroke_width);

      d3.selectAll("line").attr("marker-end", "none").style("stroke", "rgb(208,211,212)").style("stroke-opacity", 0.3);

      d3.selectAll("text.background-text").style("fill", "rgb(208,211,212)").style("stroke","rgb(208,211,212)");

      d3.selectAll("line.weight" + weight).each(function(e) {

        if (tableData.indexOf(e) === -1) {
          tableData.push(e);
        }

        e.type = "in";

      })
      // .attr("marker-end", function(e) {
      //   return "url(#"+e.type+"_2)";
      // })
      .style("stroke", line_in_color)
      .transition()
      .duration(500)
      .style("stroke-opacity", line_opacity);

      d3.selectAll("circle#_" + d.id+"_2")
      .style("stroke", dot_self_color)
      .transition()
      .duration(800)
      .attr("r", function(e) {
        return e.radius;
      })
      .style("opacity", dot_selected_opacity)
      .style("stroke-width", dot_self_stroke_width);

    });

    idUnmatched.forEach(function(id) {
      d3.select("circle#_"+id+"_2").transition().style("opacity", dot_other_opacity);
    });

    return tableData;

   }

   function createTable(dataArray) {

     var indexArray = [];

     var rowArray = [];

     for(var i= 0; i<dataArray.length; i++) {

       var row = {};

       if (indexArray.indexOf(dataArray[i].index) === -1) {

         indexArray.push(dataArray[i].index);

         row["source"] = dataArray[i].source.label;
         row["target"] = dataArray[i].target.label;
         row["weight"] = dataArray[i].weight;

         rowArray.push(row);

       } else {
         break;
       }

     };

     rowArray.sort(function(a,b) {
       var textA = a.source.split(" ")[1].toLowerCase();
       var textB = b.source.split(" ")[1].toLowerCase();
       if(textA < textB) { return -1; }
       if(textA > textB) { return 1; }
       return 0;
     });

     $("#tableNP").append("<table id='tableSortedNP' class='table table-bordered'><thead><tr><th scope='col'>#</th><th scope='col'>Non-Profit</th><th scope='col'>ASU Faculty</th><th scope='col'>Weight</th></tr></thead><tbody></tbody>");

     rowArray.forEach(function(row, i) {

       $("#tableSortedNP tr:last").after(`<tr><th scope='row'>${i+1}</th><td>${ row.target }</td><td>${ row.source }</td><td>${ row.weight }</td></tr>`);

     });

   }

};
