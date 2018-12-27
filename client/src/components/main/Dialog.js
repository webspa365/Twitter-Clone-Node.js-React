import React from 'react';
import { NavLink } from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _all, _css, set_css} from '../../modules/script';
import './Dialog.css';

class Dialog extends React.Component {
  constructor(props) {
    super(props);

    this.close_dialog = this.close_dialog.bind(this);
    this.click_button = this.click_button.bind(this);
  }

  close_dialog(e) {
    if(e.target.classList.contains('dialog')) {
      _('.dialog').style.display = 'none';
    }
  }

  click_button(e, i) {
    if(i === 0) this.props.dialog.cancelAction();
    else this.props.dialog.okAction();
    var dialog = {
      header: '',
      body: '',
      cancel: '',
      ok: '',
      cancelAction: null,
      okAction: null
    }
    this.props.setDialog(dialog);
    _('.dialog').style.display = 'none';
  }

  render() {
    var btn_0 = '', btn_1 = '';
    if(this.props.dialog.cancel != null) {
      btn_0 = (
        <button className='btn btn-default cancel' onClick={(e) => {this.click_button(e, 0)}}>{this.props.dialog.cancel}</button>
      );
    }
    if(this.props.dialog.ok != null) {
      btn_1 = (
        <button className='btn btn-default ok' onClick={(e) => {this.click_button(e, 1)}}>{this.props.dialog.ok}</button>
      );
    }

    var header = (this.props.dialog.header) ? <div className='header'>{this.props.dialog.header}</div> : '';

    var body = '';
    if(this.props.dialog.body) body = (
      <div className='body'>
        <h6>{this.props.dialog.body.name}</h6>
        <p>{this.props.dialog.body.tweet}</p>
      </div>
    );
    return (
      <div className='dialog' onClick={(e) => {this.close_dialog(e)}}>
        <div className='dialog_wrapper'>
          {header}
          {body}
          <div className='footer'>
            {btn_1}
            {btn_0}
          </div>
        </div>
      </div>
    );
  }
}

var mstp = state => ({
  dialog: state.dialog
});

var mdtp = dispatch => {
  return {
    setDialog: (dialog) => {
      dispatch({type: 'DIALOG', payload: dialog});
    }
  };
};

export default connect(mstp, mdtp)(Dialog);
