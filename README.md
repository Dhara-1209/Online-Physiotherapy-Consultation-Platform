# Online Video Recommendation for Knee Osteoarthritis

This is a web app that recommends exercise videos to people with knee osteoarthritis based on their symptoms. Users fill out a short survey, and the system suggests videos that match their condition.


## What It Does
- Users answer 11 questions about their knee pain, stiffness, and daily activities.
- The app calculates a severity score from the answers.
- Based on the score, it shows a set of helpful exercise videos.


## Technologies Used
- Frontend:HTML, CSS, JavaScript  
- Backend:Python (Flask)  
- Database:MySQL  
- Video Hosting:Google Drive  
- Security:Passwords are encrypted before storing


## How It Works
1. User fills out a survey.
2. The system calculates a score:
   - 0–12: Critical
   - 13–29: High severity
   - 30–56: Moderate
   - 57–100: Mild
3. The app recommends videos based on the score.


## Example Results
- **Mild Symptoms:** Advanced exercises
- **Moderate Symptoms:** Flexibility and pain relief
- **High Symptoms:** Light stretches
- **Critical Symptoms:** Very basic, seated exercises


## Features
- Personalized video suggestions
- User login and registration
- Simple and easy-to-use design
- Real-time video display after survey

