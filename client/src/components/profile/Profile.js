import React from 'react';
import {Redirect, Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _all, _css, set_css, set_display} from '../../modules/script';
import {http} from '../../modules/http';
import {config} from '../../modules/config';
import './Profile.css';

import Tweets from '../tweets/Tweets';
import WhoToFollow from '../tweets/WhoToFollow';
import Trends from '../tweets/Trends';
import User from './User';
import EditProfile from './EditProfile';

const months = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

class Profile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: '',
      showUsers: '',
      url: '',
      followed: false,
      skip: 0,
      rSkip: 0,
      users: [],
      show_more: () => {},
      clicked: false,
      max: 0
    }

    this.get_by_url = this.get_by_url.bind(this);
    this.set_profile = this.set_profile.bind(this);
    this.edit_profile = this.edit_profile.bind(this);
    this.click_li = this.click_li.bind(this);
    this.get_tweets = this.get_tweets.bind(this);
    this.get_following = this.get_following.bind(this);
    this.get_followers = this.get_followers.bind(this);
    this.get_likes = this.get_likes.bind(this);
    this.set_active = this.set_active.bind(this);
    this.follow_user = this.follow_user.bind(this);
  }

  componentWillUpdate() {
    console.log('componentWillUpdate()');
    if(this.state.url != window.location.href) {
      this.setState({url: window.location.href}, () => {
        console.log('this.state.url='+window.location.href);
        this.set_profile();
        if(!this.state.clicked) this.get_by_url(window.location.href);
      });
    }
  }

  get_by_url(url) {
    var username = window.location.search.split('?user=')[1];
    if(username) {
      for(var i=0; i<4; i++) {
        _('.navigation ul li:nth-of-type('+(i+1)+') a').classList.remove('active');
      }
      if(url.indexOf('/profile?user') > -1) {
        this.click_li(0);
      }
      else if(url.indexOf('/profile/following') > -1) {
        this.click_li(1);
      }
      else if(url.indexOf('/profile/followers') > -1) {
        this.click_li(2);
      }
      else if(url.indexOf('/profile/likes') > -1) {
        this.click_li(3);
      }
    }
  }

  set_profile() {
    var username = window.location.search.split('?user=')[1];
    if(!username) return;
    if(localStorage.getItem('jwtToken')) {
      http.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
    }
    http.get('/users/'+username)
    .then((res) => {
      console.log('/users/get='+JSON.stringify(res.data));
      if(res.data.success) {
        var user = res.data.user;
        if(user.avatar) user.avatar = config.server+'/images/'+user._id+'/avatar/'+user.avatar;
        if(user.bg) user.bg = config.server+'/images/'+user._id+'/bg/'+user.bg;
        this.props.setProfile(user);
        if(this.props.account && this.props.account.username === user.username) {
          this.props.setAccount(user);
        }
        this.setState({followed: this.props.profile.followed});
      }
    });
  }

  click_li(index) {
    this.setState({skip: 0, rSkip: 0, clicked: true}, () => {
      //setTimeout(() => {
        this.props.setTweets([]);
        if(index === 0) this.get_tweets();
        else if(index === 1) this.get_following();
        else if(index === 2) this.get_followers();
        else if(index === 3) this.get_likes();
        setTimeout(() => {
          this.setState({clicked: false});
        }, 200);
      //}, 500);
    });
  }

  get_tweets() {
    console.log('get_tweets()');
    var username =  window.location.search.split('?user=')[1];
    if(!username) return;
    this.set_active(0);
    this.setState({showUsers: false, show_more: this.get_tweets});
    this.props.setLoading(true);
    if(this.props.account.tweets == 0 && this.props.account.username == this.props.profile.username) {
      this.props.setLoading(false);
    }
    if(localStorage.getItem('jwtToken')) {
      http.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
    }
    http.get('/tweets/tweets', {params: {username, skip: this.state.skip, rSkip: this.state.rSkip}})
    .then((res) => {
      console.log('/tweets/get='+JSON.stringify(res.data));
      if(res.data.success) {
        var tweets = res.data.tweets;
        for(var t of tweets) {
          if(res.data.avatars[t.username]) {
            t.avatar = config.server+'/images/'+t.userId+'/avatar/thumb-'+res.data.avatars[t.username];
          }
        }
        // concat
        var oldTweets = this.props.tweets;
        tweets = oldTweets.concat(tweets);
        // get number of retweets
        var r = 0;
        for(var t of tweets) {
          if(t.retweetedBy) r++;
        }
        // update
        this.props.setTweets(tweets);
        this.props.setLoading(false);
        this.setState({
          skip: (tweets.length-r),
          rSkip: r,
          max: this.props.profile.tweets
        });
      }
    })
    .catch((err) => {
      console.log(err);
      this.props.setLoading(false);
    });
  }

  get_following() {
    this.set_active(1);
    this.setState({showUsers: true, show_more: this.get_following});
    this.props.setLoading(true);
    http.get('relationships/following', {params: {userId: this.props.profile._id}})
    .then((res) => {
      console.log('/relationships/following='+JSON.stringify(res.data));
      if(res.data.success) {
        var users = res.data.users;
        for(var u of users) {
          if(u.avatar) u.avatar = config.server+'/images/'+u._id+'/avatar/thumb-'+u.avatar;
          if(u.bg) u.bg = config.server+'/images/'+u._id+'/bg/thumb-'+u.bg;
        }
        this.setState({users, max: this.props.profile.following});
        this.props.setLoading(false);
      }
    });
  }

  get_followers() {
    this.set_active(2);
    this.setState({showUsers: true, show_more: this.get_followers});
    this.props.setLoading(true);
    http.get('relationships/followers', {params: {userId: this.props.profile._id}})
    .then((res) => {
      console.log('/relationships/followers='+JSON.stringify(res.data));
      if(res.data.success) {
        var users = res.data.users;
        for(var u of users) {
          if(u.avatar) u.avatar = config.server+'/images/'+u._id+'/avatar/thumb-'+u.avatar;
          if(u.bg) u.bg = config.server+'/images/'+u._id+'/bg/thumb-'+u.bg;
        }
        this.setState({users, max: this.props.profile.followers});
        this.props.setLoading(false);
      }
    });
  }

  get_likes() {
    this.set_active(3);
    this.setState({showUsers: false, show_more: this.get_likes});
    this.props.setLoading(true);
    if(this.props.loggedIn) http.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
    http.get('/tweets/likedTweets', {params: {userId: this.props.profile._id, skip: this.state.skip}})
    .then((res) => {
      console.log('/tweets/likedTweets='+JSON.stringify(res.data));
      if(res.data.success) {
        var tweets = res.data.tweets;
        for(var t of tweets) {
          if(res.data.avatars[t.username]) {
            t.avatar = config.server+'/images/'+t.userId+'/avatar/thumb-'+res.data.avatars[t.username];
          }
        }
        // concat
        var oldTweets = this.props.tweets;
        tweets = oldTweets.concat(tweets);
        // update
        this.props.setTweets(tweets);
        this.props.setLoading(false);
        this.setState({skip: tweets.length, max: this.props.profile.likes});
      }
    })
    .catch((err) => {
      console.log(err);
      this.props.setLoading(false);
    });
  }

  set_active(index) {
    var list = _all('.profile_ul li');
    for(var i=0; i<list.length; i++) {
      if(i != index) list[i].classList.remove('active');
      else list[i].classList.add('active');
    }
  }

  follow_user(e) {
    if(!this.props.account || !localStorage.getItem('jwtToken')) {
      this.setState({redirect: '/login'}, () => {
        this.setState({redirect: ''});
        return;
      });
    }
    http.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
    http.post('/relationships/follow', {username: this.props.profile.username})
    .then((res) => {
      console.log('/relationships/follow='+JSON.stringify(res.data));
      if(res.data.success) {
        this.setState({followed: res.data.followed});
        // update profile
        var profile = this.props.profile;
        profile.followers = res.data.followers;
        if(this.props.account._id == this.props.profile._id) {
          profile.following = res.data.following;
        }
        this.props.setProfile(profile);
        // update account
        var account = this.props.account;
        account.following = res.data.following;
        this.props.setAccount(account);

      }
    });
  }

  edit_profile(e) {
    this.setState({redirect: '/editProfile'}, () => {
      this.setState({redirect: ''});
    });
  }

  render() {
    var redirect = (this.state.redirect) ? <Redirect to={this.state.redirect} /> : '';

    var button = '';
    if(this.state.followed) {
      button = <button className='btn btn-primary follow followed' onClick={(e) => {this.follow_user(e)}}></button>;
    } else {
      button = <button className='btn btn-primary follow ' onClick={(e) => {this.follow_user(e)}}>Follow</button>;
    }
    if(this.props.account.username === this.props.profile.username) {
      button = <button className='btn btn-default edit' onClick={(e) => {this.edit_profile(e)}}>Edit Profile</button>;
    }

    // show tweets or users at the right column
    var right = (
      <div className='right col-lg-9'>
        <div className='col-lg-8'>
          <Tweets header='profile' get_tweets={this.get_tweets} show_more={this.state.show_more} max={this.state.max} />
        </div>
        <div className='col-ls-4'>
        </div>
      </div>
    );

    // show users
    if(this.state.showUsers) {
      var users = [];
      for(var i=0; i<this.state.users.length; i++) {
        var u = this.state.users[i];
        users.push(
          <User key={i} class='user' user={u} />
        );
      }
      right = (
        <div className='right col-lg-9'>
          {users}
        </div>
      );
    }

    // date
    var date = '';
    var d = new Date(this.props.profile.createdAt);
    date = <div>Member since {d.getFullYear()+' '+months[d.getMonth()]}</div>;

    return (
      <div className='profile'>
        {redirect}
        <div className='bg'>
          <img src={this.props.profile.bg} />
        </div>
        <div className='nav'>
          <div className='container'>
            <Link className='avatar' to={'/profile?user='+this.props.profile.username}>
              <img src={this.props.profile.avatar} />
            </Link>
            <ul className='profile_ul'>
              <li className='active' onClick={(e) => {this.click_li(0)}}>
                <Link to={'/profile?user='+this.props.profile.username}>
                  <span>Tweets</span>
                  <span>{this.props.profile.tweets}</span>
                </Link>
              </li>
              <li onClick={(e) => {this.click_li(1)}}>
                <Link to={'/profile/following?user='+this.props.profile.username} >
                  <span>Following</span>
                  <span>{this.props.profile.following}</span>
                </Link>
              </li>
              <li onClick={(e) => {this.click_li(2)}}>
                <Link to={'/profile/followers?user='+this.props.profile.username} >
                  <span>Followers</span>
                  <span>{this.props.profile.followers}</span>
                </Link>
              </li>
              <li onClick={(e) => {this.click_li(3)}}>
                <Link to={'/profile/likes?user='+this.props.profile.username} >
                  <span>Likes</span>
                  <span>{this.props.profile.likes}</span>
                </Link>
              </li>
            </ul>
            {button}
          </div>
        </div>

        <div className='main container'>
          <div className='row'>
            <div className='left col-lg-3'>
              <div className='info'>
                <h1>
                  <span className='name'>{this.props.profile.name}</span>
                  <span className='username'>@{this.props.profile.username}</span>
                </h1>
                <p className='bio'>{this.props.profile.bio}</p>
                <div className='date'>{date}</div>
              </div>
            </div>
            {right}
          </div>
        </div>
      </div>
    );
  }
}

var mstp = state => ({
  loggedIn: state.loggedIn,
  account: state.account,
  profile: state.profile,
  tweets: state.tweets
});

var mdtp = dispatch => {
  return {
    setProfile: (profile) => {
      dispatch({type: 'PROFILE', payload: profile});
    },
    setAccount: (account) => {
      dispatch({type: 'ACCOUNT', payload: account});
    },
    setTweets: (tweets) => {
      dispatch({type: 'TWEETS', payload: tweets});
    },
    setLoading: (loading) => {
      dispatch({type: 'LOADING', payload: loading});
    }
  };
};

export default connect(mstp, mdtp, null, {pure: false})(Profile);
