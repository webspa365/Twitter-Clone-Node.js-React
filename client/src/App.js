import React, { Component } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import './App.css';

import Navigation from './components/main/Navigation';
import Dialog from './components/main/Dialog';
import Loader from './components/main/Loader';
import Home from './components/home/Home';
import Moments from './components/moments/Moments';
import Notifications from './components/notifications/Notifications';
import Messages from './components/messages/Messages';
import Auth from './components/account/Auth';
import Profile from './components/profile/Profile';
import EditProfile from './components/profile/EditProfile';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div>
          <Navigation />
          <Dialog />
          <Loader />
          <Switch>
            <Route path="/home" component={Home} />
            <Route path="/moments" component={Moments} />
            <Route path="/notifications" component={Notifications} />
            <Route path="/messages" component={Messages} />
            <Route path="/profile" component={Profile} />
            <Route path="/profile/replies" component={Profile} />
            <Route path="/profile/media" component={Profile} />
            <Route path="/profile/likes" component={Profile} />
            <Route path="/profile/following" component={Profile} />
            <Route path="/profile/followers" component={Profile} />
            <Route path="/editProfile" component={EditProfile} />
            <Route path="/" component={Auth} />
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}


export default App;
