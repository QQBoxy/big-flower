import Phaser from 'phaser';

export interface MathProblem {
  num1: number;
  num2: number;
  operator: '+' | '-';
  correctAnswer: number;
  options: number[];
}

export const GAME_COLORS = [
  0xffb6c1, 0xffc0cb, 0xff69b4, 0xff1493, // 粉紅系列
  0xadd8e6, 0x87ceeb, 0x00bfff, 0x00f5ff, // 藍系列
  0x90ee90, 0x98fb98, 0x3cb371, 0x00ff7f, // 綠系列
  0xffffe0, 0xffd700, 0xffa500, 0xff7f50, // 黃橘系列
  0xdda0dd, 0xda70d6, 0xba55d3, 0x9370db, // 紫系列
  0xffa07a, 0xff8c00, 0xe91e63, 0xff4081, // 玫瑰與亮色系列
  0xe0f7fa, 0xb2ebf2, 0xe8f5e9, 0xc8e6c9, // 馬卡龍與青綠
  0xffe0b2, 0xffcc80, 0xd1c4e9, 0xf8bbd0, // 暖橘與淺粉
  0x1a1a1a, 0x795548                      // 酷炫黑與經典咖啡色
];

export const GAME_PATTERNS = [
  'none', 'dots', 'stripes', 'heart', 'star', 'triangle', 'diamond', 'semi',
  'cross', 'xmark', 'moon', 'ring', 'square', 'hexagon', 'spiral', 'wave',
  'zigzag', 'droplet', 'leaf', 'clover', 'flower', 'crown', 'cloud', 'lightning',
  'paw', 'fish', 'apple', 'butterfly_mini', 'shield', 'club', 'spade', 'tracks'
];

// 基礎幾何圖形繪製
export function drawHeart(g: Phaser.GameObjects.Graphics, cx: number, cy: number, r: number) {
  g.fillStyle(0xffffff, 0.9);
  g.fillCircle(cx - r/2, cy - r/2, r/2);
  g.fillCircle(cx + r/2, cy - r/2, r/2);
  g.beginPath();
  g.moveTo(cx - r, cy - r/2);
  g.lineTo(cx + r, cy - r/2);
  g.lineTo(cx, cy + r);
  g.closePath();
  g.fillPath();
}

export function drawStar(g: Phaser.GameObjects.Graphics, cx: number, cy: number, rOuter: number, rInner: number) {
  g.fillStyle(0xffffff, 0.9);
  g.beginPath();
  let rot = Math.PI / 2 * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / 5;

  g.moveTo(cx, cy - rOuter);
  for (let i = 0; i < 5; i++) {
    x = cx + Math.cos(rot) * rOuter;
    y = cy + Math.sin(rot) * rOuter;
    g.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * rInner;
    y = cy + Math.sin(rot) * rInner;
    g.lineTo(x, y);
    rot += step;
  }
  g.closePath();
  g.fillPath();
}

export function drawTriangle(g: Phaser.GameObjects.Graphics, cx: number, cy: number, r: number) {
  g.fillStyle(0xffffff, 0.9);
  g.beginPath();
  g.moveTo(cx, cy - r);
  g.lineTo(cx - r * 0.866, cy + r * 0.5);
  g.lineTo(cx + r * 0.866, cy + r * 0.5);
  g.closePath();
  g.fillPath();
}

export function drawDiamond(g: Phaser.GameObjects.Graphics, cx: number, cy: number, rx: number, ry: number) {
  g.fillStyle(0xffffff, 0.9);
  g.beginPath();
  g.moveTo(cx, cy - ry);
  g.lineTo(cx + rx, cy);
  g.lineTo(cx, cy + ry);
  g.lineTo(cx - rx, cy);
  g.closePath();
  g.fillPath();
}

export function drawSemi(g: Phaser.GameObjects.Graphics, cx: number, cy: number, r: number) {
  g.fillStyle(0xffffff, 0.9);
  g.beginPath();
  g.arc(cx, cy + r/3, r, Math.PI, 0, false);
  g.closePath();
  g.fillPath();
}

