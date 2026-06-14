# 2D 兒童數學加法遊戲 - 開發指南與核心設計

本文件為專案的單一事實來源（Single Source of Truth），所有開發與 AI Agent 協作皆須嚴格遵循本文件之規範。

---

## 1. 遊戲核心定位與目標
* **遊戲名稱**：Big Flower (大花朵)
* **核心技術**：Vite + Phaser 3 + TypeScript
* **目標受眾**：6 歲兒童
* **設計主軸**：簡單有趣的 10 以內加法數學遊戲，搭配可愛的蝴蝶外觀收集與換裝系統。
* **介面規範**：完全不使用任何前端 DOM UI 框架（如 React, Vue 等），所有 UI 介面（含按鈕、文字、問答視窗）皆由 Phaser 內建的 GameObjects (Container, Text, Graphics, Rectangle) 繪製。
* **螢幕適應**：手機直向全螢幕。採用 **`Phaser.Scale.FIT`** 模式，固定設計解析度為 **`720 x 1280`**，自動適應並置中於行動裝置。

---

## 2. 核心遊玩機制
* **視覺與捲動**：
  * 主角小蝴蝶固定在畫面左側上下移動。
  * 背景（巨大的彩色花朵）向左捲動，營造向右飛行的視覺效果。
* **操控方式**：
  * 支援鍵盤（上下方向鍵）控制主角。
  * 支援手機觸控：點擊畫面上半部往上飛，點擊畫面下半部往下飛。
* **生成與碰撞機制**：
  * 畫面右側隨機高度生成帶有不同顏色與花紋的問答蝴蝶（QAButterfly），並向左飛行。
  * 當主角與問答蝴蝶碰撞時，暫停 `GameScene` 物理引擎與背景滾動，並以 `launch` 方式疊加彈出 `DialogScene`。
* **答題邏輯（在 DialogScene 實作）**：
  * 隨機出題：10 以內的加法（例如 `3 + 4 = ?`），並提供三個按鈕選項。
  * **答對**：獲得該問答蝴蝶的外觀皮膚，若愛心未滿 5 顆則恢復 1 顆，播放成功音效與彩色紙屑粒子效果，1.5 秒後關閉彈窗並恢復遊戲。
  * **答錯**：扣除 1 顆心，畫面震動並播放失敗音效，1.5 秒後關閉彈窗並恢復遊戲。
* **結束條件**：
  * 當愛心歸零，或累積碰觸並解答 10 隻蝴蝶時，畫面淡出並切換回 `HomeScene`。

---

## 3. 系統狀態與數據結構 (`GameState`)
全域管理遊戲狀態，確保重玩時能重置數據但保留收集到的外觀。

```typescript
export interface Skin {
  id: string;      // 格式: skin_${color}_${pattern}，用於去重
  color: number;   // 16 進位顏色代碼，例如 0xffb6c1
  pattern: string; // 'none' | 'dots' | 'stripes'
}

export interface GameStateData {
  hearts: number;           // 當前愛心 (0 ~ 5)
  maxHearts: number;        // 最大愛心 (預設 5)
  progress: number;         // 當前答題次數 (0 ~ 10)
  targetProgress: number;   // 目標次數 (預設 10)
  collectedSkins: Skin[];   // 已收集的皮膚清單
  currentSkin: Skin;        // 主角目前使用的皮膚
}
```

---

## 4. 場景架構與職責 (Phaser Scenes)

| 場景類別 | 職責說明 |
| :--- | :--- |
| **BootScene** | 遊戲初始引導，隨即切換至 PreloadScene。 |
| **PreloadScene** | 負責加載所有必要的靜態資源（Web Font 字型宣告、Web Audio 音效初始化、基本粒子圖案等）。 |
| **HomeScene** | 溫暖的家。展示收集到的顏色與花紋、點擊更換主角外觀、提供「開始遊戲」按鈕（重置狀態並切換至 GameScene）。 |
| **GameScene** | 遊戲核心。負責背景花朵滾動、天氣粒子特效（晴天、陰天、下雨）、生成問答蝴蝶、碰撞處理。 |
| **UIScene** | 疊加在 GameScene 之上，顯示目前的愛心數量（Graphic 繪製或 Emoji）與關卡進度字樣。 |
| **DialogScene** | 答題彈窗。暫停 GameScene 並疊加顯示，處理加法題目、三個答案按鈕與答題對錯的動態回饋。 |

---

## 5. 核心 Bug 修復與優化準則 (必須遵守)

1. **問答蝴蝶速度重置 Bug**：
   在 `GameScene` 中將 `QAButterfly` 加入物理群組 `qaGroup` 後，必須**重新調用** `(qa.body as Phaser.Physics.Arcade.Body).setVelocityX(-200)`，否則蝴蝶會靜止在原地。
2. **多重碰撞防範**：
   在 `GameScene` 內建 `private isDialogActive: boolean` 狀態。在碰撞發生時，若該旗標為 `true` 則直接忽略，防止同一個 tick 觸發多次碰撞導致彈窗多重疊加。
3. **皮膚去重機制**：
   皮膚的唯一 ID 必須是 `skin_${color}_${pattern}`，拿掉時間戳記。在 `GameState.addSkin` 中依此 ID 去重，防止相同的皮膚重複顯示在 `HomeScene` 的收集列表。
4. **手機操控衝突防範**：
   為避免 DialogScene 中點擊選項的 `pointer.isDown` 被 GameScene 錯誤繼承，在 GameScene 恢復運作前，確保 pointer 的輸入狀態已被重置，或在對話框關閉的 1.5 秒延遲中阻斷輸入。
5. **兒童化 UI & 動效 (WOW 元素)**：
   * **字型**：全套採用 Google Font `Fredoka`。
   * **特效**：答對時使用 `Phaser.GameObjects.Particles` 製作彩色紙屑噴灑效果；答錯時使用相機震動或彈窗抖動效果。
   * **音效**：使用內建 `AudioContext` 程式合成 8-bit 可愛音效，避免外部資源載入失敗。
