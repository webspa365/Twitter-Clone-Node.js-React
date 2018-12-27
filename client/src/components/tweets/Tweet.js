import React from 'react';
import {Redirect, Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _all, _css, set_css, from_now} from '../../modules/script';
import {http} from '../../modules/http';
import './Tweet.css';

import TweetMenu from './TweetMenu';

class Tweet extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: '',
      menu: false,
      tweet: this.props.tweet,
    }

    this.click_tweet = this.click_tweet.bind(this);
    this.open_menu = this.open_menu.bind(this);
    this.set_menu = this.set_menu.bind(this);
    this.post_like = this.post_like.bind(this);
    this.post_retweet = this.post_retweet.bind(this);
    this.tweetMenu = React.createRef();
  }

  componentWillReceiveProps() {
    if(this.state.menu && this.tweetMenu.style.display == 'none') {
      this.setState({menu: false});
    }
  }

  open_menu() {
    if(this.state.menu) {
      this.setState({menu: false});
    } else {
      var menus = _all('.tweetMenu');
      for(var menu of menus) {
        menu.style.display = 'none';
      }
      this.setState({menu: true});
    }
  }

  set_menu(menu) {
    this.setState({menu});
  }

  click_tweet(e) {
    console.log('classes='+e.target.classList);
    if(this.state.menu) {
      if(e.target.className !== 'tweetMenu' && e.target.className !== 'menuItem') {
        this.setState({menu: false});
      }
    }
  }

  post_like() {
    if(!this.props.account || !localStorage.getItem('jwtToken')) {
      this.setState({redirect: '/'}, () => {
        this.setState({redirect: ''});
      });
      return;
    }
    http.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
    http.post('/likes/post', {tweetId: this.state.tweet._id})
    .then((res) => {
      console.log('/likes/post='+JSON.stringify(res.data));
      if(res.data.success) {
        // update tweet likes
        var tweet = this.state.tweet;
        tweet.likes = res.data.postLikes;
        tweet.liked = res.data.liked;
        this.setState({tweet});
        if(window.location.href.indexOf('/home') === -1) {
          // update account likes
          var account = this.props.account;
          account.likes = res.data.userLikes;
          this.props.setAccount(account);
          // update profile likes
          if(account.username === this.props.profile.username) {
            var profile = this.props.profile;
            profile.likes = res.data.userLikes;
            this.props.setProfile(profile);
          }
        }
      }
    });
  }

  post_retweet() {
    if(!this.props.account || !localStorage.getItem('jwtToken')) {
      this.setState({redirect: '/'}, () => {
        this.setState({redirect: ''});
      });
      return;
    }
    console.log('post_retweet()');
    http.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
    http.post('/retweets/post', {tweetId: this.state.tweet._id})
    .then((res) => {
      console.log('/retweets/post='+JSON.stringify(res.data));
      if(res.data.success) {
        // update tweet likes
        var tweet = this.state.tweet;
        tweet.retweets = res.data.postC;
        tweet.retweeted = res.data.retweeted;
        this.setState({tweet});
      }
    });
  }

  render() {
    var redirect = (this.state.redirect) ? <Redirect to={this.state.redirect} /> : '';

    var avatar = (this.state.tweet.avatar) ? <img src={this.state.tweet.avatar} /> : <i className='fa fa-user'></i>;

    var retweeted = '';
    if(this.props.tweet.retweetedBy) {
      retweeted = (
        <div className='retweeted'>
          <i className='fa fa-retweet'></i> {this.props.tweet.retweetedBy} retweeted
        </div>
      );
    }

    var menu = (this.state.menu) ? <TweetMenu ref={this.tweetMenu} tweet={this.state.tweet} set_menu={this.set_menu} /> : '';

    var username = window.location.search.split('?user=')[1];
    var date = from_now(new Date(this.state.tweet.createdAt).getTime());
    var str = this.state.tweet.tweet;
    if(str.indexOf(' ') > -1) {
      var words = str.split(' ');
      var tweet = [];
      for(var i=0; i<words.length; i++) {
        if(words[i][0] != '@') {
          tweet.push(words[i] + ' ');
        } else {
          var name = words[i].replace('@', '');
          name = name.replace('.', '');
          tweet.push(<Link to={'/profile?user='+name}>@{name + ' '}</Link>);
        }
      }
    } else {
      var tweet = str;
    }

    // active icons
    var retweet = (this.state.tweet.retweeted) ? 'active' : '';
    var heart = (this.state.tweet.liked) ? 'active' : '';

    return (
      //<li className='tweet' onClick={(e) => {this.click_tweet(e)}}>
      <li className='tweet'>
        {redirect}
        {retweeted}
        <Link className='avatar' to={'/profile?user='+this.state.tweet.username}>
          {avatar}
        </Link>
        <div className='info'>
          <span className='name'>{this.state.tweet.name}</span>
          <span className='username'>
            <Link to={'/profile?user='+this.state.tweet.username}>@{this.state.tweet.username}</Link>
          </span>
          <span className='date'>・{date}</span>
          <div className='toggle' onClick={() => {this.open_menu(true)}}>
            <i className='fa fa-angle-down'></i>
            {menu}
          </div>
        </div>
        <div className='content'>
          <p>{tweet}</p>
        </div>
        <div className='icons'>
          <div className='reply'><i className='fa fa-comment-o'></i><span>{this.state.tweet.replies}</span></div>
          <div className='retweet' onClick={() => {this.post_retweet()}}>
            <i className={'fa fa-retweet '+retweet}></i><span>{this.state.tweet.retweets}</span>
          </div>
          <div className='like' onClick={() => {this.post_like()}}>
            <i className={'fa fa-heart-o '+heart}></i><span>{this.state.tweet.likes}</span>
          </div>
          <div className='chart'><i className='fa fa-bar-chart'></i></div>
        </div>
      </li>
    );
  }
}

var mstp = state => ({
  account: state.account,
  profile: state.profile
});

var mdtp = dispatch => {
  return {
    setAccount: (account) => {
      dispatch({type: 'ACCOUNT', payload: account});
    },
    setProfile: (profile) => {
      dispatch({type: 'PROFILE', payload: profile});
    }
  };
};

export default connect(mstp, mdtp)(Tweet);
//export default Tweet;
