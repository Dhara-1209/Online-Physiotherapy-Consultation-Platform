from flask import Flask, render_template, request, jsonify
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
import math 
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)


# Function to Connect to MySQL Database
def connect_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",         
        password="your_password",    
        database="knee",
         auth_plugin='mysql_native_password'
    )

# Insert User into Database (Registration)
def insert_user(name, email, password, age, gender):
    conn = connect_db()
    cursor = conn.cursor()
    hashed_password = generate_password_hash(password)  
    try:
        cursor.execute("INSERT INTO log (name, email, password, age, gender) VALUES (%s, %s, %s, %s, %s)",
                       (name, email, hashed_password, age, gender))
        conn.commit()
    except mysql.connector.Error as err:
        conn.rollback()
        return str(err)
    finally:
        cursor.close()
        conn.close()
    return None  

# Validate User Credentials (Login)
def validate_user(email, password):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT password FROM log WHERE email = %s", (email,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    if user and check_password_hash(user[0], password):  
        return True  
    return False  

# Function to delete feedback older than 1 week
def delete_old_feedback():
    conn = connect_db()
    cursor = conn.cursor()
    one_week_ago = datetime.now() - timedelta(weeks=1)
    
    try:
        cursor.execute("DELETE FROM feedback WHERE submitted_at < %s", (one_week_ago,))
        conn.commit()
    except mysql.connector.Error as err:
        print("Error deleting old feedback:", err)
    finally:
        cursor.close()
        conn.close()

# Store Survey Answers in knee.feedback with Name, Age & Email
@app.route('/submit_survey', methods=['POST'])
def submit_survey():
    try:
        delete_old_feedback() 
         
        data = request.json
        name = data.get('name')
        age = data.get('age')
        email = data.get('email')
        stiffness = data.get('stiffness')
        pain_frequency = data.get('pain_frequency')
        activity_limit = data.get('activity_limit')
        rising_pain = data.get('rising_pain')
        kneeling_pain = data.get('kneeling_pain')
        squatting_pain = data.get('squatting_pain')
        household_activities = data.get('household_activities')
        jumping_pain = data.get('jumping_pain')
        running_pain = data.get('running_pain')
        sport_pain = data.get('sport_pain')
        qol = data.get('qol')
        one_week_ago = data.get('one_week_ago')

        if not name or not age or not email:
            return jsonify({"status": "error", "message": "Name, age, and email are required!"}), 400

        conn = connect_db()
        cursor = conn.cursor()

        query = """
            INSERT INTO feedback (name, age, email, stiffness, pain_frequency, activity_limit,
                rising_pain, kneeling_pain, squatting_pain, household_activities,
                jumping_pain, running_pain, sport_pain, qol, submitted_at) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
        """
        values = (name, age, email, stiffness, pain_frequency, activity_limit, rising_pain,
                  kneeling_pain, squatting_pain, household_activities,
                  jumping_pain, running_pain, sport_pain, qol)

        cursor.execute(query, values)
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"status": "success", "message": "Survey responses saved successfully"})

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/calculate_score/<email>', methods=['GET'])
def get_score(email):
    conn = connect_db()
    cursor = conn.cursor()
    
   # Check if user has feedback within 1 week
    one_week_ago = datetime.now() - timedelta(weeks=1)
    cursor.execute("""
        SELECT stiffness_score, pain_score, qol_score, average_score, submitted_at 
        FROM feedback WHERE email = %s AND submitted_at >= %s
    """, (email, one_week_ago))
    
    existing_score = cursor.fetchone()

    stiffness_score = None
    pain_score = None
    qol_score = None
    average_score = None
    
    if existing_score:
        stiffness_score, pain_score, qol_score, average_score = existing_score[:4]
    
    # Now you can add a nested if block here
    if (stiffness_score is not None 
        and pain_score is not None 
        and qol_score is not None 
        and average_score is not None):
        
        # If all scores are non-null, return them
        cursor.close()
        conn.close()
        return jsonify({
            "Stiffness": stiffness_score,
            "Pain": pain_score,
            "QOL": qol_score,
            "AverageScore": average_score,
            "message": "Using previously stored score."
        })
    else:
        # If scores are null, proceed to recalculate them
        # Indent properly here, or just continue
        pass

