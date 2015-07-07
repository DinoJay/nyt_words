var id = 0;
// number of api requests to make
var page_limit = 100;

var scale = d3.scale.linear()
  .domain([1, 30, 60])
  .range([10, 79])
  .clamp(true);

var fontSize = d3.scale.log().range([15, 100]);
var fill = d3.scale.category20();

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

var Application = ReactMeteor.createClass({
  templateName: "Application",

  getInitialState: function() {
    return {
      cloud_data: [
        []
      ],
      grid_data: [],
      clicked_words: [],
      history: []

    };
  },

  getDefaultProps: function() {
    return {
      cloud_data: [],
      start_year: 2015,
      month: 4,
      news_desk: "National",
      data: []
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
        cloud_data: init_data
      });
    }, interval);

    return t;
  },

  componentDidMount: function() {
    // make an initial load cloud

    var t = this.loadCloud(1000);

    nyt_fetch_data(this.props.start_year, this.props.month, page_limit,
      this.props.news_desk, (articles) => {
        console.log("articles", articles, "Length", articles.length);

        var nestedData = nest_data(articles, 1000, [], 0);
        console.log("nest_data", nestedData);
        clearInterval(t);

        this.setState({
          cloud_data: nestedData
        });
      });

  },

  componentDidUpdate: function() {

  },

  handleSubmit: function(e) {
    // e.preventDefault();
    // var start_year = this.props.start_year;
    // var month = parseInt(this.refs.month.getDOMNode().value);
    // // TODO: proper validation
    // // function call runs every second
    // if (!start_year) {
    //   return;
    // }
    // var t = this.loadCloud(1000);
    // Nyt_api.get_data(this.props.start_year, month, page_limit,
    //   this.props.news_desk,
    //   function(cloud_data) {
    //     var nested_data = this.nest_data(cloud_data, 600, [], 0);
    //     var cl_data = this.state.cloud_data.slice(0);
    //     cl_data.push(nested_data);
    //     this.setState({
    //       cloud_data: cl_data,
    //       grid_data: this.grid_data(cloud_data)
    //     });
    //     this.forceUpdate();
    //     clearInterval(t);
    //   }.bind(this));
    // return;
  },

  // TODO: layout obsolete
  // word_click_handler: function(d) {

  //   // add or remove word to history.
  //   var history = this.state.history;


  //   if (typeof history !== 'undefined') {

  //     var result = history.filter(function(obj) {

  //       return obj.count == d.count && obj.key == d.key;
  //     });


  //     if (typeof result !== 'undefined' && result.length != 0) {

  //       var index = $.inArray(result[0], history);

  //       if (index == 0)
  //         history.splice(0, history.length);
  //       else if (index == history.length - 1)
  //         history.splice(index, 1);
  //       else
  //         history.splice(index, history.length - index);
  //     } else {

  //       history.push(d);

  //     }

  //   }

  //   var clicked_words;
  //   if (!d.clicked) {
  //     clicked_words = this.state.clicked_words.slice(0);
  //     clicked_words.push(d.key);

  //     var cloud_filter = crossfilter(this.state.cloud_data[
  //       this.state.cloud_data.length - 1]);
  //     var keyDimension = cloud_filter.dimension(function(d) {
  //       return d.key;
  //     });
  //     console.log("clicked word");
  //     console.log(d);

  //     var sel_doc = keyDimension.filter(d.key).top(Infinity)[0];
  //     var sel_docs = [];
  //     sel_doc.values.forEach(function(doc) {
  //       var hdln_no_stop_words = stop_word_removal(doc.headline
  //         .toLowerCase());

  //       hdln_no_stop_words.match(/\S+/g).forEach(function(w) {

  //         var stripped_word = $("<div/>").html(w).text();
  //         var final_word = stripped_word.replace(/[^’a-zA-Z ]/g, "");

  //         sel_docs.push({
  //           key: final_word,
  //           headline: doc.headline,
  //           pub_date: doc.pub_date,
  //           web_url: doc.web_url
  //         });
  //       });
  //     });
  //     console.log("selected docs");
  //     console.log(sel_docs);

  //     console.log("clicked_words");
  //     console.log(clicked_words);

  //     var nested_docs = this.nest_data(sel_docs, 300, clicked_words, 10);
  //     console.log("nested docs");
  //     console.log(nested_docs);

  //     var cl_data = this.state.cloud_data.slice(0);
  //     cl_data.push(nested_docs);

  //     this.setState({
  //       cloud_data: cl_data,
  //       grid_data: this.grid_data(sel_docs),
  //       clicked_words: clicked_words,
  //       history: history

  //     });
  //     this.forceUpdate();
  //   } else {
  //     clicked_words = this.state.clicked_words.slice();
  //     clicked_words.pop();

  //     var cl_data_len = this.state.cloud_data.length;
  //     var cloud_data = this.state.cloud_data.slice(0, cl_data_len - 1);
  //     var flatted_data = [];
  //     cloud_data[cl_data_len - 2].forEach(function(d) {
  //       flatted_data = flatted_data.concat(d.values);
  //     });
  //     this.setState({
  //       cloud_data: cloud_data,
  //       grid_data: this.grid_data(flatted_data),
  //       clicked_words: clicked_words
  //     });
  //     d.clicked = false;
  //     this.forceUpdate();
  //   }
  // },

  render: function() {


    return (


      <div className="container">
        <nav className="navbar-simple navbar navbar-default navbar-fixed-top" role="navigation" >
          <div className="container-fluid">

            <div className="collapse navbar-collapse" role="navigation" id="navbar-collapse-sanident">

              <div id="header-word-cloud" className="">
                <img className="img-responsive" />
              </div>

            </div>
          </div>
        </nav>

        <div className="col-lg-12">
          <form onSubmit={this.handleSubmit} className="search-form">

            <fieldset>
              <legend>Search Articles</legend>
              <div className="row">
                  <div className="form-group col-lg-3 col-md-3 col-xs-5 col-sm-6 required">
                      <label className="control-label">Year </label>
                      <input type="number" className="form-control"
                        ref="start_year" defaultValue="2014"
                        onChange={function(event) {
                            this.props.start_year = event.target.value;
                          }.bind(this)
                        }
                      />
                  </div>
                  <div className="form-group col-lg-3 col-md-3 col-xs-5 col-sm-6 required">
                      <label className="control-label">Month </label>
                      <select className="form-control"
                        defaultValue={this.props.month} ref="month"
                        onChange={function(event) {
                            this.props.month = event.target.value;
                          }.bind(this)
                        }
                        >
                        <option value="1">Jan</option>
                        <option value="2">Feb</option>
                        <option value="3">Mar</option>
                        <option value="4">Apr</option>
                        <option value="5">May</option>
                        <option value="6">Jun</option>
                        <option value="7">Jul</option>
                        <option value="8">Aug</option>
                        <option value="9">Sep</option>
                        <option value="10">Oct</option>
                        <option value="11">Nov</option>
                        <option value="12">Dec</option>
                      </select>
                  </div>

                  <div className="form-group col-lg-3 col-md-3 col-xs-3 required">
                        <label className="control-label">Category </label>
                        <select className="form-control"
                          defaultValue={this.props.news_desk}
                          onChange={function(event) {
                                      this.props.news_desk = event.target.value;
                                   }.bind(this)
                          }>
                           <option value="National">National</option>
                           <option value="Sports">Sports</option>
                           <option value="Foreign">Foreign</option>
                           <option value="Culture">Culture</option>
                           <option value="Society">Society</option>
                        </select>
                    </div>
                  <div className="col-lg-3 col-md-3 col-sm-5 controls">

                    <button type="submit" className="btn btn-primary buttonSearch" bsStyle='primary' >
                      Submit <i className="glyphicon glyphicon-ok"></i>
                    </button>
                  </div>
              </div>

              </fieldset>

          </form>
        </div>

        <div className="col-lg-12">
        </div>

        <div className="col-md-12">
          <Cloud data={this.state.cloud_data}
            callback={this.word_click_handler}/>
        </div>

        <div className="col-lg-12">
            <div className="panel panel-primary">
                <div className="panel-heading">
                  <h4><span className="glyphicon glyphicon-th-list"></span> List of Articles</h4>
                </div>
                <div className="panel-body">


                </div>
                <div className="panel-footer"></div>
            </div>

        </div>
      </div>
    );
  }
});
