import React from 'react';
import { NavLink } from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _all, _css, set_css, set_display} from '../../modules/script';
import './Loader.css';

class Loader extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className='loader'>
        <div className='spinner_wrapper'>
          <div className='spinner'></div>
        </div>
      </div>
    );
  }
}

export default Loader;
