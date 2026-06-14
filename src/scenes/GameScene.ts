import Phaser from 'phaser';
import { Player } from '../objects/Player';
import { QAButterfly } from '../objects/QAButterfly';
import { gameState } from '../state/GameState';
import { generateRandomSkin } from '../utils/MathUtils';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private qaGroup!: Phaser.Physics.Arcade.Group;
  private spawnTimer!: Phaser.Time.TimerEvent;
  private backgrounds!: Phaser.GameObjects.Graphics[];
  private bgSpeed = 100;
  private weatherCondition!: 'sunny' | 'cloudy' | 'rainy';
  private rainEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor() {
    super('GameScene');
  }

  create() {
    // Determine weather
    const weathers: ('sunny' | 'cloudy' | 'rainy')[] = ['sunny', 'cloudy', 'rainy'];
    this.weatherCondition = weathers[Math.floor(Math.random() * weathers.length)];
    
    const bgColor = this.weatherCondition === 'sunny' ? 0x87ceeb : 
                    this.weatherCondition === 'cloudy' ? 0x778899 : 0x4a5d6e;
    this.cameras.main.setBackgroundColor(bgColor);

    // Scrolling background elements
    this.backgrounds = [];
    for (let i = 0; i < 3; i++) {
      const g = this.add.graphics();
      // Draw some large flowers or shapes
      g.fillStyle(0x32cd32, 0.5);
      g.fillCircle(0, this.scale.height, 150);
      g.fillStyle(0xff69b4, 0.5);
      g.fillCircle(100, this.scale.height - 100, 80);
      g.setX(i * this.scale.width);
      this.backgrounds.push(g);
    }

    // Weather Effects
    if (this.weatherCondition === 'rainy') {
      const particles = this.add.particles(0, 0, 'raindrop', {
        x: { min: 0, max: this.scale.width },
        y: -20,
        lifespan: 2000,
        speedY: { min: 400, max: 600 },
        scale: { start: 1, end: 0.5 },
        quantity: 2
      });
      this.rainEmitter = particles;
    } else if (this.weatherCondition === 'cloudy') {
      for(let i = 0; i < 5; i++) {
        this.add.image(Math.random() * this.scale.width, Math.random() * 200, 'cloud').setAlpha(0.6);
      }
    }

    // Player
    this.player = new Player(this, 100, this.scale.height / 2);
    if(this.input.keyboard) {
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    // QA Group
    this.qaGroup = this.physics.add.group();

    // Spawner
    this.spawnTimer = this.time.addEvent({
      delay: 2500,
      callback: this.spawnQAButterfly,
      callbackScope: this,
      loop: true
    });

    // Collision
    this.physics.add.overlap(this.player, this.qaGroup, this.handleCollision as any, undefined, this);

    // Events
    this.events.on('resume', this.onResume, this);
  }

  update() {
    if (this.physics.world.isPaused) return;

    // Player movement
    if (this.input.keyboard && this.cursors) {
      this.player.updateMovement(this.cursors, this.input.activePointer);
    }

    // Background scrolling
    this.backgrounds.forEach(bg => {
      bg.x -= (this.bgSpeed * this.game.loop.delta) / 1000;
      if (bg.x <= -this.scale.width) {
        bg.x += this.scale.width * 3;
      }
    });

    // Cleanup offscreen QA butterflies
    this.qaGroup.getChildren().forEach(child => {
      const qa = child as QAButterfly;
      if (qa.x < -100) {
        qa.destroy();
      }
    });
  }

  private spawnQAButterfly() {
    const yPos = Math.random() > 0.5 ? this.scale.height * 0.3 : this.scale.height * 0.7;
    const skin = generateRandomSkin();
    const qa = new QAButterfly(this, this.scale.width + 100, yPos, skin);
    this.qaGroup.add(qa);
  }

  private handleCollision(_player: Phaser.GameObjects.GameObject, qaSprite: Phaser.GameObjects.GameObject) {
    const qa = qaSprite as QAButterfly;
    
    // Pause game and physics
    this.physics.world.pause();
    this.spawnTimer.paused = true;
    
    if (this.rainEmitter) {
      this.rainEmitter.pause();
    }
    
    qa.destroy(); // Remove the touched butterfly

    // Launch Dialog Scene
    this.scene.pause();
    this.scene.launch('DialogScene', { skin: qa.skin });
  }

  private onResume() {
    // Check end conditions
    const data = gameState.getData();
    if (data.hearts <= 0 || data.progress >= data.targetProgress) {
      this.scene.stop('UIScene');
      this.scene.start('HomeScene');
      return;
    }

    // Resume
    this.physics.world.resume();
    this.spawnTimer.paused = false;
    if (this.rainEmitter) {
      this.rainEmitter.resume();
    }
  }
}
