d3Cloud = {};

var color = d3.scale.linear()
  .domain([10, 15, 20, 25, 30, 40, 50, 55, 60, 80, 90, 95, 97, 98, 99, 150])
  .range(['#041d4c', '#041d4c', '#041d4c', '#041d4c', '#041d4c', '#003269',
    '#003269', '#003269', '#003269', '#31669e', '#041d4c',
    '#041d4c', '#31659d', '#38507e', '#979696', '#939393'
  ]);


d3Cloud.create = function(el, state, callback) {
  //TODO: props to include as arg
  d3.select(el).append("svg")
    .attr("width", '1100')
    .attr("height", '500')
    .append("g")
    .attr("transform", "translate(545,260)");

  this.update(el, state, callback);
};

d3Cloud.update = function(el, state, callback) {

  d3.layout.cloud().size([1100, 500])
    .words(state.data)
    .padding(4)
    .rotate(0)
    //.font("Verdana")
    .font("Impact")
    .text((d) => {
      return d.key;
    })
    .fontSize((d) => {
      return d.size;
    })
    .on("end", (d) => {
      this.draw(d, callback);
    })
    .start();

};


d3Cloud.draw = function(words, callback) {

  var cloud = d3.select("g").selectAll("g text")
    .data(words, (d) => {
      return d.text;
    });

  //Entering words
  cloud.enter()
    .append("text")
    .style("font-family", "Impact")
    //.style("font-family", "Verdana")
    .attr("text-anchor", "middle")
    .attr('font-size', 3)
    .attr('class', 'Word')
    .text(d => {
      return d.key;
    })
    .on("mouseover", function(d, i) {
      // callback(d);
      var bbox = this.getBBox();

      // TODO: change z index
      d3.select("g").insert("rect", ":first-child")
        .attr("rx", 7)
        .attr("ry", 7)
        .attr("transform", "translate(" + [d.x - bbox.width / 2, d.y - bbox.height * 6 / 8] + ")rotate(" + d.rotate + ")")
        .attr("width", bbox.width )
        .attr("height", bbox.height)
        .style("fill", color(i));

     d3.select(this).style("fill", "white");

    })
    .on("mouseout", function(d, i) {
      //d3.select("svg g").insert(/ TODO: tooltip
      d3.select("g").selectAll("rect").remove();
      d3.select(this).style("fill", color(i));

    });

  //Entering and existing words
  cloud
    .transition()
    .duration(200)
    .style("font-size", (d) => {
      return d.size + "px";
    })
    //.style("fill", function(d) {return d.color;})
    .style("fill", (d, i) => {
      return color(i);
    })
    .attr("class", "Hover")
    .attr("transform", (d) => {
      return ("translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")");
    })
    // .attr("x", (d) => {
    //   return d.x;
    // })
    // .attr("y", (d) => {
    //   return d.y;
    // })
    .style("fill-opacity", 1);

  d3.selectAll("*").on("click", function(d) {
    console.log(d);
  });

  //Exiting words
  cloud.exit()
    .transition()
    .duration(200)
    .style('fill-opacity', 1e-6)
    .attr('font-size', 1)
    .remove();
};
