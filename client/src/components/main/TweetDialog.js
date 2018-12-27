import React from 'react';
import {Redirect} from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _all, _css, set_css} from '../../modules/script';
import {http} from '../../modules/http';
import {config} from '../../modules/config';
import './TweetDialog.css';

class TweetDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: '',
      tweet: '',
      message: ''
    }

    this.close_dialog = this.close_dialog.bind(this);
    this.change_tweet = this.change_tweet.bind(this);
    this.post_tweet = this.post_tweet.bind(this);
  }

  close_dialog() {
    this.setState({tweet: '', message: ''}, () => {
      _('.tweetDialog').style.display = 'none';
    });

  }

  change_tweet(e) {
    this.setState({tweet: e.target.value});
  }

  post_tweet() {
    if (localStorage.getItem("jwtToken") === null || !this.props.loggedIn) {
      this.setState({redirect: '/login'});
    } else {
      if(!this.state.tweet) return;
      _('.loader').style.display = 'block';
      http.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
      http.post('/tweets/post', {tweet: this.state.tweet})
      .then((res) => {
        //console.log('/posts/tweet='+JSON.stringify(res.data));
        _('.loader').style.display = 'none';
        if(res.data.success) {
          if(this.props.profile.username === this.props.account.username) {
            // update profile
            var profile = this.props.profile;
            profile.tweets = res.data.count;
            this.props.setProfile(profile);
            // update tweets
            var t = res.data.tweet;
            t.avatar = this.props.account.avatar;
            var tweets = this.props.tweets;
            if(tweets.length > 0) tweets = [t, ...this.props.tweets];
            else tweets[0] = t;
            this.props.setTweets(tweets);
            this.close_dialog();
          } else {
            this.setState({redirect: '/profile?user='+this.props.account.username}, () => {
              this.setState({redirect: ''});
              this.close_dialog();
            });
          }
        } else {
          this.setState({message: res.data.msg});
        }
      }).catch((err) => {
        console.log(err)
        _('.loader').style.display = 'none';
      });
    }
  }

  render() {
    var redirect = (this.state.redirect) ? <Redirect to={this.state.redirect} /> : '';

    var active = (this.state.tweet.length > 0) ? 'active' : '';

    var message = '';
    if(this.state.message) {
      message = <div class='message'>{this.state.message}</div>
    }

    return (
      <div className='tweetDialog'>
        {redirect}
        <div className='wrapper modal-content'>
          <div className='modal-header'>
            <h3>Compose new Tweet</h3>
            <i className='fa fa-times' onClick={() => {this.close_dialog()}}></i>
          </div>
          <div className='modal-body'>
            <div className='avatar'>
              <img />
              <i className='fa fa-user'></i>
            </div>
            <div className='textarea'>
              <textarea className='form-control' type='text' placeholder="What's happening?"
              onChange={(e) => this.change_tweet(e)}
              value={this.state.tweet} />
            </div>
          </div>
          <div className='modal-footer'>
            {message}
            <div>
              <ul className='icons'>
                <li><i className='fa fa-image'></i></li>
                <li><i className='fa fa-camera'></i></li>
                <li><i className='fa fa-map-o'></i></li>
                <li><i className='fa fa-map-marker'></i></li>
              </ul>
              <button className={'btn btn-default addButton '+active}><i className='fa fa-plus'></i></button>
              <button className={'btn btn-primary tweetButton '+active} onClick={() => {this.post_tweet()}}>Tweet</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

var mstp = state => ({
  loggedIn: state.loggedIn,
  tweets: state.tweets,
  profile: state.profile,
  account: state.account
});

var mdtp = dispatch => {
  return {
    setTweets: (tweets) => {
      dispatch({type: 'TWEETS', payload: tweets});
    },
    setProfile: (profile) => {
      dispatch({type: 'PROFILE', payload: profile});
    }
  };
};

export default connect(mstp, mdtp)(TweetDialog);
//export default TweetDialog;
