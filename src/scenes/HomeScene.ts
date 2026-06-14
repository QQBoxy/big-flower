import Phaser from 'phaser';
import { gameState } from '../state/GameState';
import { soundManager, drawWingPattern, drawCardPattern } from '../utils/MathUtils';

export class HomeScene extends Phaser.Scene {
  private previewContainer!: Phaser.GameObjects.Container;
  private previewWings!: Phaser.GameObjects.Graphics;
  private previewBody!: Phaser.GameObjects.Graphics;
  
  private colorsContainer!: Phaser.GameObjects.Container;
  private patternsContainer!: Phaser.GameObjects.Container;

  // Drag Scroll Status
  private isDraggingColors = false;
  private isDraggingPatterns = false;
  private startColorsX = 0;
  private startPatternsX = 0;
  private startPointerColorsX = 0;
  private startPointerPatternsX = 0;

  constructor() {
    super('HomeScene');
  }

  create() {
    const width = 720;
    const height = 1280;

    // Background (Cute soft pink pastel)
    this.add.rectangle(0, 0, width, height, 0xfff0f5).setOrigin(0, 0);
    
    // Add decorative clouds in the home background
    for (let i = 0; i < 3; i++) {
      const cloud = this.add.image(100 + i * 250, 120 + (i % 2) * 40, 'cloud');
      cloud.setAlpha(0.25);
      cloud.setScale(0.8);
    }

    // Title text (Big Flower) with a cute font, stroke, shadow
    this.add.text(width / 2, height * 0.1, 'Big Flower', {
      fontFamily: 'Fredoka',
      fontSize: '84px',
      color: '#ff4081',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 12,
      shadow: { color: '#f8bbd0', fill: true, offsetX: 4, offsetY: 8, blur: 4 }
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, height * 0.165, '蝴蝶加法冒險之旅', {
      fontFamily: 'Fredoka',
      fontSize: '28px',
      color: '#e91e63',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 1. Create Preview Butterfly (Center Top)
    this.createPreviewButterfly(width / 2, height * 0.32);

    // 2. Decorative Frame for Preview
    const frame = this.add.graphics();
    frame.lineStyle(6, 0xff80ab, 0.4);
    frame.strokeCircle(width / 2, height * 0.32, 140);
    
    frame.fillStyle(0xffeb3b, 0.8);
    frame.fillCircle(width / 2 - 120, height * 0.32 - 70, 12);
    frame.fillStyle(0xff4081, 0.8);
    frame.fillCircle(width / 2 + 110, height * 0.32 + 80, 16);

    // 3. Colors List Header
    this.add.text(width / 2, height * 0.48, '🎨 點擊更換翅膀顏色：', {
      fontFamily: 'Fredoka',
      fontSize: '32px',
      color: '#4e342e',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Colors Container
    this.colorsContainer = this.add.container(0, height * 0.56);
    this.drawColorsList();

    // 4. Patterns List Header
    this.add.text(width / 2, height * 0.66, '✨ 點擊更換花紋樣式：', {
      fontFamily: 'Fredoka',
      fontSize: '32px',
      color: '#4e342e',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Patterns Container
    this.patternsContainer = this.add.container(0, height * 0.74);
    this.drawPatternsList();

    // 5. Start Button Container
    const startBtnContainer = this.add.container(width / 2, height * 0.9);

    // Rounded button graphic
    const btnGraphic = this.add.graphics();
    btnGraphic.fillStyle(0x4caf50, 1);
    btnGraphic.fillRoundedRect(-160, -45, 320, 90, 24);
    btnGraphic.lineStyle(6, 0xffffff, 1);
    btnGraphic.strokeRoundedRect(-160, -45, 320, 90, 24);

    const startBtnText = this.add.text(0, 0, '開始遊戲', {
      fontFamily: 'Fredoka',
      fontSize: '40px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#2e7d32',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Click collider area
    const btnCollider = this.add.rectangle(0, 0, 320, 90, 0x000000, 0).setInteractive({ useHandCursor: true });

    startBtnContainer.add([btnGraphic, startBtnText, btnCollider]);
    
    btnCollider.on('pointerdown', () => {
      soundManager.playClick();
      gameState.resetGame();
      
      // Fade out before transition
      this.cameras.main.fadeOut(800, 129, 212, 250); // Fade to GameScene sky blue
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene');
      });
    });

    // Hover effects
    btnCollider.on('pointerover', () => {
      this.tweens.add({
        targets: startBtnContainer,
        scale: 1.1,
        duration: 100
      });
    });
    btnCollider.on('pointerout', () => {
      this.tweens.add({
        targets: startBtnContainer,
        scale: 1.0,
        duration: 100
      });
    });

    // Pulse animation
    this.tweens.add({
      targets: startBtnContainer,
      scale: 1.04,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 6. Setup Drag Scroll listeners
    const colorsY = height * 0.56;
    const patternsY = height * 0.74;

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Check colors row dragging area
      if (pointer.y >= colorsY - 80 && pointer.y <= colorsY + 80) {
        this.isDraggingColors = true;
        this.startColorsX = this.colorsContainer.x;
        this.startPointerColorsX = pointer.x;
      }
      // Check patterns row dragging area
      if (pointer.y >= patternsY - 80 && pointer.y <= patternsY + 80) {
        this.isDraggingPatterns = true;
        this.startPatternsX = this.patternsContainer.x;
        this.startPointerPatternsX = pointer.x;
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      const colors = gameState.getData().collectedColors;
      const patterns = gameState.getData().collectedPatterns;
      const itemWidth = 100;
      const gap = 20;

      if (this.isDraggingColors) {
        const totalWidth = colors.length * itemWidth + (colors.length - 1) * gap;
        const deltaX = pointer.x - this.startPointerColorsX;
        let newX = this.startColorsX + deltaX;

        if (totalWidth <= 640) {
          newX = 360 - totalWidth / 2 + itemWidth / 2;
        } else {
          const minX = 720 - totalWidth - 40;
          const maxX = 40;
          if (newX > maxX) newX = maxX;
          if (newX < minX) newX = minX;
        }
        this.colorsContainer.x = newX;
      }

      if (this.isDraggingPatterns) {
        const totalWidth = patterns.length * itemWidth + (patterns.length - 1) * gap;
        const deltaX = pointer.x - this.startPointerPatternsX;
        let newX = this.startPatternsX + deltaX;

        if (totalWidth <= 640) {
          newX = 360 - totalWidth / 2 + itemWidth / 2;
        } else {
          const minX = 720 - totalWidth - 40;
          const maxX = 40;
          if (newX > maxX) newX = maxX;
          if (newX < minX) newX = minX;
        }
        this.patternsContainer.x = newX;
      }
    });

    this.input.on('pointerup', () => {
      this.isDraggingColors = false;
      this.isDraggingPatterns = false;
    });
  }

  private createPreviewButterfly(x: number, y: number) {
    this.previewContainer = this.add.container(x, y);
    this.previewContainer.setScale(1.5); // Large preview

    // Wings Graphics
    this.previewWings = this.add.graphics();
    this.previewContainer.add(this.previewWings);

    // Body Graphics
    this.previewBody = this.add.graphics();
    this.previewContainer.add(this.previewBody);

    this.updatePreviewButterfly();

    // Constant cute wing flapping tween
    this.tweens.add({
      targets: this.previewWings,
      scaleY: 0.25,
      duration: 150,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private updatePreviewButterfly() {
    const data = gameState.getData();
    const color = data.currentColor;
    const pattern = data.currentPattern;

    this.previewWings.clear();
    this.previewBody.clear();

    // Draw Wings (same style as Player)
    this.previewWings.fillStyle(color, 1);
    this.previewWings.lineStyle(4, 0xffffff, 1);
    
    // Left Wing Top
    this.previewWings.fillEllipse(-22, -15, 36, 46);
    this.previewWings.strokeEllipse(-22, -15, 36, 46);
    // Left Wing Bottom
    this.previewWings.fillEllipse(-16, 15, 26, 36);
    this.previewWings.strokeEllipse(-16, 15, 26, 36);
    
    // Right Wing Top
    this.previewWings.fillEllipse(22, -15, 36, 46);
    this.previewWings.strokeEllipse(22, -15, 36, 46);
    // Right Wing Bottom
    this.previewWings.fillEllipse(16, 15, 26, 36);
    this.previewWings.strokeEllipse(16, 15, 26, 36);
    
    // Draw pattern using shared wing pattern drawing helper
    drawWingPattern(this.previewWings, pattern, true, color);
    drawWingPattern(this.previewWings, pattern, false, color);

    // Draw Body (Cute dark body)
    this.previewBody.fillStyle(0x3e2723, 1);
    this.previewBody.fillRoundedRect(-8, -35, 16, 60, 8); // Body

    // Eyes
    this.previewBody.fillStyle(0xffffff, 1);
    this.previewBody.fillCircle(-4, -25, 4);
    this.previewBody.fillCircle(4, -25, 4);
    this.previewBody.fillStyle(0x000000, 1);
    this.previewBody.fillCircle(-4, -25, 2);
    this.previewBody.fillCircle(4, -25, 2);

    // Draw Antennae
    this.previewBody.lineStyle(2, 0x3e2723, 1);
    this.previewBody.beginPath();
    this.previewBody.moveTo(-4, -30);
    this.previewBody.lineTo(-12, -45);
    this.previewBody.moveTo(4, -30);
    this.previewBody.lineTo(12, -45);
    this.previewBody.strokePath();
    
    this.previewBody.fillStyle(0x3e2723, 1);
    this.previewBody.fillCircle(-12, -45, 3);
    this.previewBody.fillCircle(12, -45, 3);
  }

  private drawColorsList() {
    this.colorsContainer.removeAll(true);

    const colors = gameState.getData().collectedColors;
    const currentColor = gameState.getData().currentColor;

    const itemWidth = 100;
    const itemHeight = 100;
    const gap = 20;

    const totalWidth = colors.length * itemWidth + (colors.length - 1) * gap;
    
    // Set container position dynamically
    if (totalWidth <= 640) {
      this.colorsContainer.x = 360 - totalWidth / 2 + itemWidth / 2;
    } else {
      const minX = 720 - totalWidth - 40;
      const maxX = 40;
      if (this.colorsContainer.x > maxX || this.colorsContainer.x === 0) {
        this.colorsContainer.x = maxX;
      } else if (this.colorsContainer.x < minX) {
        this.colorsContainer.x = minX;
      }
    }

    colors.forEach((col, index) => {
      const x = index * (itemWidth + gap);
      const isSelected = col === currentColor;

      const card = this.add.container(x, 0);

      // White card bg
      const cardBg = this.add.graphics();
      if (isSelected) {
        cardBg.fillStyle(0xffffff, 1);
        cardBg.fillRoundedRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight, 16);
        cardBg.lineStyle(5, 0xffd700, 1); // Thick gold border
        cardBg.strokeRoundedRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight, 16);
      } else {
        cardBg.fillStyle(0xffffff, 0.85);
        cardBg.fillRoundedRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight, 16);
        cardBg.lineStyle(2, 0xe0e0e0, 1);
        cardBg.strokeRoundedRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight, 16);
      }

      // Color Circle inside Card
      const circle = this.add.graphics();
      circle.fillStyle(col, 1);
      circle.fillCircle(0, 0, 32);
      circle.lineStyle(2, 0xffffff, 1);
      circle.strokeCircle(0, 0, 32);

      // Hitbox
      const hitbox = this.add.rectangle(0, 0, itemWidth, itemHeight, 0x000000, 0).setInteractive({ useHandCursor: true });

      let startX = 0;
      hitbox.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        startX = pointer.x;
      });

      hitbox.on('pointerup', (pointer: Phaser.Input.Pointer) => {
        // Only trigger switch if it's a click, not a drag slide
        const dragDist = Math.abs(pointer.x - startX);
        if (dragDist < 8) {
          if (!isSelected) {
            soundManager.playSwitch();
            gameState.setCurrentColor(col);
            this.updatePreviewButterfly();
            this.drawColorsList(); // Re-render to update highlight
            this.drawPatternsList(); // Update pattern card background color!
          }
        }
      });

      // Hover feedback
      hitbox.on('pointerover', () => {
        this.tweens.add({ targets: card, scale: 1.08, duration: 100 });
      });
      hitbox.on('pointerout', () => {
        this.tweens.add({ targets: card, scale: 1.0, duration: 100 });
      });

      card.add([cardBg, circle, hitbox]);
      this.colorsContainer.add(card);
    });
  }

  private drawPatternsList() {
    this.patternsContainer.removeAll(true);

    const patterns = gameState.getData().collectedPatterns;
    const currentPattern = gameState.getData().currentPattern;
    const currentColor = gameState.getData().currentColor;

    const itemWidth = 100;
    const itemHeight = 100;
    const gap = 20;

    const totalWidth = patterns.length * itemWidth + (patterns.length - 1) * gap;

    // Set container position dynamically
    if (totalWidth <= 640) {
      this.patternsContainer.x = 360 - totalWidth / 2 + itemWidth / 2;
    } else {
      const minX = 720 - totalWidth - 40;
      const maxX = 40;
      if (this.patternsContainer.x > maxX || this.patternsContainer.x === 0) {
        this.patternsContainer.x = maxX;
      } else if (this.patternsContainer.x < minX) {
        this.patternsContainer.x = minX;
      }
    }

    patterns.forEach((pat, index) => {
      const x = index * (itemWidth + gap);
      const isSelected = pat === currentPattern;

      const card = this.add.container(x, 0);

      // Card Bg
      const cardBg = this.add.graphics();
      if (isSelected) {
        cardBg.fillStyle(0xffffff, 1);
        cardBg.fillRoundedRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight, 16);
        cardBg.lineStyle(5, 0xffd700, 1); // Thick gold border
        cardBg.strokeRoundedRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight, 16);
      } else {
        cardBg.fillStyle(0xffffff, 0.85);
        cardBg.fillRoundedRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight, 16);
        cardBg.lineStyle(2, 0xe0e0e0, 1);
        cardBg.strokeRoundedRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight, 16);
      }

      // Draw pattern preview inside Card (using currentColor)
      const preview = this.add.graphics();
      preview.fillStyle(currentColor, 1);
      preview.fillCircle(0, 0, 32);
      
      // Draw pattern lines on top of preview circle
      drawCardPattern(preview, pat, currentColor, 1);
      
      preview.lineStyle(2, 0xffffff, 1);
      preview.strokeCircle(0, 0, 32);

      // Hitbox
      const hitbox = this.add.rectangle(0, 0, itemWidth, itemHeight, 0x000000, 0).setInteractive({ useHandCursor: true });

      let startX = 0;
      hitbox.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        startX = pointer.x;
      });

      hitbox.on('pointerup', (pointer: Phaser.Input.Pointer) => {
        const dragDist = Math.abs(pointer.x - startX);
        if (dragDist < 8) {
          if (!isSelected) {
            soundManager.playSwitch();
            gameState.setCurrentPattern(pat);
            this.updatePreviewButterfly();
            this.drawPatternsList(); // Re-render to update highlight
          }
        }
      });

      // Hover feedback
      hitbox.on('pointerover', () => {
        this.tweens.add({ targets: card, scale: 1.08, duration: 100 });
      });
      hitbox.on('pointerout', () => {
        this.tweens.add({ targets: card, scale: 1.0, duration: 100 });
      });

      card.add([cardBg, preview, hitbox]);
      this.patternsContainer.add(card);
    });
  }
}
