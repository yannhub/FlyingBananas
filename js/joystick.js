// author: Willie Lawrence
// contact: cptx032 arroba gmail dot com
// based in https://github.com/jeromeetienne/virtualjoystick.js/blob/master/virtualjoystick.js
let JOYSTICK_DIV = null;

function __init_joystick_div() {
  const oldJoy = document.getElementById("my-joystick");
  if (oldJoy) {
    oldJoy.remove();
  }
  JOYSTICK_DIV = document.createElement("div");
  JOYSTICK_DIV.id = "my-joystick";
  let div_style = JOYSTICK_DIV.style;
  div_style.background = "rgba(255,255,255,0)";
  div_style.position = "absolute";
  div_style.top = "0px";
  div_style.bottom = "0px";
  div_style.left = "0px";
  div_style.right = "0px";
  div_style.margin = "0px";
  div_style.padding = "0px";
  div_style.borderWidth = "0px";
  div_style.position = "absolute";
  div_style.overflow = "hidden";
  div_style.zIndex = "1";
  document.body.appendChild(JOYSTICK_DIV);
}
let JoyStick = function (attrs) {
  this.radius = attrs.radius || 50;
  this.inner_radius = attrs.inner_radius || this.radius / 2;
  this.x = attrs.x || 0;
  this.y = attrs.y || 0;

  if (attrs.visible === undefined) {
    attrs.visible = true;
  }

  if (attrs.visible) {
    this.__create_fullscreen_div();
  }
};

JoyStick.prototype.dx = 0;
JoyStick.prototype.dy = 0;

JoyStick.prototype.__create_fullscreen_div = function () {
  __init_joystick_div();
  this.div = JOYSTICK_DIV;
  ///////////////////////////////////////////
  this.base = document.createElement("span");
  div_style = this.base.style;
  div_style.width = this.radius * 2 + "px";
  div_style.height = this.radius * 2 + "px";
  div_style.position = "absolute";
  div_style.top = this.y - this.radius + "px";
  div_style.left = this.x - this.radius + "px";
  div_style.borderRadius = "50%";
  div_style.borderColor = "rgba(200,200,200,0.5)";
  div_style.borderWidth = "1px";
  div_style.borderStyle = "solid";
  this.div.appendChild(this.base);
  ///////////////////////////////////////////
  this.control = document.createElement("span");
  div_style = this.control.style;
  div_style.width = this.inner_radius * 2 + "px";
  div_style.height = this.inner_radius * 2 + "px";
  div_style.position = "absolute";
  div_style.top = this.y - this.inner_radius + "px";
  div_style.left = this.x - this.inner_radius + "px";
  div_style.borderRadius = "50%";
  div_style.backgroundColor = "rgba(200,200,200,0.3)";
  div_style.borderWidth = "1px";
  div_style.borderColor = "rgba(200,200,200,0.8)";
  div_style.borderStyle = "solid";
  this.div.appendChild(this.control);
  ///////////////////////////////////////////
  let self = this;
  // the event is binded in all the screen
  // to captures fast movements
  function touch_hander(evt) {
    evt.preventDefault();
    let touch_obj;

    // If multiple touches, take only touch from the left side
    if (evt.changedTouches) {
      for (i = 0; i < evt.changedTouches.length; i++) {
        const t = evt.changedTouches.item(i);
        if (t.clientX < window.innerWidth / 2) {
          touch_obj = t;
          break;
        }
      }
    }

    if (touch_obj) {
      self.control.style.left = touch_obj.clientX - self.inner_radius + "px";
      self.control.style.top = touch_obj.clientY - self.inner_radius + "px";

      self.dx = touch_obj.clientX - self.x;
      self.dy = touch_obj.clientY - self.y;
    }
  }
  function clear_flags() {
    self.dx = 0;
    self.dy = 0;

    self.control.style.top = self.y - self.inner_radius + "px";
    self.control.style.left = self.x - self.inner_radius + "px";
  }
  this.bind("touchmove", touch_hander);
  this.bind("touchstart", touch_hander);
  this.bind("touchend", clear_flags);
};
JoyStick.prototype.bind = function (evt, func) {
  this.base.addEventListener(evt, func);
  this.control.addEventListener(evt, func);
};

/*
attributes:
	+ x
	+ y
	+ func
*/
let JoyStickButton = function (attrs) {
  this.radius = attrs.radius || 50;
  this.x = attrs.x || 0;
  this.y = attrs.y || 0;
  this.text = attrs.text || "";
  __init_joystick_div();
  this.base = document.createElement("span");
  this.base.innerHTML = this.text;
  div_style = this.base.style;
  div_style.width = this.radius * 2 + "px";
  div_style.height = this.radius * 2 + "px";
  div_style.position = "absolute";
  div_style.top = this.y - this.radius + "px";
  div_style.left = this.x - this.radius + "px";
  div_style.borderRadius = "50%";
  div_style.backgroundColor = "rgba(255,255,255,0.1)";
  div_style.borderWidth = "1px";
  div_style.borderColor = "rgba(255,255,255,0.8)";
  div_style.borderStyle = "solid";
  JOYSTICK_DIV.appendChild(this.base);

  if (attrs.func) {
    this.bind("touchstart", attrs.func);
  }

  let self = this;
  function __over() {
    div_style.backgroundColor = "rgba(255,255,255,0.3)";
  }
  function __leave() {
    div_style.backgroundColor = "rgba(255,255,255,0.1)";
  }
  self.bind("touchstart", __over);
  self.bind("touchend", __leave);
};
JoyStickButton.prototype.bind = function (evt, func) {
  this.base.addEventListener(evt, func);
};
