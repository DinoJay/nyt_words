Cloud = React.createClass({
  componentDidMount: function() {
    var el = this.getDOMNode();
    d3Cloud.create(el, this.getCloudState(), this.props.callback);
  },

  componentDidUpdate: function() {
    console.log("state", this.getCloudState());
    var el = this.getDOMNode();
    d3Cloud.update(el, this.getCloudState(), this.props.callback);
  },

  getCloudState: function() {
    return {
      data: this.props.data
    };

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
