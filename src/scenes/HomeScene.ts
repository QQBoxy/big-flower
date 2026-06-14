import Phaser from 'phaser';
import { gameState } from '../state/GameState';

export class HomeScene extends Phaser.Scene {
  private skinsContainer!: Phaser.GameObjects.Container;

  constructor() {
    super('HomeScene');
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background
    this.add.rectangle(0, 0, width, height, 0xffe4e1).setOrigin(0, 0);

    // Title
    this.add.text(width / 2, height * 0.15, 'Big Flower', {
      fontSize: '48px',
      color: '#ff69b4',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Start Button
    const startBtnBg = this.add.rectangle(0, 0, 240, 80, 0x32cd32, 1).setInteractive({ useHandCursor: true });
    startBtnBg.setStrokeStyle(4, 0xffffff);
    
    const startBtnText = this.add.text(0, 0, '開始遊戲', {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.container(width / 2, height * 0.85, [startBtnBg, startBtnText]);
    
    startBtnBg.on('pointerdown', () => {
      gameState.resetGame();
      this.scene.start('GameScene');
      this.scene.start('UIScene');
    });

    // Subtitle for skins
    this.add.text(width / 2, height * 0.35, '你的收集與裝扮：', {
      fontSize: '28px',
      color: '#8b4513'
    }).setOrigin(0.5);

    // Display Collected Skins
    this.createSkinsList();
  }

  private createSkinsList() {
    if (this.skinsContainer) {
      this.skinsContainer.destroy();
    }

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    this.skinsContainer = this.add.container(0, height * 0.55);
    
    const skins = gameState.getData().collectedSkins;
    const currentSkin = gameState.getData().currentSkin;
    
    // Calculate layout
    const cols = Math.min(skins.length, 3);
    const startX = width / 2 - ((cols - 1) * 120) / 2;
    
    skins.forEach((skin, index) => {
      const x = startX + (index % 3) * 120;
      const y = Math.floor(index / 3) * 120;

      // Draw skin preview
      const previewGrp = this.add.graphics();
      
      previewGrp.fillStyle(skin.color, 1);
      previewGrp.fillEllipse(x - 10, y, 20, 30);
      previewGrp.fillEllipse(x + 10, y, 20, 30);
      
      // Highlight if selected
      const isSelected = skin.id === currentSkin.id;
      if (isSelected) {
        previewGrp.lineStyle(4, 0xffd700, 1);
        previewGrp.strokeCircle(x, y, 40);
      } else {
        previewGrp.lineStyle(2, 0xffffff, 0.5);
        previewGrp.strokeCircle(x, y, 40);
      }

      // Hitbox
      const hitbox = this.add.circle(x, y, 40, 0x000000, 0).setInteractive({ useHandCursor: true });
      hitbox.on('pointerdown', () => {
        gameState.setCurrentSkin(skin.id);
        this.createSkinsList(); // re-render to update highlight
      });

      this.skinsContainer.add([previewGrp, hitbox]);
    });
  }
}
