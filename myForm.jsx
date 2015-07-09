MyForm = ReactMeteor.createClass({

  getDefaultProps: function() {
    return {
      year: 2015,
      month: 6,
      newsDesk: "National",
      changeHandler: () => { return this.state; }
    };
  },

  getInitialState: function() {
    return {
      year: this.props.year,
      month: this.props.month,
      newsDesk: this.props.newsDesk
    };
  },

  handleSubmit: function(event) {
    event.preventDefault();
    this.props.changeHandler(this.state);
  },

  render: function() {
    return (
        <form onSubmit={this.handleSubmit} className="search-form">
          <fieldset>
            <legend>Search Articles</legend>
            <div className="row">
                <div className="form-group col-md-3">
                    <label className="control-label">Year </label>
                    <input type="number" className="form-control"
                      ref="start_year" defaultValue="2014"
                      onChange = { (event) => {
                          this.setState({ year: event.target.value });
                        }
                      }
                      />
                </div>
                <div className="form-group col-md-3">
                    <label className="control-label">Month </label>
                    <select className="form-control"
                      defaultValue={this.props.month} ref="month"
                      onChange={ (event) => {
                          this.setState({ month: event.target.value });
                        }
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

                <div className="form-group col-lg-3 col-md-3">
                      <label className="control-label">Category </label>
                      <select className="form-control"
                        defaultValue={this.props.newsDesk}
                        onChange={ (event) => {
                            this.setState({ newsDesk: event.target.value });
                          }
                        }>
                         <option value="National">National</option>
                         <option value="Sports">Sports</option>
                         <option value="Foreign">Foreign</option>
                         <option value="Culture">Culture</option>
                         <option value="Society">Society</option>
                      </select>
                  </div>

                <div className="form-group col-lg-3 col-md-3 push-down">
                  <button type="submit"
                    className="form-control btn btn-primary buttonSearch"
                    bsStyle='primary'
                    >
                    Get it on! <i className="glyphicon glyphicon-ok"></i>
                  </button>
                </div>
              </div>
            </fieldset>
        </form>
      );
    }
});
