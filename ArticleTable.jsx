ArticleTable = ReactMeteor.createClass({

  // getInitialState: function() {
  //   return {
  //     data: []
  //   };
  // },

  getDefaultProps: function() {
    return {
      data: []
    };
  },

  renderArticle: function(article) {

    var keywords = article.keywords.filter((a)=> {
      return a.name === "subject";
    }).map((a) => {return a.value; });

    return (
      <Article name={article.headline} keywords={keywords}
      date={article.pub_date} url={article.web_url}/>
    );
  },

  render: function() {

    console.log("props");
    var rows = this.props.data.map(this.renderArticle);
    return (
      <table className="table table-striped">
        <thead>
          <tr>
            <th className="name-cell">Article</th>
            <th className="date-cell">Date</th>
            <th className="keywords-cell">keywords</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  }
});

var Article = ReactMeteor.createClass({

  getDefaultProps: function() {
    return {
      name: "",
      keywords: "",
      date: "",
      url: ""
    };
  },

  render: function() {
    var dateStr = moment(this.props.date).format('MMMM Do YYYY');
    var keywordsStr = this.props.keywords.map((k, i) => {
      return i !== 0 ? " ".concat(k) : k;
    }).toString();

    return (
      <tr>
        <td className="name-cell">
          <a href={this.props.url}>{this.props.name}</a>
        </td>
        <td className="date-cell">{dateStr}</td>
        <td className="keywords-cell">{keywordsStr}</td>
      </tr>
    );
  }
});
