from faker import Faker
from pymongo import MongoClient
import bcrypt
import random

# Initialize Faker
faker = Faker()

# MongoDB setup
client = MongoClient("mongodb://localhost:27017")
db = client["leaderboard"]

# Collections
advisors_col = db["academicadvisors"]
classes_col = db["classes"]

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_academic_advisor(department, is_hod=False):
    name = faker.name()
    email = "hod@email.com" if is_hod else faker.unique.email()
    raw_password = "hodhodhod" if is_hod else faker.password()
    password = hash_password(raw_password)
    register_number = f"AA{faker.unique.random_number(digits=8)}"
    
    advisor = {
        "name": name,
        "email": email,
        "password": password,
        "rawPassword": raw_password,
        "registerNo": register_number,
        "role": "hod" if is_hod else "advisor",
        "department": department,
        "assignedClasses": [],
        "profileImg": "http://res.cloudinary.com/dyiph7is1/image/upload/v1736782080/lbblteg4fwnrlg2jci5v.jpg"
    }
    
    print(f"Created {'HOD' if is_hod else 'Advisor'}: {name} ({email})")
    if not is_hod:
        print(f"Password for {email}: {raw_password}")  # Print password for reference
    return advisor

def main():
    # First, clear existing advisors
    advisors_col.delete_many({})
    
    # Get all classes
    all_classes = list(classes_col.find())
    if not all_classes:
        print("No classes found in database!")
        return
    
    # Create HOD first
    hod = create_academic_advisor("Computer Science", is_hod=True)
    advisors_col.insert_one(hod)
    
    # Create 4 academic advisors
    departments = ["Computer Science", "Information Technology", "Artificial Intelligence", "Data Science"]
    
    # Split classes into 4 groups
    classes_per_advisor = len(all_classes) // 4
    class_groups = [all_classes[i:i + classes_per_advisor] for i in range(0, len(all_classes), classes_per_advisor)]
    
    # Create advisors and assign classes
    for i, (department, classes) in enumerate(zip(departments, class_groups)):
        advisor = create_academic_advisor(department)
        advisor["assignedClasses"] = [cls["_id"] for cls in classes]
        
        # Insert advisor and get the inserted ID
        result = advisors_col.insert_one(advisor)
        advisor_id = result.inserted_id  # Get the _id of the inserted document
        
        # Update classes with advisor reference
        for class_id in advisor["assignedClasses"]:
            classes_col.update_one(
                {"_id": class_id},
                {"$set": {"academicAdvisor": advisor_id}}  # Use the obtained _id
            )
        
        print(f"Assigned {len(classes)} classes to advisor {advisor['name']}")

if __name__ == "__main__":
    main()
    print("\nFake data generation completed!")