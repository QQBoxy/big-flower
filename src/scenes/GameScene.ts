import Phaser from 'phaser';
import { Player } from '../objects/Player';
import { QAButterfly } from '../objects/QAButterfly';
import { gameState } from '../state/GameState';
import { GAME_COLORS, GAME_PATTERNS } from '../utils/MathUtils';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private qaGroup!: Phaser.Physics.Arcade.Group;
  private spawnTimer!: Phaser.Time.TimerEvent;
  private backgrounds!: Phaser.GameObjects.Graphics[];
  private bgSpeed = 120;
  private weatherCondition!: 'sunny' | 'cloudy' | 'rainy';
  private rainEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  private isDialogActive: boolean = false;

  constructor() {
    super('GameScene');
  }

  create() {
    this.isDialogActive = false;

    // Determine weather
    const weathers: ('sunny' | 'cloudy' | 'rainy')[] = ['sunny', 'cloudy', 'rainy'];
    this.weatherCondition = weathers[Math.floor(Math.random() * weathers.length)];
    
    // Aesthetic pastel colors for weather
    const bgColor = this.weatherCondition === 'sunny' ? 0x81d4fa : // Vivid soft sky blue
                    this.weatherCondition === 'cloudy' ? 0x90a4ae : // Light grey blue
                    0x546e7a; // Deep slate rain sky
    this.cameras.main.setBackgroundColor(bgColor);

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

    // Weather Effects
    if (this.weatherCondition === 'rainy') {
      const particles = this.add.particles(0, 0, 'raindrop', {
        x: { min: 0, max: this.scale.width },
        y: -20,
        lifespan: 2000,
        speedY: { min: 600, max: 800 },
        speedX: { min: -50, max: 0 }, // slightly slanted
        scale: { start: 1, end: 0.5 },
        quantity: 3
      });
      this.rainEmitter = particles;
    } else if (this.weatherCondition === 'cloudy') {
      // Draw clouds programmatically moving across sky
      for(let i = 0; i < 4; i++) {
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
      }
    } else {
      // Sunny - Draw a glowing cute sun in top-right
      const sunGraphics = this.add.graphics();
      sunGraphics.fillStyle(0xffb74d, 0.8);
      sunGraphics.fillCircle(this.scale.width - 80, 80, 60);
      sunGraphics.fillStyle(0xfff176, 0.9);
      sunGraphics.fillCircle(this.scale.width - 80, 80, 45);
      
      // Sun rays pulse
      this.tweens.add({
        targets: sunGraphics,
        scale: 1.05,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
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
    
    const data = gameState.getData();
    // 1. Randomly decide reward type: color or pattern
    let rewardType: 'color' | 'pattern' = Math.random() > 0.5 ? 'color' : 'pattern';
    let rewardValue: number | string;

    // Filter uncollected colors/patterns
    const uncollectedColors = GAME_COLORS.filter(c => !data.collectedColors.includes(c));
    const uncollectedPatterns = GAME_PATTERNS.filter(p => p !== 'none' && !data.collectedPatterns.includes(p));

    // Force swap if one type is fully collected
    if (rewardType === 'color' && uncollectedColors.length === 0) {
      rewardType = 'pattern';
    } else if (rewardType === 'pattern' && uncollectedPatterns.length === 0) {
      rewardType = 'color';
    }

    if (rewardType === 'color') {
      if (uncollectedColors.length > 0) {
        rewardValue = uncollectedColors[Math.floor(Math.random() * uncollectedColors.length)];
      } else {
        rewardValue = GAME_COLORS[Math.floor(Math.random() * GAME_COLORS.length)];
      }
    } else {
      if (uncollectedPatterns.length > 0) {
        rewardValue = uncollectedPatterns[Math.floor(Math.random() * uncollectedPatterns.length)];
      } else {
        const activePatterns = GAME_PATTERNS.filter(p => p !== 'none');
        rewardValue = activePatterns[Math.floor(Math.random() * activePatterns.length)];
      }
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
    
    // Clear all butterflies in the group to clean the screen and give the child breathing room
    this.qaGroup.clear(true, true);

    // Launch Dialog Scene with reward data
    this.scene.pause();
    this.scene.launch('DialogScene', { rewardType: qa.rewardType, rewardValue: qa.rewardValue });
  }

  private onResume() {
    // Check end conditions
    const data = gameState.getData();
    if (data.hearts <= 0 || data.progress >= data.targetProgress) {
      // Fade out effect before returning
      this.cameras.main.fadeOut(1000, 255, 228, 225); // Fade to HomeScene's background pinkish color
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.stop('UIScene');
        this.scene.start('HomeScene');
      });
      return;
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
  }
}
