export interface MathProblem {
  num1: number;
  num2: number;
  correctAnswer: number;
  options: number[];
}

export function generateAdditionProblem(): MathProblem {
  // Sum should be <= 10
  const sum = Math.floor(Math.random() * 9) + 2; // 2 to 10
  const num1 = Math.floor(Math.random() * (sum - 1)) + 1; // 1 to sum - 1
  const num2 = sum - num1;
  
  const correctAnswer = sum;
  
  // Generate 2 wrong options
  const options = new Set<number>();
  options.add(correctAnswer);
  
  while (options.size < 3) {
    const wrongAnswer = Math.floor(Math.random() * 11); // 0 to 10
    if (wrongAnswer !== correctAnswer) {
      options.add(wrongAnswer);
    }
  }
  
  // Shuffle options
  const shuffledOptions = Array.from(options).sort(() => Math.random() - 0.5);
  
  return {
    num1,
    num2,
    correctAnswer,
    options: shuffledOptions
  };
}

export function generateRandomSkin(): import('../state/GameState').Skin {
  const colors = [0xffb6c1, 0xadd8e6, 0x90ee90, 0xffffe0, 0xffa07a, 0xdda0dd];
  const patterns = ['none', 'dots', 'stripes'];
  
  const color = colors[Math.floor(Math.random() * colors.length)];
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  const id = `skin_${color}_${pattern}_${Date.now()}`;
  
  return { id, color, pattern };
}
