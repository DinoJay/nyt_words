var scale = d3.scale.linear()
  .domain([1, 30, 60])
  .range([10, 79])
  .clamp(true);

var fontSize = d3.scale.linear().domain([1, 60]).range([8, 60]);
var fill = d3.scale.category20();

Array.prototype.last = function() {
  return this[this.length - 1];
};

// d3
function myScale(data, count, incr) {
  var size = scale(count) + incr + 5;

    // if (data.length < 500)
    //   size = fontSize(count);

  return fontSize(count);
  // return count;

}

function nest_data(data, limit, clicked_words, incr) {

  var nested_data = d3.nest().key((d) => {
      return d.key;
    })
    .entries(data, d3.map);

  console.log("nested data", nested_data);

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
      d.size = myScale(data, d.values.length, 0);
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
      cloud_data: [[]],
      history: [],
      articles: [[]]
    };
  },

  getDefaultProps: function() {
    return {
      pageLimit: 1000,
      wordLimit: 5000,
      year: 2015,
      month: 6,
      newsDesk: "National"
    };
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

  fetchData: function(year, month, newsDesk, timer) {

    nyt_fetch_data(year, month, newsDesk, this.props.pageLimit, (articles) => {
      console.log("all articles", articles, "Length", articles.length);

      var nestedData = nest_data(articles, this.props.wordLimit, [], 0);
      console.log("nest_data", nestedData);
      clearInterval(timer);

      var titles = articles.map((a) => {return a.headline; });
      console.log("titles", titles);
      var uniqArticles = articles.filter((a, i) => {
        return titles.indexOf(a.headline) === i;
      });

      this.setState((prevState) => {
        return {
          cloud_data: [nestedData],
          articles: [uniqArticles]
        };
      });
    });
  },

  componentDidMount: function() {
    var timer = this.loadCloud(1000);

    this.fetchData(this.props.year, this.props.month, this.props.newsDesk,
      timer);
  },

  componentDidUpdate: function(prevProps, prevState) {
    // TODO
    if (this.state.year !== prevState.year ||
      this.state.month !== prevState.month ||
      this.state.newsDesk !== prevState.newsDesk) {

      var t = this.loadCloud(1000);
    }
  },

  word_click_handler: function(d) {
    if (d.clicked) {
      console.log("clicked word", d);
      console.log("cloud data", this.state.cloud_data);
      var cur_cloud_data = this.state.cloud_data.last();

      // get all associated words to word d
      var context_cloud_data = d.context_words.map((key) => {
        return cur_cloud_data.find((word_obj) => {
          return (word_obj.key === key);
        });
      }).filter((word_obj) => {
        return word_obj;
      });

      var cloud_data = context_cloud_data.concat([d]);

      // TODO:
      // var cloud_data = context_cloud_data;
      // cloud_data.forEach((e) => {
      //   e.size = myScale(cloud_data, e.values.length, 40);
      // });

      this.setState(function(prevState) {
        return {
          cloud_data: prevState.cloud_data.concat([cloud_data]),
          history: prevState.history.concat([d.key]),
          articles: prevState.articles.concat([d.values])
        };
      });
    } else {

      this.setState(function(prevState, currentProps) {

        var prev_data_index = prevState.history.indexOf(d.key);
        console.log("prev data index", prev_data_index);
        var old_cloud_data = prevState.cloud_data.slice(0,
                                                        prev_data_index + 1);
        var old_history = prevState.history.slice(0, prev_data_index);

        var old_articles = prevState.articles.slice(0, prev_data_index + 1);

        return {
          cloud_data: old_cloud_data,
          history: old_history,
          articles: old_articles
        };
      });
    }
  },

  formChangeHandler: function(formState) {
    console.log("formState", formState);
    var timer = this.loadCloud(1000);
    this.fetchData(formState.year, formState.month, formState.newsDesk, timer);
  },

  bcClickHandler: function(key) {
    console.log("click", key);
    this.setState(function(prevState, currentProps) {

      var prev_data_index = prevState.history.indexOf(key);

      var old_cloud_data = prevState.cloud_data.slice(0, prev_data_index + 1);
      var old_history = prevState.history.slice(0, prev_data_index);

      d3.selectAll("rect").remove();

      return {
        cloud_data: old_cloud_data,
        history: old_history
      };
    });
  },

  render: function() {
    console.log("this.state.cloud_data", this.state.cloud_data);
    console.log("history", this.state.history);
    console.log("articles", this.state.articles.last());
    return (
      <div className="container">
        <div className="col-md-12">
          <MyForm year={this.props.year} month={this.props.month}
            newsDesk={this.props.newsDesk}
            changeHandler={this.formChangeHandler}/>
        </div>
        <div className="col-md-12">
          <Breadcrumbs history={this.state.history}
            clickHandler={this.bcClickHandler}/>
        </div>

        <div className="col-md-12">
          <Cloud data={this.state.cloud_data.last()}
            history={this.state.history}
            callback={this.word_click_handler}/>
        </div>

        <div className="col-md-12">
          <ArticleTable data={this.state.articles.last()}/>
        </div>
      </div>
    );
  }
});
