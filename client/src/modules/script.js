export function _(id) {
  return document.querySelector(id);
}

export function _all(id) {
  return document.querySelectorAll(id);
}

export function _css(id, prop) {
  var ele = _(id);
  var style;
  if(ele.length != null) {
    style = window.getComputedStyle(ele[0], null);
  } else {
    style = window.getComputedStyle(ele, null);
  }
  return style.getPropertyValue(prop);
}

export function set_css(id, obj) {
  var ele = _all(id);
  if(ele.length != null) {
    for(var i=0; i<ele.length; i++) {
      Object.assign(ele[i].style, obj);
    }
  } else {
    Object.assign(ele.style, obj);
  }
}

export function from_now(oldTime) {
  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;
  var now = new Date().getTime();
  var elapsed = now - oldTime;
  var val = 0;

  if (elapsed < msPerMinute) {
    val = Math.round(elapsed/1000);
    return val + ' second'+_s(val)+' ago';
  }

  else if (elapsed < msPerHour) {
    val = Math.round(elapsed/msPerMinute);
    return val + ' minute'+_s(val)+' ago';
  }

  else if (elapsed < msPerDay ) {
    val = Math.round(elapsed/msPerHour);
    return val + ' hour'+_s(val)+' ago';
  }

  else if (elapsed < msPerMonth) {
    val = Math.round(elapsed/msPerDay);
    return val + ' day'+_s(val)+' ago';
  }

  else if (elapsed < msPerYear) {
    val = Math.round(elapsed/msPerMonth);
    return  val + ' month'+_s(val)+' ago';
  }

  else {
    val = Math.round(elapsed/msPerYear);
    return val + ' year'+_s(val)+' ago';
  }

  function _s(val) {
    if(val < 2) return '';
    else return 's';
  }
}
