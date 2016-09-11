import React from 'react';
import { Navigation } from 'react-router';
import h from '../helpers';

var StorePicker = React.createClass({
  mixins: [Navigation],

  goToStore: function(event){
    event.preventDefault();
    //get data from the input
    var storeId = this.refs.storeId.value;
    // transition from <StorePicker/> to <App?>
    this.history.pushState(null,'/store/' + storeId);
  },

  render: function() {
    return (
      <form className='store-selector' onSubmit={this.goToStore}>
        <h2>Please Enter A Store</h2>
        <input type="text" ref='storeId' defaultValue={h.getFunName()} required />
        <input type="submit" />
      </form>
    )
  }
});

export default StorePicker;