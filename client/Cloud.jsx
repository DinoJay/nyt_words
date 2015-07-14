Cloud = React.createClass({
  getDefaultProps: function() {
    return {
      data: [],
      history: []
    };
  },

  componentDidMount: function() {
    var el = this.getDOMNode();
    d3Cloud.create(el, this.props, this.props.callback);
  },

  componentDidUpdate: function() {
    var el = this.getDOMNode();
    console.log("this props history", this.props.history);
    d3Cloud.update(el, this.props, this.props.callback);
  },

  componentWillUnmount: function() {
    var el = this.getDOMNode();
    //d3Cloud.destroy(el);
  },

  render: function() {
    return (
      <div className="Cloud"></div>
    );
  }
});
