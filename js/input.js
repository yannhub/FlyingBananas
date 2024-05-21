(function () {
  var actions = {};

  var keyToActionMap = {
    " ": "SHOOT",
    ArrowLeft: "MOVE_LEFT",
    ArrowUp: "MOVE_UP",
    ArrowRight: "MOVE_RIGHT",
    ArrowDown: "MOVE_DOWN",
    w: "MOVE_UP",
    a: "MOVE_LEFT",
    s: "MOVE_DOWN",
    d: "MOVE_RIGHT",
  };

  function setAction(event, status) {
    var action = keyToActionMap[event.key];
    if (action) {
      actions[action] = status;
    }
  }

  document.addEventListener("keydown", function (e) {
    setAction(e, true);
  });

  document.addEventListener("keyup", function (e) {
    setAction(e, false);
  });

  document.addEventListener("blur", function () {
    actions = {};
  });

  window.input = {
    isActionActive: function (action) {
      return actions[action];
    },
    setShoot: function (active) {
      actions.SHOOT = active;
    },
  };
})();
