# Models Documentation

## Event Model

The `Event` model represents an event in the system. Below are the details of the schema:

- **eventName**: 
  - Type: `String`
  - Required: `true`
  - Description: The name of the event.

- **description**: 
  - Type: `String`
  - Required: `true`
  - Description: A brief description of the event.

- **date**: 
  - Type: `Date`
  - Default: `Date.now`
  - Description: The date of the event.

- **proofUrl**: 
  - Type: `String`
  - Required: `true`
  - Description: URL to the proof of the event.

- **priceMoney**: 
  - Type: `Number`
  - Description: The prize money for the event.

- **status**: 
  - Type: `String`
  - Enum: `['Pending', 'Approved', 'Rejected']`
  - Default: `Pending`
  - Description: The status of the event.

- **category**: 
  - Type: `String`
  - Enum: `['Hackathon', 'Ideathon', 'Coding', 'Global-Certificates', 'Workshop', 'Conference', 'Others']`
  - Required: `true`
  - Description: The category of the event.

- **positionSecured**: 
  - Type: `String`
  - Enum: `['First', 'Second', 'Third', 'Participated', null]`
  - Default: `null`
  - Description: The position secured in the event.

- **pointsEarned**: 
  - Type: `Number`
  - Default: `0`
  - Description: The points earned from the event.

- **submittedBy**: 
  - Type: `ObjectId`
  - Ref: `student`
  - Required: `true`
  - Description: The student who submitted the event.

- **approvedBy**: 
  - Type: `ObjectId`
  - Ref: `teacher`
  - Description: The teacher who approved the event.

### Indexes

- `submittedBy`: Index for frequent queries on the student who submitted the event.
- `approvedBy`: Index for frequent queries on the teacher who approved the event.
- `status`: Index for frequent queries on the status of the event.

## Teacher Model

The `Teacher` model represents a teacher in the system. Below are the details of the schema:

- **name**: 
  - Type: `String`
  - Required: `true`
  - Description: The name of the teacher.

- **email**: 
  - Type: `String`
  - Required: `true`
  - Unique: `true`
  - Description: The email of the teacher.

- **password**: 
  - Type: `String`
  - Required: `true`
  - Description: The password of the teacher.

- **profileImg**: 
  - Type: `String`
  - Default: `null`
  - Description: The profile image URL of the teacher.

- **registerNo**: 
  - Type: `String`
  - Required: `true`
  - Unique: `true`
  - Description: The registration number of the teacher.

- **classes**: 
  - Type: `Array`
  - Items: `ObjectId`
  - Ref: `Class`
  - Description: The classes assigned to the teacher.

### Methods

- `generateAuthToken`: Generates an authentication token for the teacher.
- `comparePassword`: Compares the provided password with the stored password.
- `hashedPassword`: Hashes the provided password.

## Student Model

The `Student` model represents a student in the system. Below are the details of the schema:

- **name**: 
  - Type: `String`
  - Required: `true`
  - Description: The name of the student.

- **profileImg**: 
  - Type: `String`
  - Default: `null`
  - Description: The profile image URL of the student.

- **email**: 
  - Type: `String`
  - Required: `true`
  - Unique: `true`
  - Description: The email of the student.

- **registerNo**: 
  - Type: `String`
  - Required: `true`
  - Unique: `true`
  - Description: The registration number of the student.

- **password**: 
  - Type: `String`
  - Required: `true`
  - Select: `false`
  - Description: The password of the student.

- **class**: 
  - Type: `ObjectId`
  - Ref: `Class`
  - Description: The class the student belongs to.

- **totalPoints**: 
  - Type: `Number`
  - Default: `0`
  - Description: The total points earned by the student.

- **eventsParticipated**: 
  - Type: `Array`
  - Items: `ObjectId`
  - Ref: `Event`
  - Description: The events the student has participated in.

### Methods

- `generateAuthToken`: Generates an authentication token for the student.
- `comparePassword`: Compares the provided password with the stored password.
- `hashedPassword`: Hashes the provided password.

## Class Model

The `Class` model represents a class in the system. Below are the details of the schema:

- **className**: 
  - Type: `String`
  - Required: `true`
  - Unique: `true`
  - Description: The name of the class.

- **teacher**: 
  - Type: `ObjectId`
  - Ref: `teacher`
  - Description: The teacher assigned to the class.

- **students**: 
  - Type: `Array`
  - Items: `ObjectId`
  - Ref: `student`
  - Description: The students in the class.

## Admin Model

The `Admin` model represents an admin in the system. Below are the details of the schema:

- **name**: 
  - Type: `String`
  - Required: `true`
  - Description: The name of the admin.

- **email**: 
  - Type: `String`
  - Required: `true`
  - Unique: `true`
  - Description: The email of the admin.

- **password**: 
  - Type: `String`
  - Required: `true`
  - Description: The password of the admin.

### Methods

- `generateAuthToken`: Generates an authentication token for the admin.
- `comparePassword`: Compares the provided password with the stored password.
- `hashPassword`: Hashes the provided password.
