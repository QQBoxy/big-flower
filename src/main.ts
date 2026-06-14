import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { HomeScene } from './scenes/HomeScene';
import { LevelScene } from './scenes/LevelScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';
import { DialogScene } from './scenes/DialogScene';

declare global {
  interface Window {
    deferredPrompt: any;
  }
}

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Extract base pathname, e.g. "/big-flower" from "/big-flower/index.html" or "/big-flower/"
    const base = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
    navigator.serviceWorker.register(`${base}/sw.js`)
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Capture PWA Install Prompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPrompt = e;
  // Dispatch a custom event to notify Phaser scenes that install prompt is available
  window.dispatchEvent(new CustomEvent('pwa-can-install'));
});

window.addEventListener('appinstalled', () => {
  window.deferredPrompt = null;
  window.dispatchEvent(new CustomEvent('pwa-installed'));
  console.log('PWA was installed successfully');
});

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 720,
  height: 1280,
  parent: 'game-container',
  backgroundColor: '#aae0fa',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { x: 0, y: 0 }
    }
  },
  scene: [BootScene, PreloadScene, HomeScene, LevelScene, GameScene, UIScene, DialogScene]
};

const game = new Phaser.Game(config);

export default game;
