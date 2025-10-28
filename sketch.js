// Global variables for the quiz
let quizTable; // Stores the loaded CSV data
let allQuestions = []; // Array to hold parsed question objects
let selectedQuestions = []; // Array to hold 3 randomly selected questions for the current quiz
let currentQuestionIndex = 0; // Index of the current question being displayed
let userAnswers = []; // Stores user's selected option index for each question
let score = 0; // User's score
let quizState = 'start'; // 'start', 'question', 'result'

let startButton;
let submitButton;
let restartButton;

let feedbackText = "";
let feedbackColor;

// Interactive elements for visual effects
let particles = [];
let backgroundColor;

// Preload function to load the CSV file
function preload() {
  quizTable = loadTable('questions.csv', 'csv', 'header');
}

// Setup function to initialize the p5.js canvas and quiz elements
function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textSize(20);
  rectMode(CENTER);

  // Parse questions from the loaded table
  parseQuestions();

  // Create UI buttons
  startButton = createButton('Start Quiz');
  startButton.mousePressed(startQuiz);

  submitButton = createButton('Submit Answer');
  submitButton.mousePressed(submitAnswer);

  restartButton = createButton('Restart Quiz');
  restartButton.mousePressed(resetQuiz);

  positionButtons();
  backgroundColor = color(220); // Initial background color
}

// Draw function to render the quiz based on its state
function draw() {
  background(backgroundColor);

  switch (quizState) {
    case 'start':
      displayStartScreen();
      break;
    case 'question':
      displayQuestion();
      break;
    case 'result':
      displayResultScreen();
      break;
  }

  // Update and display particles for interactive effects
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    if (particles[i].isFinished()) {
      particles.splice(i, 1);
    }
  }
}

// Parses questions from the CSV table
function parseQuestions() {
  for (let r = 0; r < quizTable.getRowCount(); r++) {
    let row = quizTable.getRow(r);
    allQuestions.push({
      question: row.getString('Question'),
      options: [
        row.getString('Option1'),
        row.getString('Option2'),
        row.getString('Option3'),
        row.getString('Option4')
      ],
      correctAnswer: parseInt(row.getString('CorrectAnswerIndex'))
    });
  }
}

// Starts the quiz
function startQuiz() {
  selectRandomQuestions(5); // Select 5 questions
  currentQuestionIndex = 0;
  userAnswers = new Array(selectedQuestions.length).fill(-1); // -1 indicates no answer yet
  score = 0;
  quizState = 'question';
  startButton.hide();
  submitButton.show();
  restartButton.hide();
  backgroundColor = color(220);
  particles = [];
}

// Selects N random questions from the allQuestions array
function selectRandomQuestions(num) {
  selectedQuestions = [];
  let availableIndices = Array.from({ length: allQuestions.length }, (_, i) => i);
  for (let i = 0; i < num; i++) {
    if (availableIndices.length === 0) break; // No more questions to select
    let randomIndex = floor(random(availableIndices.length));
    let questionIndex = availableIndices[randomIndex];
    selectedQuestions.push(allQuestions[questionIndex]);
    availableIndices.splice(randomIndex, 1); // Remove selected index to avoid duplicates
  }
}

// Displays the start screen
function displayStartScreen() {
  fill(0);
  text('Welcome to the Quiz!', width / 2, height / 2 - 50);
  startButton.show();
  submitButton.hide();
  restartButton.hide();
}

// Displays the current question and options
function displayQuestion() {
  let q = selectedQuestions[currentQuestionIndex];
  fill(0);
  text(`Question ${currentQuestionIndex + 1} of ${selectedQuestions.length}:`, width / 2, 50);
  text(q.question, width / 2, 150);

  let optionY = 250;
  let optionHeight = 50;
  let optionWidth = width * 0.6;
  let optionX = width / 2;

  for (let i = 0; i < q.options.length; i++) {
    let isSelected = userAnswers[currentQuestionIndex] === i;
    
    // Draw option box
    if (isSelected) {
      fill(150, 200, 255); // Highlight selected option
    } else {
      fill(240);
    }
    rect(optionX, optionY + i * (optionHeight + 10), optionWidth, optionHeight, 10);

    // Draw option text
    fill(0);
    text(q.options[i], optionX, optionY + i * (optionHeight + 10));
  }
}

