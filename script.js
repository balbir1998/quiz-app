const mainContainer = document.querySelector(".main-Container");
const startNow = document.querySelector(".start-now");
const highestScore = document.querySelector(".highest-score");
const quizState = document.querySelector(".quiz-state");
const volumeIcon = document.querySelector(".volume-icon");
const timer = document.querySelector(".timer");
const questionCount = document.querySelector(".question-count");
const questionElement = document.querySelector(".question");
const optionsContainer = document.querySelector(".options-container")
const options = document.querySelectorAll(".option");
const nextQues = document.querySelector(".next");
const retryBtn = document.querySelector(".retry-btn");
const attemptedQues = document.querySelector(".attempted-questions");
const userPercentage = document.querySelector(".percentage");
const quote = document.querySelector(".quote");

(() => {
    const quizData = JSON.parse(localStorage.getItem("quizData")) || {
        currentQuesNo: 0,
        score: 0,
        questionAttempt: false,
        isMute: true,
        highScore: 0
    };

    const correctSound = new Audio('./audio/correct_option.mp3');
    const wrongSound = new Audio("./audio/wrong_option.mp3");

    const correctImage = new Image();
    const wrongImage = new Image();
    correctImage.src = "./images/correct.svg";
    wrongImage.src = "./images/wrong.svg";

    const questions = [
        {
            question: "Inside which HTML element do we put the JavaScript?",
            choices: ["<js>", "<scripting>", "<javascript>", "<script>"],
            ansIndex: 3,
            duration: { minute: 0, second: 30 }
        },
        {
            question: "Which keyword is used for declaring a variable in JavaScript that can be reassigned?",
            choices: ["const", "var", "let", "static"],
            ansIndex: 2,
            duration: { minute: 0, second: 30 }
        },
        {
            question: "What is the purpose of JavaScript in web development?",
            choices: ["To structure web page", "To style web pages", "To add interactivity and dynamic content to web pages", "To store data on the server"],
            ansIndex: 2,
            duration: { minute: 0, second: 30 }
        },
        {
            question: "What will be the output of the following code snippet?",
            desc: "const obj1 = {first: 20, second: 30, first: 50}; console.log(obj1);",
            choices: ["{first: 20, second: 30}", "{first: 50, second: 30}", "{first: 20, second: 50, first: 20}", "Syntax Error"],
            ansIndex: 1,
            duration: { minute: 0, second: 30 }
        }
    ];


    window.addEventListener('load', () => {
        setTimeout(() => {
            document.getElementById("loader").style.display = "none";
            mainContainer.style.display = "block";
        }, 100);
    });

    if (quizData.currentQuesNo) {
        window.addEventListener('load', () => setTimeout(() => window.scrollTo({ top: 0 }), 0));
        if (quizData.currentQuesNo >= questions.length) {
            if (quizData.score > quizData.highScore) quizData.highScore = quizData.score;
            quizData.currentQuesNo = 0;
            quizData.score = 0;
            quizData.questionAttempt = false;
            localStorage.setItem("quizData", JSON.stringify(quizData));
        } else {
            mainContainer.classList.add("active");
            quizStateFunc();
        }
    }

    if (quizData.highScore) {
        let quesLength = (questions.length >= 10) ? questions.length : `0${questions.length}`;
        let score = (quizData.highScore >= 10) ? quizData.highScore : `0${quizData.highScore}`;
        highestScore.innerText = `Highest Score: ${score}/${quesLength}`;
        highestScore.classList.add("score-visible");
    }

    startNow.addEventListener("click", () => {
        mainContainer.classList.add("active");
        quizStateFunc();
    });

    function quizStateFunc() {
        const timerIds = {};
        questionElement.innerText = questions[quizData.currentQuesNo].question;
        if (questions[quizData.currentQuesNo].desc) {
            const span = document.createElement("span");
            span.classList.add("unselectable", "break-after-semicolon");
            let formattedText = questions[quizData.currentQuesNo].desc.replace(";", ';\n');
            span.textContent = formattedText;
            questionElement.append(span);
        }
        options.forEach(option => {
            option.firstElementChild.innerText = questions[quizData.currentQuesNo].choices[option.id]
        });

        let minute = questions[quizData.currentQuesNo].duration.minute;
        let second = questions[quizData.currentQuesNo].duration.second;
        (second >= 10) ? timer.innerText = `0${minute}:${second}` : timer.innerText = `0${minute}:0${second}`;
        setTimer();

        let quesLength = (questions.length >= 10) ? questions.length : `0${questions.length}`;
        let quesNo = (quizData.currentQuesNo + 1 >= 10) ? quizData.currentQuesNo + 1 : `0${quizData.currentQuesNo + 1}`;
        questionCount.innerText = `${quesNo}/${quesLength}`;

        if (quizData.isMute) {
            volumeIcon.firstElementChild.src = "./images/icon _Volume_mute.svg";
        } else {
            volumeIcon.firstElementChild.src = "./images/icon _Volume.svg";
        }

        volumeIcon.addEventListener("click", () => {
            if (quizData.isMute) {
                volumeIcon.firstElementChild.src = "./images/icon _Volume.svg";
                quizData.isMute = false;
                localStorage.setItem("quizData", JSON.stringify(quizData));
            } else {
                volumeIcon.firstElementChild.src = "./images/icon _Volume_mute.svg";
                quizData.isMute = true;
                localStorage.setItem("quizData", JSON.stringify(quizData));
            }
        });

        optionsContainer.addEventListener("click", ansCheck);
        nextQues.addEventListener("click", next);
        retryBtn.addEventListener("click", retry);

        function ansCheck(e) {
            if (e.target === optionsContainer) return;

            let firstChild = e.target.closest(".option");
            if (!firstChild) return;

            let isCorrect = parseInt(firstChild.id) === questions[quizData.currentQuesNo].ansIndex

            if (isCorrect) {
                quizData.score++;
                firstChild.classList.add("correct-ans");

                let correctAns = document.createElement("div");
                correctAns.classList.add("result");
                correctAns.append(correctImage);
                firstChild.append(correctAns);

                if (!quizData.isMute) correctSound.play();
            } else {
                firstChild.classList.add("wrong-ans");
                options[questions[quizData.currentQuesNo].ansIndex].classList.add("correct-ans");

                let correctAns = document.createElement("div");
                correctAns.classList.add("result");
                correctAns.append(correctImage);
                options[questions[quizData.currentQuesNo].ansIndex].append(correctAns);

                let wrongAns = document.createElement("div");
                wrongAns.classList.add("result");
                const span = document.createElement("span");
                span.innerText = "You Choose";
                wrongAns.append(span, wrongImage);
                firstChild.append(wrongAns);

                if (!quizData.isMute) wrongSound.play();
            };

            optionsContainer.removeEventListener("click", ansCheck);
            clearTimer();
            quizData.currentQuesNo++;
            quizData.questionAttempt = true;
            localStorage.setItem("quizData", JSON.stringify(quizData));
        };

        function next() {
            quizState.classList.remove("beige-background", "paleChestnut-background");
            timer.classList.remove("golden-background", "red-background");
            nextQues.classList.remove("golden-text", "red-text");

            window.scrollTo({ top: 0 });

            if (quizData.currentQuesNo >= questions.length) {
                finalState();
                return;
            };

            if (!quizData.questionAttempt) {
                clearTimer();
                quizData.currentQuesNo++;
                localStorage.setItem("quizData", JSON.stringify(quizData));
                optionsContainer.removeEventListener("click", ansCheck);

                if (quizData.currentQuesNo >= questions.length) {
                    finalState();
                    return;
                };
            } else {
                quizData.questionAttempt = false;
                localStorage.setItem("quizData", JSON.stringify(quizData));
            };

            updateQuestion();
        }

        function updateQuestion() {
            quesNo = (quizData.currentQuesNo + 1 >= 10) ? quizData.currentQuesNo + 1 : `0${quizData.currentQuesNo + 1}`;
            questionCount.innerText = `${quesNo}/${quesLength}`;

            questionElement.innerText = questions[quizData.currentQuesNo].question;
            if (questions[quizData.currentQuesNo].desc) {
                const span = document.createElement("span");
                span.classList.add("unselectable", "break-after-semicolon");
                let formattedText = questions[quizData.currentQuesNo].desc.replace(";", ';\n');
                span.textContent = formattedText;
                questionElement.append(span);
            }

            options.forEach(option => {
                option.classList.remove("correct-ans", "wrong-ans");
                if (option.lastElementChild.classList.contains("result")) option.lastElementChild.remove();
                option.firstElementChild.innerText = questions[quizData.currentQuesNo].choices[option.id];
            });

            optionsContainer.addEventListener("click", ansCheck);

            minute = questions[quizData.currentQuesNo].duration.minute;
            second = questions[quizData.currentQuesNo].duration.second;
            (second >= 10) ? timer.innerText = `0${minute}:${second}` : timer.innerText = `0${minute}:0${second}`;

            setTimer();
        }

        function finalState() {
            mainContainer.classList.replace("active", "final-state");

            let attemptQueValue = (attemptedQues >= 10) ? quizData.score : `0${quizData.score}`;
            attemptedQues.innerText = `${attemptQueValue}/${quesLength}`;

            let percentage = parseInt(quizData.score / quesLength * 100);
            let cubicDegree = 360 - (percentage / 100 * 360);
            let degree = 360;
            if (degree === cubicDegree) {
                document.documentElement.style.cssText = `--cubic-degree: ${degree}deg`;
            } else {
                setInterval(() => {
                    degree--;
                    if (degree < cubicDegree) return;
                    document.documentElement.style.cssText = `--cubic-degree: ${degree}deg`;
                }, 5)
            }

            userPercentage.innerText = `${percentage}%`;

            if (percentage >= 70) {
                quote.innerText = "“Keep learning, you have a good score!”";
            } else if (percentage >= 60) {
                quote.innerText = "“Good effort! Keep learning”";
            } else if (percentage >= 50) {
                quote.innerText = "“You can do better, keep improving”";
            } else if (percentage >= 33) {
                quote.innerText = "“Put more effort to improve your score”";
            } else {
                quote.innerText = "“You need to work hard”";
            }

            if (quizData.score > quizData.highScore) {
                quizData.highScore = quizData.score
                localStorage.setItem("quizData", JSON.stringify(quizData));
            };
        }

        function retry() {
            window.scrollTo({ top: 0 });
            mainContainer.classList.replace("final-state", "active");

            quizData.currentQuesNo = 0;
            quizData.questionAttempt = false;
            quizData.score = 0;
            localStorage.setItem("quizData", JSON.stringify(quizData));

            updateQuestion();
        }

        function setTimer() {
            let halfMilliSeconds;
            let oneSixthMilliSeconds;

            if (!minute) {
                halfMilliSeconds = (second * 1000) / 2;
                oneSixthMilliSeconds = (second * 1000) * (5 / 6);
            } else {
                if (!second) {
                    halfMilliSeconds = ((minute * 60) * 1000) / 2;
                    oneSixthMilliSeconds = ((minute * 60) * 1000) * (5 / 6);
                } else {
                    halfMilliSeconds = ((minute * 60 + second) * 1000) / 2;
                    oneSixthMilliSeconds = ((minute * 60 + second) * 1000) * (5 / 6);
                }
            }

            timerIds.intervalId = setInterval(() => {
                second--;
                if (minute === 0 && second < 0) {
                    nextQues.click();
                    return;
                };
                if (second < 0) {
                    minute--;
                    second = 59;
                };
                (second >= 10) ? timer.innerText = `0${minute}:${second}` : timer.innerText = `0${minute}:0${second}`;
            }, 1000)

            timerIds.timeoutId1 = setTimeout(() => {
                quizState.classList.add("beige-background");
                timer.classList.add("golden-background");
                nextQues.classList.add("golden-text");
                timerIds.timeoutId1 = null;
            }, halfMilliSeconds);

            timerIds.timeoutId2 = setTimeout(() => {
                quizState.classList.replace("beige-background", "paleChestnut-background");
                timer.classList.replace("golden-background", "red-background");
                nextQues.classList.replace("golden-text", "red-text");
                timerIds.timeoutId2 = null;
            }, oneSixthMilliSeconds);
            return timerIds;
        }

        function clearTimer() {
            clearInterval(timerIds.intervalId);
            if (timerIds.timeoutId1) clearTimeout(timerIds.timeoutId1);
            if (timerIds.timeoutId2) clearTimeout(timerIds.timeoutId2);
        }

    }
})();