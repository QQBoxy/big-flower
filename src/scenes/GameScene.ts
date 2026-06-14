import Phaser from 'phaser';
import { Player } from '../objects/Player';
import { QAButterfly } from '../objects/QAButterfly';
import { gameState } from '../state/GameState';
import { GAME_COLORS, GAME_PATTERNS, soundManager } from '../utils/MathUtils';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private qaGroup!: Phaser.Physics.Arcade.Group;
  private spawnTimer!: Phaser.Time.TimerEvent;
  private backgrounds!: Phaser.GameObjects.Graphics[];
  private bgSpeed = 120;
  private weatherCondition!: 'sunny' | 'cloudy' | 'rainy' | 'thunder';
  private rainEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  private sunGraphics?: Phaser.GameObjects.Graphics;
  private clouds: Phaser.GameObjects.Image[] = [];
  private thunderTimer?: Phaser.Time.TimerEvent;
  private isDialogActive: boolean = false;
  private levelMode: 'addition' | 'subtraction' | 'additionTen' | 'subtractionTen' = 'addition';

  constructor() {
    super('GameScene');
  }

  init(data?: { mode: 'addition' | 'subtraction' | 'additionTen' | 'subtractionTen' }) {
    if (data && data.mode) {
      this.levelMode = data.mode;
    } else {
      this.levelMode = 'addition';
    }
  }

  create() {
    this.isDialogActive = false;

    // Determine initial weather (thunder only happens when answering wrong)
    const weathers: ('sunny' | 'cloudy' | 'rainy')[] = ['sunny', 'cloudy', 'rainy'];
    const initialWeather = weathers[Math.floor(Math.random() * weathers.length)];
    this.clouds = [];
    this.changeWeather(initialWeather);

    // Scrolling background elements (Beautiful large flowers)
    this.backgrounds = [];
    for (let i = 0; i < 3; i++) {
      const g = this.add.graphics();
      const startY = this.scale.height - 180;
      const startX = 240;
      
      // Stem
      g.lineStyle(16, 0x81c784, 0.7);
      g.beginPath();
      g.moveTo(startX, startY);
      g.lineTo(startX, this.scale.height);
      g.strokePath();

      // Leaves
      g.fillStyle(0x4caf50, 0.7);
      g.fillEllipse(startX - 45, startY + 80, 60, 30);
      g.fillEllipse(startX + 45, startY + 110, 60, 30);

      // 5-petals flower
      const petalColors = [0xff80ab, 0xff4081, 0xf48fb1, 0xce93d8, 0x80deea];
      const petalColor = petalColors[i % petalColors.length];
      g.fillStyle(petalColor, 0.85);
      
      for (let angle = 0; angle < Math.PI * 2; angle += (Math.PI * 2) / 5) {
        const px = startX + Math.cos(angle) * 75;
        const py = startY + Math.sin(angle) * 75;
        g.fillCircle(px, py, 60);
      }
      
      // Flower center
      g.fillStyle(0xffeb3b, 0.95);
      g.fillCircle(startX, startY, 50);

      g.setX(i * this.scale.width);
      this.backgrounds.push(g);
    }

    // Player
    this.player = new Player(this, 120, this.scale.height / 2);
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }

    // QA Group
    this.qaGroup = this.physics.add.group();

    // Spawner
    this.spawnTimer = this.time.addEvent({
      delay: 3000,
      callback: this.spawnQAButterfly,
      callbackScope: this,
      loop: true
    });

    // Collision
    this.physics.add.overlap(this.player, this.qaGroup, this.handleCollision as any, undefined, this);

    // Events
    this.events.on('resume', this.onResume, this);

    // Launch UI Scene overlay
    this.scene.launch('UIScene');
  }

  update() {
    if (this.physics.world.isPaused) return;

    // Player movement
    this.player.updateMovement(this.cursors, this.input.activePointer);

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
    // Continuous random height between 25% and 75% of screen height
    const minY = this.scale.height * 0.25;
    const maxY = this.scale.height * 0.75;
    const yPos = minY + Math.random() * (maxY - minY);
    
    // 1. Randomly decide reward type: color or pattern
    const rewardType: 'color' | 'pattern' = Math.random() > 0.5 ? 'color' : 'pattern';
    let rewardValue: number | string;

    if (rewardType === 'color') {
      rewardValue = GAME_COLORS[Math.floor(Math.random() * GAME_COLORS.length)];
    } else {
      const activePatterns = GAME_PATTERNS.filter(p => p !== 'none');
      rewardValue = activePatterns[Math.floor(Math.random() * activePatterns.length)];
    }

    // 2. Randomly decide flying appearance (visual only, independent of reward)
    const renderColor = GAME_COLORS[Math.floor(Math.random() * GAME_COLORS.length)];
    const renderPattern = GAME_PATTERNS[Math.floor(Math.random() * GAME_PATTERNS.length)];

    const qa = new QAButterfly(
      this, 
      this.scale.width + 100, 
      yPos, 
      rewardType, 
      rewardValue, 
      renderColor, 
      renderPattern
    );
    
    // Add to group first
    this.qaGroup.add(qa);
    
    // FIX: Set velocity AFTER adding to the group to prevent resets
    const body = qa.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocityX(-220);
    }
  }

  private handleCollision(_player: Phaser.GameObjects.GameObject, qaSprite: Phaser.GameObjects.GameObject) {
    if (this.isDialogActive) return;
    this.isDialogActive = true;

    const qa = qaSprite as QAButterfly;
    
    // Pause game and physics
    this.physics.world.pause();
    this.spawnTimer.paused = true;
    
    if (this.rainEmitter) {
      this.rainEmitter.pause();
    }
    if (this.thunderTimer) {
      this.thunderTimer.paused = true;
    }
    
    // Clear all butterflies in the group to clean the screen and give the child breathing room
    this.qaGroup.clear(true, true);

    // Launch Dialog Scene with reward data
    this.scene.pause();
    this.scene.launch('DialogScene', { rewardType: qa.rewardType, rewardValue: qa.rewardValue, mode: this.levelMode });
  }

  private onResume(_scene: Phaser.Scene, data?: { isCorrect: boolean }) {
    // Check end conditions
    const gameStateData = gameState.getData();
    if (gameStateData.hearts <= 0 || gameStateData.progress >= gameStateData.targetProgress) {
      // Fade out effect before returning
      this.cameras.main.fadeOut(1000, 255, 228, 225); // Fade to HomeScene's background pinkish color
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.stop('UIScene');
        this.scene.start('HomeScene');
      });
      return;
    }

    // Handle weather change based on answer correctness
    if (data && typeof data.isCorrect === 'boolean') {
      if (!data.isCorrect) {
        this.changeWeather('thunder');
      } else if (data.isCorrect && this.weatherCondition === 'thunder') {
        this.changeWeather('sunny');
      }
    }

    // Reset collision protection
    this.isDialogActive = false;

    // Prevent input leakage: block inputs for 250ms
    this.player.blockInput(250);

    // Resume physics and timers
    this.physics.world.resume();
    this.spawnTimer.paused = false;
    if (this.rainEmitter) {
      this.rainEmitter.resume();
    }
    if (this.thunderTimer) {
      this.thunderTimer.paused = false;
    }
  }

  private changeWeather(newWeather: 'sunny' | 'cloudy' | 'rainy' | 'thunder') {
    if (this.weatherCondition === newWeather && (this.rainEmitter || this.clouds.length > 0 || this.sunGraphics || this.thunderTimer)) {
      return;
    }

    const oldWeather = this.weatherCondition;
    this.weatherCondition = newWeather;

    const shouldFade = (oldWeather === 'thunder' && newWeather === 'sunny');
    this.clearWeatherEffects();

    let bgColor = 0x81d4fa;
    switch (newWeather) {
      case 'sunny':
        bgColor = 0x81d4fa;
        break;
      case 'cloudy':
        bgColor = 0x90a4ae;
        break;
      case 'rainy':
        bgColor = 0x546e7a;
        break;
      case 'thunder':
        bgColor = 0x263238; // Ultra deep slate/purple gray
        break;
    }

    if (shouldFade) {
      // Background color fade transition (1 second)
      const color1 = Phaser.Display.Color.IntegerToColor(0x263238);
      const color2 = Phaser.Display.Color.IntegerToColor(0x81d4fa);
      let colorObj = { step: 0 };
      this.tweens.add({
        targets: colorObj,
        step: 100,
        duration: 1000,
        ease: 'Linear',
        onUpdate: () => {
          const result = Phaser.Display.Color.Interpolate.ColorWithColor(color1, color2, 100, colorObj.step);
          this.cameras.main.setBackgroundColor(Phaser.Display.Color.GetColor(result.r, result.g, result.b));
        }
      });
    } else {
      this.cameras.main.setBackgroundColor(bgColor);
    }

    if (newWeather === 'sunny') {
      this.sunGraphics = this.add.graphics();
      this.sunGraphics.fillStyle(0xffb74d, 0.8);
      this.sunGraphics.fillCircle(this.scale.width - 80, 80, 60);
      this.sunGraphics.fillStyle(0xfff176, 0.9);
      this.sunGraphics.fillCircle(this.scale.width - 80, 80, 45);
      
      if (shouldFade) {
        // Fade in the sun graphics
        this.sunGraphics.setAlpha(0);
        this.tweens.add({
          targets: this.sunGraphics,
          alpha: 1,
          duration: 1000,
          ease: 'Linear',
          onComplete: () => {
            if (this.sunGraphics) {
              this.tweens.add({
                targets: this.sunGraphics,
                scale: 1.05,
                duration: 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
              });
            }
          }
        });
      } else {
        this.tweens.add({
          targets: this.sunGraphics,
          scale: 1.05,
          duration: 2000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    } else if (newWeather === 'cloudy') {
      for (let i = 0; i < 4; i++) {
        const cloud = this.add.image(Math.random() * this.scale.width, 100 + Math.random() * 200, 'cloud');
        cloud.setAlpha(0.65);
        cloud.setScale(0.8 + Math.random() * 0.5);
        this.tweens.add({
          targets: cloud,
          x: '+=150',
          yoyo: true,
          repeat: -1,
          duration: 3000 + Math.random() * 3000,
          ease: 'Sine.easeInOut'
        });
        this.clouds.push(cloud);
      }
    } else if (newWeather === 'rainy') {
      const particles = this.add.particles(0, 0, 'raindrop', {
        x: { min: 0, max: this.scale.width },
        y: -20,
        lifespan: 2000,
        speedY: { min: 600, max: 800 },
        speedX: { min: -50, max: 0 },
        scale: { start: 1, end: 0.5 },
        quantity: 3
      });
      this.rainEmitter = particles;
    } else if (newWeather === 'thunder') {
      // Storm: heavy rain
      const particles = this.add.particles(0, 0, 'raindrop', {
        x: { min: 0, max: this.scale.width },
        y: -20,
        lifespan: 1500,
        speedY: { min: 800, max: 1100 },
        speedX: { min: -120, max: -40 },
        scale: { start: 1.2, end: 0.6 },
        quantity: 6
      });
      this.rainEmitter = particles;

      // Trigger lightning right away
      this.triggerLightning();

      // Repeat lightning effects
      this.thunderTimer = this.time.addEvent({
        delay: 5000,
        callback: () => {
          this.triggerLightning();
        },
        callbackScope: this,
        loop: true
      });
    }
  }

  private triggerLightning() {
    this.cameras.main.flash(250, 255, 255, 255);
    this.cameras.main.shake(200, 0.008);
    // 8-bit synthetic thunder clap sound
    soundManager.playTone(90, 0.3, 'sawtooth');
    soundManager.playTone(50, 0.5, 'triangle', 0.08);
  }

  private clearWeatherEffects() {
    if (this.sunGraphics) {
      this.sunGraphics.destroy();
      this.sunGraphics = undefined;
    }
    if (this.clouds.length > 0) {
      this.clouds.forEach(c => c.destroy());
      this.clouds = [];
    }
    if (this.rainEmitter) {
      this.rainEmitter.destroy();
      this.rainEmitter = undefined;
    }
    if (this.thunderTimer) {
      this.thunderTimer.destroy();
      this.thunderTimer = undefined;
    }
  }
}
