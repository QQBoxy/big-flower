import Phaser from 'phaser';
import { generateAdditionProblem, MathProblem } from '../utils/MathUtils';
import { gameState, Skin } from '../state/GameState';

export class DialogScene extends Phaser.Scene {
  private skin!: Skin;
  private problem!: MathProblem;

  constructor() {
    super('DialogScene');
  }

  init(data: { skin: Skin }) {
    this.skin = data.skin;
  }

  create() {
    this.problem = generateAdditionProblem();
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Semi-transparent background
    this.add.rectangle(0, 0, width, height, 0x000000, 0.5).setOrigin(0, 0);

    // Dialog Box
    const dialogW = Math.min(width * 0.9, 600);
    const dialogH = Math.min(height * 0.8, 500);
    
    const dialogBox = this.add.graphics();
    dialogBox.fillStyle(0xffffff, 1);
    dialogBox.fillRoundedRect(width / 2 - dialogW / 2, height / 2 - dialogH / 2, dialogW, dialogH, 20);
    dialogBox.lineStyle(6, 0xff69b4, 1);
    dialogBox.strokeRoundedRect(width / 2 - dialogW / 2, height / 2 - dialogH / 2, dialogW, dialogH, 20);

    // Question Text
    this.add.text(width / 2, height / 2 - dialogH * 0.3, `${this.problem.num1} + ${this.problem.num2} = ?`, {
      fontSize: '64px',
      color: '#333333',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Answer Buttons
    const btnWidth = dialogW * 0.8;
    const btnHeight = 80;
    const startY = height / 2 - 20;

    this.problem.options.forEach((opt, idx) => {
      const y = startY + idx * (btnHeight + 20);
      
      const btnBg = this.add.rectangle(width / 2, y, btnWidth, btnHeight, 0x87ceeb, 1).setInteractive({ useHandCursor: true });
      btnBg.setStrokeStyle(4, 0x4682b4);

      this.add.text(width / 2, y, opt.toString(), {
        fontSize: '48px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      btnBg.on('pointerdown', () => {
        this.handleAnswer(opt === this.problem.correctAnswer);
      });
    });
  }

  private handleAnswer(isCorrect: boolean) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Overlay to block further clicks
    this.add.rectangle(0, 0, width, height, 0x000000, 0).setOrigin(0, 0).setInteractive();

    const msg = isCorrect ? '答對了！\n你獲得了新蝴蝶！' : '哎呀，答錯了！\n扣一顆愛心';
    const color = isCorrect ? '#32cd32' : '#ff0000';

    const resultBox = this.add.rectangle(width / 2, height / 2, 400, 200, 0xffffff, 0.95);
    resultBox.setStrokeStyle(4, isCorrect ? 0x32cd32 : 0xff0000);
    
    this.add.text(width / 2, height / 2, msg, {
      fontSize: '36px',
      color: color,
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    if (isCorrect) {
      gameState.addSkin(this.skin);
      gameState.addHeart(1);
      gameState.addProgress(1);
    } else {
      gameState.removeHeart(1);
    }

    // Wait a moment then close
    this.time.delayedCall(1500, () => {
      this.scene.stop();
      this.scene.resume('GameScene');
    });
  }
}
