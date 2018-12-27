import React from 'react';
import {Redirect, Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _all, _css, set_css} from '../../modules/script';
import {config} from '../../modules/config';
import './Home.css';

import Timeline from '../tweets/Timeline';
import WhoToFollow from '../tweets/WhoToFollow';

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: ''
    }
  }

  componentWillMount() {
    console.log('this.props.loggedIn='+this.props.loggedIn);
    if(!this.props.loggedIn) this.setState({redirect: '/'});
    //this.props.setTweets([]);
  }

  render() {
    var redirect = (this.state.redirect) ? <Redirect to={this.state.redirect} /> : '';

    return (
      <div className='home container'>
        {redirect}
        <div className='row'>
          <div className='col-lg-3'>
            <div className='account'>
              <Link className='bg' to={'/profile?user='+this.props.account.username}>
                <img src={this.props.account.bg} />
              </Link>
              <Link className='avatar' to={'/profile?user='+this.props.account.username}>
                <img src={this.props.account.avatar} />
              </Link>
              <h1>
                <span className='name'>{this.props.account.name}</span>
                <span className='username'>@{this.props.account.username}</span>
              </h1>
              <div className='info'>
                <Link to={'/profile?user='+this.props.account.username} className='numTweets'>
                  Tweets<br /><span>{this.props.account.tweets}</span>
                </Link>
                <Link to={'/profile/following?user='+this.props.account.username} className='numFollowing'>
                  Following<br /><span>{this.props.account.following}</span>
                </Link>
                <Link to={'/profile/followers?user='+this.props.account.username} className='numFollowers'>
                  Followers<br /><span>{this.props.account.followers}</span>
                </Link>
              </div>
            </div>
          </div>
          <div className='col-lg-6'>
            <Timeline />
          </div>
          <div className='col-lg-3'>
            <WhoToFollow />
          </div>
        </div>
      </div>
    );
  }
}



var mstp = state => ({
  loggedIn: state.loggedIn,
  account: state.account
});

var mdtp = dispatch => {
  return {
    setTweets: (tweets) => {
      dispatch({type: 'TWEETS', payload: tweets});
    }
  };
};

export default connect(mstp, mdtp, null, {pure: false})(Home);
//export default Home;
