var requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);

//Main game loop
var lastTime;
function main() {
    var now = Date.now();
    var dt = (now - lastTime) / 1000.0;

    update(dt);
    render();

    lastTime = now;
    requestAnimFrame(main);
};

function init() {
    terrainPattern = ctx.createPattern(resources.get('img/terrain.png'), 'repeat');

    document.getElementById('play-again').addEventListener('click', function () {
        reset();
    });

    reset();
    lastTime = Date.now();
    main();
}

resources.load([
    'img/sprites.png',
    'img/terrain.png'
]);
resources.onReady(init);
//Game state

var player = {
    pos: [0, 0],
    sprite: new Sprite('img/sprites.png',[0, 0], [39, 39], 16, [0, 1])
};

var bullets = [];
var enemies = [];
var explosions = [];


var lastFire = Date.now();
var gameTime = 0;
var isGameOver;
var terrainPattern;

var score = 0;
var scoreEl = document.getElementById('score');

//Speed in pps
var playerSpeed = 200;
var bulletSpeed = 500;
var enemySpeed = 100;

// Update Game Objects

function update(dt)
{
    gameTime += dt;
    handleInput(dt);
    updateEntities(dt);

    if (Math.random() < 1 - Math.pow(.993, gameTime))
    {
        enemies.push({
            pos: [canvas.width,
                  Math.random() * (canvas.height - 39)],
            sprite: new Sprite('img/sprites.png', [0, 78], [80, 39],
                               6, [0, 1, 2, 3, 2, 1])
        });
    }
    checkCollision();
    scoreEl.innerHTML = score;
};

function handleInput(dt)
{
    if (input.isDown('DOWN') || input.isDown('s'))
    {
        player.pos[1] += playerSpeed * dt;
    }

    if (input.isDown('UP') || input.isDown('w'))
    {
        player.pos[1] -= playerSpeed * dt;
    }

    if (input.isDown('LEFT') || input.isDown('a'))
    {
        player.pos[0] -= playerSpeed * dt;
    }

    if (input.isDown('RIGHT') || input.isDown('d'))
    {
        player.pos[0] += playerSpeed * dt;
    }

    if (input.isDown('SPACE') && !isGameOver && Date.now() - lastFire > 100)
    {
        var x = player.pos[0] + player.sprite.size[0] / 2;
        var y = player.pos[1] + player.sprite.size[1] / 2;

        bullets.push({
            pos: [x, y],
            dir: 'forward',
            sprite: new Sprite('img/sprites.png', [0, 39], [18, 8])
        });
        bullets.push({
            pos: [x, y],
            dir: 'up',
            sprite: new Sprite('img/sprites.png', [0, 50], [9, 5])
        });
        bullets.push({
            pos: [x, y],
            dir: 'down',
            sprite: new Sprite('img/sprites.png', [0, 60], [9, 5])
        });

        lastFire = Date.now();
    }
}

function updateEntities(dt)
{
    // Update the player sprite animation
    player.sprite.update(dt);

    for (var i = 0; i < bullets.length; i++)
    {
        var bullet = bullets[i];
        switch (bullet.dir)
        {
            case 'up': bullet.pos[1] -= bulletSpeed * dt; break;
            case 'down': bullet.pos[1] += bulletSpeed * dt; break;
            default:
                bullet.pos[0] += bulletSpeed * dt;
        }

        if (bullet.pos[1] < 0 || bullet.pos[1] > canvas.height || bullet.pos[0] > canvas.width)
        {
            bullets.splice(i, 1);
            i--;
        }
    }

    // Update all the enemies
    for (var i = 0; i < enemies.length; i++)
    {
        enemies[i].pos[0] -= enemySpeed * dt;
        enemies[i].sprite.update(dt);
        if (enemies[i].pos[0] + enemies[i].sprite.size[0] < 0)
        {
            enemies.splice(i, 1);
            i--;
        }
    }

    // Update all the explosions
    for (var i = 0; i < explosions.length; i++)
    {
        explosions[i].sprite.update(dt);
        if (explosions[i].sprite.done)
        {
            explosions.splice(i, 1);
            i--;
        }
    }
}

//Tomorrow 29.07 i will finish update parts

//Game over

function gameOver() {
    document.getElementById("game-over").style.display = 'block';
    document.getElementById('game-over-overplay').style.display = 'block';
}

//Reset game to original state
function reset()
{
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('game-over-overlay').style.display = 'none';

    isGameOver = false;

    gameTime = 0;
    score = 0;

    enemies = [];
    bullets = [];

    player.pos = [50, canvas.height / 2];
};