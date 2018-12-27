import React from 'react';
import {Redirect, Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _all, _css, set_css} from '../../modules/script';
import {http} from '../../modules/http';
import {config} from '../../modules/config';
import './EditProfile.css';

class EditProfile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: '',
      bg: '',
      bgSrc: '',
      avatar: '',
      avatarSrc: '',
      name: '',
      username: '',
      email: '',
      bio: ''

    }

    this.cancel_edit = this.cancel_edit.bind(this);
    this.change_bg = this.change_bg.bind(this);
    this.change_avatar = this.change_avatar.bind(this);
    this.cahnge_value = this.change_value.bind(this);
    this.post_data = this.post_data.bind(this);
  }

  componentDidMount() {
    this.setState({
      name: this.props.account.name,
      username: this.props.account.username,
      email: this.props.account.email,
      bio: this.props.account.bio,
      avatarSrc: this.props.account.avatar,
      bgSrc: this.props.account.bg
    });
  }

  change_bg(e) {
    this.setState({
      bg: e.target.files[0],
      bgSrc: URL.createObjectURL(e.target.files[0])
    }, () => {
      var img = new Image();
      img.src = this.state.bgSrc;
      img.onload = () => {
        //console.log(img.naturalWidth +'/'+ img.naturalHeight);
        if((img.naturalWidth/img.naturalHeight) > 4) {
          var avatar = _('.editProfile .avatar img');
          avatar.style.width = 'auto';
          avatar.style.height = '100%';
        }
      }
    });
  }

  change_avatar(e) {
    this.setState({
      avatar: e.target.files[0],
      avatarSrc: URL.createObjectURL(e.target.files[0])
    }, () => {
      var img = new Image();
      img.src = this.state.avatarSrc;
      img.onload = () => {
        //console.log(img.naturalWidth +'/'+ img.naturalHeight);
        if(img.naturalWidth > img.naturalHeight) {
          var avatar = _('.editProfile .avatar img');
          avatar.style.width = 'auto';
          avatar.style.height = '100%';
        }
      }
    });
  }

  change_value(e, key) {
    this.setState({
      [key]: e.target.value
    });
  }

  cancel_edit() {
    this.setState({redirect: '/profile?user='+this.props.account.username}, () => {
      this.setState({redirect: ''});
    })
  }

  post_data() {
    if(!this.props.account && !localStorage.getItem('jwtToken')) {
      console.log('Error: Not logged in.');
      return;
    }
    if(!this.state.username || !this.state.email) {
      console.log('Error: Username or email is empty.');
      return;
    }
    _('.loader').style.display = 'block';
    var fd = new FormData();
    fd.append('name', this.state.name);
    fd.append('username', this.state.username);
    fd.append('email', this.state.email);
    fd.append('bio', this.state.bio);
    fd.append('bg', this.state.bg);
    fd.append('avatar', this.state.avatar);

    http.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
    http({
      method: 'post',
      url: '/users/edit',
      data: fd,
      config: {headers: {'Content-Type': 'multipart/form-data'}}
    })
    .then((res) => {
      console.log('users/edit='+JSON.stringify(res.data));
      _('.loader').style.display = 'none';
      var user = res.data.user;
      if(user.avatar) user.avatar = config.server+'/images/'+user._id+'/avatar/'+user.avatar;
      if(user.bg) user.bg = config.server+'/images/'+user._id+'/bg/'+user.bg;
      this.props.setAccount(user);
      this.props.setProfile(user);
      this.setState({redirect: '/profile?user='+user.username}, () => {
        this.setState({redirect: ''});
      });
    })
    .catch((err) => {
      console.log(err);
      _('.loader').style.display = 'none';
    });

  }

  render() {
    var redirect = (this.state.redirect) ? <Redirect to={this.state.redirect} /> : '';

    return (
      <div className='editProfile'>
        {redirect}
        <div className='bg'>
          <img src={this.state.bgSrc} />
          <div className='message'>
            <i className='fa fa-camera'></i><br />
            <span>Add a header photo</span>
            <input className='form-control' type='file' name='bg' onChange={(e) => {this.change_bg(e)}} />
          </div>
        </div>
        <div className='nav'>
          <div className='container'>
            <div className='avatar'>
              <img src={this.state.avatarSrc} />
              <div className='message'>
                <i className='fa fa-image'></i><br />
                <span>Change your profile photo</span>
              </div>
              <input className='form-control' type='file' name='avatar' onChange={(e) => {this.change_avatar(e)}} />
            </div>
            <button className='btn btn-default' onClick={() => {this.post_data()}}>Save changes</button>
            <button className='btn btn-default' onClick={() => {this.cancel_edit()}}>Cancel</button>
          </div>
        </div>

        <div className='main container'>
          <div className='row'>
            <div className='left col-lg-3'>
              <div className='info'>
                <label>Name:</label>
                <input className='name form-control' type='text'
                value={this.state.name} onChange={(e) => {this.change_value(e, 'name')}} />
                <label>Username:</label>
                <input className='username form-control' type='text'
                value={this.state.username} onChange={(e) => {this.change_value(e, 'username')}} />
                <label>Email:</label>
                <input className='email form-control' type='text'
                value={this.state.email} onChange={(e) => {this.change_value(e, 'email')}} />
                <label>Bio:</label>
                <textarea className='bio form-control' type='text' onChange={(e) => {this.change_value(e, 'bio')}} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

var mstp = state => ({
  account: state.account
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

export default connect(mstp, mdtp)(EditProfile);
