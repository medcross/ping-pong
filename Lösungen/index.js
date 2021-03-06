const gameWidth = 800; // Breite des Spiels
const gameHeight = 600; // Höhe des Spiels

const standardFont = { 
    fontFamily: '"Arial"',
    fontSize: "24px" 
};

const atlasKey = "atlas";

const paddleWidth = 52;
const paddleYPos = 500;

const bricksPerRow = 10;
const numberOfRows = 4;

const brickHeight = 32;
const brickWidth = 64;
const bricksYOffset = 50 + brickHeight / 2;
const bricksXOffset = (gameWidth - brickWidth * bricksPerRow) / 2 + brickWidth / 2;

const ballHeight = 22;

let isGameStarted = false;
let lostGame = false;

let remainingBricks;

// Konfiguriert das Spiel
const config = {
    type: Phaser.AUTO,
    width: gameWidth, 
    height: gameHeight,
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: "arcade"
    },
    backgroundColor: "#31403d"
};

const game = new Phaser.Game(config);

/* Lädt Ressourzen, die später im Spiel benötigt werden.
Dies können z.B. Bilder sein. */
function preload() {
    this.load.atlas(atlasKey, "assets/atlas.png", "assets/atlas.json");
}

// Hier können Objekte in der Szene erstellt werden.
function create() {
    this.physics.world.setBoundsCollision(true, true, true, false);

    this.remainingBricksText = this.add.text(0, 0, "Zerstöre alle Mauersteine", standardFont);

    this.ball = this.physics.add.image(gameWidth / 2, paddleYPos - ballHeight, atlasKey, "ball1");
    this.ball.setCollideWorldBounds(true);
    this.ball.setBounce(1);

    this.paddle = this.physics.add.image(gameWidth / 2, paddleYPos, atlasKey, "paddle1");
    this.paddle.setImmovable(true);
    this.physics.add.collider(this.ball, this.paddle, hitPaddle, null, this);

    for (let xj = 0; xj < numberOfRows; xj++) {
        for (let xi = 0; xi < bricksPerRow; xi++) {
            const brick = this.physics.add.image(
                bricksXOffset + xi * brickWidth,
                bricksYOffset + xj * brickHeight,
                atlasKey,
                "blue1"
            );
            brick.setImmovable();
            this.physics.add.collider(this.ball, brick, hitBrick, null, this);
        }
    }

    this.input.on("pointerup", startGame, this);
    this.input.on("pointermove", movePaddle, this);

    this.particles = this.add.particles(atlasKey, "particle1");
    const emitterConfig = {
        speed: {
            min: 10,
            max: 50 
        },
        quantity: { 
            min: 5,
            max: 10 
        },
        alpha: { 
            start: 1,
            end: 0 
        },
        gravityY: 200,
        lifespan: 800,
        blendMode: "SCREEN",
        on: false
    }
    this.particles.createEmitter(emitterConfig);
}

function update() {
    if (this.ball.y > gameHeight && !lostGame) {
        this.add.text(
            gameWidth / 2 - 100,
            gameHeight / 2,
            "Du hast verloren!",
            standardFont
        );
        lostGame = true;
    }
}

function startGame() {
    if (!isGameStarted) {
        this.ball.setVelocity(-75, -300);
        isGameStarted = true;
        remainingBricks = numberOfRows * bricksPerRow;
        lostGame = false;
    }
}

function movePaddle(pointer) {
    this.paddle.x = Phaser.Math.Clamp(pointer.x, paddleWidth, gameWidth - paddleWidth);

    if (!isGameStarted) {
        this.ball.x = this.paddle.x; // Nicht pointer.x !!!
    }
}

function hitPaddle(ball, paddle) {
    if (isGameStarted) {
        const distance = ball.x - paddle.x;

        if (distance === 0) {
            ball.setVelocityX(2 + Math.random() * 8);
        } else {
            ball.setVelocityX(10 * distance);
        }
    }
}

function hitBrick(ball, brick) {
    brick.disableBody(true, true);
    remainingBricks--;
    this.remainingBricksText.text = `Anzahl zu zerstörender Steine: ${remainingBricks}`;

    this.particles.emitParticleAt(brick.x, brick.y);

    if (remainingBricks === 0) {
        this.ball.setVelocity(0, 0);

        this.add.text(
            gameWidth / 2 - 100,
            gameHeight / 2,
            "Du hast gewonnen!",
            standardFont
        );
    }
}
