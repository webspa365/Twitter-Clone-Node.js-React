import React from 'react';
import {Redirect} from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _all, _css, set_css, set_display} from '../../modules/script';
import './Notifications.css';

class Notifications extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: ''
    }
  }

  render() {
    var redirect = (this.state.redirect) ? <Redirect to={this.state.redirect} /> : '';
    return (
      <div className='_'>
        {redirect}
        notifications
      </div>
    );
  }
}

var mstp = state => ({
  _: state._
});

var mdtp = dispatch => {
  return {
    set_: (_) => {
      dispatch({type: '', payload: _});
    }
  };
};

//export default connect(mstp, mdtp)(Notifications);
export default Notifications;