// 繪製翅膀上的花紋
export function drawWingPattern(
  g: Phaser.GameObjects.Graphics,
  pattern: string,
  isLeft: boolean,
  currentColor: number,
  scale: number = 1
) {
  const flip = isLeft ? 1 : -1;
  
  // 三點排版位置 helper
  const drawThreePoints = (drawFn: (x: number, y: number, r: number) => void, baseR: number) => {
    drawFn(-25 * flip * scale, -15 * scale, baseR * scale);
    drawFn(-15 * flip * scale, -5 * scale, baseR * 0.75 * scale);
    drawFn(-18 * flip * scale, 15 * scale, baseR * 0.75 * scale);
  };

  // 置中型位置
  const cx = -22 * flip * scale;
  const cy = -15 * scale;
  const mainR = 12 * scale;

  g.fillStyle(0xffffff, 0.9);
  g.lineStyle(2 * scale, 0xffffff, 0.9);

  if (pattern === 'dots') {
    drawThreePoints((x, y, r) => g.fillCircle(x, y, r), 6);
  } else if (pattern === 'stripes') {
    g.lineStyle(3 * scale, 0xffffff, 0.9);
    g.beginPath();
    g.moveTo(-35 * flip * scale, -20 * scale);
    g.lineTo(-10 * flip * scale, -10 * scale);
    g.moveTo(-30 * flip * scale, 0 * scale);
    g.lineTo(-8 * flip * scale, 5 * scale);
    g.strokePath();
  } else if (pattern === 'heart') {
    drawThreePoints((x, y, r) => drawHeart(g, x, y, r), 6.5);
  } else if (pattern === 'star') {
    drawThreePoints((x, y, r) => drawStar(g, x, y, r, r * 0.4), 7);
  } else if (pattern === 'triangle') {
    drawThreePoints((x, y, r) => drawTriangle(g, x, y, r), 7);
  } else if (pattern === 'diamond') {
    drawThreePoints((x, y, r) => drawDiamond(g, x, y, r * 0.7, r), 7);
  } else if (pattern === 'semi') {
    drawThreePoints((x, y, r) => drawSemi(g, x, y, r), 7);
  } else if (pattern === 'cross') {
    drawThreePoints((x, y, r) => {
      g.fillRect(x - r, y - r/3, r*2, r*0.66);
      g.fillRect(x - r/3, y - r, r*0.66, r*2);
    }, 6);
  } else if (pattern === 'xmark') {
    drawThreePoints((x, y, r) => {
      g.beginPath();
      g.moveTo(x - r*0.7, y - r*0.7); g.lineTo(x + r*0.7, y + r*0.7);
      g.moveTo(x + r*0.7, y - r*0.7); g.lineTo(x - r*0.7, y + r*0.7);
      g.strokePath();
    }, 7);
  } else if (pattern === 'moon') {
    g.fillCircle(cx, cy, mainR);
    g.fillStyle(currentColor, 1);
    g.fillCircle(cx + mainR * 0.4 * flip, cy, mainR * 0.95);
  } else if (pattern === 'ring') {
    drawThreePoints((x, y, r) => g.strokeCircle(x, y, r), 6);
  } else if (pattern === 'square') {
    drawThreePoints((x, y, r) => g.fillRect(x - r, y - r, r*2, r*2), 5.5);
  } else if (pattern === 'hexagon') {
    g.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const px = cx + Math.cos(angle) * mainR;
      const py = cy + Math.sin(angle) * mainR;
      if (i === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.closePath();
    g.fillPath();
  } else if (pattern === 'spiral') {
    g.lineStyle(2 * scale, 0xffffff, 0.9);
    g.strokeCircle(cx, cy, mainR * 0.9);
    g.strokeCircle(cx, cy, mainR * 0.6);
    g.strokeCircle(cx, cy, mainR * 0.3);
  } else if (pattern === 'wave') {
    g.lineStyle(2.5 * scale, 0xffffff, 0.9);
    g.beginPath();
    for (let xOffset = -18; xOffset <= 18; xOffset += 2) {
      const px = cx + xOffset * flip;
      const py = cy + Math.sin(xOffset * 0.3) * 6 * scale;
      if (xOffset === -18) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.strokePath();
  } else if (pattern === 'zigzag') {
    g.lineStyle(2.5 * scale, 0xffffff, 0.9);
    g.beginPath();
    g.moveTo(cx - 16 * flip * scale, cy - 8 * scale);
    g.lineTo(cx - 8 * flip * scale, cy + 8 * scale);
    g.lineTo(cx, cy - 8 * scale);
    g.lineTo(cx + 8 * flip * scale, cy + 8 * scale);
    g.lineTo(cx + 16 * flip * scale, cy - 8 * scale);
    g.strokePath();
  } else if (pattern === 'droplet') {
    drawThreePoints((x, y, r) => {
      g.fillCircle(x, y + r*0.3, r * 0.7);
      g.beginPath();
      g.moveTo(x - r*0.7, y + r*0.3);
      g.lineTo(x, y - r);
      g.lineTo(x + r*0.7, y + r*0.3);
      g.closePath();
      g.fillPath();
    }, 6);
  } else if (pattern === 'leaf') {
    drawThreePoints((x, y, r) => {
      g.fillEllipse(x, y, r * 0.7, r * 1.3);
      g.beginPath();
      g.moveTo(x, y + r * 1.3);
      g.lineTo(x - 2 * flip * scale, y + r * 1.8);
      g.strokePath();
    }, 5);
  } else if (pattern === 'clover') {
    const r = mainR * 0.45;
    g.fillCircle(cx - r*0.8 * flip, cy + r*0.2, r);
    g.fillCircle(cx + r*0.8 * flip, cy + r*0.2, r);
    g.fillCircle(cx, cy - r*0.8, r);
    g.lineStyle(2 * scale, 0xffffff, 0.9);
    g.beginPath();
    g.moveTo(cx, cy);
    g.lineTo(cx - 6 * flip, cy + r * 2.2);
    g.strokePath();
  } else if (pattern === 'flower') {
    const r = mainR * 0.35;
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      g.fillCircle(cx + Math.cos(angle) * r * 1.3, cy + Math.sin(angle) * r * 1.3, r);
    }
    g.fillStyle(0xffeb3b, 1);
    g.fillCircle(cx, cy, r * 0.9);
  } else if (pattern === 'crown') {
    g.beginPath();
    g.moveTo(cx - mainR, cy + mainR * 0.6);
    g.lineTo(cx + mainR, cy + mainR * 0.6);
    g.lineTo(cx + mainR * 0.8, cy - mainR * 0.6);
    g.lineTo(cx + mainR * 0.4, cy);
    g.lineTo(cx, cy - mainR * 0.8);
    g.lineTo(cx - mainR * 0.4, cy);
    g.lineTo(cx - mainR * 0.8, cy - mainR * 0.6);
    g.closePath();
    g.fillPath();
    g.fillCircle(cx - mainR * 0.8, cy - mainR * 0.6, 2 * scale);
    g.fillCircle(cx, cy - mainR * 0.8, 2 * scale);
    g.fillCircle(cx + mainR * 0.8, cy - mainR * 0.6, 2 * scale);
  } else if (pattern === 'cloud') {
    g.fillCircle(cx - mainR * 0.4 * flip, cy + mainR * 0.2, mainR * 0.5);
    g.fillCircle(cx + mainR * 0.4 * flip, cy + mainR * 0.2, mainR * 0.5);
    g.fillCircle(cx, cy - mainR * 0.2, mainR * 0.6);
    g.fillRect(cx - mainR * 0.5, cy + mainR * 0.2, mainR, mainR * 0.4);
  } else if (pattern === 'lightning') {
    g.beginPath();
    g.moveTo(cx - mainR * 0.2 * flip, cy - mainR);
    g.lineTo(cx + mainR * 0.6 * flip, cy - mainR * 0.1);
    g.lineTo(cx + mainR * 0.1 * flip, cy - mainR * 0.1);
    g.lineTo(cx + mainR * 0.5 * flip, cy + mainR * 1.1);
    g.lineTo(cx - mainR * 0.5 * flip, cy + mainR * 0.1);
    g.lineTo(cx - mainR * 0.1 * flip, cy + mainR * 0.1);
    g.closePath();
    g.fillPath();
  } else if (pattern === 'paw') {
    g.fillEllipse(cx, cy + mainR * 0.3, mainR * 0.8, mainR * 0.6);
    g.fillCircle(cx - mainR * 0.6 * flip, cy - mainR * 0.1, mainR * 0.25);
    g.fillCircle(cx - mainR * 0.2 * flip, cy - mainR * 0.5, mainR * 0.28);
    g.fillCircle(cx + mainR * 0.2 * flip, cy - mainR * 0.5, mainR * 0.28);
    g.fillCircle(cx + mainR * 0.6 * flip, cy - mainR * 0.1, mainR * 0.25);
  } else if (pattern === 'fish') {
    g.fillEllipse(cx - 3 * flip * scale, cy, mainR * 0.9, mainR * 0.6);
    g.beginPath();
    g.moveTo(cx + mainR * 0.6 * flip, cy);
    g.lineTo(cx + mainR * 1.2 * flip, cy - mainR * 0.5);
    g.lineTo(cx + mainR * 1.2 * flip, cy + mainR * 0.5);
    g.closePath();
    g.fillPath();
  } else if (pattern === 'apple') {
    g.fillCircle(cx - mainR * 0.3 * flip, cy, mainR * 0.7);
    g.fillCircle(cx + mainR * 0.3 * flip, cy, mainR * 0.7);
    g.lineStyle(2 * scale, 0xffffff, 0.9);
    g.beginPath();
    g.moveTo(cx, cy - mainR * 0.4);
    g.lineTo(cx + 5 * flip, cy - mainR * 1.1);
    g.strokePath();
  } else if (pattern === 'butterfly_mini') {
    g.fillEllipse(cx - mainR * 0.5 * flip, cy - mainR * 0.3, mainR * 0.5, mainR * 0.6);
    g.fillEllipse(cx - mainR * 0.4 * flip, cy + mainR * 0.4, mainR * 0.35, mainR * 0.45);
    g.fillEllipse(cx + mainR * 0.5 * flip, cy - mainR * 0.3, mainR * 0.5, mainR * 0.6);
    g.fillEllipse(cx + mainR * 0.4 * flip, cy + mainR * 0.4, mainR * 0.35, mainR * 0.45);
    g.fillStyle(0x3e2723, 1);
    g.fillRoundedRect(cx - 2 * scale, cy - mainR * 0.6, 4 * scale, mainR * 1.2, 2 * scale);
  } else if (pattern === 'shield') {
    g.beginPath();
    g.moveTo(cx - mainR * 0.8, cy - mainR * 0.8);
    g.lineTo(cx + mainR * 0.8, cy - mainR * 0.8);
    g.lineTo(cx + mainR * 0.8, cy + mainR * 0.2);
    g.lineTo(cx, cy + mainR);
    g.lineTo(cx - mainR * 0.8, cy + mainR * 0.2);
    g.closePath();
    g.fillPath();
  } else if (pattern === 'club') {
    drawThreePoints((x, y, r) => {
      g.fillCircle(x - r*0.4, y + r*0.1, r * 0.65);
      g.fillCircle(x + r*0.4, y + r*0.1, r * 0.65);
      g.fillCircle(x, y - r*0.4, r * 0.65);
    }, 6);
  } else if (pattern === 'spade') {
    drawThreePoints((x, y, r) => {
      g.fillCircle(x - r*0.4, y + r*0.2, r*0.55);
      g.fillCircle(x + r*0.4, y + r*0.2, r*0.55);
      g.beginPath();
      g.moveTo(x - r*0.8, y + r*0.2);
      g.lineTo(x + r*0.8, y + r*0.2);
      g.lineTo(x, y - r*0.8);
      g.closePath();
      g.fillPath();
      g.fillRect(x - r*0.2, y + r*0.2, r*0.4, r*0.6);
    }, 6);
  } else if (pattern === 'tracks') {
    g.lineStyle(2 * scale, 0xffffff, 0.9);
    g.beginPath();
    for (let yOffset = -22; yOffset <= 22; yOffset += 6) {
      g.moveTo(cx - 8 * flip, cy + yOffset);
      g.lineTo(cx - 8 * flip, cy + yOffset + 3);
      g.moveTo(cx + 8 * flip, cy + yOffset);
      g.lineTo(cx + 8 * flip, cy + yOffset + 3);
    }
    g.strokePath();
  }
}

// 繪製卡片預覽中的花紋
export function drawCardPattern(
  g: Phaser.GameObjects.Graphics,
  pattern: string,
  currentColor: number,
  scale: number = 1
) {
  g.fillStyle(0xffffff, 0.9);
  g.lineStyle(2 * scale, 0xffffff, 0.9);

  const cx = 0;
  const cy = 0;
  const mainR = 15 * scale;

  const drawThreePoints = (drawFn: (x: number, y: number, r: number) => void, baseR: number) => {
    drawFn(-10 * scale, -8 * scale, baseR * scale);
    drawFn(10 * scale, -8 * scale, baseR * scale);
    drawFn(0 * scale, 10 * scale, baseR * scale);
  };

  if (pattern === 'dots') {
    drawThreePoints((x, y, r) => g.fillCircle(x, y, r), 5);
  } else if (pattern === 'stripes') {
    g.lineStyle(3 * scale, 0xffffff, 0.9);
    g.beginPath();
    g.moveTo(-18 * scale, -12 * scale);
    g.lineTo(18 * scale, 12 * scale);
    g.moveTo(-18 * scale, 0 * scale);
    g.lineTo(6 * scale, 16 * scale);
    g.strokePath();
  } else if (pattern === 'heart') {
    drawThreePoints((x, y, r) => drawHeart(g, x, y, r), 5.5);
  } else if (pattern === 'star') {
    drawThreePoints((x, y, r) => drawStar(g, x, y, r, r * 0.4), 6);
  } else if (pattern === 'triangle') {
    drawThreePoints((x, y, r) => drawTriangle(g, x, y, r), 6);
  } else if (pattern === 'diamond') {
    drawThreePoints((x, y, r) => drawDiamond(g, x, y, r * 0.7, r), 6);
  } else if (pattern === 'semi') {
    drawThreePoints((x, y, r) => drawSemi(g, x, y, r), 6);
  } else if (pattern === 'cross') {
    drawThreePoints((x, y, r) => {
      g.fillRect(x - r, y - r/3, r*2, r*0.66);
      g.fillRect(x - r/3, y - r, r*0.66, r*2);
    }, 5);
  } else if (pattern === 'xmark') {
    drawThreePoints((x, y, r) => {
      g.beginPath();
      g.moveTo(x - r*0.7, y - r*0.7); g.lineTo(x + r*0.7, y + r*0.7);
      g.moveTo(x + r*0.7, y - r*0.7); g.lineTo(x - r*0.7, y + r*0.7);
      g.strokePath();
    }, 6);
  } else if (pattern === 'moon') {
    g.fillCircle(cx, cy, mainR);
    g.fillStyle(currentColor, 1);
    g.fillCircle(cx + mainR * 0.4, cy, mainR * 0.95);
  } else if (pattern === 'ring') {
    drawThreePoints((x, y, r) => g.strokeCircle(x, y, r), 5);
  } else if (pattern === 'square') {
    drawThreePoints((x, y, r) => g.fillRect(x - r, y - r, r*2, r*2), 5);
  } else if (pattern === 'hexagon') {
    g.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      g.lineTo(cx + Math.cos(angle) * mainR, cy + Math.sin(angle) * mainR);
    }
    g.closePath();
    g.fillPath();
  } else if (pattern === 'spiral') {
    g.lineStyle(2 * scale, 0xffffff, 0.9);
    g.strokeCircle(cx, cy, mainR * 0.9);
    g.strokeCircle(cx, cy, mainR * 0.6);
    g.strokeCircle(cx, cy, mainR * 0.3);
  } else if (pattern === 'wave') {
    g.lineStyle(2.5 * scale, 0xffffff, 0.9);
    g.beginPath();
    for (let xOffset = -18; xOffset <= 18; xOffset += 2) {
      g.lineTo(cx + xOffset * scale, cy + Math.sin(xOffset * 0.3) * 6 * scale);
    }
    g.strokePath();
  } else if (pattern === 'zigzag') {
    g.lineStyle(2.5 * scale, 0xffffff, 0.9);
    g.beginPath();
    g.moveTo(-16 * scale, -8 * scale);
    g.lineTo(-8 * scale, 8 * scale);
    g.lineTo(0, -8 * scale);
    g.lineTo(8 * scale, 8 * scale);
    g.lineTo(16 * scale, -8 * scale);
    g.strokePath();
  } else if (pattern === 'droplet') {
    drawThreePoints((x, y, r) => {
      g.fillCircle(x, y + r*0.3, r * 0.7);
      g.beginPath();
      g.moveTo(x - r*0.7, y + r*0.3);
      g.lineTo(x, y - r);
      g.lineTo(x + r*0.7, y + r*0.3);
      g.closePath();
      g.fillPath();
    }, 5);
  } else if (pattern === 'leaf') {
    drawThreePoints((x, y, r) => {
      g.fillEllipse(x, y, r * 0.7, r * 1.3);
      g.beginPath();
      g.moveTo(x, y + r * 1.3);
      g.lineTo(x - 2 * scale, y + r * 1.8);
      g.strokePath();
    }, 4);
  } else if (pattern === 'clover') {
    const r = mainR * 0.45;
    g.fillCircle(cx - r*0.8, cy + r*0.2, r);
    g.fillCircle(cx + r*0.8, cy + r*0.2, r);
    g.fillCircle(cx, cy - r*0.8, r);
    g.lineStyle(2 * scale, 0xffffff, 0.9);
    g.beginPath();
    g.moveTo(cx, cy);
    g.lineTo(cx - 6 * scale, cy + r * 2.2);
    g.strokePath();
  } else if (pattern === 'flower') {
    const r = mainR * 0.35;
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      g.fillCircle(cx + Math.cos(angle) * r * 1.3, cy + Math.sin(angle) * r * 1.3, r);
    }
    g.fillStyle(0xffeb3b, 1);
    g.fillCircle(cx, cy, r * 0.9);
  } else if (pattern === 'crown') {
    g.beginPath();
    g.moveTo(cx - mainR, cy + mainR * 0.6);
    g.lineTo(cx + mainR, cy + mainR * 0.6);
    g.lineTo(cx + mainR * 0.8, cy - mainR * 0.6);
    g.lineTo(cx + mainR * 0.4, cy);
    g.lineTo(cx, cy - mainR * 0.8);
    g.lineTo(cx - mainR * 0.4, cy);
    g.lineTo(cx - mainR * 0.8, cy - mainR * 0.6);
    g.closePath();
    g.fillPath();
    g.fillCircle(cx - mainR * 0.8, cy - mainR * 0.6, 2 * scale);
    g.fillCircle(cx, cy - mainR * 0.8, 2 * scale);
    g.fillCircle(cx + mainR * 0.8, cy - mainR * 0.6, 2 * scale);
  } else if (pattern === 'cloud') {
    g.fillCircle(cx - mainR * 0.4, cy + mainR * 0.2, mainR * 0.5);
    g.fillCircle(cx + mainR * 0.4, cy + mainR * 0.2, mainR * 0.5);
    g.fillCircle(cx, cy - mainR * 0.2, mainR * 0.6);
    g.fillRect(cx - mainR * 0.5, cy + mainR * 0.2, mainR, mainR * 0.4);
  } else if (pattern === 'lightning') {
    g.beginPath();
    g.moveTo(cx - mainR * 0.2, cy - mainR);
    g.lineTo(cx + mainR * 0.6, cy - mainR * 0.1);
    g.lineTo(cx + mainR * 0.1, cy - mainR * 0.1);
    g.lineTo(cx + mainR * 0.5, cy + mainR * 1.1);
    g.lineTo(cx - mainR * 0.5, cy + mainR * 0.1);
    g.lineTo(cx - mainR * 0.1, cy + mainR * 0.1);
    g.closePath();
    g.fillPath();
  } else if (pattern === 'paw') {
    g.fillEllipse(cx, cy + mainR * 0.3, mainR * 0.8, mainR * 0.6);
    g.fillCircle(cx - mainR * 0.6, cy - mainR * 0.1, mainR * 0.25);
    g.fillCircle(cx - mainR * 0.2, cy - mainR * 0.5, mainR * 0.28);
    g.fillCircle(cx + mainR * 0.2, cy - mainR * 0.5, mainR * 0.28);
    g.fillCircle(cx + mainR * 0.6, cy - mainR * 0.1, mainR * 0.25);
  } else if (pattern === 'fish') {
    g.fillEllipse(cx - 3 * scale, cy, mainR * 0.9, mainR * 0.6);
    g.beginPath();
    g.moveTo(cx + mainR * 0.6, cy);
    g.lineTo(cx + mainR * 1.2, cy - mainR * 0.5);
    g.lineTo(cx + mainR * 1.2, cy + mainR * 0.5);
    g.closePath();
    g.fillPath();
  } else if (pattern === 'apple') {
    g.fillCircle(cx - mainR * 0.3, cy, mainR * 0.7);
    g.fillCircle(cx + mainR * 0.3, cy, mainR * 0.7);
    g.lineStyle(2 * scale, 0xffffff, 0.9);
    g.beginPath();
    g.moveTo(cx, cy - mainR * 0.4);
    g.lineTo(cx + 5 * scale, cy - mainR * 1.1);
    g.strokePath();
  } else if (pattern === 'butterfly_mini') {
    g.fillEllipse(cx - mainR * 0.5, cy - mainR * 0.3, mainR * 0.5, mainR * 0.6);
    g.fillEllipse(cx - mainR * 0.4, cy + mainR * 0.4, mainR * 0.35, mainR * 0.45);
    g.fillEllipse(cx + mainR * 0.5, cy - mainR * 0.3, mainR * 0.5, mainR * 0.6);
    g.fillEllipse(cx + mainR * 0.4, cy + mainR * 0.4, mainR * 0.35, mainR * 0.45);
    g.fillStyle(0x3e2723, 1);
    g.fillRoundedRect(cx - 2 * scale, cy - mainR * 0.6, 4 * scale, mainR * 1.2, 2 * scale);
  } else if (pattern === 'shield') {
    g.beginPath();
    g.moveTo(cx - mainR * 0.8, cy - mainR * 0.8);
    g.lineTo(cx + mainR * 0.8, cy - mainR * 0.8);
    g.lineTo(cx + mainR * 0.8, cy + mainR * 0.2);
    g.lineTo(cx, cy + mainR);
    g.lineTo(cx - mainR * 0.8, cy + mainR * 0.2);
    g.closePath();
    g.fillPath();
  } else if (pattern === 'club') {
    drawThreePoints((x, y, r) => {
      g.fillCircle(x - r*0.4, y + r*0.1, r * 0.65);
      g.fillCircle(x + r*0.4, y + r*0.1, r * 0.65);
      g.fillCircle(x, y - r*0.4, r * 0.65);
    }, 5);
  } else if (pattern === 'spade') {
    drawThreePoints((x, y, r) => {
      g.fillCircle(x - r*0.4, y + r*0.2, r*0.55);
      g.fillCircle(x + r*0.4, y + r*0.2, r*0.55);
      g.beginPath();
      g.moveTo(x - r*0.8, y + r*0.2);
      g.lineTo(x + r*0.8, y + r*0.2);
      g.lineTo(x, y - r*0.8);
      g.closePath();
      g.fillPath();
      g.fillRect(x - r*0.2, y + r*0.2, r*0.4, r*0.6);
    }, 5);
  } else if (pattern === 'tracks') {
    g.lineStyle(2 * scale, 0xffffff, 0.9);
    g.beginPath();
    for (let yOffset = -18; yOffset <= 18; yOffset += 6) {
      g.moveTo(cx - 6 * scale, cy + yOffset);
      g.lineTo(cx - 6 * scale, cy + yOffset + 3);
      g.moveTo(cx + 6 * scale, cy + yOffset);
      g.lineTo(cx + 6 * scale, cy + yOffset + 3);
    }
    g.strokePath();
  }
}

