d3Cloud = {};

var color = d3.scale.linear()
  .domain([10, 15, 20, 25, 30, 40, 50, 55, 60, 80, 90, 95, 97, 98, 99, 150])
  .range(['#041d4c', '#041d4c', '#041d4c', '#041d4c', '#041d4c', '#003269',
    '#003269', '#003269', '#003269', '#31669e', '#041d4c',
    '#041d4c', '#31659d', '#38507e', '#979696', '#939393'
  ]);

function linkArc(d) {
  var dx = d.target.x - d.source.x;
  var dy = d.target.y - d.source.y;
  var dr = Math.sqrt(dx * dx + dy * dy);

  return ('M' + d.source.x + ',' + d.source.y + 'A' + dr + ',' + dr +
    ' 0 0,1 ' + d.target.x + ',' + d.target.y);
}

function update_word_links(selection, word_obj, that, i) {

  // console.log("update background selection", selection);
  var bboxStart = that.getBBox();
  // TODO: find better
  var xRectStart = word_obj.x - bboxStart.width / 2;
  var yRectStart = word_obj.y - bboxStart.height * 6 / 8;

  d3.select("g")
    .insert("g", ":first-child")
    .insert("rect")
    .datum(word_obj)
    .attr("rx", 7)
    .attr("ry", 7)
    .attr("transform", "translate(" + [xRectStart, yRectStart] + ")")
    .attr("width", bboxStart.width)
    .attr("height", bboxStart.height)
    .style("fill", color(i));

  d3.select(that).style("fill", "white");

  var links = [];

  selection.each(function(d, j) {
    if (word_obj.context_words.indexOf(d.key) !== -1) {
      d.i = j;

      links.push({
        id: word_obj.key + d.key,
        source: word_obj,
        target: d
      });

      if (!d.clicked) {
        var bboxEnd = this.getBBox();
        // TODO: find better
        var xRectEnd = d.x - bboxEnd.width / 2;
        var yRectEnd = d.y - bboxEnd.height * 6 / 8;

        d3.select("g")
          .insert("g", ":first-child")
          .append("rect")
          .datum(d)
          .attr("rx", 7)
          .attr("ry", 7)
          .attr("transform", "translate(" + [xRectStart, yRectStart] + ")")
          .attr("width", bboxStart.width)
          .attr("height", bboxStart.height)
          .style("fill", color(j))
          .transition()
          // .duration(500)
          .attr("rx", 7)
          .attr("ry", 7)
          .attr("transform", "translate(" + [xRectEnd, yRectEnd] + ")")
          .attr("width", bboxEnd.width)
          .attr("height", bboxEnd.height)
          .attr("opacity", 0.8)
          .style("fill", color(j));

        d3.select(this).style("fill", "white");
      }
    } else {
      d3.select(this).style("opacity", (e) => {
        if (e.key !== word_obj.key)
          return 0.3;
        else return 1;
      });

    }
  });

  var paths = d3.select("g g").selectAll('path')
    .data(links, function(d) {
      return d.source.key + "-" + d.target.key;
    });

  paths.enter().append('path')
    .attr('class', function() {
      return 'child-branch';
    })
    .style('stroke', (d) => {
      return color(d.target.i);
    })
    .attr('d', 'M' + 0 + ',' + 0 + 'A' + 0 + ',' + 0 + ' 0 0,1 ' + 0 + ',' + 0)
    .transition()
    .duration(200)
    .attr('class', function() {
      return 'child-branch';
    })
    .style('stroke', (d) => {
      return color(d.target.i);
    })
    .attr('d', linkArc);
}

function remove_word_links() {
  d3.selectAll("g rect").filter((d) => {
    return !d.clicked;
  }).remove();

  d3.selectAll("g text").style("fill", (d, i) => {
    return d.clicked ? "white" : color(i);
  });

  d3.selectAll("g text").style("opacity", 1);

  d3.selectAll("g path").remove();

}

function reset_background() {
  d3.select("g").selectAll("rect").remove();
  d3.selectAll("g text").style("fill", (d, j) => color(j));
}

function post_process_background(d, i) {
  if (d.clicked) {
    var bbox = this.getBBox();
    // TODO: find better
    var xRect = d.x - bbox.width / 2;
    var yRect = d.y - bbox.height * 6 / 8;

    d3.select("g").insert("rect", ":first-child")
      .datum(d)
      .attr("rx", 7)
      .attr("ry", 7)
      .attr("transform", "translate(" + [xRect, yRect] + ")")
      .attr("width", bbox.width)
      .attr("height", bbox.height)
      .style("fill", color(i));

    d3.select(this).style("fill", "white");
  }
}

d3Cloud.create = function(el, state, callback) {
  //TODO: props to include as arg
  d3.select(el).append("svg")
    .attr("id", "word-cloud")
    .attr("width", '1100')
    .attr("height", '500')
    .append("g")
    .attr("transform", "translate(545,260)");

  this.update(el, state, callback);
};

d3Cloud.update = function(el, state, callback) {
  console.log("update data", state.data);
  d3.layout.cloud().size([1100, 500])
    .words(state.data)
    .padding(4)
    // .random((d) => {return 1; } )
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
    .on("click", function(d, i) {
      d3.selectAll("rect").remove();
      d.clicked = !d.clicked;
      callback(d);
    })
    .on("mouseover", function(d, i) {
      if (!d.clicked) {
        update_word_links(d3.selectAll("g text"), d, this, i);
      }
    })
    .on("mouseout", function(d, i) {
      remove_word_links();
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
    .style("fill-opacity", 1)
    .each("end", post_process_background);

  d3.selectAll("g path").remove();

  //Exiting words
  cloud.exit()
    .transition()
    .duration(200)
    .style('fill-opacity', 1e-6)
    .attr('font-size', 1)
    .remove();

};
