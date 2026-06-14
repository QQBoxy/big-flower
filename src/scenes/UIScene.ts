import Phaser from 'phaser';
import { gameState } from '../state/GameState';

export class UIScene extends Phaser.Scene {
  private heartsGraphics!: Phaser.GameObjects.Graphics;
  private progressText!: Phaser.GameObjects.Text;
  private progressBg!: Phaser.GameObjects.Graphics;

  constructor() {
    super('UIScene');
  }

  create() {
    const width = 720;

    // Hearts indicator (Top Left vector hearts)
    this.heartsGraphics = this.add.graphics();

    // Progress capsule background (Top Right)
    this.progressBg = this.add.graphics();
    this.progressBg.fillStyle(0x000000, 0.25);
    this.progressBg.fillRoundedRect(width - 260, 20, 240, 60, 30);

    // Progress indicator text inside capsule
    this.progressText = this.add.text(width - 140, 50, '', {
      fontFamily: 'Fredoka',
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    this.updateUI();
  }

  update() {
    this.updateUI();
  }

  private updateUI() {
    const data = gameState.getData();
    
    // Draw vector glossy hearts
    this.heartsGraphics.clear();
    for (let i = 0; i < data.maxHearts; i++) {
      const x = 50 + i * 65;
      const y = 50;
      const size = 20;
      const isFilled = i < data.hearts;
      
      this.drawHeart(this.heartsGraphics, x, y, size, isFilled);
    }

    // Draw progress text
    this.progressText.setText(`蝴蝶: ${data.progress} / ${data.targetProgress}`);
  }

  private drawHeart(g: Phaser.GameObjects.Graphics, x: number, y: number, size: number, isFilled: boolean) {
    const color = isFilled ? 0xff4081 : 0x78909c; // Shiny Pinkish red or Slate Grey
    const outlineColor = isFilled ? 0xffffff : 0xb0bec5;
    const r = size * 0.45; // circle radius

    // 1. Draw outline first (slightly larger base)
    g.fillStyle(outlineColor, 1);
    const strokeOffset = 4;
    const outR = r + strokeOffset * 0.4;
    const outSize = size + strokeOffset * 0.8;
    g.fillCircle(x - outR * 0.8, y - outR * 0.4, outR);
    g.fillCircle(x + outR * 0.8, y - outR * 0.4, outR);
    g.fillTriangle(
      x - outR * 1.6, y - outR * 0.1,
      x + outR * 1.6, y - outR * 0.1,
      x, y + outSize
    );

    // 2. Draw inner fill color
    g.fillStyle(color, 1);
    g.fillCircle(x - r * 0.8, y - r * 0.4, r);
    g.fillCircle(x + r * 0.8, y - r * 0.4, r);
    g.fillTriangle(
      x - r * 1.6, y - r * 0.1,
      x + r * 1.6, y - r * 0.1,
      x, y + size
    );

    // 3. Glare shine reflection (Cute touch)
    if (isFilled) {
      g.fillStyle(0xffffff, 0.75);
      g.fillCircle(x - r * 0.7, y - r * 0.7, r * 0.35);
    }
  }
}