// 產生隨機加減法問題
export function generateMathProblem(mode: 'addition' | 'subtraction' | 'additionTen' | 'subtractionTen'): MathProblem {
  let num1: number;
  let num2: number;
  let operator: '+' | '-';
  let correctAnswer: number;

  const isTenDigit = mode === 'additionTen' || mode === 'subtractionTen';

  if (mode === 'addition') {
    operator = '+';
    const sum = Math.floor(Math.random() * 9) + 2; // 2 to 10
    num1 = Math.floor(Math.random() * (sum - 1)) + 1; // 1 to sum - 1
    num2 = sum - num1;
    correctAnswer = sum;
  } else if (mode === 'subtraction') {
    operator = '-';
    num1 = Math.floor(Math.random() * 9) + 2; // 2 to 10
    num2 = Math.floor(Math.random() * num1) + 1; // 1 to num1
    correctAnswer = num1 - num2;
  } else if (mode === 'additionTen') {
    operator = '+';
    // num1 in [10, 89], num2 in [10, 99 - num1], so sum in [20, 99]
    num1 = Math.floor(Math.random() * 80) + 10;
    const maxNum2 = 99 - num1;
    num2 = Math.floor(Math.random() * (maxNum2 - 10 + 1)) + 10;
    correctAnswer = num1 + num2;
  } else { // subtractionTen
    operator = '-';
    // num1 in [20, 99], num2 in [10, num1 - 10], so answer in [10, 89]
    num1 = Math.floor(Math.random() * 80) + 20;
    const maxNum2 = num1 - 10;
    num2 = Math.floor(Math.random() * (maxNum2 - 10 + 1)) + 10;
    correctAnswer = num1 - num2;
  }
  
  const options = new Set<number>();
  options.add(correctAnswer);
  
  while (options.size < 3) {
    let wrongAnswer: number;
    if (isTenDigit) {
      // 兩位數干擾項：在 [correctAnswer - 15, correctAnswer + 15] 之間，且在 [10, 99] 內
      const delta = Math.floor(Math.random() * 31) - 15; // -15 to 15
      wrongAnswer = correctAnswer + delta;
      if (wrongAnswer < 10) wrongAnswer = 10 + Math.floor(Math.random() * 10);
      if (wrongAnswer > 99) wrongAnswer = 90 + Math.floor(Math.random() * 10);
    } else {
      wrongAnswer = Math.floor(Math.random() * 11);
    }
    
    if (wrongAnswer !== correctAnswer) {
      options.add(wrongAnswer);
    }
  }
  
  const shuffledOptions = Array.from(options);
  for (let i = shuffledOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
  }
  
  return {
    num1,
    num2,
    operator,
    correctAnswer,
    options: shuffledOptions
  };
}