# If there is no existing_score or we want to do something outside that if
# put the rest of your code here (aligned to the left with if existing_score:)


    # Fetch all survey responses
    cursor.execute("""
        SELECT stiffness, pain_frequency, activity_limit, rising_pain, 
               kneeling_pain, squatting_pain, household_activities, 
               jumping_pain, running_pain, sport_pain, qol
        FROM feedback WHERE email = %s
    """, (email,))
    survey_data = cursor.fetchone()
   
    if not survey_data:
         cursor.close()
         conn.close()
         return jsonify({"error": "No survey data found for user."})

    # Define the score mapping
    score_mapping = {"None": 0, "Mild": 1, "Moderate": 2, "Severe": 3, "Extreme": 4}
    
    # Convert survey responses to numerical scores
    raw_scores = [score_mapping.get(value, 0) for value in survey_data]

    # Assign scores to new categories
    stiffness_raw = raw_scores[0]  # Only Question 1
    pain_raw = sum(raw_scores[1:10])  # Questions 2 to 10
    qol_raw = raw_scores[10]  # Question 11

    # Maximum possible scores for each category
    max_scores = {
        "stiffness": 4, 
        "pain": 36,      
        "qol": 4         
    }

    # Logarithmic scaling function
    def log_scaled_score(raw, max_val):
        return round(100 * (1 - (math.log(1 + raw) / math.log(1 + max_val))))

    # Calculate transformed scores
    stiffness_transformed = log_scaled_score(stiffness_raw, 4)
    pain_transformed = log_scaled_score(pain_raw, 36)
    qol_transformed = log_scaled_score(qol_raw, 4)

    # Compute the final average score
    average_score = round((stiffness_transformed + pain_transformed + qol_transformed) / 3, 2)

        # Store calculated scores in database
    cursor.execute("""
        UPDATE feedback SET stiffness_score=%s, pain_score=%s, qol_score=%s, average_score=%s 
        WHERE email=%s
    """, (stiffness_transformed, pain_transformed, qol_transformed, average_score, email))

    conn.commit()
    cursor.close()
    conn.close()

    cursor.close()
    conn.close()
    # Return transformed scores and average
    return jsonify({
        "Stiffness": stiffness_transformed,
        "Pain": pain_transformed,
        "QOL": qol_transformed,
        "AverageScore": average_score,
        "message": "Calculated new score."
        
    })
VIDEO_LINKS = {
     "0-12" : [
            #yourvideo
    ],
    "12-29" : [
       #yourvideo
    ],
    "29-56" : [
       #yourvideo
    ],
    "56-100" : [
        #yourvideo
    ]
}

# Home Page
@app.route('/')
def home():
    return render_template("test3.html")

@app.route("/refresh_score", methods=["POST"])
def refresh_score():
    email = request.form.get("email")
    if not email:
        return "Email not provided", 400

    conn = connect_db()
    cursor = conn.cursor()
    # Get the most recent average_score for this user
    cursor.execute("""
        SELECT average_score
        FROM feedback
        WHERE email = %s
        ORDER BY submitted_at DESC
        LIMIT 1
    """, (email,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()

    if not row or row[0] is None:
        return "No computed average score found for user", 404

    average_score = row[0]

    # Determine score range
    def get_score_range(score):
        if 0 <= score < 12:
            return "0-12"
        elif 12 <= score < 29:
            return "12-29"
        elif 29 <= score < 56:
            return "29-56"
        else:
            return "56-100"

    score_range = get_score_range(average_score)
    videos = VIDEO_LINKS.get(score_range, [])

    return render_template(
        "videos.html",
        score_range=score_range,
        videos=videos,
        average_score=average_score
    )

  
# Handle Registration Request
@app.route('/register', methods=['POST'])
def register():
    name = request.form['name']
    email = request.form['email']
    password = request.form['password']
    age = request.form['age']
    gender = request.form['gender']
    
    error = insert_user(name, email, password, age, gender)
    if error:
        return jsonify({"status": "error", "message": error})

    return jsonify({"status": "success", "message": "User registered successfully!"})

# Handle Login Request
@app.route('/login', methods=['POST'])
def login():
    email = request.form['email']
    password = request.form['password']

    if validate_user(email, password):
        return jsonify({"status": "success", "message": f"Hi {email}, you are welcomed!"})
    return jsonify({"status": "error", "message": "Invalid credentials. Please register first."})




if __name__ == '__main__':
    app.run(debug=True)
