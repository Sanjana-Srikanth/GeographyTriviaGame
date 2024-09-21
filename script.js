//DECLARING VARIABLES 
let questions = []; //stores the questions retrieved from the csv file in an array
let selectedQuestions = []; //holds four randomly selected questions for each trivia round
let currentQuestionIndex = 0; //keeps track of the current question
let scoreTracker = 0; //sets the intial score tracker to 0
let hintTracker = 5; //sets 5 hints per round
const questionsPerGame = 4; //the number of questions per trivia round (4)
let gameOver = false; //only set to true once the game is over
let timerInterval; //stores the timer ID 
let timeLeft = 60; //sets the total time for each round (in seconds)

//this function fetches questions from the geography_questions.csv file, parses it, and constructs a question array
async function fetchQuestions() { //the async keyword to fetch from the csv file
    try {
        const response = await fetch('geography_questions.csv'); //await pauses program execution until fetch is resolved
        
        if (!response.ok) {//ok property is true for successful network requests and false otherwise
            throw new Error('Network response was not ok'); //throws error if network request is unsuccessful
        }
    
        const csvContent = await response.text(); //read raw text from the csv file; "await" ensures the program waits until csv is fully read
        console.log('CSV Text:', csvContent); //outputs csv text onto the console to ensure accuracy of what was read 

        //uses the PapaParse library to parse the csv text
        //PapaParse library has a lot of functionalities for easy csv parsing and error catching
        const parsedData = Papa.parse(csvContent, {
            header: true, //treats the 1st row as a header to look mainly at the rest of the content
            skipEmptyLines: true //skips empty lines in the csv file to exclude them from the output
        });

        //checks that there are questions in the csv, throwing an error if otherwise
        if (parsedData.data.length === 0) {
            console.error('No questions found in the CSV');
            return;
        }

        //maps parsed data to questions array
        questions = parsedData.data.map(row => ({
            question: row.Question,
            correctAnswer: row.Answer //gets the correct answer
        }));
        
        //hides the replay button initially 
        document.getElementById('replay').style.display = 'none';
        console.log('Parsed Questions Array:', questions); // Log the parsed questions array
        selectRandomQuestions(); // Select random questions to display
        
    //throws an error if CSV cannot fetch or parse
    } catch (error) {
        console.error('Error fetching or parsing the CSV:', error);
    }
}

//selects 4 random questions from the questions Array
function selectRandomQuestions() {
    const shuffledQuestions = questions.sort(() => 0.5 - Math.random());
    selectedQuestions = shuffledQuestions.slice(0, questionsPerGame);
    currentQuestionIndex = 0; //reset index
    displayQuestion(); //display the first question
}


//starts the timer and assigns timer ID 
function startTimer() {
    const timerDisplay = document.getElementById('timer');
    timeLeft = 60; // Reset time left
    timerDisplay.innerText = timeLeft;

    timerInterval = setInterval(() => {
        if (timeLeft <= 0) {
            stopTimer();
        } else {
            timeLeft--;
            timerDisplay.innerText = timeLeft;
        }
    }, 1000); //updates every second
}

//hides all game features at the end of the game 
function hideFeatures(){
    document.getElementById('question-container').innerHTML = ''; //clears the question
    document.getElementById('result-message').textContent = ''; //clears any result message
    document.getElementById('score-container').style.display = 'none';
    document.getElementById('user-input').style.display = 'none';
    document.getElementById('hint-container').style.display = 'none';
    document.getElementById('submit-answer').style.display = 'none';
    document.getElementById('hint').style.display = 'none';
    document.getElementById('display-word').style.display = 'none';
    //shows replay button at the end
    document.getElementById('replay').style.display = 'block';
}

//stops the timer and displays the end screen
function stopTimer(){
    clearInterval(timerInterval);
    document.getElementById('timer-container').style.display = 'none'; // Hide timer

    const questionContainer = document.getElementById('question-container');

    if (timeLeft <= 0) { //only runs if the game isn't already over and timer runs out automatically
        alert("Time's up!");
        hideFeatures();
        questionContainer.innerHTML = 'Game Over! Your final score is ' + scoreTracker;
        gameOver = true; //set gameOver to true
    }
    else{
        hideFeatures();
    }
}

    //starts the timer when the game beings
    startTimer();


//displays the current question
function displayQuestion() {
    const questionContainer = document.getElementById('question-container');
    const resultMessage = document.getElementById('result-message');

    if (currentQuestionIndex < selectedQuestions.length) {
        questionContainer.innerHTML = selectedQuestions[currentQuestionIndex].question; // Display the question
        resultMessage.textContent = ''; // Clear previous messages
        document.getElementById('user-input').value = ''; // Clear input field
        //resets the hint button functionailities
        resetHint(selectedQuestions[currentQuestionIndex].correctAnswer);
    } else {
        gameOver = true; // Set gameOver to true
        stopTimer(); // Stop the timer and handle UI updates
        //make the replay button appear
        questionContainer.innerHTML = 'Game Over! Your final score is ' + scoreTracker;

    }
}

//checks whether the user's answer is correct of incorrect
function checkAnswer() {
    const userInput = document.getElementById('user-input').value.trim();
    const correctAnswer = selectedQuestions[currentQuestionIndex].correctAnswer;

    const resultMessage = document.getElementById('result-message');
    if (userInput.toLowerCase() === correctAnswer.toLowerCase()) {
        resultMessage.textContent = 'Correct!';
        scoreTracker++;
        document.getElementById('score').innerText = scoreTracker;
    } else {
        resultMessage.textContent = `Incorrect! The correct answer is: ${correctAnswer}`;
    }

    currentQuestionIndex++; // Move to the next question
    setTimeout(displayQuestion, 800); // Wait 2 seconds before showing the next question
}

//event listener for the submit button
document.getElementById('submit-answer').addEventListener('click', (event) => {
    event.preventDefault(); // Prevent default submission and allows for customization 
    checkAnswer();
});

//global variables that can be accessed by "hint" methods
let word = " "; 
let lettersArray = word.split('');
let displayArray = Array(lettersArray.length).fill('*');
let hintIndex = 0;

//resets the hint
function resetHint(currentWord) {
    word = currentWord; // Reset the word
    lettersArray = word.split('');
    displayArray = Array(lettersArray.length).fill('*');
    document.getElementById('display-word').innerText = displayArray.join('');
    hintIndex = 0;
}

//reveals the correct answer one letter at a time for a hint
function revealLetter() {
    displayArray[hintIndex] = lettersArray[hintIndex];
    document.getElementById('display-word').innerText = displayArray.join('');
    hintIndex++; // Move to the next index for the next letter
}

//event listener for the hint button
document.getElementById('hint').addEventListener('click', (event) => {
    if (hintTracker > 0){
        hintTracker--;
        document.getElementById('hintDisplay').innerText = hintTracker;
        event.preventDefault();
        revealLetter();
    }
    else {
        alert("No more hints available!");
    }
});

//event listener for the replay button --> takes user to the end page 
document.getElementById('replay').addEventListener('click', (event) => {
    window.location.href = 'game.html';
});


//calls the function to fetch questions
fetchQuestions();
