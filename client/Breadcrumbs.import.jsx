var Breadcrumbs = React.createClass({

  getDefaultProps: function() {
    return {
      history: [],
      clickHandler: null
    };
  },

  getInitialState: function() {
    return {
      history: this.props.history,
      clickHandler: this.props.clickHandler
    };
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({
      history: nextProps.history,
      clickHandler: nextProps.clickHandler
    });
  },

  renderCrumb: function(text) {
    return <Crumb text={text} clickHandler={this.state.clickHandler}/>;
  },

  render: function() {

    var crumbs = this.state.history.map(this.renderCrumb);

    return (
      <ol className="bc">
        {crumbs.length > 0 ? crumbs : "No Word selected"}
      </ol>
    );
  }
});


var Crumb = React.createClass({

  getDefaultProps: function() {
    return {
      text: null,
      clickHandler: null
    };
  },

  componentDidMount: function() {
  },

  componentDidUpdate: function(prevProps, prevState) {
  },

  handleClick: function(e) {
    e.preventDefault();
    this.props.clickHandler(this.props.text);
  },

  render: function() {
    return (
      <li className="">
        <a href="" onClick={this.handleClick}>
          {this.props.text}
        </a>
      </li>
    );
  }
});

export default Breadcrumbs;
