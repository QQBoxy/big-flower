import Phaser from 'phaser';
import { gameState } from '../state/GameState';

export class Player extends Phaser.GameObjects.Container {
  private bodySprite: Phaser.GameObjects.Graphics;
  private wingsSprite: Phaser.GameObjects.Graphics;
  public wingTween: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    
    // Create wings
    this.wingsSprite = scene.add.graphics();
    this.add(this.wingsSprite);

    // Create body
    this.bodySprite = scene.add.graphics();
    this.add(this.bodySprite);
    
    this.drawSkin();

    // Add to scene
    scene.add.existing(this);
    
    // Enable physics
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(60, 60);
    body.setOffset(-30, -30);

    // Flapping animation
    this.wingTween = scene.tweens.add({
      targets: this.wingsSprite,
      scaleY: 0.2,
      duration: 150,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  public drawSkin() {
    const skin = gameState.getData().currentSkin;
    
    this.wingsSprite.clear();
    this.bodySprite.clear();

    // Draw Wings
    this.wingsSprite.fillStyle(skin.color, 1);
    this.wingsSprite.fillEllipse(-20, 0, 40, 60); // Left wing
    this.wingsSprite.fillEllipse(20, 0, 40, 60);  // Right wing
    
    // Draw pattern if any
    if (skin.pattern === 'dots') {
      this.wingsSprite.fillStyle(0xffffff, 0.8);
      this.wingsSprite.fillCircle(-25, -10, 8);
      this.wingsSprite.fillCircle(-15, 15, 6);
      this.wingsSprite.fillCircle(25, -10, 8);
      this.wingsSprite.fillCircle(15, 15, 6);
    } else if (skin.pattern === 'stripes') {
      this.wingsSprite.lineStyle(4, 0xffffff, 0.8);
      this.wingsSprite.beginPath();
      this.wingsSprite.moveTo(-35, -10);
      this.wingsSprite.lineTo(-5, 0);
      this.wingsSprite.moveTo(35, -10);
      this.wingsSprite.lineTo(5, 0);
      this.wingsSprite.strokePath();
    }

    // Draw Body
    this.bodySprite.fillStyle(0x4a4a4a, 1);
    this.bodySprite.fillRoundedRect(-8, -50, 16, 50, 8); // Body

    // Draw Antennae
    this.bodySprite.lineStyle(2, 0x4a4a4a, 1);
    this.bodySprite.beginPath();
    this.bodySprite.moveTo(-4, -20);
    this.bodySprite.lineTo(-10, -40);
    this.bodySprite.moveTo(4, -20);
    this.bodySprite.lineTo(10, -40);
    this.bodySprite.strokePath();
    
    this.bodySprite.fillStyle(0x4a4a4a, 1);
    this.bodySprite.fillCircle(-10, -40, 3);
    this.bodySprite.fillCircle(10, -40, 3);
  }

  public updateMovement(cursors: Phaser.Types.Input.Keyboard.CursorKeys, pointer: Phaser.Input.Pointer) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const speed = 300;

    body.setVelocityY(0);

    if (cursors.up.isDown) {
      body.setVelocityY(-speed);
    } else if (cursors.down.isDown) {
      body.setVelocityY(speed);
    } else if (pointer.isDown) {
      // Touch screen: upper half -> up, lower half -> down
      if (pointer.y < this.scene.scale.height / 2) {
        body.setVelocityY(-speed);
      } else {
        body.setVelocityY(speed);
      }
    }
  }
}