class SoundManager {
  private ctx: AudioContext | null = null;
  private isBgmPlaying = false;
  private bgmIntervalId: any = null;
  private bgmIndex = 0;

  // BPM = 120 (every 250ms triggers a step)
  private bgmNotes: number[] = [
    659.25, 783.99, 1046.50, 783.99, // E5, G5, C6, G5
    880.00, 1046.50, 783.99, 0,      // A5, C6, G5, rest
    698.46, 880.00, 1046.50, 880.00, // F5, A5, C6, A5
    783.99, 659.25, 587.33, 0,       // G5, E5, D5, rest
    659.25, 783.99, 1046.50, 783.99, // E5, G5, C6, G5
    880.00, 1046.50, 1174.66, 1318.51,// A5, C6, D6, E6
    1046.50, 880.00, 783.99, 659.25, // C6, A5, G5, E5
    587.33, 783.99, 523.25, 0        // D5, G5, C5, rest
  ];

  private bgmBass: number[] = [
    261.63, 0, 196.00, 0, // C4, G3
    261.63, 0, 196.00, 0, // C4, G3
    174.61, 0, 261.63, 0, // F3, C4
    196.00, 0, 293.66, 0, // G3, D4
    261.63, 0, 196.00, 0, // C4, G3
    220.00, 0, 329.63, 0, // A3, E4
    174.61, 0, 196.00, 0, // F3, G3
    261.63, 0, 130.81, 0  // C4, C3
  ];

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.isBgmPlaying) {
      this.startBGM();
    }
  }

  public startBGM() {
    if (this.isBgmPlaying) return;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    this.isBgmPlaying = true;
    this.bgmIndex = 0;
    
    this.bgmIntervalId = setInterval(() => {
      this.playBgmStep();
    }, 250);
  }

  public stopBGM() {
    if (this.bgmIntervalId) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
    this.isBgmPlaying = false;
  }

  private playBgmStep() {
    try {
      if (!this.ctx || this.ctx.state === 'suspended') return;

      const time = this.ctx.currentTime;
      const noteFreq = this.bgmNotes[this.bgmIndex];
      const bassFreq = this.bgmBass[this.bgmIndex];

      // 1. Main Melody (triangle wave for soft glockenspiel-like tone)
      if (noteFreq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(noteFreq, time);
        
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.02, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.20);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.20);
      }

      // 2. Bass Accompaniment (sine wave for warm underlying pad-like bass)
      if (bassFreq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(bassFreq, time);
        
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.024, time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.22);
      }

      this.bgmIndex = (this.bgmIndex + 1) % 32;
    } catch (e) {
      console.warn("BGM play step error:", e);
    }
  }

  public playTone(freq: number, duration: number, type: OscillatorType = 'sine', delay: number = 0) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);
      
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + delay);
      osc.stop(this.ctx.currentTime + delay + duration);
    } catch (e) {
      console.warn("AudioContext play error:", e);
    }
  }

  public playCorrect() {
    this.playTone(523.25, 0.1, 'sine', 0);     // C5
    this.playTone(659.25, 0.1, 'sine', 0.08);  // E5
    this.playTone(783.99, 0.1, 'sine', 0.16);  // G5
    this.playTone(1046.50, 0.2, 'sine', 0.24); // C6
  }

  public playWrong() {
    this.playTone(220.00, 0.15, 'triangle', 0);     // A3
    this.playTone(174.61, 0.15, 'triangle', 0.12);  // F3
    this.playTone(130.81, 0.25, 'triangle', 0.24);  // C3
  }

  public playClick() {
    this.playTone(600, 0.06, 'sine');
  }

  public playSwitch() {
    this.playTone(440, 0.04, 'sine');
    this.playTone(660, 0.06, 'sine', 0.03);
  }
}

export const soundManager = new SoundManager();
