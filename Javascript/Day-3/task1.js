$(document).ready(function () {

    const quizData = [
        
         {
            question: "Enter the full form of DOM",
            type: "text",
            answer: "Document Object Model"
        },
        {
            question: "Which language is used for styling web pages?",
            type: "radio",
            options: ["HTML", "CSS", "JavaScript"],
            answer: "CSS"
        },
        {
            question: "Which library simplifies JavaScript?",
            type: "radio",
            options: ["React", "jQuery", "Bootstrap"],
            answer: "jQuery"
        },
        {
            question: "Which symbol is used for jQuery?",
            type: "radio",
            options: ["#", "$", "@"],
            answer: "$"
        },
        {
            question: "Which HTML tag creates a hyperlink?",
            type: "radio",
            options: ["link", "a", "href"],
            answer: "a"
        }
    ]

    let currentIndex = 0
    let score = 0
    let correctAnswers = []
    let incorrectAnswers = []

    
    const quizValidator = $("#quizForm").validate({
        rules: {
            answer: {
                required: true
            }
        },
        messages: {
            answer: {
                required: "You must answer the current question before proceeding"
            }
        },
        errorClass: "error",
        errorElement: "div",

        errorPlacement: function (error) {
            $("#errorContainer").html(error)
        },

        highlight: function (element) {
            $(element).addClass("is-invalid")
            $("input[name='answer']").addClass("is-invalid")
        },

        unhighlight: function (element) {
            $(element).removeClass("is-invalid")
            $("input[name='answer']").removeClass("is-invalid")
        },

        submitHandler: function () {
            checkAnswer()
            return false
        }
    })

    function loadQuestion() {
        const questionData = quizData[currentIndex]

        $("#questionNumber").text(currentIndex + 1)
        $("#questionText").text(questionData.question)
        $("#answerArea").empty()
        $("#errorContainer").empty()
        $(".feedback").text("")
        $("#scoreDisplay").text(score)

        quizValidator.resetForm()

        if (questionData.type === "radio") {
            questionData.options.forEach(function (option) {
                $("#answerArea").append(`
                    <div class="form-check mb-2">
                        <input class="form-check-input" type="radio" name="answer" value="${option}">
                        <label class="form-check-label">${option}</label>
                    </div>
                `)
            })
        } else {
            $("#answerArea").append(`
                <input type="text" name="answer" class="form-control" placeholder="Type your answer">
            `)
        }
    }

    function checkAnswer() {
        let userAnswer = $("[name='answer']:checked").val()
        if (!userAnswer) {
            userAnswer = $("[name='answer']").val()
        }

        const currentQuestion = quizData[currentIndex]
        const correctAnswer = currentQuestion.answer

        if (userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase()) {
            score++

            correctAnswers.push({
                question: currentQuestion.question,
                answer: userAnswer
            })

            $(".feedback")
                .addClass("correct")
                .removeClass("incorrect")
                .text("Correct Answer")
                .hide()
                .fadeIn(400)
        } else {
            incorrectAnswers.push({
                question: currentQuestion.question,
                userAnswer: userAnswer,
                correctAnswer: correctAnswer
            })

            $(".feedback")
                .addClass("incorrect")
                .removeClass("correct")
                .text("Incorrect Answer")
                .hide()
                .fadeIn(400)
        }

        setTimeout(nextQuestion, 900)
    }

    function nextQuestion() {
        currentIndex++

        if (currentIndex < quizData.length) {
            $(".quizCard").fadeOut(400, function () {
                loadQuestion()
                $(this).fadeIn(400)
            })
        } else {
            showFinalResult()
        }
    }

    function showFinalResult() {
        $("#quizSection").fadeOut(400, function () {
            $("#finalScore").text("Your Score: " + score + " / " + quizData.length)

            $("#correctList").empty()
            $("#incorrectList").empty()

            correctAnswers.forEach(function (item) {
                $("#correctList").append(`
                    <li>${item.question} — <strong>${item.answer}</strong></li>
                `)
            })

            incorrectAnswers.forEach(function (item) {
                $("#incorrectList").append(`
                    <li>
                        ${item.question}<br>
                        Your Answer: <strong>${item.userAnswer}</strong><br>
                        Correct Answer: <strong>${item.correctAnswer}</strong>
                    </li>
                `)
            })

            $("#resultSection").fadeIn(500)
        })
    }

    $("#resetQuiz").click(function () {
        currentIndex = 0
        score = 0
        correctAnswers = []
        incorrectAnswers = []

        $("#resultSection").hide()
        $("#quizSection").show()

        loadQuestion()
    })

    loadQuestion()
})
