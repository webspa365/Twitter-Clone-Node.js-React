import React from "react";
import { NavLink, Redirect } from 'react-router-dom';
import {connect} from 'react-redux';
import {http} from '../../modules/http';
import {config} from '../../modules/config';
import {_} from '../../modules/script';
import './LogIn.css';

class LogIn extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      message: '',
      redirect: ''
    }

    this.change_username = this.change_username.bind(this);
    this.change_password = this.change_password.bind(this);
    this.log_in = this.log_in.bind(this);
  }

  change_username(event) {
    this.setState({username: event.target.value});
  }

  change_password(event) {
    this.setState({password: event.target.value});
  }

  log_in() {
    _('.loader').style.display = 'block';
    var data = {
      username: this.state.username,
      password: this.state.password
    }
    http.post('/users/login', data)
    .then((res) => {
      _('.loader').style.display = 'none';
      console.log('/users/login='+JSON.stringify(res.data));
      if(res.data.success) {
        var user = res.data.user;
        if(user.avatar) user.avatar = config.server+'/images/'+user._id+'/avatar/'+user.avatar;
        if(user.bg) user.bg = config.server+'/images/'+user._id+'/bg/'+user.bg;
        localStorage.setItem('jwtToken', res.data.token);
        this.props.setLoggedIn(true);
        this.props.setAccount(user);
        this.props.setProfile(user);
        this.setState({
          username: '',
          password: '',
          redirect: '/profile?user='+res.data.user.username
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

  componentWillReceiveProps(nextProps) {
  }

  render() {
    var redirect = '';
    if(this.state.redirect != '') redirect = <Redirect to={this.state.redirect} />;

    return (
      <div className='logIn'>
        {redirect}
        <header>
          <i className='fa fa-twitter'></i>
          <h1>Log In to Twitter</h1>
        </header>
        <form>
          <div className="form-group">
            <label>Username:</label>
            <input type="text" className="form-control" id="username" value={this.state.username}
            onChange={this.change_username} />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input type="password" className="form-control" id="password" value={this.state.password}
            onChange={this.change_password} />
          </div>
          <div className="form-group">
            <label className='message'>{this.state.message}</label>
            <input type="button" className="form-control button" id="login" value="Log In" onClick={this.log_in} />
          </div>
        </form>
        <div className='toSignUp'>
          <p>New to Twitter? <span onClick={(e) => {this.props.switch_form(e, 0)}}>Sign up now »</span></p>
        </div>
      </div>
    );
  }
};

var mstp = state => ({
});

var mdtp = dispatch => {
  return {
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
export default connect(mstp, mdtp)(LogIn);
