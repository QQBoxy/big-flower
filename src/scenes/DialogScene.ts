import Phaser from 'phaser';
import { generateAdditionProblem, MathProblem, soundManager } from '../utils/MathUtils';
import { gameState } from '../state/GameState';
export class DialogScene extends Phaser.Scene {
  private rewardType!: 'color' | 'pattern';
  private rewardValue!: number | string;
  private problem!: MathProblem;
  private dialogContainer!: Phaser.GameObjects.Container;

  constructor() {
    super('DialogScene');
  }

  init(data: { rewardType: 'color' | 'pattern', rewardValue: number | string }) {
    this.rewardType = data.rewardType;
    this.rewardValue = data.rewardValue;
  }

  create() {
    this.problem = generateAdditionProblem();
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Semi-transparent background overlay
    this.add.rectangle(0, 0, width, height, 0x000000, 0.4).setOrigin(0, 0);
    
    // Container for popup animation
    this.dialogContainer = this.add.container(width / 2, height / 2);

    const dialogW = 600;
    const dialogH = 680;
    
    // Dialog base rounded rect
    const dialogBox = this.add.graphics();
    dialogBox.fillStyle(0xffffff, 1);
    dialogBox.fillRoundedRect(-dialogW / 2, -dialogH / 2, dialogW, dialogH, 32);
    dialogBox.lineStyle(8, 0xff80ab, 1);
    dialogBox.strokeRoundedRect(-dialogW / 2, -dialogH / 2, dialogW, dialogH, 32);

    // Dialog top ribbon decor
    const ribbon = this.add.graphics();
    ribbon.fillStyle(0xff4081, 1);
    ribbon.fillRoundedRect(-dialogW / 2 + 40, -dialogH / 2 - 25, dialogW - 80, 50, 16);
    
    const titleText = this.add.text(0, -dialogH / 2, '算一算，幫小蝴蝶找回顏色！', {
      fontFamily: 'Fredoka',
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Question Text
    const qText = this.add.text(0, -dialogH * 0.22, `${this.problem.num1} + ${this.problem.num2} = ?`, {
      fontFamily: 'Fredoka',
      fontSize: '76px',
      color: '#2c3e50',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.dialogContainer.add([dialogBox, ribbon, titleText, qText]);

    // Answer Buttons
    const btnWidth = dialogW * 0.8;
    const btnHeight = 90;
    const startY = -dialogH * 0.02;

    this.problem.options.forEach((opt, idx) => {
      const btnY = startY + idx * (btnHeight + 25);
      
      const btnContainer = this.add.container(0, btnY);
      
      const btnBg = this.add.rectangle(0, 0, btnWidth, btnHeight, 0x81d4fa, 1).setInteractive({ useHandCursor: true });
      btnBg.setStrokeStyle(4, 0x0288d1);
      
      const btnText = this.add.text(0, 0, opt.toString(), {
        fontFamily: 'Fredoka',
        fontSize: '44px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      btnContainer.add([btnBg, btnText]);
      this.dialogContainer.add(btnContainer);

      // Hover Effects
      btnBg.on('pointerover', () => {
        this.tweens.add({
          targets: btnContainer,
          scale: 1.05,
          duration: 100,
          ease: 'Power1.easeOut'
        });
      });

      btnBg.on('pointerout', () => {
        this.tweens.add({
          targets: btnContainer,
          scale: 1.0,
          duration: 100,
          ease: 'Power1.easeOut'
        });
      });

      // Press Interaction
      btnBg.on('pointerdown', () => {
        soundManager.playClick();
        this.handleAnswer(opt === this.problem.correctAnswer);
      });
    });

    // Pop up entrance animation
    this.dialogContainer.setScale(0);
    this.tweens.add({
      targets: this.dialogContainer,
      scale: 1,
      duration: 400,
      ease: 'Back.easeOut'
    });
  }

  private handleAnswer(isCorrect: boolean) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Overlay to block further clicks during transitions
    this.add.rectangle(0, 0, width, height, 0x000000, 0).setOrigin(0, 0).setInteractive();

    if (isCorrect) {
      soundManager.playCorrect();
      
      // Confetti splash
      const colors = [0xff80ab, 0xffeb3b, 0x00e676, 0x29b6f6, 0xff9100, 0xd500f9];
      this.add.particles(width / 2, height / 2 - 120, 'confetti', {
        angle: { min: 0, max: 360 },
        speed: { min: 250, max: 600 },
        gravityY: 600,
        lifespan: 1200,
        scale: { start: 1.8, end: 0.3 },
        rotate: { start: 0, end: 360 },
        color: colors,
        quantity: 80,
        stopAfter: 80
      });
    } else {
      soundManager.playWrong();
      
      // Camera shake
      this.cameras.main.shake(300, 0.015);
      
      // Shake dialog box
      this.tweens.add({
        targets: this.dialogContainer,
        x: width / 2 - 15,
        duration: 50,
        yoyo: true,
        repeat: 4,
        onComplete: () => {
          this.dialogContainer.x = width / 2;
        }
      });
    }

    const msg = isCorrect 
      ? (this.rewardType === 'color' ? '答對了！\n你解鎖了新顏色！' : '答對了！\n你解鎖了新花紋！')
      : '可惜答錯了！\n扣了一顆愛心';
    const color = isCorrect ? '#2e7d32' : '#c62828';
    const strokeColor = isCorrect ? '#e8f5e9' : '#ffebee';

    // Response dialog overlay
    const resultContainer = this.add.container(width / 2, height / 2 + 100);
    resultContainer.setScale(0);

    const resultBox = this.add.graphics();
    resultBox.fillStyle(0xffffff, 0.95);
    resultBox.fillRoundedRect(-240, -100, 480, 200, 24);
    resultBox.lineStyle(6, isCorrect ? 0x2e7d32 : 0xc62828, 1);
    resultBox.strokeRoundedRect(-240, -100, 480, 200, 24);

    const resultText = this.add.text(0, 0, msg, {
      fontFamily: 'Fredoka',
      fontSize: '34px',
      color: color,
      fontStyle: 'bold',
      align: 'center',
      stroke: strokeColor,
      strokeThickness: 2
    }).setOrigin(0.5);

    resultContainer.add([resultBox, resultText]);
    
    // Scale up result popup
    this.tweens.add({
      targets: resultContainer,
      scale: 1,
      duration: 350,
      ease: 'Back.easeOut',
      delay: 100
    });
    // Update global states
    if (isCorrect) {
      if (this.rewardType === 'color') {
        gameState.addColor(this.rewardValue as number);
      } else {
        gameState.addPattern(this.rewardValue as string);
      }
      gameState.addHeart(1);
    } else {
      gameState.removeHeart(1);
    }
    gameState.addProgress(1);

    // Wait and exit
    this.time.delayedCall(1800, () => {
      // Scale down dialog box before closing
      this.tweens.add({
        targets: [this.dialogContainer, resultContainer],
        scale: 0,
        duration: 300,
        ease: 'Back.easeIn',
        onComplete: () => {
          this.scene.stop();
          this.scene.resume('GameScene');
        }
      });
    });
  }
}
