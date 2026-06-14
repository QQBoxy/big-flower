export interface Skin {
  id: string;
  color: number;
  pattern: string;
}

export interface GameStateData {
  hearts: number;
  maxHearts: number;
  progress: number;
  targetProgress: number;
  collectedSkins: Skin[];
  currentSkin: Skin;
}

class GameState {
  private static instance: GameState;
  private data: GameStateData;

  private constructor() {
    this.data = {
      hearts: 5,
      maxHearts: 5,
      progress: 0,
      targetProgress: 10,
      collectedSkins: [
        { id: 'default', color: 0xffb6c1, pattern: 'none' } // Light pink
      ],
      currentSkin: { id: 'default', color: 0xffb6c1, pattern: 'none' }
    };
  }

  public static getInstance(): GameState {
    if (!GameState.instance) {
      GameState.instance = new GameState();
    }
    return GameState.instance;
  }

  public getData(): GameStateData {
    return this.data;
  }

  public resetGame(): void {
    this.data.hearts = this.data.maxHearts;
    this.data.progress = 0;
  }

  public addProgress(amount: number = 1): void {
    this.data.progress += amount;
  }

  public addHeart(amount: number = 1): void {
    this.data.hearts = Math.min(this.data.hearts + amount, this.data.maxHearts);
  }

  public removeHeart(amount: number = 1): void {
    this.data.hearts = Math.max(this.data.hearts - amount, 0);
  }

  public addSkin(skin: Skin): void {
    if (!this.data.collectedSkins.find(s => s.id === skin.id)) {
      this.data.collectedSkins.push(skin);
    }
  }

  public setCurrentSkin(skinId: string): void {
    const skin = this.data.collectedSkins.find(s => s.id === skinId);
    if (skin) {
      this.data.currentSkin = skin;
    }
  }
}

export const gameState = GameState.getInstance();
