import Phaser from "phaser";
import { gameState } from "../state/GameState";
import {
  soundManager,
  drawWingPattern,
  drawCardPattern,
  GAME_COLORS,
  GAME_PATTERNS,
} from "../utils/MathUtils";

export class HomeScene extends Phaser.Scene {
  private previewContainer!: Phaser.GameObjects.Container;
  private previewWings!: Phaser.GameObjects.Graphics;
  private previewBody!: Phaser.GameObjects.Graphics;

  private colorsContainer!: Phaser.GameObjects.Container;
  private patternsContainer!: Phaser.GameObjects.Container;
  private colorsHeader!: Phaser.GameObjects.Text;
  private patternsHeader!: Phaser.GameObjects.Text;

  // Drag Scroll Status
  private isDraggingColors = false;
  private isDraggingPatterns = false;
  private startColorsX = 0;
  private startPatternsX = 0;
  private startPointerColorsX = 0;
  private startPointerPatternsX = 0;

  constructor() {
    super("HomeScene");
  }

  create() {
    const width = 720;
    const height = 1280;

    // Background (Cute soft pink pastel)
    this.add.rectangle(0, 0, width, height, 0xfff0f5).setOrigin(0, 0);

    // Add decorative clouds in the home background
    for (let i = 0; i < 3; i++) {
      const cloud = this.add.image(100 + i * 250, 120 + (i % 2) * 40, "cloud");
      cloud.setAlpha(0.25);
      cloud.setScale(0.8);
    }

    // Title text (Big Flower) with a cute font, stroke, shadow
    this.add
      .text(width / 2, height * 0.1, "Big Flower", {
        fontFamily: "Fredoka",
        fontSize: "84px",
        color: "#ff4081",
        fontStyle: "bold",
        stroke: "#ffffff",
        strokeThickness: 12,
        shadow: {
          color: "#f8bbd0",
          fill: true,
          offsetX: 4,
          offsetY: 8,
          blur: 4,
        },
      })
      .setOrigin(0.5);

    // Subtitle
    this.add
      .text(width / 2, height * 0.165, "蝴蝶加法冒險之旅", {
        fontFamily: "Fredoka",
        fontSize: "28px",
        color: "#e91e63",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

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
    this.colorsHeader = this.add
      .text(width / 2, height * 0.48, "", {
        fontFamily: "Fredoka",
        fontSize: "32px",
        color: "#4e342e",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Colors Container
    this.colorsContainer = this.add.container(0, height * 0.56);
    this.drawColorsList();

    // 4. Patterns List Header
    this.patternsHeader = this.add
      .text(width / 2, height * 0.66, "", {
        fontFamily: "Fredoka",
        fontSize: "32px",
        color: "#4e342e",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Patterns Container
    this.patternsContainer = this.add.container(0, height * 0.74);
    this.drawPatternsList();

    // Update header texts
    this.updateHeadersText();

    // 5. Start Button Container
    const startBtnContainer = this.add.container(width / 2, height * 0.9);

    // Rounded button graphic
    const btnGraphic = this.add.graphics();
    btnGraphic.fillStyle(0x4caf50, 1);
    btnGraphic.fillRoundedRect(-160, -45, 320, 90, 24);
    btnGraphic.lineStyle(6, 0xffffff, 1);
    btnGraphic.strokeRoundedRect(-160, -45, 320, 90, 24);

    const startBtnText = this.add
      .text(0, 0, "開始遊戲", {
        fontFamily: "Fredoka",
        fontSize: "40px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#2e7d32",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // Click collider area
    const btnCollider = this.add
      .rectangle(0, 0, 320, 90, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    startBtnContainer.add([btnGraphic, startBtnText, btnCollider]);

    btnCollider.on("pointerdown", () => {
      soundManager.playClick();

      // Fade out before transition
      this.cameras.main.fadeOut(800, 243, 229, 245); // Fade to LevelScene bg (approx 0xf3e5f5)
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("LevelScene");
      });
    });

    // Hover effects
    btnCollider.on("pointerover", () => {
      this.tweens.add({
        targets: startBtnContainer,
        scale: 1.1,
        duration: 100,
      });
    });
    btnCollider.on("pointerout", () => {
      this.tweens.add({
        targets: startBtnContainer,
        scale: 1.0,
        duration: 100,
      });
    });

    // Pulse animation
    this.tweens.add({
      targets: startBtnContainer,
      scale: 1.04,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // 6. Setup Drag Scroll listeners
    const colorsY = height * 0.56;
    const patternsY = height * 0.74;

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
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

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      const colors = gameState.getData().collectedColors;
      const patterns = gameState.getData().collectedPatterns;
      const itemWidth = 100;
      const gap = 20;

      if (this.isDraggingColors) {
        const totalWidth =
          colors.length * itemWidth + (colors.length - 1) * gap;
        const deltaX = pointer.x - this.startPointerColorsX;
        let newX = this.startColorsX + deltaX;

        if (totalWidth <= 640) {
          newX = 360 - totalWidth / 2 + itemWidth / 2;
        } else {
          const maxX = 40 + itemWidth / 2;
          const minX = 720 - 40 - totalWidth + itemWidth / 2;
          if (newX > maxX) newX = maxX;
          if (newX < minX) newX = minX;
        }
        this.colorsContainer.x = newX;
      }

      if (this.isDraggingPatterns) {
        const totalWidth =
          patterns.length * itemWidth + (patterns.length - 1) * gap;
        const deltaX = pointer.x - this.startPointerPatternsX;
        let newX = this.startPatternsX + deltaX;

        if (totalWidth <= 640) {
          newX = 360 - totalWidth / 2 + itemWidth / 2;
        } else {
          const maxX = 40 + itemWidth / 2;
          const minX = 720 - 40 - totalWidth + itemWidth / 2;
          if (newX > maxX) newX = maxX;
          if (newX < minX) newX = minX;
        }
        this.patternsContainer.x = newX;
      }
    });

    this.input.on("pointerup", () => {
      this.isDraggingColors = false;
      this.isDraggingPatterns = false;
    });

    // 7. Setup Settings Button
    this.createSettingsButton(width, height);
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
      scaleX: 0.25,
      duration: 150,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
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
      const maxX = 40 + itemWidth / 2;
      const minX = 720 - 40 - totalWidth + itemWidth / 2;
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
        cardBg.fillRoundedRect(
          -itemWidth / 2,
          -itemHeight / 2,
          itemWidth,
          itemHeight,
          16,
        );
        cardBg.lineStyle(5, 0xffd700, 1); // Thick gold border
        cardBg.strokeRoundedRect(
          -itemWidth / 2,
          -itemHeight / 2,
          itemWidth,
          itemHeight,
          16,
        );
      } else {
        cardBg.fillStyle(0xffffff, 0.85);
        cardBg.fillRoundedRect(
          -itemWidth / 2,
          -itemHeight / 2,
          itemWidth,
          itemHeight,
          16,
        );
        cardBg.lineStyle(2, 0xe0e0e0, 1);
        cardBg.strokeRoundedRect(
          -itemWidth / 2,
          -itemHeight / 2,
          itemWidth,
          itemHeight,
          16,
        );
      }

      // Color Circle inside Card
      const circle = this.add.graphics();
      circle.fillStyle(col, 1);
      circle.fillCircle(0, 0, 32);
      circle.lineStyle(2, 0xffffff, 1);
      circle.strokeCircle(0, 0, 32);

      // Hitbox
      const hitbox = this.add
        .rectangle(0, 0, itemWidth, itemHeight, 0x000000, 0)
        .setInteractive({ useHandCursor: true });

      let startX = 0;
      hitbox.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        startX = pointer.x;
      });

      hitbox.on("pointerup", (pointer: Phaser.Input.Pointer) => {
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
      hitbox.on("pointerover", () => {
        this.tweens.add({ targets: card, scale: 1.08, duration: 100 });
      });
      hitbox.on("pointerout", () => {
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

    const totalWidth =
      patterns.length * itemWidth + (patterns.length - 1) * gap;

    // Set container position dynamically
    if (totalWidth <= 640) {
      this.patternsContainer.x = 360 - totalWidth / 2 + itemWidth / 2;
    } else {
      const maxX = 40 + itemWidth / 2;
      const minX = 720 - 40 - totalWidth + itemWidth / 2;
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
        cardBg.fillRoundedRect(
          -itemWidth / 2,
          -itemHeight / 2,
          itemWidth,
          itemHeight,
          16,
        );
        cardBg.lineStyle(5, 0xffd700, 1); // Thick gold border
        cardBg.strokeRoundedRect(
          -itemWidth / 2,
          -itemHeight / 2,
          itemWidth,
          itemHeight,
          16,
        );
      } else {
        cardBg.fillStyle(0xffffff, 0.85);
        cardBg.fillRoundedRect(
          -itemWidth / 2,
          -itemHeight / 2,
          itemWidth,
          itemHeight,
          16,
        );
        cardBg.lineStyle(2, 0xe0e0e0, 1);
        cardBg.strokeRoundedRect(
          -itemWidth / 2,
          -itemHeight / 2,
          itemWidth,
          itemHeight,
          16,
        );
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
      const hitbox = this.add
        .rectangle(0, 0, itemWidth, itemHeight, 0x000000, 0)
        .setInteractive({ useHandCursor: true });

      let startX = 0;
      hitbox.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        startX = pointer.x;
      });

      hitbox.on("pointerup", (pointer: Phaser.Input.Pointer) => {
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
      hitbox.on("pointerover", () => {
        this.tweens.add({ targets: card, scale: 1.08, duration: 100 });
      });
      hitbox.on("pointerout", () => {
        this.tweens.add({ targets: card, scale: 1.0, duration: 100 });
      });

      card.add([cardBg, preview, hitbox]);
      this.patternsContainer.add(card);
    });
  }

  private createSettingsButton(width: number, height: number) {
    const btnSize = 64;
    const x = width - 60;
    const y = 60;

    const btnContainer = this.add.container(x, y);

    // Button Background
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.95);
    bg.fillCircle(0, 0, btnSize / 2);
    bg.lineStyle(4, 0xff80ab, 1);
    bg.strokeCircle(0, 0, btnSize / 2);

    // Cute Custom Vector Gear Icon
    const gear = this.add.graphics();
    const strokeColor = 0xff4081; // 亮粉紅外框
    const fillColor = 0xffd54f; // 溫暖黃色本體

    // 1. 畫 8 個突出的齒
    gear.fillStyle(fillColor, 1);
    gear.lineStyle(3, strokeColor, 1);
    const teethCount = 8;
    const outerRadius = 15;
    const toothRadius = 4.5;
    for (let i = 0; i < teethCount; i++) {
      const angle = (i * Math.PI * 2) / teethCount;
      const tx = Math.cos(angle) * outerRadius;
      const ty = Math.sin(angle) * outerRadius;
      gear.fillCircle(tx, ty, toothRadius);
      gear.strokeCircle(tx, ty, toothRadius);
    }

    // 2. 畫主體圓，蓋掉突出齒的內半部
    gear.fillCircle(0, 0, outerRadius);
    gear.strokeCircle(0, 0, outerRadius);

    // 3. 畫中心的孔
    gear.fillStyle(strokeColor, 1);
    gear.fillCircle(0, 0, 5);

    // Interactive hitbox
    const hitbox = this.add
      .circle(0, 0, btnSize / 2, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    btnContainer.add([bg, gear, hitbox]);

    hitbox.on("pointerover", () => {
      this.tweens.add({
        targets: btnContainer,
        scale: 1.15,
        duration: 100,
      });
      // Cute rotation effect on hover
      this.tweens.add({
        targets: gear,
        angle: 45,
        duration: 200,
        ease: "Power1.easeOut",
      });
    });

    hitbox.on("pointerout", () => {
      this.tweens.add({
        targets: btnContainer,
        scale: 1.0,
        duration: 100,
      });
      this.tweens.add({
        targets: gear,
        angle: 0,
        duration: 200,
        ease: "Power1.easeOut",
      });
    });

    hitbox.on("pointerdown", () => {
      soundManager.playClick();
      this.createSettingsModal(width, height);
    });
  }

  private createSettingsModal(width: number, height: number) {
    // 建立一個覆蓋全螢幕的 Container，用於呈現半透明遮罩與彈窗
    const modalContainer = this.add.container(0, 0).setDepth(100);

    // 1. 半透明遮罩，阻擋下方的互動
    const overlay = this.add
      .rectangle(0, 0, width, height, 0x000000, 0.4)
      .setOrigin(0, 0)
      .setInteractive();

    // 2. 彈窗 Container 放在畫面正中央，並實作彈出動畫
    const dialogContainer = this.add.container(width / 2, height / 2);

    const canInstall = !!window.deferredPrompt;
    const dialogW = 540;
    const dialogH = canInstall ? 600 : 420;

    // 關閉邏輯動畫 (先宣告以供按鈕 callback 使用)
    const closeModal = () => {
      this.tweens.add({
        targets: dialogContainer,
        scale: 0,
        duration: 250,
        ease: "Back.easeIn",
        onComplete: () => {
          modalContainer.destroy();
        },
      });
    };

    // 點擊灰色半透明遮罩可關閉設定彈窗並返回遊戲
    overlay.on("pointerdown", () => {
      soundManager.playClick();
      closeModal();
    });

    // 彈窗背景
    const dialogBox = this.add.graphics();
    dialogBox.fillStyle(0xffffff, 1);
    dialogBox.fillRoundedRect(-dialogW / 2, -dialogH / 2, dialogW, dialogH, 32);
    dialogBox.lineStyle(6, 0xff80ab, 1);
    dialogBox.strokeRoundedRect(
      -dialogW / 2,
      -dialogH / 2,
      dialogW,
      dialogH,
      32,
    );

    // 畫分隔線
    if (canInstall) {
      dialogBox.lineStyle(2, 0xff80ab, 0.3);
      // 第一條分隔線：在 Install 區與 Reset 區之間 (y: -40 處)
      dialogBox.beginPath();
      dialogBox.moveTo(-dialogW / 2 + 40, -40);
      dialogBox.lineTo(dialogW / 2 - 40, -40);
      dialogBox.strokePath();

      // 第二條分隔線：在 Reset 區與 返回遊戲 按鈕之間 (y: 160 處)
      dialogBox.beginPath();
      dialogBox.moveTo(-dialogW / 2 + 40, 160);
      dialogBox.lineTo(dialogW / 2 - 40, 160);
      dialogBox.strokePath();
    } else {
      // 僅有重置紀錄時，在 Reset 區與 返回遊戲 之間畫一條線 (y: 50 處)
      dialogBox.lineStyle(2, 0xff80ab, 0.3);
      dialogBox.beginPath();
      dialogBox.moveTo(-dialogW / 2 + 40, 50);
      dialogBox.lineTo(dialogW / 2 - 40, 50);
      dialogBox.strokePath();
    }

    // 標題 Ribbon
    const ribbon = this.add.graphics();
    ribbon.fillStyle(0xff4081, 1);
    ribbon.fillRoundedRect(
      -dialogW / 2 + 40,
      -dialogH / 2 - 25,
      dialogW - 80,
      50,
      16,
    );

    const titleText = this.add
      .text(0, -dialogH / 2, "遊戲設定", {
        fontFamily: "Fredoka",
        fontSize: "28px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // 根據是否可安裝，繪製不同的分類內容
    if (canInstall) {
      // === 第一區：安裝遊戲 ===
      const installTitle = this.add
        .text(0, -210, "📥 安裝遊戲到裝置", {
          fontFamily: "Fredoka",
          fontSize: "24px",
          color: "#2e7d32",
          fontStyle: "bold",
        })
        .setOrigin(0.5);

      const installDesc = this.add
        .text(0, -170, "安裝後可直接從桌面啟動，支援離線遊玩！", {
          fontFamily: "Fredoka",
          fontSize: "20px",
          color: "#5d4037",
          fontStyle: "bold",
        })
        .setOrigin(0.5);

      const installBtn = this.createCute3DButton(
        0,
        -100,
        "安裝遊戲",
        "green",
        240,
        () => {
          const promptEvent = window.deferredPrompt;
          if (!promptEvent) return;

          // 顯示安裝提示
          promptEvent.prompt();

          // 等待使用者回應
          promptEvent.userChoice.then((choiceResult: any) => {
            if (choiceResult.outcome === "accepted") {
              console.log("User accepted PWA installation");
            } else {
              console.log("User dismissed PWA installation");
            }
            window.deferredPrompt = null;
            // 關閉並重新建立設定視窗以刷新版面
            closeModal();
            this.time.delayedCall(200, () => {
              this.createSettingsModal(width, height);
            });
          });
        },
        "download",
      );

      // === 第二區：重置遊戲紀錄 ===
      const resetTitle = this.add
        .text(0, 0, "⚠️ 重置遊戲紀錄", {
          fontFamily: "Fredoka",
          fontSize: "24px",
          color: "#c62828",
          fontStyle: "bold",
        })
        .setOrigin(0.5);

      const resetDesc = this.add
        .text(0, 40, "是否清除所有已獲得的翅膀顏色與花紋？", {
          fontFamily: "Fredoka",
          fontSize: "20px",
          color: "#5d4037",
          fontStyle: "bold",
        })
        .setOrigin(0.5);

      const clearBtn = this.createCute3DButton(
        0,
        100,
        "清除紀錄",
        "red",
        240,
        () => {
          gameState.clearSaveData();
          this.updateHeadersText();
          this.updatePreviewButterfly();
          this.drawColorsList();
          this.drawPatternsList();
          soundManager.playSwitch();

          const successText = this.add
            .text(0, 145, "已清除所有紀錄！", {
              fontFamily: "Fredoka",
              fontSize: "24px",
              color: "#2e7d32",
              fontStyle: "bold",
              stroke: "#ffffff",
              strokeThickness: 4,
            })
            .setOrigin(0.5);
          dialogContainer.add(successText);

          this.time.delayedCall(1000, () => {
            closeModal();
          });
        },
        "trash",
      );

      // === 最下方：返回遊戲按鈕 (與上面兩個分類獨立) ===
      const closeBtn = this.createCute3DButton(
        0,
        220,
        "返回遊戲",
        "blue",
        240,
        closeModal,
        "back",
      );

      dialogContainer.add([
        dialogBox,
        ribbon,
        titleText,
        installTitle,
        installDesc,
        installBtn,
        resetTitle,
        resetDesc,
        clearBtn,
        closeBtn,
      ]);
    } else {
      // === 僅有重置遊戲紀錄 ===
      const resetDesc = this.add
        .text(
          0,
          -60,
          "是否要清除所有獲得的顏色與花紋？\n清除後將無法恢復喔！",
          {
            fontFamily: "Fredoka",
            fontSize: "24px",
            color: "#4e342e",
            fontStyle: "bold",
            align: "center",
            lineSpacing: 10,
          },
        )
        .setOrigin(0.5);

      const clearBtn = this.createCute3DButton(
        0,
        10,
        "清除紀錄",
        "red",
        240,
        () => {
          gameState.clearSaveData();
          this.updateHeadersText();
          this.updatePreviewButterfly();
          this.drawColorsList();
          this.drawPatternsList();
          soundManager.playSwitch();

          const successText = this.add
            .text(0, 35, "已清除所有紀錄！", {
              fontFamily: "Fredoka",
              fontSize: "24px",
              color: "#2e7d32",
              fontStyle: "bold",
              stroke: "#ffffff",
              strokeThickness: 4,
            })
            .setOrigin(0.5);
          dialogContainer.add(successText);

          this.time.delayedCall(1000, () => {
            closeModal();
          });
        },
        "trash",
      );

      // === 最下方：返回遊戲按鈕 (與重置分類獨立) ===
      const closeBtn = this.createCute3DButton(
        0,
        120,
        "返回遊戲",
        "blue",
        240,
        closeModal,
        "back",
      );

      dialogContainer.add([
        dialogBox,
        ribbon,
        titleText,
        resetDesc,
        clearBtn,
        closeBtn,
      ]);
    }

    modalContainer.add([overlay, dialogContainer]);

    // 彈出動畫
    dialogContainer.setScale(0);
    this.tweens.add({
      targets: dialogContainer,
      scale: 1,
      duration: 350,
      ease: "Back.easeOut",
    });
  }

  private createCute3DButton(
    x: number,
    y: number,
    textStr: string,
    theme: "red" | "blue" | "green",
    btnW: number,
    callback: () => void,
    iconType?: "download" | "trash" | "back",
  ): Phaser.GameObjects.Container {
    const btnH = 65;
    const radius = 18;
    const depthOffset = 6; // 3D 厚度

    const btnContainer = this.add.container(x, y);

    const baseColor =
      theme === "red" ? 0xb71c1c : theme === "blue" ? 0x0288d1 : 0x1b5e20;
    const faceColor =
      theme === "red" ? 0xff5252 : theme === "blue" ? 0x40c4ff : 0x4caf50;
    const strokeColor = 0xffffff;

    // 1. 底座 (陰影厚度)
    const baseGraphic = this.add.graphics();
    baseGraphic.fillStyle(baseColor, 1);
    baseGraphic.fillRoundedRect(
      -btnW / 2,
      -btnH / 2 + depthOffset,
      btnW,
      btnH,
      radius,
    );

    // 2. 按鈕表面
    const faceContainer = this.add.container(0, 0);

    const faceGraphic = this.add.graphics();
    faceGraphic.fillStyle(faceColor, 1);
    faceGraphic.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, radius);
    faceGraphic.lineStyle(3.5, strokeColor, 1);
    faceGraphic.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, radius);

    // 有圖案時文字向右微調，避免與圖示重疊
    const textX = iconType ? 22 : 0;

    const text = this.add
      .text(textX, 0, textStr, {
        fontFamily: "Fredoka",
        fontSize: "24px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    faceContainer.add(faceGraphic);

    // 繪製各類可愛的圖示
    if (iconType) {
      const iconGraphic = this.add.graphics();
      const ix = -50;
      const iy = -2;

      if (iconType === "download") {
        // 繪製白雲底圖
        iconGraphic.fillStyle(0xffffff, 1);
        iconGraphic.lineStyle(2, 0x1b5e20, 1);

        iconGraphic.beginPath();
        iconGraphic.arc(ix - 8, iy + 4, 7, Math.PI * 0.5, Math.PI * 1.5);
        iconGraphic.arc(ix, iy - 3, 10, Math.PI * 1.0, Math.PI * 2.0);
        iconGraphic.arc(ix + 8, iy + 4, 7, Math.PI * 1.5, Math.PI * 0.5);
        iconGraphic.closePath();
        iconGraphic.fillPath();
        iconGraphic.strokePath();

        // 遮蓋底部的圓弧線條
        iconGraphic.fillRect(ix - 8, iy, 16, 11);
        iconGraphic.fillStyle(0xffffff, 1);
        iconGraphic.fillRect(ix - 7, iy - 1, 14, 11);
        iconGraphic.lineStyle(2, 0x1b5e20, 1);
        iconGraphic.beginPath();
        iconGraphic.moveTo(ix - 8, iy + 11);
        iconGraphic.lineTo(ix + 8, iy + 11);
        iconGraphic.strokePath();

        // 繪製白雲內部的綠色箭頭
        iconGraphic.fillStyle(0x4caf50, 1);
        iconGraphic.lineStyle(1.5, 0x1b5e20, 1);
        iconGraphic.fillRect(ix - 2.5, iy - 5, 5, 8);
        iconGraphic.strokeRect(ix - 2.5, iy - 5, 5, 8);
        iconGraphic.beginPath();
        iconGraphic.moveTo(ix - 6.5, iy + 2);
        iconGraphic.lineTo(ix + 6.5, iy + 2);
        iconGraphic.lineTo(ix, iy + 9);
        iconGraphic.closePath();
        iconGraphic.fillPath();
        iconGraphic.strokePath();
      } else if (iconType === "trash") {
        // 繪製垃圾桶 (紅色主題)
        iconGraphic.fillStyle(0xffffff, 1);
        iconGraphic.lineStyle(2, baseColor, 1);

        // 蓋子
        iconGraphic.fillRoundedRect(ix - 10, iy - 12, 20, 4, 2);
        iconGraphic.strokeRoundedRect(ix - 10, iy - 12, 20, 4, 2);
        // 蓋子把手
        iconGraphic.fillRoundedRect(ix - 4, iy - 16, 8, 4, 1);
        iconGraphic.strokeRoundedRect(ix - 4, iy - 16, 8, 4, 1);

        // 桶身
        iconGraphic.beginPath();
        iconGraphic.moveTo(ix - 8, iy - 8);
        iconGraphic.lineTo(ix + 8, iy - 8);
        iconGraphic.lineTo(ix + 6, iy + 12);
        iconGraphic.lineTo(ix - 6, iy + 12);
        iconGraphic.closePath();
        iconGraphic.fillPath();
        iconGraphic.strokePath();

        // 桶身垂直條紋
        iconGraphic.beginPath();
        iconGraphic.moveTo(ix - 3, iy - 4);
        iconGraphic.lineTo(ix - 2, iy + 8);
        iconGraphic.moveTo(ix, iy - 4);
        iconGraphic.lineTo(ix, iy + 8);
        iconGraphic.moveTo(ix + 3, iy - 4);
        iconGraphic.lineTo(ix + 2, iy + 8);
        iconGraphic.strokePath();
      } else if (iconType === "back") {
        // 繪製可愛的返回箭頭 (藍色主題)
        iconGraphic.fillStyle(0xffffff, 1);
        iconGraphic.lineStyle(2, baseColor, 1);

        // 箭頭後端矩形
        iconGraphic.fillRect(ix - 2, iy - 4, 12, 8);
        iconGraphic.strokeRect(ix - 2, iy - 4, 12, 8);

        // 箭頭前端三角形
        iconGraphic.beginPath();
        iconGraphic.moveTo(ix - 12, iy);
        iconGraphic.lineTo(ix - 2, iy - 10);
        iconGraphic.lineTo(ix - 2, iy + 10);
        iconGraphic.closePath();
        iconGraphic.fillPath();
        iconGraphic.strokePath();

        // 遮蓋接縫
        iconGraphic.fillStyle(0xffffff, 1);
        iconGraphic.fillRect(ix - 2, iy - 3, 2, 6);
      }

      faceContainer.add(iconGraphic);

      // 綁定資料供 hover 動效存取
      btnContainer.setData("icon", iconGraphic);
      btnContainer.setData("iconType", iconType);
    }

    faceContainer.add(text);

    // 3. 熱區 hitbox
    const hitbox = this.add
      .rectangle(0, depthOffset / 2, btnW, btnH + depthOffset, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    btnContainer.add([baseGraphic, faceContainer, hitbox]);

    // 下壓與圖示躍動特效
    hitbox.on("pointerover", () => {
      this.tweens.add({
        targets: faceContainer,
        y: 2,
        duration: 80,
        ease: "Power1.easeOut",
      });
      const icon = btnContainer.getData("icon") as Phaser.GameObjects.Graphics;
      const type = btnContainer.getData("iconType") as string;
      if (icon) {
        if (type === "download") {
          this.tweens.add({
            targets: icon,
            y: 3,
            duration: 200,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
          });
        } else if (type === "trash") {
          // 垃圾桶左右搖晃動效
          this.tweens.add({
            targets: icon,
            angle: { from: -8, to: 8 },
            duration: 100,
            yoyo: true,
            repeat: -1,
            ease: "Linear",
          });
        } else if (type === "back") {
          // 返回箭頭左右跳動動效
          this.tweens.add({
            targets: icon,
            x: icon.x - 4,
            duration: 150,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
          });
        }
      }
    });

    hitbox.on("pointerout", () => {
      this.tweens.add({
        targets: faceContainer,
        y: 0,
        duration: 80,
        ease: "Power1.easeOut",
      });
      const icon = btnContainer.getData("icon") as Phaser.GameObjects.Graphics;
      if (icon) {
        this.tweens.killTweensOf(icon);
        icon.y = 0;
        icon.x = 0;
        icon.angle = 0;
      }
    });

    hitbox.on("pointerdown", () => {
      this.tweens.add({
        targets: faceContainer,
        y: depthOffset,
        duration: 50,
        ease: "Power1.easeOut",
      });
    });

    hitbox.on("pointerup", () => {
      this.tweens.add({
        targets: faceContainer,
        y: 0,
        duration: 100,
        ease: "Back.easeOut",
        onComplete: () => {
          callback();
        },
      });
    });

    return btnContainer;
  }

  private updateHeadersText() {
    if (this.colorsHeader && this.patternsHeader) {
      const collectedColors = gameState.getData().collectedColors.length;
      this.colorsHeader.setText(`🎨 點擊更換翅膀顏色 (${collectedColors})：`);

      const collectedPatterns = gameState.getData().collectedPatterns.length;
      this.patternsHeader.setText(
        `✨ 點擊更換花紋樣式 (${collectedPatterns})：`,
      );
    }
  }
}
