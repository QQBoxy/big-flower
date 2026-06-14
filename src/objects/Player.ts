import Phaser from 'phaser';
import { gameState } from '../state/GameState';
import { drawWingPattern } from '../utils/MathUtils';

export class Player extends Phaser.GameObjects.Container {
  private bodySprite: Phaser.GameObjects.Graphics;
  private wingsSprite: Phaser.GameObjects.Graphics;
  public wingTween: Phaser.Tweens.Tween;
  private inputBlockedUntil: number = 0;

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
    body.setSize(70, 70);
    body.setOffset(-35, -35);

    // Flapping animation
    this.wingTween = scene.tweens.add({
      targets: this.wingsSprite,
      scaleY: 0.2,
      duration: 120,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  public blockInput(duration: number): void {
    this.inputBlockedUntil = this.scene.time.now + duration;
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocityY(0);
    }
  }

  public drawSkin() {
    const data = gameState.getData();
    const color = data.currentColor;
    const pattern = data.currentPattern;
    
    this.wingsSprite.clear();
    this.bodySprite.clear();

    // Draw Wings (Left Top, Left Bottom, Right Top, Right Bottom)
    this.wingsSprite.fillStyle(color, 1);
    this.wingsSprite.lineStyle(4, 0xffffff, 1);
    
    // Left Wing Top
    this.wingsSprite.fillEllipse(-22, -15, 36, 46);
    this.wingsSprite.strokeEllipse(-22, -15, 36, 46);
    // Left Wing Bottom
    this.wingsSprite.fillEllipse(-16, 15, 26, 36);
    this.wingsSprite.strokeEllipse(-16, 15, 26, 36);
    
    // Right Wing Top
    this.wingsSprite.fillEllipse(22, -15, 36, 46);
    this.wingsSprite.strokeEllipse(22, -15, 36, 46);
    // Right Wing Bottom
    this.wingsSprite.fillEllipse(16, 15, 26, 36);
    this.wingsSprite.strokeEllipse(16, 15, 26, 36);
    
    // Draw pattern if any
    drawWingPattern(this.wingsSprite, pattern, true, color);
    drawWingPattern(this.wingsSprite, pattern, false, color);

    // Draw Body (Cute dark body)
    this.bodySprite.fillStyle(0x3e2723, 1);
    this.bodySprite.fillRoundedRect(-8, -35, 16, 60, 8); // Body

    // Eyes (Two tiny shiny white/black eyes)
    this.bodySprite.fillStyle(0xffffff, 1);
    this.bodySprite.fillCircle(-4, -25, 4);
    this.bodySprite.fillCircle(4, -25, 4);
    this.bodySprite.fillStyle(0x000000, 1);
    this.bodySprite.fillCircle(-4, -25, 2);
    this.bodySprite.fillCircle(4, -25, 2);

    // Draw Antennae
    this.bodySprite.lineStyle(2, 0x3e2723, 1);
    this.bodySprite.beginPath();
    this.bodySprite.moveTo(-4, -30);
    this.bodySprite.lineTo(-12, -45);
    this.bodySprite.moveTo(4, -30);
    this.bodySprite.lineTo(12, -45);
    this.bodySprite.strokePath();
    
    this.bodySprite.fillStyle(0x3e2723, 1);
    this.bodySprite.fillCircle(-12, -45, 3);
    this.bodySprite.fillCircle(12, -45, 3);
  }

  public updateMovement(cursors: Phaser.Types.Input.Keyboard.CursorKeys, pointer: Phaser.Input.Pointer) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const speed = 400;

    // Reset velocity
    body.setVelocityY(0);

    // If input is blocked, skip movements
    if (this.scene.time.now < this.inputBlockedUntil) {
      return;
    }

    if (cursors && cursors.up && cursors.up.isDown) {
      body.setVelocityY(-speed);
    } else if (cursors && cursors.down && cursors.down.isDown) {
      body.setVelocityY(speed);
    } else if (pointer && pointer.isDown) {
      // Touch screen: move towards touch position relative to the butterfly
      // Add a dead zone of 15 pixels to prevent high-frequency jittering
      if (Math.abs(pointer.y - this.y) < 15) {
        body.setVelocityY(0);
      } else if (pointer.y < this.y) {
        body.setVelocityY(-speed);
      } else {
        body.setVelocityY(speed);
      }
    }
  }
}
