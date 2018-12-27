import React from 'react';
import {Redirect} from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _all, _css, set_css} from '../../modules/script';
import {http} from '../../modules/http';
import './TweetMenu.css';
import Dialog from '../main/Dialog';

class TweetMenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: ''
    }

    this.open_delete_dialog = this.open_delete_dialog.bind(this);
    this.delete_tweet = this.delete_tweet.bind(this);
  }

  open_delete_dialog() {
    _('.dialog .ok').classList.remove('btn-default');
    _('.dialog .ok').classList.add('btn-danger');
    _('.dialog').style.display = 'block';
    var body = {
      name: '@'+this.props.tweet.username,
      tweet: this.props.tweet.tweet
    };
    this.props.setDialog({
      header: 'Delete tweet?',
      body: body,
      cancel: 'Cancel',
      ok: 'Delete',
      cancelAction: () => {

      },
      okAction: this.delete_tweet
    });
  }

  delete_tweet() {
    if(!localStorage.getItem('jwtToken')) return;
    http.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
    http.post('tweets/delete', {tweetId: this.props.tweet._id})
    .then((res) => {
      console.log('tweets/remove='+JSON.stringify(res.data));
      this.props.set_menu(false);
      if(res.data.success) {
        // update account
        var account = this.props.account;
        account.tweets = res.data.tweetC;
        this.props.setAccount(account);
        // update profile
        if(this.props.profile.username == this.props.account.username) {
          var profile = this.props.profile;
          profile.tweets = res.data.tweetC;
          this.props.setProfile(profile);
        }
        // update tweets
        var tweets = this.props.tweets;
        var arr = [];
        for(var tweet of tweets) {
          if(tweet._id !== res.data.deletedId) {
            arr.push(tweet);
          }
        }
        this.props.setTweets(arr);
      }
    });
  }

  render() {
    var redirect = (this.state.redirect) ? <Redirect to={this.state.redirect} /> : '';

    var deleteTweet = '';
    if(this.props.tweet.username === this.props.account.username) {
      deleteTweet = <li className='menuItem' onClick={() => {this.open_delete_dialog()}}>Delete Tweet</li>;
    }
    return (
      <div className='tweetMenu'>
        {redirect}
        <div><div></div></div>
        <ul>
          <li className='menuItem'>Pin to your profile page</li>
          <li className='menuItem'>Report Tweet</li>
          {deleteTweet}
        </ul>
      </div>
    );
  }
}

var mstp = state => ({
  tweets: state.tweets,
  profile: state.profile,
  account: state.account
});

var mdtp = dispatch => {
  return {
    setDialog: (dialog) => {
      dispatch({type: 'DIALOG', payload: dialog});
    },
    setTweets: (tweets) => {
      dispatch({type: 'TWEETS', payload: tweets});
    },
    setProfile: (profile) => {
      dispatch({type: 'PROFILE', payload: profile});
    },
    setAccount: (account) => {
      dispatch({type: 'PROFILE', payload: account});
    }
  };
};

export default connect(mstp, mdtp)(TweetMenu);
//export default TweetMenu;
