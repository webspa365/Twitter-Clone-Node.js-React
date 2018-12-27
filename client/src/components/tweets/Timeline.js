import React from 'react';
import {Redirect, Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _all, _css, set_css} from '../../modules/script';
import {http} from '../../modules/http';
import {config} from '../../modules/config';
import './Timeline.css';

import Tweet from './Tweet';

class Timeline extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: '',
      username: '',
      mode: '', // tweets, replies, media, likes
      url: '',
      tweets: [],
      count: 0,
      skip: 0,
      rSkip: 0
    }

    this.get_by_url = this.get_by_url.bind(this);
    this.get_timeline = this.get_timeline.bind(this);
    this.show_more = this.show_more.bind(this);
  }

  componentDidMount() {
    this.props.setTweets([]);
    this.get_timeline();
  }

  componentWillReceiveProps(nextProps) {
    console.log('componentWillReceiveProps()');
    console.log('state.len='+this.state.tweets.length);
    console.log('props.len='+nextProps.tweets.length);
    if(this.state.tweets.length !== nextProps.tweets.length) {
      this.setState({tweets: []}, () => {
        this.setState({tweets: nextProps.tweets}, () => {
          console.log('added')
        });
      });
    }
    /*
    if(nextProps.tweets.length != this.state.tweets.length || !this.state.tweets) {
      this.setState({tweets: this.props.tweets})
    }*/
  }

  get_by_url() {

  }

  show_more() {
    this.get_timeline();
  }

  get_timeline() {
    if(!this.props.account || !localStorage.getItem('jwtToken')) return;
    console.log('get_timeline()');
    http.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
    http.get('/tweets/timeline', {params: {userId: this.props.account._id, skip: this.state.skip, rSkip: this.state.rSkip}})
    .then((res) => {
      console.log('/tweets/timeline='+JSON.stringify(res.data));
      if(res.data.success) {
        var tweets = res.data.tweets;
        for(var t of tweets) {
          if(res.data.avatars[t.username]) {
            t.avatar = config.server+'/images/'+t.userId+'/avatar/thumb-'+res.data.avatars[t.username];
          }
        }
        // concat
        var oldTweets = this.state.tweets;
        var newTweets = oldTweets.concat(tweets);
        // get number of retweets
        var r = 0;
        for(var t of newTweets) {
          if(t.retweetedBy) r++;
        }
        // update state
        this.setState({skip: (newTweets.length-r), rSkip: r}, () => {
          this.props.setTweets(newTweets);
        });
      }
    });
  }

  render() {
    var redirect = (this.state.redirect) ? <Redirect to={this.state.redirect} /> : '';

    var tweets = [];
    console.log('len='+this.state.tweets.length);
    for(var i=0; i<this.state.tweets.length; i++) {
      var t = this.state.tweets[i];
      if(t) {
        if(!t.name) t.name = 'name';
        var tweet = <Tweet key={i} tweet={t} />
        tweets.push(tweet);
      }
    }

    return (
      <div className='timeline'>
        {redirect}
        <div className='header'>
          <div className='input'>
            <input className='form-control' placeholder="What's happenning?" />
            <i className='fa fa-image'></i>
          </div>
          <div className='avatar'>
            <img src={this.props.account.avatar} />
          </div>
        </div>
        <div className='body'>
          <ul>{tweets}</ul>
        </div>
        <div className='footer' onClick={() => {this.show_more()}}>
          <span>Show more tweets...</span>
        </div>
      </div>
    );
  }
}

var mstp = state => ({
  loggedIn: state.loggedIn,
  account: state.account,
  tweets: state.tweets
});

var mdtp = dispatch => {
  return {
    setTweets: (tweets) => {
      dispatch({type: 'TWEETS', payload: tweets});
    }
  };
};

export default connect(mstp, mdtp, null, {pure: false})(Timeline);
