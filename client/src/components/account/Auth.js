import React from 'react';
import {Redirect} from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _all, _css, set_css, set_display} from '../../modules/script';
import './Auth.css';
import LogIn from './LogIn';
import SignUp from './SignUp';

class Auth extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: ''
    }

    this.switch_form = this.switch_form.bind(this);
  }

  componentWillMount() {
    if(this.props.loggedIn && this.props.account && localStorage.getItem('jwtToken')) {
      this.setState({redirect: '/profile?user='+this.props.account.username});
    }
  }

  switch_form(e, i) {
    console.log('i='+i);
    if(i == 0) this.setState({redirect: '/signUp'});
    else this.setState({redirect: '/logIn'});
  }

  render() {
    var redirect = (this.state.redirect) ? <Redirect to={this.state.redirect} /> : '';

    var right = '';
    if(!redirect) {
      right = (
        <div className='wrapper'>
          <i className='fa fa-twitter'></i>
          <p>See what’s happening in<br /> the world right now</p>
          <h1>Join Twitter today.</h1>
          <button className='btn btn-primary' onClick={(e) => {this.switch_form(e, 0)}}>Sign Up</button>
          <button className='btn btn-default' onClick={(e) => {this.switch_form(e, 1)}}>Log In</button>
        </div>
      )
    } else if(this.state.redirect == '/signUp') {
      right = <SignUp switch_form={this.switch_form} />;
    } else if(this.state.redirect == '/logIn') {
      right = <LogIn switch_form={this.switch_form} />;
    }

    return (
      <div className='auth'>
        {redirect}
        <div className='left'>
          <ul>
            <li>
              <i className='fa fa-search'></i>
              <span>Follow your interests.</span>
            </li>
            <li>
              <i className='fa fa-user-o'></i>
              <span>Hear what people are talking about.</span>
            </li>
            <li>
              <i className='fa fa-comment-o'></i>
              <span>Join the conversation.</span>
            </li>
          </ul>
          <div className='bg'><i className='fa fa-twitter'></i></div>
        </div>
        <div className='right'>
          {right}
        </div>

      </div>
    );
  }
}

var mstp = state => ({
  loggedIn: state.loggedIn,
  account: state.account
});

var mdtp = dispatch => {
  return {
    set_: (_) => {
      dispatch({type: '', payload: _});
    }
  };
};

export default connect(mstp, null)(Auth);
