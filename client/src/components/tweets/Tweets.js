import React from 'react';
import {Redirect, Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _all, _css, set_css} from '../../modules/script';
import {http} from '../../modules/http';
import {config} from '../../modules/config';
import './Tweets.css';

import Tweet from './Tweet';

class Tweets extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: '',
      username: '',
      mode: '', // tweets, replies, media, likes
      url: '',
      tweets: [],
      count: 0
    }

    this.get_replies = this.get_replies.bind(this);
    this.get_media = this.get_media.bind(this);
    this.set_active = this.set_active.bind(this);
    this.back_to_top = this.back_to_top.bind(this);
  }

  componentWillMount() {
    this.props.setTweets([]);
    var url = window.location.href;
    if(url.indexOf('/profile') > -1) {
      var username = window.location.search.split('?user=')[1];
      if(username) {
        this.setState({username, url});
        //this.get_tweets({username});
      }
    }
  }

  componentWillUpdate() {
    console.log('componentWillUpdate()');
    var url = window.location.href;
    if(this.state.url !== url && url.indexOf('/profile/edit') === -1) {
      console.log('this.state.url='+window.location.href);
      this.props.setTweets([]);
      var username = window.location.search.split('?user=')[1];
      if(username) {
        this.setState({username, url}, () => {
          //this.get_tweets({username});
          if(url.indexOf('profile?user=') > -1) this.set_active(0);
          if(url.indexOf('profile/replies') > -1) this.set_active(1);
          if(url.indexOf('profile/media') > -1) this.set_active(2);
        });
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    console.log('componentWillReceiveProps()');
    //if(this.state.tweets != nextProps.tweets) {
      if(nextProps.tweets) {
        this.setState({tweets: []}, () => {
          this.setState({tweets: nextProps.tweets});
        });
      }
    //}
  }

  set_active(index) {
    var list = _all('.tweets_ul li');
    for(var i=0; i<list.length; i++) {
      console.log(i);
      if(i != index) list[i].classList.remove('active');
      else list[i].classList.add('active');
    }
  }

  get_replies(username) {
    http.get('/tweets/replies', {params: {username}})
    .then((res) => {
      //console.log('/tweets/get='+JSON.stringify(res.data));
      if(res.data.success) {
        var tweets = res.data.tweets;
        for(var t of tweets) {
          if(res.data.avatars[t.username]) {
            t.avatar = config.server+'/images/'+t.userId+'/avatar/'+res.data.avatars[t.username];
          }
        }
        this.setState({tweets}, () => {
          this.props.setTweets(tweets);
        });
      }
    });
  }

  get_media(username) {
    http.get('/tweets/media', {params: {username}})
    .then((res) => {
      //console.log('/tweets/get='+JSON.stringify(res.data));
      if(res.data.success) {
        var tweets = res.data.tweets;
        for(var t of tweets) {
          if(res.data.avatars[t.username]) {
            t.avatar = config.server+'/images/'+t.userId+'/avatar/'+res.data.avatars[t.username];
          }
        }
        this.setState({tweets}, () => {
          this.props.setTweets(tweets);
        });
      }
    });
  }

  back_to_top() {
    window.scrollTo({top: 0, behavior: 'smooth'})
  }

  render() {
    var redirect = (this.state.redirect) ? <Redirect to={this.state.redirect} /> : '';

    var tweets = [];
    for(var i=0; i<this.state.tweets.length; i++) {
      var t = this.state.tweets[i];
      if(t) {
        if(!t.name) t.name = 'name';
        var tweet = <Tweet key={i.toString()} tweet={t} />
        tweets.push(tweet);
      }
    }

    var header = '';
    if(this.props.header == 'profile') {
      var username = this.state.username;
      header = (
        <div className='header'>
          <ul className='tweets_ul'>
            <li className={'li_tweets active'} onClick={() => {this.props.get_tweets()}}>
              <Link to={'/profile?user='+this.state.username}>Tweets</Link>
            </li>
            <li className={'li_replies'} onClick={() => {this.get_replies()}}>
              <Link to={'/profile/replies?user='+this.state.username}>Tweets & replies</Link>
            </li>
            <li className={'li_media'} onClick={() => {this.get_media()}}>
              <Link to={'/profile/media?user='+this.state.username}>Media</Link>
            </li>
          </ul>
        </div>
      );
    }

    var footer = (
      <div className='footer' onClick={() => {this.props.show_more()}}>
        <span>Show more...</span>
      </div>
    );
    if(this.state.tweets.length >= this.props.max) {
      footer = (
        <div className='footer' onClick={() => {this.back_to_top()}}>
          <span>Back to Top</span>
        </div>
      );

    }

    return (
      <div className='tweets'>
        {redirect}
        {header}
        <div className='body'>
          <ul>{tweets}</ul>
        </div>
        {footer}
      </div>
    );
  }
}

var mstp = state => ({
  tweets: state.tweets,
  loggedIn: state.loggedIn
});

var mdtp = dispatch => {
  return {
    setTweets: (tweets) => {
      dispatch({type: 'TWEETS', payload: tweets});
    }
  };
};

export default connect(mstp, mdtp, null, {pure: false})(Tweets);
