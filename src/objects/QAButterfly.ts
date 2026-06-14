import Phaser from 'phaser';
import { Skin } from '../state/GameState';

export class QAButterfly extends Phaser.GameObjects.Container {
  public skin: Skin;
  private wingsSprite: Phaser.GameObjects.Graphics;
  public wingTween: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number, skin: Skin) {
    super(scene, x, y);
    this.skin = skin;

    // Wings
    this.wingsSprite = scene.add.graphics();
    this.add(this.wingsSprite);

    // Body
    const bodySprite = scene.add.graphics();
    this.add(bodySprite);

    // Question Mark
    const qText = scene.add.text(0, 0, '?', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    this.add(qText);

    this.drawSkin(bodySprite);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(60, 60);
    body.setOffset(-30, -30);
    body.setVelocityX(-200); // Move left

    // Flapping
    this.wingTween = scene.tweens.add({
      targets: this.wingsSprite,
      scaleY: 0.3,
      duration: 180,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private drawSkin(bodySprite: Phaser.GameObjects.Graphics) {
    // Draw Wings
    this.wingsSprite.fillStyle(this.skin.color, 1);
    this.wingsSprite.fillEllipse(-20, 0, 40, 60);
    this.wingsSprite.fillEllipse(20, 0, 40, 60);
    
    if (this.skin.pattern === 'dots') {
      this.wingsSprite.fillStyle(0xffffff, 0.8);
      this.wingsSprite.fillCircle(-25, -10, 8);
      this.wingsSprite.fillCircle(25, -10, 8);
    } else if (this.skin.pattern === 'stripes') {
      this.wingsSprite.lineStyle(4, 0xffffff, 0.8);
      this.wingsSprite.beginPath();
      this.wingsSprite.moveTo(-35, -10);
      this.wingsSprite.lineTo(-5, 0);
      this.wingsSprite.strokePath();
    }

    // Draw Body
    bodySprite.fillStyle(0x333333, 1);
    bodySprite.fillRoundedRect(-6, -40, 12, 40, 6);
  }
}