// Handles mouse clicks for option selection and button presses
function mousePressed() {
  if (quizState === 'question') {
    let optionY = 250;
    let optionHeight = 50;
    let optionWidth = width * 0.6;
    let optionX = width / 2;

    for (let i = 0; i < selectedQuestions[currentQuestionIndex].options.length; i++) {
      let rectLeft = optionX - optionWidth / 2;
      let rectRight = optionX + optionWidth / 2;
      let rectTop = optionY + i * (optionHeight + 10) - optionHeight / 2;
      let rectBottom = optionY + i * (optionHeight + 10) + optionHeight / 2;

      if (mouseX > rectLeft && mouseX < rectRight && mouseY > rectTop && mouseY < rectBottom) {
        userAnswers[currentQuestionIndex] = i;
        // Add a particle effect on selection
        for (let p = 0; p < 5; p++) {
          particles.push(new Particle(mouseX, mouseY, color(0, 150, 255)));
        }
        break;
      }
    }
  }
}

// Submits the current answer and moves to the next question or results
function submitAnswer() {
  if (userAnswers[currentQuestionIndex] === -1) {
    // User hasn't selected an answer
    // Optional: provide visual feedback that an answer is required
    return;
  }

  // Check answer and provide immediate feedback
  let q = selectedQuestions[currentQuestionIndex];
  let isCorrect = userAnswers[currentQuestionIndex] === q.correctAnswer;

  if (isCorrect) {
    score++;
    feedbackText = "Correct!";
    feedbackColor = color(0, 200, 0); // Green
    for (let p = 0; p < 20; p++) {
      particles.push(new Particle(width / 2, height / 2, feedbackColor));
    }
  } else {
    feedbackText = "Incorrect. The correct answer was: " + q.options[q.correctAnswer];
    feedbackColor = color(200, 0, 0); // Red
    for (let p = 0; p < 20; p++) {
      particles.push(new Particle(width / 2, height / 2, feedbackColor));
    }
  }
  
  // Briefly show feedback, then move to next question
  setTimeout(() => {
    currentQuestionIndex++;
    if (currentQuestionIndex < selectedQuestions.length) {
      // Move to next question
      feedbackText = ""; // Clear feedback
    } else {
      // Quiz finished, show results
      quizState = 'result';
      submitButton.hide();
      restartButton.show();
    }
  }, 1500); // Show feedback for 1.5 seconds
}

// Displays the result screen
function displayResultScreen() {
  fill(0);
  text('Quiz Finished!', width / 2, height / 2 - 100);
  text(`You scored ${score} out of ${selectedQuestions.length} questions.`, width / 2, height / 2 - 50);

  let percentage = (score / selectedQuestions.length) * 100;
  let resultFeedback = "";
  if (percentage === 100) {
    resultFeedback = "Excellent! You got all answers correct!";
    backgroundColor = color(150, 255, 150); // Light green for perfect score
  } else if (percentage >= 70) {
    resultFeedback = "Good job! You did well.";
    backgroundColor = color(200, 200, 100); // Yellowish for good score
  } else {
    resultFeedback = "Keep practicing! You'll get better.";
    backgroundColor = color(255, 150, 150); // Light red for low score
  }
  text(resultFeedback, width / 2, height / 2);

  restartButton.show();
}

// Resets the quiz to the start screen
function resetQuiz() {
  quizState = 'start';
  startButton.show();
  submitButton.hide();
  restartButton.hide();
  backgroundColor = color(220);
  particles = [];
}

// Repositions buttons when the window is resized
function positionButtons() {
  startButton.position(width / 2 - startButton.width / 2, height / 2 + 50);
  submitButton.position(width / 2 - submitButton.width / 2, height - 50);
  restartButton.position(width / 2 - restartButton.width / 2, height / 2 + 100);
}

// Handles window resize events
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  positionButtons();
}

// Particle class for visual effects
class Particle {
  constructor(x, y, c) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D();
    this.vel.mult(random(1, 5));
    this.acc = createVector(0, 0.1); // Gravity-like effect
    this.lifespan = 255;
    this.color = c;
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.lifespan -= 5;
  }

  display() {
    stroke(this.color, this.lifespan);
    strokeWeight(2);
    fill(this.color, this.lifespan);
    ellipse(this.pos.x, this.pos.y, 10);
  }

  isFinished() {
    return this.lifespan < 0;
  }
}