import Phaser from 'phaser';
import { gameState } from '../state/GameState';
import { soundManager } from '../utils/MathUtils';

export class LevelScene extends Phaser.Scene {
  constructor() {
    super('LevelScene');
  }

  create() {
    const width = 720;
    const height = 1280;

    // Background (Cute soft purple pastel)
    this.add.rectangle(0, 0, width, height, 0xf3e5f5).setOrigin(0, 0);

    // Decorative clouds
    for (let i = 0; i < 3; i++) {
      const cloud = this.add.image(120 + i * 240, 120 + (i % 2) * 40, 'cloud');
      cloud.setAlpha(0.3);
      cloud.setScale(0.7);
    }

    // Title Text
    this.add.text(width / 2, height * 0.15, '選擇冒險關卡', {
      fontFamily: 'Fredoka',
      fontSize: '68px',
      color: '#8e24aa',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 10,
      shadow: { color: '#e1bee7', fill: true, offsetX: 3, offsetY: 6, blur: 3 }
    }).setOrigin(0.5);

    // Layout variables for 2x2 Grid
    const colLeft = width / 2 - 160;  // 200
    const colRight = width / 2 + 160; // 520
    const rowTop = height * 0.38;     // 486
    const rowBottom = height * 0.56;  // 716
    const btnW = 280;
    const btnH = 150;

    // Level Buttons
    const level1Btn = this.createCute3DButton(
      colLeft, 
      rowTop, 
      '第 1 關', 
      '個位數加法', 
      'green', 
      btnW, 
      btnH, 
      () => this.startLevel('addition')
    );

    const level2Btn = this.createCute3DButton(
      colRight, 
      rowTop, 
      '第 2 關', 
      '個位數減法', 
      'blue', 
      btnW, 
      btnH, 
      () => this.startLevel('subtraction')
    );

    const level3Btn = this.createCute3DButton(
      colLeft, 
      rowBottom, 
      '第 3 關', 
      '十位數加法', 
      'orange', 
      btnW, 
      btnH, 
      () => this.startLevel('additionTen')
    );

    const level4Btn = this.createCute3DButton(
      colRight, 
      rowBottom, 
      '第 4 關', 
      '十位數減法', 
      'purple', 
      btnW, 
      btnH, 
      () => this.startLevel('subtractionTen')
    );

    this.createCute3DButton(
      width / 2, 
      height * 0.80, 
      '返回首頁', 
      '', 
      'red', 
      320, 
      80, 
      () => this.goBack()
    );

    // Pulse animation for level buttons
    this.tweens.add({
      targets: [level1Btn, level2Btn, level3Btn, level4Btn],
      scale: 1.03,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private startLevel(mode: 'addition' | 'subtraction' | 'additionTen' | 'subtractionTen') {
    soundManager.playClick();
    gameState.resetGame();

    // Fade out before transition
    this.cameras.main.fadeOut(800, 129, 212, 250); // Fade to GameScene sky blue
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene', { mode });
    });
  }

  private goBack() {
    soundManager.playClick();
    this.cameras.main.fadeOut(800, 255, 240, 245); // Fade to HomeScene's pinkish color
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('HomeScene');
    });
  }

  private createCute3DButton(
    x: number, 
    y: number, 
    titleStr: string, 
    subStr: string,
    theme: 'red' | 'blue' | 'green' | 'orange' | 'purple',
    btnW: number,
    btnH: number,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const radius = 24;
    const depthOffset = 8; // 3D depth

    const btnContainer = this.add.container(x, y);

    let baseColor = 0x1b5e20;
    let faceColor = 0x4caf50;

    if (theme === 'red') {
      baseColor = 0xb71c1c;
      faceColor = 0xff4081;
    } else if (theme === 'blue') {
      baseColor = 0x01579b;
      faceColor = 0x29b6f6;
    } else if (theme === 'orange') {
      baseColor = 0xe65100;
      faceColor = 0xff9100;
    } else if (theme === 'purple') {
      baseColor = 0x4a148c;
      faceColor = 0x9c27b0;
    }

    const strokeColor = 0xffffff;

    // 1. Base (Shadow depth)
    const baseGraphic = this.add.graphics();
    baseGraphic.fillStyle(baseColor, 1);
    baseGraphic.fillRoundedRect(-btnW / 2, -btnH / 2 + depthOffset, btnW, btnH, radius);

    // 2. Button Face
    const faceContainer = this.add.container(0, 0);

    const faceGraphic = this.add.graphics();
    faceGraphic.fillStyle(faceColor, 1);
    faceGraphic.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, radius);
    faceGraphic.lineStyle(4, strokeColor, 1);
    faceGraphic.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, radius);

    // Title Text
    const titleY = subStr ? -18 : 0;
    const titleText = this.add.text(0, titleY, titleStr, {
      fontFamily: 'Fredoka',
      fontSize: subStr ? '34px' : '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    faceContainer.add(faceGraphic);
    faceContainer.add(titleText);

    // Subtext (if any)
    if (subStr) {
      const subText = this.add.text(0, 24, subStr, {
        fontFamily: 'Fredoka',
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5).setAlpha(0.9);
      faceContainer.add(subText);
    }

    // 3. Interactive hitbox
    const hitbox = this.add.rectangle(0, depthOffset / 2, btnW, btnH + depthOffset, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    btnContainer.add([baseGraphic, faceContainer, hitbox]);

    // Press down and hover animations
    hitbox.on('pointerover', () => {
      this.tweens.add({
        targets: faceContainer,
        y: 2,
        duration: 80,
        ease: 'Power1.easeOut'
      });
    });

    hitbox.on('pointerout', () => {
      this.tweens.add({
        targets: faceContainer,
        y: 0,
        duration: 80,
        ease: 'Power1.easeOut'
      });
    });

    hitbox.on('pointerdown', () => {
      this.tweens.add({
        targets: faceContainer,
        y: depthOffset,
        duration: 50,
        ease: 'Power1.easeOut'
      });
    });

    hitbox.on('pointerup', () => {
      this.tweens.add({
        targets: faceContainer,
        y: 2, // Return to hover height
        duration: 50,
        ease: 'Power1.easeOut',
        onComplete: () => {
          callback();
        }
      });
    });

    return btnContainer;
  }
}
