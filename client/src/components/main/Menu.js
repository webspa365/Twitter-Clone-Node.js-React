import React from 'react';
import {Redirect, Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _all, _css, set_css, set_display} from '../../modules/script';
import {http} from '../../modules/http';
import './Menu.css';

class Menu extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: '',
      loading: false
    }

    this.to_profile = this.to_profile.bind(this);
    this.log_out = this.log_out.bind(this);
  }

  to_profile() {
    console.log('to_profile()');
    this.setState({redirect: '/profile?user='+this.props.account.username}, () => {
      this.setState({redirect: ''});
    });
  }

  log_out() {
    localStorage.setItem("jwtToken", null);
    this.props.setLoggedIn(false);
    this.props.setAccount({});
    this.setState({redirect: '/login'}, () => {
      this.setState({redirect: ''});
    });
    /*
    http.get('/users/logout')
    .then((res) => {
      console.log('/users/logout='+JSON.stringify(res.data));
      if(res.data.success) {

      }
    });*/
  }

  render() {
    var redirect = (this.state.redirect) ? <Redirect to={this.state.redirect} /> : '';
    return (
      <div className='menu'>
        {redirect}
        <div><div></div></div>
        <ul>
          <li className='user' onClick={() => {this.to_profile()}}>
            <Link to={'/profile?user='+this.props.account.username}>
              <span>{this.props.account.name}</span>
              <span>@{this.props.account.username}</span>
            </Link>
          </li>
          <li className='following'>
            <Link to={'/profile/following?user='+this.props.account.username}>{this.props.account.following} Following</Link>
          </li>
          <li className='followers'>
            <Link to={'/profile/followers?user='+this.props.account.username}>{this.props.account.followers} Followers</Link>
          </li>
          <li className='likes'><Link to=''>{this.props.account.likes} Likes</Link></li>
          <li className='logout' onClick={() => {this.log_out()}}>Log out</li>
        </ul>
      </div>
    );
  }
}

var mstp = state => ({
  account: state.account
});

var mdtp = dispatch => {
  return {
    setLoggedIn: (loggedIn) => {
      dispatch({type: 'LOGGEDIN', payload: loggedIn});
    },
    setAccount: (account) => {
      dispatch({type: 'ACCOUNT', payload: account});
    }
  };
};

export default connect(mstp, mdtp, null, {pure: false})(Menu);
