import React from "react";
import { Redirect } from 'react-router-dom';
import {connect} from 'react-redux';
import {http} from '../../modules/http';
import {_, _all} from '../../modules/script';
import './SignUp.css';

class SignUp extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: '',
      error: '',
      user: {
        username: '',
        email: '',
        password: '',
        confirmation: ''
      },
      message: ''
    }

    this.on_change = this.on_change.bind(this);
    this.sign_up = this.sign_up.bind(this);
  }

  on_change(event) {
    const { name, value } = event.target;
    //console.log('['+name+']='+value);
    this.setState({
      user: {
          ...this.state.user,
          [name]: value
      }
    });
  }

  sign_up() {
    _('.loader').style.display = 'block';
    var {user} = this.state;
    var data = {
      username: user.username,
      email: user.email,
      password: user.password,
      confirmation: user.confirmation
    }
    http.post('/users/signup', data)
    .then((res) => {
      console.log('/users/signup='+JSON.stringify(res.data));
      _('.loader').style.display = 'none';
      if(res.data.success) {
        //this.setState({redirect: 'login'});
        localStorage.setItem('jwtToken', res.data.token);
        this.props.setUsername(res.data.user.username);
        this.props.setAccount(res.data.user);
        this.props.setProfile(res.data.user);
        this.props.setLoggedIn(true);
        this.setState({
          username: '',
          password: '',
          redirect: '/profile?user='+data.username
        });
      } else {
        this.setState({message: res.data.msg});
      }
    })
    .catch((err) => {
      _('.loader').style.display = 'none';
      this.setState({message: err.toString()});
    });
  }

  render() {
    var redirect = '';
    if(this.state.redirect != '') redirect = <Redirect to={this.state.redirect} />;

    var {user} = this.state;

    console.log('this.state.message='+this.state.message);

    return (
      <div className='signUp'>
        {redirect}
        <header>
          <i className='fa fa-twitter'></i>
          <h1>Create Your Account</h1>
        </header>
        <form>
          <div className="form-group">
            <label>Username: <span id='for_username'></span></label>
            <input type="text" className="form-control" id="username" name='username' onChange={this.on_change} />
          </div>
          <div className="form-group">
            <label>Email address: <span id='for_email'></span></label>
            <input type="email" className="form-control" id="email" name='email' onChange={this.on_change} />
          </div>
          <div className="form-group">
            <label>Password: <span id='for_password'></span></label>
            <input type="password" className="form-control" id="password" name='password' onChange={this.on_change} />
          </div>
          <div className="form-group">
            <label>Confirm password: <span id='for_confirmation'></span></label>
            <input type="password" className="form-control" id="confirmation" name='confirmation' onChange={this.on_change} />
          </div>
          <div className="form-group">
            <label><span id='for_post' className='message'>{this.state.message}</span></label>
            <input type="button" className="form-control button" id="submit" value="Sign Up" onClick={this.sign_up} />
          </div>
        </form>
        <div className='toLogIn'>
          <p>If you have an account, <span onClick={(e) => {this.props.switch_form(e, 1)}}>Log In »</span></p>
        </div>
      </div>
    );
  }
};

var mstp = state => ({
  username: state.username
});

var mdtp = dispatch => {
  return {
    setUsername: (username) => {
      dispatch({type: 'USERNAME', payload: username});
    },
    setLoggedIn: (loggedIn) => {
      dispatch({type: 'LOGGEDIN', payload: loggedIn});
    },
    setAccount: (account) => {
      dispatch({type: 'ACCOUNT', payload: account});
    },
    setProfile: (profile) => {
      dispatch({type: 'PROFILE', payload: profile});
    }
  };
};

export default connect(mstp, mdtp)(SignUp);
