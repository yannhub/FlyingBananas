(function () {
  var pressedKeys = {};

  function setKey(event, status) {
    var code = event.keyCode;
    var key;

    switch (code) {
      case 32:
        key = "SPACE";
        break;
      case 37:
        key = "LEFT";
        break;
      case 38:
        key = "UP";
        break;
      case 39:
        key = "RIGHT";
        break;
      case 40:
        key = "DOWN";
        break;
      default:
        key = String.fromCharCode(code);
    }

    pressedKeys[key] = status;
  }

  document.addEventListener("keydown", function (e) {
    setKey(e, true);
  });

  document.addEventListener("keyup", function (e) {
    setKey(e, false);
  });

  document.addEventListener("blur", function () {
    pressedKeys = {};
  });

  window.input = {
    isDown: function (key) {
      return pressedKeys[key.toUpperCase()];
    },
    setKeyFromJoystick: function (joystick) {
      pressedKeys.UP = joystick.up;
      pressedKeys.DOWN = joystick.down;
      pressedKeys.LEFT = joystick.left;
      pressedKeys.RIGHT = joystick.right;
    },
    setSpaceKey: function (pressed) {
      pressedKeys.SPACE = pressed;
    },
  };
})();
