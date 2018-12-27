import React from 'react';
import {Redirect} from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _all, _css, set_css, set_display} from '../../modules/script';
import {http} from '../../modules/http';
import './User.css';

class User extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: '',
      followed: false
    }

    this.click_user = this.click_user.bind(this);
    this.follow_user = this.follow_user.bind(this);
  }

  componentWillMount() {
    this.setState({followed: this.props.user.followed});
  }

  click_user() {
    this.setState({redirect: '/profile?user='+this.props.user.username}, () => {
      this.setState({redirect: ''});
    });
  }

  follow_user() {
    if(!this.props.account || !localStorage.getItem('jwtToken')) return;
    http.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
    http.post('/relationships/follow', {username: this.props.user.username})
    .then((res) => {
      console.log('/relationships/follow='+JSON.stringify(res.data));
      if(res.data.success) {
        this.setState({followed: res.data.followed});
        var account = this.props.account;
        account.following = res.data.following;
        this.props.setAccount(account);
        if(this.props.username == this.props.user.username) {
          var profile = this.props.profile;
          profile.followers = res.data.followers;
          this.props.setProfile(profile);
        }
      }
    });
  }

  render() {
    var redirect = (this.state.redirect) ? <Redirect to={this.state.redirect} /> : '';

    var followsYou = '';
    if(this.props.user.followed) {
      followsYou = <div className='followsYou'>Follows you</div>
    }

    var followed = (this.state.followed) ? 'followed' : '';

    return (
      <div className='user'>
        {redirect}
        <div className='avatar' onClick={() => {this.click_user()}}>
          <img src={this.props.user.avatar} />
        </div>
        <div className='bg' onClick={() => {this.click_user()}}>
          <img src={this.props.user.bg} />
        </div>
        <div className='info'>
          <h3>
            <span className='name'>{this.props.user.name}Name</span>
            <span className='username' onClick={() => {this.click_user()}}>@{this.props.user.username}{followsYou}</span>
          </h3>
          <p className='bio'>{this.props.user.bio}</p>
          <button className={'btn btn-default followButton ' + followed} onClick={() => {this.follow_user()}}></button>
        </div>
      </div>
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

export default connect(mstp, mdtp)(User);
