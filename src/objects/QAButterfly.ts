import Phaser from 'phaser';
import { drawWingPattern } from '../utils/MathUtils';

export type RewardType = 'color' | 'pattern';

export class QAButterfly extends Phaser.GameObjects.Container {
  public rewardType: RewardType;
  public rewardValue: number | string;
  private renderColor: number;
  private renderPattern: string;
  private wingsSprite: Phaser.GameObjects.Graphics;
  public wingTween: Phaser.Tweens.Tween;

  constructor(
    scene: Phaser.Scene, 
    x: number, 
    y: number, 
    rewardType: RewardType, 
    rewardValue: number | string,
    renderColor: number,
    renderPattern: string
  ) {
    super(scene, x, y);
    this.rewardType = rewardType;
    this.rewardValue = rewardValue;
    this.renderColor = renderColor;
    this.renderPattern = renderPattern;

    // Wings
    this.wingsSprite = scene.add.graphics();
    this.add(this.wingsSprite);

    // Body
    const bodySprite = scene.add.graphics();
    this.add(bodySprite);

    // Question Mark (using Fredoka font)
    const qText = scene.add.text(0, 0, '?', {
      fontFamily: 'Fredoka',
      fontSize: '36px',
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
    body.setSize(70, 70);
    body.setOffset(-35, -35);

    // Flapping
    this.wingTween = scene.tweens.add({
      targets: this.wingsSprite,
      scaleX: 0.3,
      duration: 150,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private drawSkin(bodySprite: Phaser.GameObjects.Graphics) {
    const wingColor = this.renderColor;
    const pattern = this.renderPattern;

    // Draw Wings (Left Top, Left Bottom, Right Top, Right Bottom)
    this.wingsSprite.fillStyle(wingColor, 1);
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
    
    // Draw patterns
    drawWingPattern(this.wingsSprite, pattern, true, wingColor);
    drawWingPattern(this.wingsSprite, pattern, false, wingColor);

    // Draw Body (Cute dark body)
    bodySprite.fillStyle(0x3e2723, 1);
    bodySprite.fillRoundedRect(-8, -35, 16, 60, 8); // Body

    // Eyes (Two tiny shiny white/black eyes)
    bodySprite.fillStyle(0xffffff, 1);
    bodySprite.fillCircle(-4, -25, 4);
    bodySprite.fillCircle(4, -25, 4);
    bodySprite.fillStyle(0x000000, 1);
    bodySprite.fillCircle(-4, -25, 2);
    bodySprite.fillCircle(4, -25, 2);

    // Draw Antennae
    bodySprite.lineStyle(2, 0x3e2723, 1);
    bodySprite.beginPath();
    bodySprite.moveTo(-4, -30);
    bodySprite.lineTo(-12, -45);
    bodySprite.moveTo(4, -30);
    bodySprite.lineTo(12, -45);
    bodySprite.strokePath();
    
    bodySprite.fillStyle(0x3e2723, 1);
    bodySprite.fillCircle(-12, -45, 3);
    bodySprite.fillCircle(12, -45, 3);
  }
}
