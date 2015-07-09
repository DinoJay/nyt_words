var id = 0;
// number of api requests to make
var page_limit = 10;

var scale = d3.scale.linear()
  .domain([1, 30, 60])
  .range([10, 79])
  .clamp(true);

var fontSize = d3.scale.log().range([15, 100]);
var fill = d3.scale.category20();

Array.prototype.last = function() {
  return this[this.length - 1];
};

// d3
function myScale(data, count, incr) {
  var size;
  if (data.length < 1000) size = scale(count) + incr + 5;
  else {
    size = scale(count);
  }
  return size;
}

function nest_data(data, limit, clicked_words, incr) {

  var nested_data = d3.nest().key((d) => {
      return d.key;
    })
    .entries(data, d3.map);

  var context_data = nested_data.map((d) => {
    d.context_words = [];

    d.values.forEach((e) => {
      d.context_words = d.context_words.concat(e.context_words.filter((w) => {
        if (d.context_words.indexOf(w) === -1)
          return w;
      }));
    });
    return d;
  });

  console.log("context data", context_data);
  var selected_data = nested_data.filter(d => {
    if (d.values.length > 0)
      return d;
  });

  console.log("selected_data");
  console.log(selected_data);

  var augmented_data = selected_data.map(function(d, i) {
    d.count = d.values.length;
    // d.size = fontSize(d.count);
    d.size = myScale(data, d.values.length, incr);
    d.clicked = false;
    d.color = fill(i);

    if (clicked_words.indexOf(d.key) !== -1) {
      console.log("pass");
      d.clicked = true;
      d.size = myScale(data, d.values.length, incr) + 40;
    }
    return d;
  });

  var sortedData = augmented_data.sort(function(a, b) {
    return b.count - a.count;
  });

  return sortedData.slice(0, limit);

}

var App = ReactMeteor.createClass({
  templateName: "App",

  getInitialState: function() {
    return {
      cloud_data: [
        []
      ]
    };
  },

  getDefaultProps: function() {
    return {
      pageLimit: 10,
      year: 2015,
      month: 4,
      newsDesk: "National"
    };
  },

  grid_data: function(data) {
    console.log("Flat Data");
    console.log(data);
    var grid_data = d3.nest().key(function(d) {
        return d.headline;
      })
      .entries(data, d3.map);

    grid_data.forEach(function(d) {
      console.log("single WORD:" + d);
      d.article = d.key;
      d.id = id++;
      d.date = d.values[0].pub_date.substring(0,
        d.values[0].pub_date.indexOf('T'));
      // web url
      d.web_url = d.values[0].web_url;
    });
    return grid_data;

  },

  loadCloud: function(interval) {
    var counter = 0;
    var init_data = [];
    var t = setInterval(() => {

      if (counter / 1000 <= 20) init_data = ["Please", "Wait!"];
      else if (counter / 1000 <= 40) init_data = ["It", "Takes", "Time..."];
      else if (counter / 1000 <= 80) init_data = ["Don't", "Worry!"];
      else init_data = ["Almost", "Done", "Promised", ":-)"];

      init_data = init_data.map(function(d, i) {
        return {
          key: d,
          size: 100 + Math.random(),
          color: fill(i)
        };
      });

      counter += 1000;
      console.log("INIT DATA");
      console.log(init_data);

      this.setState({
        cloud_data: [init_data]
      });
    }, interval);

    return t;
  },

  componentDidMount: function() {
    var t = this.loadCloud(1000);

    nyt_fetch_data(this.props.year, this.props.month, this.props.pageLimit,
      this.props.newsDesk, (articles) => {
        console.log("articles", articles, "Length", articles.length);

        var nestedData = nest_data(articles, 1000, [], 0);
        console.log("nest_data", nestedData);
        clearInterval(t);

        this.setState({
          cloud_data: [nestedData]
        });
      });
  },

  componentDidUpdate: function(prevProps, prevState) {
    if (this.state.year !== prevState.year ||
      this.state.month !== prevState.month ||
      this.state.newsDesk !== prevState.newsDesk) {

      var t = this.loadCloud(1000);
    }
  },

  word_click_handler: function(d) {

    console.log("fishing datum", d);
    if (!d.clicked) {
      this.setState(function(previousState, currentProps) {
        previousState.cloud_data.pop();
        return {
          cloud_data: previousState.cloud_data
        };
      });
      return;
    } else {

      console.log("cloud data", this.state.cloud_data);
      var cur_cloud_data = this.state.cloud_data.last();

      // filter word objects
      var context_cloud_data = d.context_words.map((str) => {
        return cur_cloud_data.find((word_obj) => {
          return (word_obj.key === str);
        });
      }).filter((word_obj) => {
        return word_obj;
      });

      var cloud_data = context_cloud_data.concat([d]);

      this.setState(function(previousState, currentProps) {
        var newCloudDataStack = previousState.cloud_data.concat([cloud_data]);

        return {
          cloud_data: newCloudDataStack
        };
      });
    }

  },

  formChangeHandler: function(formState) {
    console.log("formState", formState);
    var t = this.loadCloud(1000);

    nyt_fetch_data(formState.year, formState.month, formState.pageLimit,
      formState.newsDesk, (articles) => {
        console.log("articles", articles, "Length", articles.length);

        var nestedData = nest_data(articles, 1000, [], 0);
        console.log("nest_data", nestedData);
        clearInterval(t);

        this.setState({
          cloud_data: [nestedData]
        });
      }
    );
  },

  render: function() {
    return (
      <div className="container">
      <div className="col-md-12">
        <MyForm year={this.props.year} month={this.props.month}
          newsDesk={this.props.newsDesk}
          changeHandler={this.formChangeHandler}/>
      </div>
        <div className="col-md-12">
          Placeholder, Placeholder, Placeholder, Placeholder, Placeholder
        </div>

        <div className="col-md-12">
          <Cloud data={this.state.cloud_data.last()}
            callback={this.word_click_handler}/>
        </div>

        <div className="col-md-12">
        </div>
      </div>
    );
  }
});

