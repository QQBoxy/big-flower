import Phaser from 'phaser';
import { gameState } from '../state/GameState';

export class UIScene extends Phaser.Scene {
  private heartsText!: Phaser.GameObjects.Text;
  private progressText!: Phaser.GameObjects.Text;

  constructor() {
    super('UIScene');
  }

  create() {
    const width = this.cameras.main.width;

    // Hearts indicator (Top Left)
    this.heartsText = this.add.text(20, 20, '', {
      fontSize: '32px',
      color: '#ff0000'
    });

    // Progress indicator (Top Right)
    this.progressText = this.add.text(width - 20, 20, '', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(1, 0);

    this.updateUI();

    // Listen to a custom event or update regularly
    this.events.on('update-ui', this.updateUI, this);
    
    // Auto update in update loop is also fine for simple values
  }

  update() {
    this.updateUI();
  }

  private updateUI() {
    const data = gameState.getData();
    
    // Draw hearts using emoji
    const heartsStr = '❤️'.repeat(data.hearts) + '🤍'.repeat(data.maxHearts - data.hearts);
    this.heartsText.setText(heartsStr);

    // Draw progress
    this.progressText.setText(`進度: ${data.progress} / ${data.targetProgress}`);
  }
}
