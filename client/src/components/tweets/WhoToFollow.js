import React from 'react';
import {Redirect, Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _all, _css, set_css, set_display} from '../../modules/script';
import {http} from '../../modules/http';
import {config} from '../../modules/config';
import './WhoToFollow.css';

class WhoToFollow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: '',
      users: []
    }

    this.get_users = this.get_users.bind(this);
    this.follow_user = this.follow_user.bind(this);
  }

  componentWillMount() {
    this.get_users();
  }

  get_users() {
    console.log('get_users()');
    if(!localStorage.getItem('jwtToken')) return;
    http.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
    http.get('/relationships/unfollowing')
    .then((res) => {
      console.log('/relationships/unfollowing='+JSON.stringify(res.data));
      var users = res.data.users;
      for(var u of users) {
        if(u.avatar) u.avatar = config.server+'/images/'+u._id+'/avatar/thumb-'+u.avatar;
        if(u.bg) u.bg = config.server+'/images/'+u._id+'/bg/thumb-'+u.bg;
      }
      this.setState({users});
    });
  }

  follow_user(e) {
    var username = e.target.getAttribute('username');
    console.log(username);
    if(!localStorage.getItem('jwtToken')) return;
    http.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
    http.post('/relationships/follow', {username})
    .then((res) => {
      console.log('/relationships/follow='+JSON.stringify(res.data));
      if(res.data.success) {
        var users = this.state.users;
        for(var user of users) {
          if(user.username === username) {
            user.followed = res.data.followed;
            console.log('followed');
          }
        }
        this.setState({users});
        /*
        this.setState({followed: res.data.followed});
        var account = this.props.account;
        account.following = res.data.following;
        this.props.setAccount(account);
        if(this.props.username == this.props.user.username) {
          var profile = this.props.profile;
          profile.followers = res.data.followers;
          this.props.setProfile(profile);
        }*/
      }
    });
  }

  render() {
    var redirect = (this.state.redirect) ? <Redirect to={this.state.redirect} /> : '';

    var users = [];
    for(var i=0; i<this.state.users.length; i++) {
      var avatar = <i className='fa fa-user'></i>;
      var user = this.state.users[i];
      if(user.avatar) {
        avatar = <img src={user.avatar} />;
      }
      var li = (
        <li key={i}>
          <Link className='avatar' to={'/profile?user='+user.username}>
            {avatar}
          </Link>
          <div className='nameWrapper'>
            <span className='name'>{user.name}</span>
            <span className='username'>@{user.username}</span>
          </div>
          <div className='buttonWrapper'>
            <button className={'followButton '+((user.followed) ? 'followed' : '')}
            username={user.username} onClick={(e) => {this.follow_user(e)}}></button>
          </div>
        </li>
      );
      users.push(li);
    }

    return (
      <div className='whoToFollow'>
        <h2>Who to follow</h2>
        <ul>
          {users}
        </ul>
      </div>
    );
  }
}

export default WhoToFollow;
