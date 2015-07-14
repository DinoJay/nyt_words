var stoplist = ["the", "for", "in", "year", "years", "but", "of", "new",
  "to", "at", "a", "on", "from", "as", "every", "say",
  "that", "make", "de", "two", "up", "with", "no", "is",
  "may", "more", "before", "an", "by", "get", "best",
  "back", "it", "can", "are", "says", "how", "time", "times",
  "again", "top", "when", "week", "and", "day", "cut",
  "wait", "since", "what", "least", "part", "have", "start",
  "win", "be", "talks", "out", "into", "big", "talks",
  "found", "over", "after", "your", "first", "high",
  "keep", "their", "some", "open", "ends", "was", "its",
  "notice:", "end", "ahead", "this", "will", "help", "away",
  "little", "another", "or", "not", "around", "you",
  "look", "has", "where", "about", "listings", "those",
  "still", "case", "us", "all", "against", "man", "tour",
  "off", "team", "group", "paid", "past", "test", "down",
  "reach", "wins", "raises", "4", "early", "take", "set",
  "response", "won't", "should", "2", "seek", "rise",
  "oct.", "calls", "charged", "his", "charged", "deal",
  "report", "finally", "posts", "hong", "behind", "evening"
];
// stoplist = [];


function fetchForMonth(year, month, page, totalDone, desk, api_key) {
  //YYYYMMDD
  var month_str;
  if (month < 10) month_str = "0" + month;
  else month_str = month.toString();
  var startYearStr = year + month_str + "01";
  var endYearStr = year + month_str + "30";
  console.log('doing year ' + year + 'and month ' + month + ' with offset ' + page);

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

        if (doc.headline.main !== undefined) {
          var headline_lc = doc.headline.main.toLowerCase();
          var hdln_no_stop_words = stop_word_removal(headline_lc);
          var headline_uc = doc.headline.main;
          // TODO: trim words
          var words = hdln_no_stop_words.match(/\S+/g);
          if (!words) words = [];
          doc.keywords.forEach(function(word) {

            var stripped_word = $("<div/>").html(word).text();
            var final_word = stripped_word.replace(/[^’a-zA-Z ]/g, "");
            final_word = word.value;

            if (stoplist.indexOf(final_word) === -1) {

              globalData.push({
                key: final_word,
                headline: headline_uc,
                context_words: doc.keywords.filter((w) => {return ( w.value !== final_word && w.name === "subject"); }).map((w) => {return w.value; }),
                doc: doc,
                type: doc.document_type,
                type_mat: doc.type_of_material,
                pub_date: doc.pub_date,
                keywords: doc.keywords,
                news_desk: doc.news_desk,
                web_url: doc.web_url // url
              });
            }
          });
        }
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
      callback(globalData);
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

