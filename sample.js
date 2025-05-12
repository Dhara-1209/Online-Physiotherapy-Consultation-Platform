document.addEventListener("DOMContentLoaded", function () {
    console.log("Page Loaded");

    const LoginForm = document.getElementById("LoginForm");
    const Form1 = document.getElementById("Form1");
    const Form2 = document.getElementById("Form2");
    const Form3 = document.getElementById("Form3");
    const Form4 = document.getElementById("Form4"); 
    const Form5 = document.getElementById("Form5");
    const Form6 = document.getElementById("Form6");

    const scoreDisplay = document.getElementById("score_display");
    const refreshScore = document.getElementById("refreshScore");

    const goToRegister = document.getElementById("goToRegister");
    const backToLogin = document.getElementById("backToLogin");
    const nextStep = document.getElementById("nextStep");
    const registerBtn = document.getElementById("registerBtn");
    const LoginBtn = document.getElementById("LoginBtn");
    const submitSurvey = document.getElementById("submitSurvey");
    const languageSelect = document.getElementById("languageSelect");
    const finalSubmit = document.getElementById("finalSubmit");

    Form1.style.display = "none";
    Form2.style.display = "none";
    Form3.style.display = "none";
    Form4.style.display = "none";
    Form5.style.display = "none";
    Form6.style.display = "none";

    goToRegister.onclick = () => {
        LoginForm.style.display = "none";
        Form1.style.display = "block";
    };

    backToLogin.onclick = () => {
        Form1.style.display = "none";
        Form2.style.display = "none";
        Form3.style.display = "none";
        Form4.style.display = "none";
        Form5.style.display = "none";
        LoginForm.style.display = "block";
    };

    // Function to validate email format
    function validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

    nextStep.onclick = (event) => {
        event.preventDefault();
    
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
    
        if (!email || !password || !confirmPassword) {
            alert("Please fill out all fields.");
            return;
        }

        // Validate email format
        if (!validateEmail(email)) {
            alert("Please enter a valid email address.");
            return;
        }
    
        if (password !== confirmPassword) {
            alert("Passwords do not match! Please re-enter.");
            return;
        }
    
        Form1.style.display = "none";
        Form2.style.display = "block";
    };
    
    registerBtn.onclick = async (event) => {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const name = document.getElementById("name").value;
        const age = document.getElementById("age").value;
        const gender = document.getElementById("gender").value;

        
        if (!email || !password || !confirmPassword || !name || !age || !gender) {
            alert("Please fill out all fields.");
            return;
        }

        // Validate email format
        if (!validateEmail(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        const response = await fetch("/register", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&age=${encodeURIComponent(age)}&gender=${encodeURIComponent(gender)}`
        });

        const data = await response.json();

        if (data.status === "success") {
            alert(data.message);
            Form2.style.display = "none";
            LoginForm.style.display = "block";
        } else {
            alert("Error: " + data.message);
        }
    };


    LoginBtn.onclick = async (event) => {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }
        LoginForm.style.display="none"
        const response = await fetch(`/calculate_score/${email}`);
        const data = await response.json();
        document.getElementById("refreshEmail").value = email;

        if (data.AverageScore) {
            document.getElementById("score_display").innerHTML = `<p>Average Score: ${data.AverageScore}</p>`;
            Form6.style.display = "block"; // Show the score page
        } else {
            Form3.style.display = "block"; // Show the questionnaire
        }
    
    };

    submitSurvey.onclick = () => {
        Form3.style.display = "none";
        if (languageSelect.value === "english") {
            Form4.style.display = "block";
            loadQuestions("english");
        } else if (languageSelect.value === "gujarati") {
            Form5.style.display = "block";
            loadQuestions("gujarati");
        }
        document.querySelector('.container').classList.add('fullscreen');

    };

    function loadQuestions(language) {
        const container = language === "english" ? document.getElementById("questions-container") : document.getElementById("gujarati-questions-container");
        container.innerHTML = `
            <input type="email" id="surveyEmail" placeholder="Enter Your Email" required>
            <input type="text" id="surveyName" placeholder="Enter Your Name" required>
            <input type="number" id="surveyAge" placeholder="Enter Your Age" required>
        `;

        const questions = [
            { id: "stiffness", en: "1. How severe is your knee stiffness after exercise?", gu: "1. અભ્યાસ પછી તમારા ઘૂંટણની સખતાઈ કેટલી ગંભીર છે?" },
            { id: "pain_frequency", en: "2. How often do you experience knee pain after activity?", gu: "2. તમે પ્રવૃત્તિ પછી ઘૂંટણમાં દુખાવો કેટલી વાર અનુભવો છો?" },
            { id: "activity_limit", en: "3. How often does pain limit your activity?", gu: "3. દુખાવો તમારી પ્રવૃત્તિ કેટલો મર્યાદિત કરે છે?" },
            { id: "rising_pain", en: "4. Do you feel pain when rising from sitting (including getting out of the car)?", gu: "4. શું તમને ખુરશી પરથી ઊઠતી વખતે દુખાવો થાય છે (કારમાૂંથી બિાર આર્વર્વા સવિત)?" },
            { id: "kneeling_pain", en: "5. Do you feel pain when kneeling?", gu: "5. શું તમને ઘૂંટણ મોયતી વખતે દુખાવો થાય છે?" },
            { id: "squatting_pain", en: "6. Do you feel pain while squatting?", gu: "6. શું તમને ઊંટકેસી બેસતી વખતે દુખાવો થાય છે?" },
            { id: "household_activities", en: "7. Do you feel pain while doing heavy household activities (including carrying and lifting)?", gu: "7. શું તમને ભારે ઘરકામ કરતા દુખાવો થાય છે (ઉૂંચકર્વા અને લાર્વર્વા લઈ જર્વા સાથે)?" },
            { id: "jumping_pain", en: "8. Do you feel pain while hopping/jumping?", gu: "8. શું તમને કૂદતા અથવા ઝંપલાવતા દુખાવો થાય છે?" },
            { id: "running_pain", en: "9. Do you feel pain while running or jogging?", gu: "9. શું તમને દોડતા અથવા જોગીંગ કરતા દુખાવો થાય છે?" },
            { id: "sport_pain", en: "10. Do you feel pain after sports and recreational activities?", gu: "10. શું તમને રમતગમત અને મનોરંજનની પ્રવૃત્તિઓ પછી દુખાવો થાય છે?" },
            { id: "qol", en: "11. Have you modified your sport or recreational activities due to your knee pain?", gu: "11. શું ઘૂંટણના દુખાવાને કારણે તમે તમારી રમત ગમત અને મનોરંજનની પ્રવૃત્તિઓમાં ફેરફાર કરેલો છે?" }
        ];

        questions.forEach((q) => {
            const div = document.createElement("div");
            div.classList.add("question");
            div.innerHTML = `<p>${language === "english" ? q.en : q.gu}</p>
                <div class="options">
                    <label><input type="radio" name="${q.id}" value="None"> ${language === "english" ? "None" : "જરાય નહિ"}</label>
                    <label><input type="radio" name="${q.id}" value="Mild"> ${language === "english" ? "Mild" : "મધ્યમ"}</label>
                    <label><input type="radio" name="${q.id}" value="Moderate"> ${language === "english" ? "Moderate" : "તીવ્ર"}</label>
                    <label><input type="radio" name="${q.id}" value="Severe"> ${language === "english" ? "Severe" : "તીવ્રતમ"}</label>
                    <label><input type="radio" name="${q.id}" value="Extreme"> ${language === "english" ? "Extreme" : "અત્યંત તીવ્ર"}</label>
                </div>`;
            container.appendChild(div);
        });

        container.innerHTML += `
            <div class="btn-box">
                <button type="submit" id="finalSubmit">Submit</button>
            </div>
        `;

        document.getElementById("finalSubmit").onclick = async (event) => {
            event.preventDefault();
            const email = document.getElementById("surveyEmail").value;
            const name = document.getElementById("surveyName").value;
            const age = document.getElementById("surveyAge").value;

            if (!email || !name || !age) {
                alert("Please enter your email, name, and age.");
                return;
            }

            const answers = { email, name, age };
            questions.forEach(q => {
                answers[q.id] = document.querySelector(`input[name="${q.id}"]:checked`)?.value || "";
            });

            console.log("Submitting survey answers:", answers); 

            const response = await fetch("/submit_survey", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(answers)
            });

            const data = await response.json();
            console.log("Survey submission response:", data);  // Debugging
        
            alert(data.message);
            if (language === "english") {
                Form4.style.display = "none";
            } else if (language === "gujarati") {
                Form5.style.display = "none";
            }
            Form6.style.display = "block";
            loadScore(email);
        };
    }

    function loadScore(email) {
        console.log("Fetching score for email:", email);  // Debugging
        fetch(`/calculate_score/${email}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then(data => {
                console.log("Response Data:", data);  // Debugging
                if (data.error) {
                    document.getElementById("score_display").innerText = "No survey data found.";
                } else {
                    // Display the average score
                    document.getElementById("score_display").innerHTML = `
                        <p>Average Score: ${data.AverageScore}</p>
                    `;
                }
            })
            .catch(error => {
                console.error("Error fetching score:", error);
                document.getElementById("score_display").innerText = "Error loading score. Please try again.";
                Form6.style.display = "block";
            });
    }
    document.getElementById("score_display").innerText = "Loading score...";

    refreshScore.onclick = async () => {
      const email = document.getElementById("loginEmail").value;
      if (!email) {
        alert("Please log in first.");
        return;
      }
    
      try {
        const response = await fetch(
          `/calculate_score/${encodeURIComponent(email)}`
        );
        if (!response.ok) throw new Error("Network response was not ok");
    
        const data = await response.json();
        if (data.AverageScore != null) {
          document.getElementById("score_display").innerHTML =
            `<p>Average Score: ${data.AverageScore}</p>`;
        } else {
          alert("No score available yet.");
        }
      } catch (err) {
        console.error("Error fetching score:", err);
        alert("Error fetching score. Please try again.");
      }
    };
   
    
    });

