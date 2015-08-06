var scale = d3.scale.linear()
  .domain([1, 30, 60])
  .range([10, 79])
  .clamp(true);

var fontSize = d3.scale.log().domain([1, 60]).range([8, 60]);

var fill = d3.scale.category20();

function myScale(data, count, incr) {
  var size = scale(count) + incr + 5;

    // if (data.length < 500)
    //   size = fontSize(count);

  return fontSize(count);
  // return count;

}

function fetchForMonth(year, month, page, totalDone, desk, api_key) {
  //YYYYMMDD
  var month_str;
  if (month < 10) month_str = "0" + month;
  else month_str = month.toString();
  var startYearStr = year + month_str + "01";
  var endYearStr = year + month_str + "30";
  // console.log('doing year ' + year + 'and month ' + month + ' with offset ' + page);

  var result = $.get("http://api.nytimes.com/svc/search/v2/articlesearch.json", {
      "api-key": api_key,
      sort: "newest",
      begin_date: startYearStr,
      end_date: endYearStr,
      page: page,
      fl: "keywords,headline,snippet,pub_date,news_desk," +
        "document_type,type_of_material,web_url",
      fq: 'source:("The New York Times")' + ' AND document_type:("article") AND news_desk:("' + desk + '")'
    },
    function(data, status) {
      totalDone++;
      return data;
    }, "JSON");

   return result;
}

function processSets(globalData, cur_month, year, per_set, page_counter, page_limit, totalDone, desk, api_key, callback) {
    // var result = fetchForMonth(year, cur_month, page_counter, totalDone,
    //   desk, api_key);

  var promises = [];
  for (var i = 0; i < per_set; i++) {
    page_counter++;

    var result = fetchForMonth(year, cur_month, page_counter, totalDone,
      desk, api_key);
    promises.push(result);
  }

  var docs = [];
  $.when.apply($, promises).done(function() {

    for (var j = 0, len = arguments.length; j < len; j++) {

      var toAddRaw = (promises.length !== 1) ? arguments[j][0] : arguments[0];
      docs = toAddRaw.response.docs;
      docs.forEach(function(doc) {
        doc.keywords.forEach(function(keyword) {
          globalData.push({
            key: keyword.value,
            headline: doc.headline,
            context_words: doc.keywords.filter((kw) => {
              return ( kw.value !== keyword && kw.name === "subject"); }).map((w) => {return w.value; }),
                doc: doc,
              type: doc.document_type,
              type_mat: doc.type_of_material,
              pub_date: doc.pub_date,
              keywords: doc.keywords,
              news_desk: doc.news_desk,
              web_url: doc.web_url // url
          });
        });
      });
    }
    var ret;
    if (docs.length > 0 && page_counter < page_limit && cur_month <= 12) {
      setTimeout(function() {
        ret = processSets(globalData, cur_month, year, per_set,
          page_counter, page_limit, totalDone, desk,
          api_key, callback);
      }, 900);
    } else {
      // callback with the data to be returned
      var titles = globalData.map((a) => {return a.headline; });
      console.log("titles", titles);

      var articles = globalData.filter((a, k) => {
        return titles.indexOf(a.headline) === k;
      });
      console.log("articles", articles);

      var nestedData = nest_data(articles, 5000);
      // console.log("nest_data", nestedData);

      callback(articles, nestedData);
    }
  });
}


nyt_fetch_data = function(year, cur_month, desk, page_limit, callback) {
  //used to get progress (not done yet)
  var searchTerm = "";
  var per_set = 10;
  var page_counter = 0;
  var totalDone = 0;
  // global data used for processSets
  var globalData = [];
  var api_key = "120b4b17dae90dd971d043bd54a1d3f2:18:69878891";

  //$progress.text("Beginning work...");
  return processSets(globalData, cur_month, year, per_set, page_counter,
    page_limit, totalDone, desk, api_key, callback);
};

function nest_data(data, limit) {

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

  console.log("selected_data", selected_data);

  var augmented_data = selected_data.map(function(d, i) {
    d.count = d.values.length;
    // d.size = fontSize(d.count);
    d.size = myScale(data, d.values.length, 0);
    d.clicked = false;
    d.color = fill(i);

    return d;

  });

  console.log("augmented_data", augmented_data);

  var sortedData = augmented_data.sort(function(a, b) {
    return b.count - a.count;
  });

  console.log("sortedData", sortedData);

  return sortedData.slice(0, limit);

}
export default nyt_fetch_data;
