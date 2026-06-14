import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    // Generate simple programmatic textures for backgrounds or UI if needed
    
    // Cloud texture
    const cloudGraphics = this.make.graphics({ x: 0, y: 0 });
    cloudGraphics.fillStyle(0xffffff, 1);
    cloudGraphics.fillCircle(40, 40, 40);
    cloudGraphics.fillCircle(80, 40, 50);
    cloudGraphics.fillCircle(120, 40, 40);
    cloudGraphics.generateTexture('cloud', 160, 100);

    // Rain drop texture
    const rainGraphics = this.make.graphics({ x: 0, y: 0 });
    rainGraphics.fillStyle(0x0000ff, 0.6);
    rainGraphics.fillEllipse(5, 10, 5, 15);
    rainGraphics.generateTexture('raindrop', 10, 20);
    
    // Confetti texture (for correct answers)
    const confettiGraphics = this.make.graphics({ x: 0, y: 0 });
    confettiGraphics.fillStyle(0xffffff, 1);
    confettiGraphics.fillRect(0, 0, 12, 12);
    confettiGraphics.generateTexture('confetti', 12, 12);

    // Add a simple loading text
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2,
      text: 'Loading...',
      style: {
        font: '40px monospace',
        color: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5, 0.5);
  }

  create() {
    this.scene.start('HomeScene');
  }
}
