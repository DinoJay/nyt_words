var d3Cloud = {};

var width = 1100;
var height = 600;
var margin = {left: 100, right: 100, top: 100, bottom: 100};

var color = d3.scale.linear()
  .domain([10, 15, 20, 25, 30, 40, 50, 55, 60, 80, 90, 95, 97, 98, 99, 150])
  .range((['#041d4c', '#041d4c', '#041d4c', '#041d4c', '#041d4c', '#003269',
          '#003269', '#003269', '#003269', '#31669e', '#041d4c', '#041d4c',
          '#31659d', '#38507e', '#979696', '#939393']));

var color2 = d3.scale.linear()
  .domain([10, 15, 20, 25, 30, 40, 50, 55, 60, 80, 90, 95, 97, 98, 99, 150])
  .range(['#ffffe0', '#fff6cf', '#ffeec1', '#ffe6b2', '#ffdda7', '#ffd59b',
         '#ffcb91', '#ffc287', '#ffb880', '#ffaf79', '#ffa474', '#ff9a6e',
         '#fe8f6a', '#fb8767', '#f87d64', '#f47361', '#f06a5e', '#eb615b',
         '#e65758', '#e14f55', '#db4551', '#d53d4c', '#ce3447', '#c82b42',
         '#c0223b', '#b81b34', '#b0122c', '#a70b24', '#9e051b', '#94010f',
         '#8b0000'].reverse());


function linkArc(d) {
  var dx = d.target.x - d.source.x;
  var dy = d.target.y - d.source.y;
  var dr = Math.sqrt(dx * dx + dy * dy);

  return ('M' + d.source.x + ',' + d.source.y + 'A' + dr + ',' + dr +
    ' 0 0,1 ' + d.target.x + ',' + d.target.y);
}

function update_word_links(selection, word_obj, history, that, i) {

  var bboxStart = that.getBBox();
  // TODO: find better
  var xRectStart = word_obj.x - bboxStart.width / 2;
  var yRectStart = word_obj.y - bboxStart.height * 6 / 8;

  d3.select("#word-cloud g")
    .insert("g", ":first-child")
    .insert("rect")
    .datum(word_obj)
    .attr("rx", 7)
    .attr("ry", 7)
    .attr("transform", "translate(" + [xRectStart, yRectStart] + ")")
    .attr("width", bboxStart.width)
    .attr("height", bboxStart.height)
    .style("fill", color2(i));

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

      if (history.indexOf(d.key) === -1) {
        var bboxEnd = this.getBBox();
        // TODO: find better
        var xRectEnd = d.x - bboxEnd.width / 2;
        var yRectEnd = d.y - bboxEnd.height * 6 / 8;

        d3.select("#word-cloud g")
          .insert("g", ":first-child")
          .append("rect")
          .datum(d)
          .attr("rx", 7)
          .attr("ry", 7)
          .attr("transform", "translate("
                + [xRectStart, yRectStart]
                + ")")
          .attr("width", bboxStart.width)
          .attr("height", bboxStart.height)
          .style("fill", color2(j))
          .transition()
          // .duration(500)
          .attr("rx", 7)
          .attr("ry", 7)
          .attr("transform", "translate(" + [xRectEnd, yRectEnd] + ")")
          .attr("width", bboxEnd.width)
          .attr("height", bboxEnd.height)
          .attr("opacity", 0.5)
          .style("fill", color2(j));

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

  var paths = d3.select("#word-cloud g g").selectAll('path')
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
      return color2(d.target.i);
    })
    .attr('d', linkArc);
}

function remove_word_links(history) {
  d3.select("#word-cloud g").selectAll("g rect").filter((d) => {
    return history.indexOf(d.key) === -1;
  }).remove();

  // d3.select("g").selectAll("rect").remove();

  d3.selectAll("#word-cloud g text").style("fill", (d, i) => {
    return d.clicked ? color2(i) : color(i);
  });

  d3.selectAll("#word-cloud g text").style("fill", (d, i) => {
    if(history.indexOf(d.key) !== -1)
      return "white";
    else
      return color(i);
  });

  d3.selectAll("#word-cloud g rect").style("opacity", (d, i) => {
    return d.clicked ? 0.5 : 1;
  });

  d3.selectAll("#word-cloud g text").style("opacity", 1);

  d3.selectAll("#word-cloud g path").remove();

}

function reset_background() {
  d3.select("#word-cloud g").selectAll("rect").filter((d) => {
    return !d.clicked;
  }).remove();
  d3.selectAll("#word-cloud g text").style("fill", (d, j) => {
    if(d.clicked)
      return "white";
    else
      return color(j);
  });
}

function post_process_background(d, i, history, that) {
    if (history.indexOf(d.key) !== -1) {
      var bbox = that.getBBox();
      // TODO: find better
      var xRect = d.x - bbox.width / 2;
      var yRect = d.y - bbox.height * 6 / 8;

      d3.select("#word-cloud g").insert("rect", ":first-child")
        .datum(d)
        .attr("rx", 7)
        .attr("ry", 7)
        .attr("transform", "translate(" + [xRect, yRect] + ")")
        .attr("width", bbox.width)
        .attr("height", bbox.height)
        .style("fill", color2(i))
        .style("opacity", 0.3);

      d3.select(that).style("fill", "white");

    } else
      d.clicked = false;
}


d3Cloud.create = function(el, state, callback) {
  //TODO: props to include as arg
  d3.select(el).append("svg")
    .attr("id", "word-cloud")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(545,300)");

  this.update(el, state, callback);
};

d3Cloud.update = function(el, state, callback) {
  d3.layout.cloud().size([width, height])
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
      this.draw(d, state, callback);
    })
    .start();
    d3.selectAll("*").on('contextmenu', (d)=> console.log(d));
};

d3Cloud.draw = function(words, state, callback) {
  d3.selectAll("rect").remove();

  var cloud = d3.select("g").selectAll("#word-cloud g text")
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
    });

    d3.selectAll("#word-cloud text")
      .on("click", function(d, i) {
        d.clicked = !d.clicked;
        callback(d);
      })
      .on("mouseover", function(d, i) {
        if (!d.clicked) {
          update_word_links(d3.selectAll("#word-cloud g text"), d,
                            state.history, this, i);
        }
        // console.log("mouseover", d);
      })
      .on("mouseout", function(d, i) {
        remove_word_links(state.history);
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
    .each("end", function(d, i) {
      post_process_background(d, i, state.history, this);
    });

  d3.selectAll("#word-cloud g path").remove();

  //Exiting words
  cloud.exit()
    .on("mouseout", null)
    .on("mouseover", null)
    .on("click", null)
    .transition()
    .duration(1000)
    .style('fill-opacity', 1e-6)
    .attr('font-size', 1)
    .remove();
};

export default d3Cloud;
