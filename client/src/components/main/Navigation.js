import React from 'react';
import {Link, NavLink, Redirect} from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _all, _css, set_css, set_display} from '../../modules/script';
import './Navigation.css';
import Search from './Search';
import Menu from './Menu';
import TweetDialog from './TweetDialog';
import Dialog from './Dialog';

class Navigation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: '',
      menu: false
    }

    this.show_menu = this.show_menu.bind(this);
    this.open_tweet_dialog = this.open_tweet_dialog.bind(this);
    this.click_link = this.click_link.bind(this);
  }

  componentWillMount() {
    this.props.setLoading(false);
  }

  show_menu() {
    if(this.state.menu) {
      this.setState({menu: false}, () => {
        _('.menu').style.display = 'none';
      });
    } else {
      this.setState({menu: true}, () => {
        _('.menu').style.display = 'block';
      });
    }
  }

  open_tweet_dialog() {
    this.setState({menu: false}, () => {
      _('.menu').style.display = 'none';
      _('.tweetDialog').style.display = 'block';
    })
  }

  click_link(index) {
    for(var i=0; i<4; i++) {
      _('.navigation ul li:nth-of-type('+(i+1)+') a').classList.remove('active');
    }
    _('.navigation ul li:nth-of-type('+(index+1)+') a').classList.add('active');
  }

  render() {
    var redirect = (this.state.redirect) ? <Redirect to={this.state.redirect} /> : '';

    var center = <NavLink to='home' className='twitter'><i className='fa fa-twitter'></i></NavLink>;
    if(this.props.loading) {
      center = (
        <div className='spinner_wrapper'>
          <div className='spinner'></div>
        </div>
      )
    }

    var userIcon = <i className='fa fa-user'></i>;
    if(this.props.account.avatar) userIcon = <img src={this.props.account.avatar} />;

    return (
      <nav className='navigation'>
        {redirect}
        <ul>
          <li className='left' onClick={() => {this.click_link(0)}}>
            <NavLink to='/home' activeClassName='active'><i className='fa fa-home'></i><span>Home</span></NavLink>
          </li>
          <li className='left' onClick={() => {this.click_link(1)}}>
            <NavLink to='/moments' activeClassName='active'><i className='fa fa-bolt'></i><span>Moments</span></NavLink>
          </li>
          <li className='left' onClick={() => {this.click_link(2)}}>
            <NavLink to='/notifications' activeClassName='active'><i className='fa fa-bell-o'></i><span>Notifications</span></NavLink>
          </li>
          <li className='left' onClick={() => {this.click_link(3)}}>
            <NavLink to='/messages' activeClassName='active'><i className='fa fa-envelope-o'></i><span>Messages</span></NavLink>
          </li>
          <li className='center'>
            {center}
          </li>
          <li className='right li_post'><div onClick={() => {this.open_tweet_dialog()}}>Tweet</div></li>
          <li className='right li_user' onClick={() => {this.show_menu()}}>
            <div>
              {userIcon}
            </div>
            <Menu />
          </li>
          <li className='right li_search'><Search /></li>
        </ul>
        <TweetDialog />
        <Dialog />
      </nav>
    );
  }
}

var mstp = state => ({
  loading: state.loading,
  account: state.account
});

var mdtp = dispatch => {
  return {
    setLoading: (loading) => {
      dispatch({type: 'LOADING', payload: loading});
    }
  };
};

export default connect(mstp, mdtp)(Navigation);
