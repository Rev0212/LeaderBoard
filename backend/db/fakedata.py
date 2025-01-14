from faker import Faker
from pymongo import MongoClient
import random
import bcrypt
from datetime import datetime, timedelta

# Initialize Faker
faker = Faker()

# MongoDB setup
client = MongoClient("mongodb://localhost:27017")  # Replace with your MongoDB URI
db = client["leaderboard"]

# Collections
teachers_col = db["teachers"]
students_col = db["students"]
classes_col = db["classes"]
events_col = db["events"]

# Helper functions
def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def generate_register_number(year):
    return f"RA{year}{random.randint(100000000, 999999999)}"

def create_teacher():
    name = faker.name()
    email = faker.unique.email()
    raw_password = faker.password()
    password = hash_password(raw_password)
    print(f"Created teacher: {name} ({email})")
    return {
        "name": name,
        "email": email,
        "password": password,
        "rawPassword": raw_password,
        "profileImg": "http://res.cloudinary.com/dyiph7is1/image/upload/v1736782080/lbblteg4fwnrlg2jci5v.jpg",
        "registerNo": faker.unique.uuid4(),
        "classes": []
    }

def create_student(class_id, year):
    name = faker.name()
    email = faker.unique.email()
    raw_password = faker.password()
    password = hash_password(raw_password)
    register_number = generate_register_number(year)
    print(f"Created student: {name} ({email}) with Register No: {register_number} in class ID {class_id}")
    return {
        "name": name,
        "profileImg": "http://res.cloudinary.com/dyiph7is1/image/upload/v1736782080/lbblteg4fwnrlg2jci5v.jpg",
        "email": email,
        "registerNo": register_number,
        "password": password,
        "rawPassword": raw_password,
        "class": class_id,
        "totalPoints": 0,
        "eventsParticipated": []
    }

def create_event(event_name, submitted_by, category, approved_by=None, status="Pending"):
    print(f"Creating event: {event_name} (Category: {category})")
    pdf_name = f"{int(datetime.now().timestamp() * 1000)}-{random.randint(100000000, 999999999)}.pdf"
    event = {
        "eventName": event_name,
        "description": faker.text(max_nb_chars=200),
        "date": datetime.combine(faker.date_between(start_date="-2y", end_date="today"), datetime.min.time()),
        "proofUrl": "http://res.cloudinary.com/dyiph7is1/image/upload/v1736782080/lbblteg4fwnrlg2jci5v.jpg",
        "pdfDocument": pdf_name,
        "priceMoney": random.randint(0, 5000),
        "status": status,
        "category": category,
        "positionSecured": "Participated" if category in ["Workshop", "Conference", "Others"] else random.choice(["First", "Second", "Third"]),
        "pointsEarned": 0 if status == "Rejected" else random.randint(0, 100),
        "submittedBy": submitted_by
    }
    if status != "Pending":
        event["approvedBy"] = approved_by
    return event

def create_class(name, teacher_id):
    print(f"Creating class: {name} with teacher ID {teacher_id}")
    return {
        "className": name,
        "teacher": teacher_id,
        "students": []
    }

# Populate database
def populate_database():
    print("Clearing existing data...")
    teachers_col.delete_many({})
    students_col.delete_many({})
    classes_col.delete_many({})
    events_col.delete_many({})

    print("Creating teachers...")
    teachers = []
    for _ in range(26):
        teacher = create_teacher()
        teacher_id = teachers_col.insert_one(teacher).inserted_id
        teachers.append((teacher, teacher_id))

    print("Creating classes with assigned teachers...")
    classes = []
    years = ["22", "23"]
    for year in years:
        for char in "ABCD":
            for num in range(1, 3):  # A1, A2, ..., Z1, Z2
                class_name = f"{char}{num}"
                teacher = teachers[len(classes) % len(teachers)]
                teacher_id = teacher[1]

                if not classes_col.find_one({"className": class_name}):
                    class_data = create_class(class_name, teacher_id)
                    class_id = classes_col.insert_one(class_data).inserted_id
                    classes.append((class_id, teacher_id, year))

                    # Update teacher's classes
                    teachers_col.update_one(
                        {"_id": teacher_id},
                        {"$push": {"classes": class_id}}
                    )

    print("Creating students and assigning them to classes...")
    for class_id, teacher_id, year in classes:
        student_ids = []
        for _ in range(20):
            student = create_student(class_id, year)
            student_id = students_col.insert_one(student).inserted_id
            student_ids.append(student_id)

            # Create an event for the student
            event_name = faker.unique.catch_phrase()
            category = random.choice(["Hackathon", "Ideathon", "Coding", "Global-Certificates", "Workshop", "Conference", "Others"])

            # Teacher's decision for the event
            status = random.choices(["Approved", "Rejected", "Pending"], weights=[40, 30, 30], k=1)[0]
            approved_by = teacher_id if status != "Pending" else None

            event = create_event(event_name, student_id, category, approved_by, status)
            event_id = events_col.insert_one(event).inserted_id

            # Update student's eventsParticipated
            students_col.update_one(
                {"_id": student_id},
                {"$push": {"eventsParticipated": event_id}}
            )

            # Add points for approved or participated events
            if status in ["Approved", "Pending"]:
                points = events_col.find_one({"_id": event_id})["pointsEarned"]
                students_col.update_one(
                    {"_id": student_id},
                    {"$inc": {"totalPoints": points}}
                )

        # Update class with students
        classes_col.update_one(
            {"_id": class_id},
            {"$set": {"students": student_ids}}
        )

    print("Database populated successfully!")

# Run the script
if __name__ == "__main__":
    populate_database()
