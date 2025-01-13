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

def create_student(class_id):
    name = faker.name()
    email = faker.unique.email()
    raw_password = faker.password()
    password = hash_password(raw_password)
    print(f"Created student: {name} ({email}) in class ID {class_id}")
    return {
        "name": name,
        "profileImg": "http://res.cloudinary.com/dyiph7is1/image/upload/v1736782080/lbblteg4fwnrlg2jci5v.jpg",
        "email": email,
        "registerNo": faker.unique.uuid4(),
        "password": password,
        "rawPassword": raw_password,
        "class": class_id,
        "totalPoints": random.randint(0, 100),
        "eventsParticipated": []
    }

def create_event(event_name, submitted_by, category):
    print(f"Creating event: {event_name} (Category: {category})")
    pdf_name = "1736790121145-142319603.pdf"
    return {
        "eventName": event_name,
        "description": faker.text(max_nb_chars=200),
        "date": datetime.combine(faker.date_between(start_date="-2y", end_date="today"), datetime.min.time()),
        "proofUrl": "http://res.cloudinary.com/dyiph7is1/image/upload/v1736782080/lbblteg4fwnrlg2jci5v.jpg",
        "pdfDocument": pdf_name,
        "priceMoney": random.randint(0, 5000),
        "status": random.choice(["Pending", "Approved", "Rejected"]),
        "category": category,
        "positionSecured": "Participated" if category in ["Workshop", "Conference", "Others"] else None,
        "pointsEarned": random.randint(0, 100),
        "submittedBy": submitted_by,
        "approvedBy": None  # Will be set later if approved
    }

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

    print("Creating classes and teachers...")
    classes = []
    teachers = []
    teacher_ids = []
    for char in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":
        for num in range(1, 3):  # A1, A2, ..., Z1, Z2
            class_name = f"{char}{num}"
            teacher = create_teacher()
            teacher_id = teachers_col.insert_one(teacher).inserted_id
            teacher_ids.append(teacher_id)

            class_data = create_class(class_name, teacher_id)
            class_id = classes_col.insert_one(class_data).inserted_id
            classes.append((class_id, teacher_id))

    print("Creating a pool of unique events...")
    event_names = [faker.unique.catch_phrase() for _ in range(50)]
    event_categories = ["Hackathon", "Ideathon", "Coding", "Global-Certificates", "Workshop", "Conference", "Others"]

    print("Assigning events to students...")
    for class_id, teacher_id in classes:
        student_ids = []
        for _ in range(60):  # 60 students per class
            student = create_student(class_id)
            student_id = students_col.insert_one(student).inserted_id
            student_ids.append(student_id)

            # Assign events to some students with varying participation
            event_count = random.choices([0, 3, 4, 5, 6], weights=[5, 30, 30, 25, 10], k=1)[0]
            assigned_events = set()
            for _ in range(event_count):
                event_name = random.choice(event_names)
                category = random.choice(event_categories)

                if category in ["Hackathon", "Ideathon", "Coding", "Global-Certificates"]:
                    # Ensure unique position awards for competitive categories
                    if event_name in assigned_events:
                        continue
                    assigned_events.add(event_name)

                    event = events_col.find_one({"eventName": event_name, "category": category})
                    if event:
                        if not event.get("positionSecured"):
                            position = random.choice(["First", "Second", "Third", "Participated"])
                            event_id = event["_id"]
                            events_col.update_one(
                                {"_id": event_id},
                                {"$set": {"positionSecured": position, "submittedBy": student_id}}
                            )
                            students_col.update_one(
                                {"_id": student_id},
                                {"$push": {"eventsParticipated": event_id}}
                            )
                        elif event["positionSecured"] != "Participated":
                            continue
                    else:
                        position = random.choice(["First", "Second", "Third", "Participated"])
                        event = create_event(event_name, student_id, category)
                        event["positionSecured"] = position
                        event_id = events_col.insert_one(event).inserted_id
                        students_col.update_one(
                            {"_id": student_id},
                            {"$push": {"eventsParticipated": event_id}}
                        )
                else:
                    # Non-competitive categories always have "Participated"
                    event = create_event(event_name, student_id, category)
                    event["positionSecured"] = "Participated"
                    event_id = events_col.insert_one(event).inserted_id
                    students_col.update_one(
                        {"_id": student_id},
                        {"$push": {"eventsParticipated": event_id}}
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
