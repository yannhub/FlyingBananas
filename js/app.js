window.addEventListener("load", () => {
  function getInitialState() {
    return {
      idle: false,
      lastTime: Date.now(),
      lastFire: Date.now(),
      gameTime: 0,
      playerSpeed: 200,
      bulletSpeed: 500,
      enemySpeed: 100,
      bulletCadence: 180,
      score: 0,
      oldScore: -1,
    };
  }

  function getInitialEntities() {
    return {
      player: {
        sprite: new Sprite("img/sprites1.png", [0, 0], [39, 39], 16, [0, 1]),
      },
      bullets: [],
      enemies: [],
      explosions: [],
      bonus: [],
    };
  }

  // Request Animation Frame polyfill
  const requestAnimFrame = (() =>
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    ((callback) => window.setTimeout(callback, 1000 / 60)))();

  // Device detection
  const isMobileDevice = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
  ].some((toMatchItem) => navigator.userAgent.match(toMatchItem));

  // DOM elements
  const domElements = {
    portraitAlert: document.getElementById("portrait-alert"),
    shootButton: document.getElementById("shoot-button"),
    scoreWrapper: document.getElementById("score-wrapper"),
    playAgainBtn: document.getElementById("play-again"),
    scoreEl: document.getElementById("score"),
    gameOverEl: document.getElementById("game-over"),
    gameOverOverlay: document.getElementById("game-over-overlay"),
  };

  // Game variables
  const game = {
    canvas: null,
    terrainPattern: null,
    isLandscape: window.innerHeight < window.innerWidth,
    state: null,
    entities: null,
  };

  // Event listeners
  domElements.playAgainBtn.addEventListener("click", () => init());

  if (isMobileDevice) {
    domElements.shootButton.addEventListener("touchstart", () =>
      input.setSpaceKey(true)
    );
    domElements.shootButton.addEventListener("touchend", () =>
      input.setSpaceKey(false)
    );
    window.addEventListener(
      "orientationchange",
      () =>
        setTimeout(() => {
          game.isLandscape = window.innerHeight < window.innerWidth;
          init();
        }, 50),
      false
    );
  }

  // Bootstrap game
  resources.load(["img/sprites1.png", "img/jungle.jpg", "img/oc-bonus.png"]);
  resources.onReady(init);

  // Initialize game
  function init() {
    if (isMobileDevice && !game.isLandscape) {
      game.state.idle = true;
      showPortraitAlert();
      return;
    }
    hidePortraitAlert();
    game.state = getInitialState();
    game.entities = getInitialEntities();
    setupJoystick();
    setupCanvas();
    initPlayePosition();
    main();
  }

  function initPlayePosition() {
    game.entities.player.pos = [50, game.canvas.height / 2];
  }

  // Show portrait alert
  function showPortraitAlert() {
    domElements.portraitAlert.style.visibility = "visible";
    domElements.shootButton.style.visibility = "hidden";
    domElements.scoreWrapper.style.visibility = "hidden";
    document.getElementById("my-joystick")?.remove();
    game.canvas?.remove();
    domElements.gameOverEl.style.display = "none";
    domElements.gameOverOverlay.style.display = "none";
  }

  // Hide portrait alert
  function hidePortraitAlert() {
    domElements.portraitAlert.style.visibility = "hidden";
    if (isMobileDevice) {
      domElements.shootButton.style.visibility = "visible";
    }
    domElements.scoreWrapper.style.visibility = "visible";
    domElements.gameOverEl.style.display = "none";
    domElements.gameOverOverlay.style.display = "none";
  }

  function setupJoystick() {
    if (isMobileDevice) {
      joystick = new JoyStick({
        radius: 40,
        x: 80,
        y: window.innerHeight - 80,
        inner_radius: 30,
      });
    }
  }

  // Setup game.canvas
  function setupCanvas() {
    game.canvas = document.createElement("canvas");
    game.canvas.id = "game-canvas";
    ctx = game.canvas.getContext("2d");
    game.canvas.width = 512;
    game.canvas.height = Math.min(window.innerHeight, 480);
    document.body.appendChild(game.canvas);

    game.terrainPattern = ctx.createPattern(
      resources.get("img/jungle.jpg"),
      "no-repeat"
    );
  }

  // Main game loop
  function main() {
    if (!game.state.idle) {
      const now = Date.now();
      const dt = (now - game.state.lastTime) / 1000.0;
      update(dt);
      render();
      game.state.lastTime = now;
      requestAnimFrame(main);
    }
  }

  // Update game objects
  function update(dt) {
    game.state.gameTime += dt;
    handleInput(dt);
    updateEntities(dt);
    generateBonus();
    generateEnemies();
    checkCollisions();
    domElements.scoreEl.innerHTML = game.state.score;
  }

  function generateBonus() {
    if (
      game.state.oldScore !== game.state.score &&
      game.state.score !== 0 &&
      game.state.score % 500 === 0 &&
      Math.random() < 0.025
    ) {
      game.state.oldScore = game.state.score;
      game.entities.bonus.push({
        pos: [game.canvas.width, Math.random() * (game.canvas.height - 39)],
        sprite: new Sprite("img/oc-bonus.png", [0, 0], [50, 50], 6, [0]),
      });
    }
  }

  function generateEnemies() {
    if (Math.random() < 1 - Math.pow(0.993, game.state.gameTime)) {
      game.entities.enemies.push({
        pos: [game.canvas.width, Math.random() * (game.canvas.height - 39)],
        sprite: new Sprite(
          "img/sprites1.png",
          [0, 65],
          [85, 50],
          6,
          [0, 1, 2, 1, 0]
        ),
      });
    }
  }

  // Handle input
  function handleInput(dt) {
    if (isMobileDevice) {
      handleMobileInput(dt);
    } else {
      handleKeyboardInput(dt);
    }
    handleShooting();
  }

  // Handle mobile input
  function handleMobileInput(dt) {
    input.setKeyFromJoystick(joystick);
    const maxRadius = 30;
    const dx = Math.max(Math.min(joystick.dx, maxRadius), -maxRadius);
    const dy = Math.max(Math.min(joystick.dy, maxRadius), -maxRadius);
    const sx = dx / maxRadius;
    const sy = dy / maxRadius;
    game.entities.player.pos[0] +=
      sx * (game.state.playerSpeed * (2 - Math.abs(sy))) * dt;
    game.entities.player.pos[1] +=
      sy * (game.state.playerSpeed * (2 - Math.abs(sx))) * dt;
  }

  // Handle keyboard input
  function handleKeyboardInput(dt) {
    if (input.isDown("DOWN") || input.isDown("s"))
      game.entities.player.pos[1] += game.state.playerSpeed * dt;
    if (input.isDown("UP") || input.isDown("w"))
      game.entities.player.pos[1] -= game.state.playerSpeed * dt;
    if (input.isDown("LEFT") || input.isDown("a"))
      game.entities.player.pos[0] -= game.state.playerSpeed * dt;
    if (input.isDown("RIGHT") || input.isDown("d"))
      game.entities.player.pos[0] += game.state.playerSpeed * dt;
  }

  // Handle shooting
  function handleShooting() {
    if (
      input.isDown("SPACE") &&
      Date.now() - game.state.lastFire > game.state.bulletCadence
    ) {
      const x =
        game.entities.player.pos[0] + game.entities.player.sprite.size[0] / 2;
      const y =
        game.entities.player.pos[1] + game.entities.player.sprite.size[1] / 2;
      game.entities.bullets.push({
        pos: [x, y],
        dir: "forward",
        sprite: new Sprite("img/sprites1.png", [0, 39], [18, 8]),
      });
      game.entities.bullets.push({
        pos: [x, y],
        dir: "up",
        sprite: new Sprite("img/sprites1.png", [0, 50], [9, 5]),
      });
      game.entities.bullets.push({
        pos: [x, y],
        dir: "down",
        sprite: new Sprite("img/sprites1.png", [0, 60], [9, 5]),
      });
      game.state.lastFire = Date.now();
    }
  }

  // Update entities
  function updateEntities(dt) {
    game.entities.player.sprite.update(dt);
    updateBullets(dt);
    updateEnemies(dt);
    updateBonus(dt);
    updateExplosions(dt);
  }

  // Update bullets
  function updateBullets(dt) {
    for (let i = 0; i < game.entities.bullets.length; i++) {
      const bullet = game.entities.bullets[i];
      if (bullet.dir === "up") bullet.pos[1] -= game.state.bulletSpeed * dt;
      else if (bullet.dir === "down")
        bullet.pos[1] += game.state.bulletSpeed * dt;
      else bullet.pos[0] += game.state.bulletSpeed * dt;
      if (
        bullet.pos[1] < 0 ||
        bullet.pos[1] > game.canvas.height ||
        bullet.pos[0] > game.canvas.width
      ) {
        game.entities.bullets.splice(i, 1);
        i--;
      }
    }
  }

  // Update enemies
  function updateEnemies(dt) {
    for (let i = 0; i < game.entities.enemies.length; i++) {
      game.entities.enemies[i].pos[0] -= game.state.enemySpeed * dt;
      game.entities.enemies[i].sprite.update(dt);
      if (
        game.entities.enemies[i].pos[0] +
          game.entities.enemies[i].sprite.size[0] <
        0
      ) {
        game.entities.enemies.splice(i, 1);
        i--;
      }
    }
  }

  // Update bonus items
  function updateBonus(dt) {
    for (let i = 0; i < game.entities.bonus.length; i++) {
      game.entities.bonus[i].pos[0] -= game.state.enemySpeed * dt;
      game.entities.bonus[i].sprite.update(dt);
      if (
        game.entities.bonus[i].pos[0] + game.entities.bonus[i].sprite.size[0] <
        0
      ) {
        game.entities.bonus.splice(i, 1);
        i--;
      }
    }
  }

  // Update explosions
  function updateExplosions(dt) {
    for (let i = 0; i < game.entities.explosions.length; i++) {
      game.entities.explosions[i].sprite.update(dt);
      if (game.entities.explosions[i].sprite.done) {
        game.entities.explosions.splice(i, 1);
        i--;
      }
    }
  }

  // Check collisions
  function checkCollisions() {
    checkPlayerBounds();
    checkBulletCollisions();
    checkBonusCollisions();
  }

  // Check player bounds
  function checkPlayerBounds() {
    if (game.entities.player.pos[0] < 0) game.entities.player.pos[0] = 0;
    else if (
      game.entities.player.pos[0] >
      game.canvas.width - game.entities.player.sprite.size[0]
    )
      game.entities.player.pos[0] =
        game.canvas.width - game.entities.player.sprite.size[0];
    if (game.entities.player.pos[1] < 0) game.entities.player.pos[1] = 0;
    else if (
      game.entities.player.pos[1] >
      game.canvas.height - game.entities.player.sprite.size[1]
    )
      game.entities.player.pos[1] =
        game.canvas.height - game.entities.player.sprite.size[1];
  }

  // Check bullet collisions
  function checkBulletCollisions() {
    for (let i = 0; i < game.entities.enemies.length; i++) {
      const enemy = game.entities.enemies[i];
      for (let j = 0; j < game.entities.bullets.length; j++) {
        const bullet = game.entities.bullets[j];
        if (
          boxCollides(
            enemy.pos,
            enemy.sprite.size,
            bullet.pos,
            bullet.sprite.size
          )
        ) {
          game.entities.enemies.splice(i, 1);
          i--;
          game.state.score += 100;
          game.entities.explosions.push({
            pos: enemy.pos,
            sprite: new Sprite(
              "img/sprites1.png",
              [0, 117],
              [39, 39],
              16,
              [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
              null,
              true
            ),
          });
          game.entities.bullets.splice(j, 1);
          break;
        }
      }
      if (
        boxCollides(
          enemy.pos,
          enemy.sprite.size,
          game.entities.player.pos,
          game.entities.player.sprite.size
        )
      ) {
        gameOver();
      }
    }
  }

  // Check bonus collisions
  function checkBonusCollisions() {
    for (let i = 0; i < game.entities.bonus.length; i++) {
      const bonusItem = game.entities.bonus[i];
      if (
        boxCollides(
          bonusItem.pos,
          bonusItem.sprite.size,
          game.entities.player.pos,
          game.entities.player.sprite.size
        )
      ) {
        game.state.bulletCadence = Math.max(10, game.state.bulletCadence - 5);
        const enemiesToKill =
          game.entities.enemies.length -
          Math.round(game.entities.enemies.length / 3);
        for (let j = 0; j < enemiesToKill; j++) {
          game.entities.explosions.push({
            pos: game.entities.enemies[j].pos,
            sprite: new Sprite(
              "img/sprites1.png",
              [0, 117],
              [39, 39],
              16,
              [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
              null,
              true
            ),
          });
        }
        game.entities.enemies.splice(0, enemiesToKill);
        game.state.score += 100 * enemiesToKill;
        game.entities.bonus.splice(i, 1);
      }
    }
  }

  // Collision detection helper functions
  function collides(x, y, r, b, x2, y2, r2, b2) {
    return !(r <= x2 || x > r2 || b <= y2 || y > b2);
  }

  function boxCollides(pos, size, pos2, size2) {
    return collides(
      pos[0],
      pos[1],
      pos[0] + size[0],
      pos[1] + size[1],
      pos2[0],
      pos2[1],
      pos2[0] + size2[0],
      pos2[1] + size2[1]
    );
  }

  // Render functions
  function render() {
    ctx.fillStyle = game.terrainPattern;
    ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
    renderEntity(game.entities.player);
    renderEntities(game.entities.bullets);
    renderEntities(game.entities.enemies);
    renderEntities(game.entities.bonus);
    renderEntities(game.entities.explosions);
  }

  function renderEntities(list) {
    list.forEach(renderEntity);
  }

  function renderEntity(entity) {
    ctx.save();
    ctx.translate(entity.pos[0], entity.pos[1]);
    entity.sprite.render(ctx);
    ctx.restore();
  }

  // Game over
  function gameOver() {
    domElements.gameOverEl.style.display = "flex";
    domElements.gameOverOverlay.style.display = "block";
    game.state.idle = true;
  }
});
