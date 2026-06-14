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
    this.loadFromLocalStorage();
  }

  private saveToLocalStorage(): void {
    try {
      const saveData = {
        collectedColors: this.data.collectedColors,
        collectedPatterns: this.data.collectedPatterns,
        currentColor: this.data.currentColor,
        currentPattern: this.data.currentPattern
      };
      localStorage.setItem('big_flower_save_data', JSON.stringify(saveData));
    } catch (e) {
      console.error('Failed to save game state to LocalStorage', e);
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const saved = localStorage.getItem('big_flower_save_data');
      if (saved) {
        const saveData = JSON.parse(saved);
        if (saveData.collectedColors && Array.isArray(saveData.collectedColors)) {
          const colors = Array.from(new Set([0xffb6c1, ...saveData.collectedColors]));
          this.data.collectedColors = colors.filter((c): c is number => typeof c === 'number');
        }
        if (saveData.collectedPatterns && Array.isArray(saveData.collectedPatterns)) {
          const patterns = Array.from(new Set(['none', ...saveData.collectedPatterns]));
          this.data.collectedPatterns = patterns.filter((p): p is string => typeof p === 'string');
        }
        if (typeof saveData.currentColor === 'number' && this.data.collectedColors.includes(saveData.currentColor)) {
          this.data.currentColor = saveData.currentColor;
        } else {
          this.data.currentColor = this.data.collectedColors[0] || 0xffb6c1;
        }
        if (typeof saveData.currentPattern === 'string' && this.data.collectedPatterns.includes(saveData.currentPattern)) {
          this.data.currentPattern = saveData.currentPattern;
        } else {
          this.data.currentPattern = this.data.collectedPatterns[0] || 'none';
        }
      }
    } catch (e) {
      console.error('Failed to load game state from LocalStorage', e);
    }
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
      this.saveToLocalStorage();
    }
  }

  public addPattern(pattern: string): void {
    if (!this.data.collectedPatterns.includes(pattern)) {
      this.data.collectedPatterns.push(pattern);
      this.saveToLocalStorage();
    }
  }

  public setCurrentColor(color: number): void {
    if (this.data.collectedColors.includes(color)) {
      this.data.currentColor = color;
      this.saveToLocalStorage();
    }
  }

  public setCurrentPattern(pattern: string): void {
    if (this.data.collectedPatterns.includes(pattern)) {
      this.data.currentPattern = pattern;
      this.saveToLocalStorage();
    }
  }

  public clearSaveData(): void {
    try {
      localStorage.removeItem('big_flower_save_data');
      this.data.collectedColors = [0xffb6c1];
      this.data.collectedPatterns = ['none'];
      this.data.currentColor = 0xffb6c1;
      this.data.currentPattern = 'none';
    } catch (e) {
      console.error('Failed to clear save data', e);
    }
  }
}

export const gameState = GameState.getInstance();
