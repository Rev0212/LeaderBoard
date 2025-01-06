Event Reports API
Overview
The Event Reports API provides various endpoints to fetch detailed analytics and insights about events. This includes information such as total prize money, top students, popular categories, approval rates, trends, and more. The API allows users to filter data based on various criteria like time periods (monthly, quarterly, yearly), class names, and event categories.

Endpoints
1. Get Total Prize Money
Endpoint: /total-prize-money

Description: Retrieves the total prize money won in events.

Query Parameters:

filterType: The type of filter (e.g., 'monthly', 'quarterly', 'yearly'). Default is 'monthly'.
Response:

json
Copy code
{
  "totalPrizeMoney": 150000
}
2. Get Total Prize Money by Class
Endpoint: /total-prize-money/class/:className

Description: Retrieves the total prize money won by a specific class.

Parameters:

className: Name of the class (e.g., 'Class A').
filterType: The type of filter (e.g., 'monthly'). Default is 'monthly'.
Response:

json
Copy code
{
  "totalPrizeMoney": 50000
}
3. Get Top Students
Endpoint: /top-students

Description: Retrieves the top students based on points earned.

Query Parameters:

limit: Number of results to return (default: 10).
filterType: The type of filter (e.g., 'monthly'). Default is 'monthly'.
Response:

json
Copy code
{
  "topStudents": [
    { "submittedBy": "Student A", "totalPoints": 150 },
    { "submittedBy": "Student B", "totalPoints": 130 },
    { "submittedBy": "Student C", "totalPoints": 120 }
  ]
}
4. Get Top Performers by Category
Endpoint: /top-performers/:category

Description: Retrieves top performers for a specific category.

Parameters:

category: Event category (e.g., 'Coding').
limit: Number of results to return (default: 10).
filterType: The type of filter (e.g., 'monthly'). Default is 'monthly'.
Response:

json
Copy code
{
  "topPerformers": [
    { "submittedBy": "Student D", "totalPoints": 180 },
    { "submittedBy": "Student E", "totalPoints": 160 },
    { "submittedBy": "Student F", "totalPoints": 140 }
  ]
}
5. Get Popular Categories
Endpoint: /popular-categories

Description: Retrieves the most popular event categories.

Query Parameters:

limit: Number of results to return (default: 10).
filterType: The type of filter (e.g., 'monthly'). Default is 'monthly'.
Response:

json
Copy code
{
  "popularCategories": [
    { "category": "Coding", "count": 200 },
    { "category": "Design", "count": 180 },
    { "category": "Photography", "count": 150 }
  ]
}
6. Get Approval Rates
Endpoint: /approval-rates

Description: Retrieves the approval rates of events.

Query Parameters:

filterType: The type of filter (e.g., 'monthly'). Default is 'monthly'.
Response:

json
Copy code
{
  "approvalRates": [
    { "status": "approved", "count": 75 },
    { "status": "rejected", "count": 10 },
    { "status": "pending", "count": 15 }
  ]
}
7. Get Trends
Endpoint: /trends/:filterType

Description: Retrieves event trends over the years.

Parameters:

filterType: The type of filter (e.g., 'monthly', 'quarterly'). Default is 'monthly'.
Response:

json
Copy code
{
  "trends": [
    { "year": 2024, "count": 50 },
    { "year": 2023, "count": 45 }
  ]
}
8. Get Class-Wise Participation
Endpoint: /class-wise-participation/:className

Description: Retrieves class-wise participation based on event status.

Parameters:

className: Name of the class (e.g., 'Class A').
filterType: The type of filter (e.g., 'monthly'). Default is 'monthly'.
Response:

json
Copy code
{
  "classWiseParticipation": [
    { "status": "approved", "count": 40 },
    { "status": "rejected", "count": 5 }
  ]
}