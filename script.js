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
const linkedin = document.querySelector(".linkedin");

(() => {
    let quizData = JSON.parse(localStorage.getItem("quizData")) || {
        currentQuesNo: 0,
        score: 0,
        questionAttempt: false,
        isMute: true,
        highScore: 0
    };

    let correctSound = new Audio('./audio/correct_option.mp3');
    let wrongSound = new Audio("./audio/wrong_option.mp3");

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
        document.querySelector(".main-Container").style.display = "block";
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
            quizFunc();
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
        quizFunc();
    });

    function quizFunc() {
        questionElement.innerText = questions[quizData.currentQuesNo].question;
        if (questions[quizData.currentQuesNo].desc) {
            let span = document.createElement("span");
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
        let intervalId = setInterval(setTimer, 1000);

        let timoutIds = changeBackgroundColor(minute, second);

        let quesLength = (questions.length >= 10) ? questions.length : `0${questions.length}`;
        let quesNo = (quizData.currentQuesNo + 1 >= 10) ? quizData.currentQuesNo + 1 : `0${quizData.currentQuesNo + 1}`;
        questionCount.innerText = `${quesNo}/${quesLength}`;

        optionsContainer.addEventListener("click", ansCheck);

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

        nextQues.addEventListener("click", () => {
            if (quizData.currentQuesNo >= questions.length) {
                mainContainer.classList.replace("active", "final-state");
                quizState.classList.replace("beige-background", "paleChestnut-background");
                timer.classList.replace("golden-background", "red-background");
                nextQues.classList.replace("golden-text", "red-text");

                clearInterval(intervalId);
                if (timoutIds.setTimeoutId1) clearTimeout(timoutIds.setTimeoutId1);
                if (timoutIds.setTimeoutId2) clearTimeout(timoutIds.setTimeoutId2);

                let attemptQueValue = (attemptedQues >= 10) ? quizData.score : `0${quizData.score}`;
                attemptedQues.innerText = `${attemptQueValue}/${quesLength}`;


                let percentage = parseInt(quizData.score / quesLength * 100);
                let cubicDegree = 360 - (percentage / 100 * 360);
                document.documentElement.style.cssText = `--cubic-degree: ${cubicDegree}deg`;

                userPercentage.innerText = `${percentage}%`;

                if (quizData.score > quizData.highScore) {
                    quizData.highScore = quizData.score
                    localStorage.setItem("quizData", JSON.stringify(quizData));
                };
                window.scrollTo({ top: 0 });
                return;
            };

            if (!quizData.questionAttempt) {
                quizData.currentQuesNo++;
                localStorage.setItem("quizData", JSON.stringify(quizData));
                optionsContainer.removeEventListener("click", ansCheck);
                if (quizData.currentQuesNo >= questions.length) {
                    mainContainer.classList.replace("active", "final-state");
                    quizState.classList.replace("beige-background", "paleChestnut-background");
                    timer.classList.replace("golden-background", "red-background");
                    nextQues.classList.replace("golden-text", "red-text");

                    clearInterval(intervalId);
                    if (timoutIds.setTimeoutId1) clearTimeout(timoutIds.setTimeoutId1);
                    if (timoutIds.setTimeoutId2) clearTimeout(timoutIds.setTimeoutId2);

                    let attemptQueValue = (attemptedQues >= 10) ? quizData.score : `0${quizData.score}`;
                    attemptedQues.innerText = `${attemptQueValue}/${quesLength}`;

                    let percentage = parseInt(quizData.score / quesLength * 100);
                    let cubicDegree = 360 - (percentage / 100 * 360);
                    document.documentElement.style.cssText = `--cubic-degree: ${cubicDegree}deg`;

                    userPercentage.innerText = `${percentage}%`;

                    if (quizData.score > quizData.highScore) {
                        quizData.highScore = quizData.score
                        localStorage.setItem("quizData", JSON.stringify(quizData));
                    };
                    window.scrollTo({ top: 0 });
                    return;
                };
            } else {
                quizData.questionAttempt = false;
                localStorage.setItem("quizData", JSON.stringify(quizData));
            };

            quesNo = (quizData.currentQuesNo + 1 >= 10) ? quizData.currentQuesNo + 1 : `0${quizData.currentQuesNo + 1}`;
            questionCount.innerText = `${quesNo}/${quesLength}`;
            window.scrollTo({ top: 0 });
            questionElement.innerText = questions[quizData.currentQuesNo].question;
            if (questions[quizData.currentQuesNo].desc) {
                let span = document.createElement("span");
                span.classList.add("unselectable", "break-after-semicolon");
                let formattedText = questions[quizData.currentQuesNo].desc.replace(";", ';\n');
                span.textContent = formattedText;
                questionElement.append(span);
            }
            options.forEach(option => {
                option.classList.remove("correct-ans", "wrong-ans");
                if (option.lastElementChild.classList.contains("result")) {
                    option.lastElementChild.remove();
                };
                option.firstElementChild.innerText = questions[quizData.currentQuesNo].choices[option.id];
            });

            quizState.classList.remove("beige-background", "paleChestnut-background");
            timer.classList.remove("golden-background", "red-background");
            nextQues.classList.remove("golden-text", "red-text");

            optionsContainer.addEventListener("click", ansCheck);

            clearInterval(intervalId);
            if (timoutIds.setTimeoutId1) clearTimeout(timoutIds.setTimeoutId1);
            if (timoutIds.setTimeoutId2) clearTimeout(timoutIds.setTimeoutId2);
            minute = questions[quizData.currentQuesNo].duration.minute;
            second = questions[quizData.currentQuesNo].duration.second;
            (second >= 10) ? timer.innerText = `0${minute}:${second}` : timer.innerText = `0${minute}:0${second}`;
            intervalId = setInterval(setTimer, 1000);
            timoutIds = changeBackgroundColor(minute, second);
        })

        function ansCheck(e) {
            if (e.target === optionsContainer) return;

            let firstChild = e.target.closest(".option");
            if (!firstChild) return;

            if (parseInt(firstChild.id) === questions[quizData.currentQuesNo].ansIndex) {
                quizData.score++;
                firstChild.classList.add("correct-ans");
                let correctAns = document.createElement("div");
                correctAns.classList.add("result");
                let img = document.createElement("img");
                img.src = "./images/correct.svg";
                correctAns.append(img);
                firstChild.append(correctAns);
                if (!quizData.isMute) correctSound.play();
            } else {
                firstChild.classList.add("wrong-ans");
                options[questions[quizData.currentQuesNo].ansIndex].classList.add("correct-ans");

                let correctAns = document.createElement("div");
                correctAns.classList.add("result");
                let correctImg = document.createElement("img");
                correctImg.src = "./images/correct.svg";
                correctAns.append(correctImg);
                options[questions[quizData.currentQuesNo].ansIndex].append(correctAns);

                let wrongAns = document.createElement("div");
                wrongAns.classList.add("result");

                let span = document.createElement("span");
                let crossImg = document.createElement("img");
                crossImg.src = "./images/wrong.svg";
                span.innerText = "You Choose";
                crossImg.onload = () => {
                    wrongAns.append(span, crossImg);
                }

                firstChild.append(wrongAns);
                if (!quizData.isMute) wrongSound.play();
            };
            optionsContainer.removeEventListener("click", ansCheck);
            quizData.currentQuesNo++;
            quizData.questionAttempt = true;
            clearInterval(intervalId);
            if (timoutIds.setTimeoutId1) clearTimeout(timoutIds.setTimeoutId1);
            if (timoutIds.setTimeoutId2) clearTimeout(timoutIds.setTimeoutId2);
            localStorage.setItem("quizData", JSON.stringify(quizData));
        };

        retryBtn.addEventListener("click", () => {
            mainContainer.classList.replace("final-state", "active");
            quizState.classList.remove("beige-background", "paleChestnut-background");
            timer.classList.remove("golden-background", "red-background");
            nextQues.classList.remove("golden-text", "red-text");
            quizData.currentQuesNo = 0;
            quizData.questionAttempt = false;
            quizData.score = 0;
            localStorage.setItem("quizData", JSON.stringify(quizData));
            quesNo = (quizData.currentQuesNo + 1 >= 10) ? quizData.currentQuesNo + 1 : `0${quizData.currentQuesNo + 1}`;
            questionCount.innerText = `${quesNo}/${quesLength}`;
            questionElement.innerText = questions[quizData.currentQuesNo].question;
            if (questions[quizData.currentQuesNo].desc) {
                let span = document.createElement("span");
                span.classList.add("unselectable");
                span.innerText = questions[quizData.currentQuesNo].desc;
                questionElement.append(span);
            }
            options.forEach(option => {
                option.classList.remove("correct-ans", "wrong-ans");
                if (option.lastElementChild.classList.contains("result")) {
                    option.lastElementChild.remove();
                };
                option.firstElementChild.innerText = questions[quizData.currentQuesNo].choices[option.id];
            });
            optionsContainer.addEventListener("click", ansCheck);
            window.scrollTo({ top: 0 });

            minute = questions[quizData.currentQuesNo].duration.minute;
            second = questions[quizData.currentQuesNo].duration.second;
            (second >= 10) ? timer.innerText = `0${minute}:${second}` : timer.innerText = `0${minute}:0${second}`;
            intervalId = setInterval(setTimer, 1000);
            timoutIds = changeBackgroundColor(minute, second);
        });

        function setTimer() {
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
        }

        function changeBackgroundColor(minute, second) {
            let halfSeconds;
            let oneSixthSeconds;

            let id1 = (() => {
                if (!minute) {
                    halfSeconds = (second * 1000) / 2;
                } else {
                    if (!second) {
                        halfSeconds = ((minute * 60) * 1000) / 2;
                    } else {
                        halfSeconds = ((minute * 60 + second) * 1000) / 2;
                    }
                }
                let id = setTimeout(() => {
                    quizState.classList.add("beige-background");
                    timer.classList.add("golden-background");
                    nextQues.classList.add("golden-text");
                }, halfSeconds);
                return id;
            })();

            let id2 = (() => {
                if (!minute) {
                    oneSixthSeconds = (second * 1000) * (5 / 6);
                } else {
                    if (!second) {
                        oneSixthSeconds = ((minute * 60) * 1000) * (5 / 6);
                    } else {
                        oneSixthSeconds = ((minute * 60 + second) * 1000) * (5 / 6);
                    }
                }
                let id = setTimeout(() => {
                    quizState.classList.replace("beige-background", "paleChestnut-background");
                    timer.classList.replace("golden-background", "red-background");
                    nextQues.classList.replace("golden-text", "red-text");
                }, oneSixthSeconds);
                return id;
            })();

            return { setTimeoutId1: id1, setTimeoutId2: id2 };
        }
    }
})();