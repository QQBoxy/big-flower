export interface GameStateData {
  hearts: number;
  maxHearts: number;
  progress: number;
  targetProgress: number;
  collectedColors: number[];
  collectedPatterns: string[];
  currentColor: number;
  currentPattern: string;
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
      collectedColors: [0xffb6c1], // Light pink default color
      collectedPatterns: ['none'], // default no pattern
      currentColor: 0xffb6c1,
      currentPattern: 'none'
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

  public addColor(color: number): void {
    if (!this.data.collectedColors.includes(color)) {
      this.data.collectedColors.push(color);
    }
  }

  public addPattern(pattern: string): void {
    if (!this.data.collectedPatterns.includes(pattern)) {
      this.data.collectedPatterns.push(pattern);
    }
  }

  public setCurrentColor(color: number): void {
    if (this.data.collectedColors.includes(color)) {
      this.data.currentColor = color;
    }
  }

  public setCurrentPattern(pattern: string): void {
    if (this.data.collectedPatterns.includes(pattern)) {
      this.data.currentPattern = pattern;
    }
  }
}

export const gameState = GameState.getInstance();
