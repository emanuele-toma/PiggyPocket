## PiggyPocket API Documentation - Authentication

To access the protected resources of the PiggyPocket API, users must authenticate. This guide explains how users can authenticate using the combined authentication process.

The combined authentication process accepts an authentication token provided by the user through the request header (`Authorization`) or the request body (`token`).

The authentication token can be obtained through the user's settings page.

Here's how to authenticate:

1. Include the authentication token in the request using one of the following methods:
   - **Header**: Add the `Authorization` header to your request with the token value. The header should follow the schema `Authorization: <token>`. For example:

     ```
     Authorization: <authentication_token>
     ```

   - **Request Body**: Include the authentication token in the request body as a parameter with the name `token`. For example:

     ```
     POST /api/request HTTP/1.1
     Content-Type: application/json

     {
       "token": "<authentication_token>"
     }
     ```

2. The server will verify the provided authentication token. Here's how the verification occurs:
   - The token is extracted from the `Authorization` header or the request body.
   - The token is hashed using the SHA-256 algorithm.
   - A database search is performed to find a user corresponding to the hashed token.
   - If the user is found in the database, the authentication is considered valid, and the user is authorized to access the protected resources.
   - If the user is not found in the database, the authentication is considered invalid, and an authentication error is returned.

If the authentication process is successful, the user will be authorized to access the protected resources of the PiggyPocket API. In case of authentication errors, an appropriate error message will be returned with HTTP status 401 (Unauthorized).

Make sure to include the correct authentication token in your request to access the protected resources of the PiggyPocket API.

*Remember to protect your authentication token and treat it as sensitive information. Do not share the token with others, and ensure to use secure connections (HTTPS) to protect the transmission of the token during API requests.*

## PiggyPocket API Documentation - Users Endpoint

This document provides a description of the API endpoint for retrieving current user information (`/api/users/@me`) in the PiggyPocket application.

### Database Structure

The database contains the `users` table with the following fields:

- `id`: User identifier (of type `TEXT`).
- `name`: User's name (of type `TEXT`).
- `email`: User's email address (of type `TEXT`).
- `picture`: URL of the user's profile picture (of type `TEXT`).
- `token`: User's authentication token (of type `TEXT`).

### API Endpoint

The following API endpoint is available for retrieving current user information:

- **GET /api/users/@me**

  This endpoint returns the information of the current user. The user must be authenticated to access this endpoint. The returned information includes the user's identifier (`id`), name (`name`), email address (`email`), and profile picture URL (`picture`).

  Example request:
  ```
  GET /api/users/@me HTTP/1.1
  Host: example.com
  Authorization: <authentication_token>
  ```

  Example response:
  ```json
  {
    "id": "123456",
    "name": "Mario Rossi",
    "email": "mario@example.com",
    "picture": "https://example.com/profile.jpg"
  }
  ```

  **Notes**:
  - Ensure to include the `Authorization` header in the request with the valid authentication token to access the information of the current user.
  - In case of missing authentication or an invalid authentication token, an HTTP status 401 (Unauthorized) will be returned with an appropriate error message.



*Remember to protect user information and treat it as sensitive data. Ensure to use secure connections (HTTPS) to protect data transmission during API requests.*

## PiggyPocket API Documentation - Transactions Endpoint

This document provides a description of the API endpoint for retrieving current user transactions (`/api/transactions/@me`) in the PiggyPocket application.

### Database Structure

The database contains the `expenses` table with the following fields:

- `id`: Transaction identifier (of type `TEXT`).
- `user_id`: Identifier of the user who owns the transaction (of type `TEXT`).
- `date`: Transaction date (of type `TEXT`).
- `amount`: Transaction amount (of type `REAL`).
- `description`: Transaction description (of type `TEXT`).
- `category`: Transaction category (of type `TEXT`).
- `payee`: Payee of the transaction (of type `TEXT`).

### API Endpoint

The following API endpoint is available for retrieving transactions of the current user:

- **GET /api/transactions/@me**

  This endpoint returns transactions of the current user with filtering and pagination options. The user must be authenticated to access this endpoint.

  Available query parameters:
  - `page` (optional): Page number for transaction pagination.
  - `category` (optional): Category of transactions to filter.
  - `type` (optional): Type of transactions to filter (`income` for income, any other value for expenses).
  - `date_span` (optional): Date span of transactions to filter (`week` for the current week, `month` for the current month, `year` for the current year).
  - `search` (optional): Search term to filter transactions based on description or payee.

  Example request:
  ```
  GET /api/transactions/@me?page=1&category=groceries&type=expense&date_span=month&search=food HTTP/1.1
  Host: example.com
  Authorization: <authentication_token>
  ```

  Example response:
  ```json
  {
    "expenses": [
      {
        "id": "123456",
        "user_id": "7890",
        "date": "2023-05-20",
        "amount": 25.0,
        "description": "Grocery shopping",
        "category": "groceries",
        "payee": "Supermarket XYZ"
      },
      {
        "id": "789012",
        "user_id": "7890",
        "date": "2023-05-18",
        "amount": 15.0,
        "description": "Lunch at restaurant",
        "category": "dining",
        "payee": "Restaurant ABC"
      }
    ],
    "totalPages": 3
  }
  ```

  **Notes**:
  - Ensure to include the `Authorization` header in the request with the valid authentication token to access transactions of the current user.
  - You can use query parameters to filter transactions based on your requirements.
  - Transactions are returned based on pagination, with a default number of transactions per page (10 in our case).
  - The response includes the `expenses` array containing transactions and the `totalPages` field indicating the total number of available pages based on filtered transactions.


*Remember to protect user information and treat it as sensitive data. Ensure to use secure connections (HTTPS) to protect data transmission during API requests.*

## PiggyPocket API Documentation - Transaction Detail Endpoint

This document provides a description of the API endpoint for retrieving specific transaction details of the current user (`/api/transactions/@me/:id`) in the PiggyPocket application.

### Database Structure

The database contains the `expenses` table with the following fields:

- `id`: Transaction identifier (of type `TEXT`).
- `user_id`: Identifier of the user who owns the transaction (of type `TEXT`).
- `date`: Transaction date (of type `TEXT`).
- `amount`: Transaction amount (of type `REAL`).
- `description`: Transaction description (of type `TEXT`).
- `category`: Transaction category (of type `TEXT`).
- `payee`: Payee of the transaction (of type `TEXT`).

### API Endpoint

The following API endpoint is available for retrieving specific transaction details of the current user:

- **GET /api/transactions/@me/:id**

  This endpoint returns the details of a specific transaction of the current user based on the provided transaction ID. The user must be authenticated to access this endpoint.

  URL Parameters:
  - `id`: ID of the transaction to retrieve.

  Example request:
  ```
  GET /api/transactions/@me/123456 HTTP/1.1
  Host: example.com
  Authorization: <authentication_token>
  ```

  Example response:
  ```json
  {
    "id": "123456",
    "user_id": "7890",
    "date": "2023-05-20",
    "amount": 25.0,
    "description": "Grocery shopping",
    "category": "groceries",
    "payee": "Supermarket XYZ"
  }
  ```

  **Notes**:
  - Ensure to include the `Authorization` header in the request with the valid authentication token to access the specific transaction of the current user.
  - The transaction ID is specified as a parameter in the URL.
  - The response returns the complete details of the transaction corresponding to the provided ID.

*Remember to protect user information and treat it as sensitive data. Ensure to use secure connections (HTTPS) to protect data transmission during API requests.*

## PiggyPocket API Documentation - Payee Image Endpoint

This document provides a description of the API endpoint for obtaining the image of a specific payee (`/api/payee_picture/:id`) in the PiggyPocket application.

### API Endpoint

The following API endpoint is available for obtaining the image of a specific payee:

- **GET /api/payee_picture/:id**

  This endpoint returns the image corresponding to the specified payee based on the provided ID. The image will be fetched from the `/assets/payees` folder of the PiggyPocket application.

  URL Parameters:
  - `id`: Payee ID.

  Example request:
  ```
  GET /api/payee_picture/123456 HTTP/1.1
  Host: example.com
  ```

  Example response:
  - If the payee's image exists in the `/assets/payees` folder with the name `123456.png`, the corresponding image will be returned.
  - If the payee's image does not exist, a default image named `default.png` from the `/assets/payees` folder will be returned.

  **Notes**:
  - The payee's ID is specified as a parameter in the URL.
  - Ensure that the `/assets/payees` folder contains payee images in the correct format (e.g., `123456.png`) and the default image `default.png`.
  - The response will return the image corresponding to the specified payee or the default image if the payee's image does not exist.

*Remember to protect user information and treat it as sensitive data. Ensure to use secure connections (HTTPS) to protect data transmission during API requests.*

## PiggyPocket API Documentation - User Categories Endpoint

This document provides a description of the API endpoint for obtaining user categories (`/api/categories/@me`) in the PiggyPocket application.

### API Endpoint

The following API endpoint is available for obtaining user categories:

- **GET /api/categories/@me**

  This endpoint returns a list of categories used by the user, including predefined default categories.

  Example request:
  ```
  GET /api/categories/@me HTTP/1.1
  Host: example.com
  ```

  Example response:
  ```
  [
    "Food",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Bills",
    "Health",
    "Travel",
    "Education"
  ]
  ```

  **Notes**:
  - The endpoint will return an array of categories that includes both user-used categories and predefined default categories.
  - User-used categories are retrieved from the `expenses` table of the database based on the current user's ID.
  - Predefined default categories are defined in the `defaultCategories` array in the code.

*Remember to protect user information and treat it as sensitive data. Ensure to use secure connections (HTTPS) to protect data transmission during API requests.*

## PiggyPocket API Documentation - User Payees Endpoint

This document provides a description of the API endpoint for obtaining user payees (`/api/payees/@me`) in the PiggyPocket application.

### API Endpoint

The following API endpoint is available for obtaining user payees:

- **GET /api/payees/@me**

  This endpoint returns a list of payees used by the user, including predefined default payees.

  Example request:
  ```
  GET /api/payees/@me HTTP/1.1
  Host: example.com
  ```

  Example response:
  ```
  [
    "Netflix",
    "Amazon",
    "Ebay",
    "Esselunga",
    "Coop",
    "Conad",
    "Carrefour",
    "Ipercoop",
    "Lidl",
    "Pam",
    ...
  ]
  ```

  **Notes**:
  - The endpoint will return an array of payees that includes both user-used payees and predefined default payees.
  - User-used payees are retrieved from the `expenses` table of the database based on the current user's ID.
  - Predefined default payees are defined in the `defaultPayees` array in the code.

*Remember to protect user information and treat it as sensitive data. Ensure to use secure connections (HTTPS) to protect data transmission during API requests.*

## PiggyPocket API Documentation - Add Transaction Endpoint

This document provides a description of the API endpoint for adding a new transaction (`/api/transactions/@me`) in the PiggyPocket application.

### Database Structure

The database contains the `expenses` table with the following fields:

- `id`: Transaction identifier (of type `TEXT`).
- `user_id`: Identifier of the transaction owner (of type `TEXT`).
- `date`: Transaction date (of type `TEXT`).
- `amount`: Transaction amount (of type `REAL`).
- `description`: Transaction description (of type `TEXT`).
- `category`: Transaction category (of type `TEXT`).
- `payee`: Transaction payee (of type `TEXT`).

### API Endpoint

The following API endpoint is available for adding a new transaction:

- **POST /api/transactions/@me**

  This endpoint allows adding a new transaction for the current user.

  Example request:
  ```
  POST /api/transactions/@me HTTP/1.1
  Host: example.com
  Content-Type: application/json

  {
    "payee": "Netflix",
    "category": "Subscriptions",
    "description": "Monthly subscription to Netflix",
    "amount": 12.99,
    "date": "2023-05-21"
  }
  ```

  Example success response:
  ```
  HTTP/1.1 201 Created
  Content-Type: application/json

  {
    "id": "12345"
  }
  ```

  Example error response:
  ```
  HTTP/1.1 400 Bad Request
  Content-Type: application/json

  {
    "error": "Payee is required"
  }
  ```

  **Notes**:
  - The endpoint requires user authentication to add a transaction to their account.
  - Transaction data is sent in the request body in JSON format.
  - Before adding the transaction, appropriate checks are made to verify the validity of the data:
    - Payee (`payee`) is required.
    - Category (`category`) is required.
    - Description (`description`) is required.
    - Amount (`amount`) is required and must be a number.
    - Date (`date`) is required and must be a valid date.
  - If all checks are passed successfully, the transaction is added to the database, and the ID of the newly created transaction is returned.
  - In case of errors during the transaction addition, an appropriate error message will be returned.

*Remember to protect user information and treat it as sensitive data. Ensure to use secure connections (HTTPS) to protect data transmission during API requests.*

## PiggyPocket API Documentation - Update Transaction Endpoint

This document provides a description of the API endpoint for updating an existing transaction (`/api/transactions/@me/:id`) in the PiggyPocket application.

### Database Structure

The database contains the `expenses` table with the following fields:

- `id`: Transaction identifier (of type `TEXT`).
- `user_id`: Identifier of the transaction owner (of type `TEXT`).
- `date`: Transaction date (of type `TEXT`).
- `amount`: Transaction amount (of type `REAL`).
- `description`: Transaction description (of type `TEXT`).
- `category`: Transaction category (of type `TEXT`).
- `payee`: Transaction payee (of type `TEXT`).

### API Endpoint

The following API endpoint is available for updating an existing transaction:

- **PUT /api/transactions/@me/:id**

  This endpoint allows modifying a transaction for the current user, specifying the ID of the transaction to be modified as part of the URL.

  Example request:
  ```
  PUT /api/transactions/@me/12345 HTTP/1.1
  Host: example.com
  Content-Type: application/json

  {
    "payee": "Netflix",
    "category": "Entertainment",
    "description": "Monthly subscription to Netflix",
    "amount": 15.99,
    "date": "2023-05-21"
  }
  ```

  Example success response:
  ```
  HTTP/1.1 200 OK
  Content-Type: application/json

  {
    "id": "12345"
  }
  ```

  Example error response:
  ```
  HTTP/1.1 400 Bad Request
  Content-Type: application/json

  {
    "error": "Payee is required"
  }
  ```

  **Notes**:
  - The endpoint requires user authentication to modify a transaction in their account.
  - The ID of the transaction to be modified is specified as part of the URL.
  - The transaction data to be modified is sent in the request body in JSON format.
  - Before making the modification, appropriate checks are made to verify the validity of the data:
    - Payee (`payee`) is required.
    - Category (`category`) is required.
    - Description (`description`) is required.
    - Amount (`amount`) is required and must be a number.
    - Date (`date`) is required and must be a valid date.
  - If all checks are passed successfully, the transaction in the database is updated with the new provided data.
  - In case of success, the ID of the updated transaction is returned.
  - In case of errors during the transaction update, an appropriate error message will be returned.

*Remember to protect user information and treat it as sensitive data. Ensure to use secure connections (HTTPS) to protect data transmission during API requests.*

---

## PiggyPocket API Documentation - Delete Transaction Endpoint

This document provides a description of the API endpoint for deleting an existing transaction (`/api/transactions/@me/:id`) in the PiggyPocket application.

### Database Structure

The database contains the `expenses` table with the following fields:

- `id`: Transaction identifier (of type `TEXT`).
- `user_id`: Identifier of the transaction owner (of type `TEXT`).
- `date`: Transaction date (of type `TEXT`).
- `amount`: Transaction amount (of type `REAL`).
- `description`: Transaction description (of type `TEXT`).
- `category`: Transaction category (of type `TEXT`).
- `payee`: Transaction payee (of type `TEXT`).

### API Endpoint

The following API endpoint is available for deleting an existing transaction:

- **DELETE /api/transactions/@me/:id**

  This endpoint allows deleting a transaction for the current user, specifying the ID of the transaction to be deleted as part of the URL.

  Example request:
  ```
  DELETE /api/transactions/@me/12345 HTTP/1.1
  Host: example.com
  ```

  Example success response:
  ```
  HTTP/1.1 200 OK
  Content-Type: application/json

  {
    "id": "12345"
  }
  ```

  Example error response:
  ```
  HTTP/1.1 500 Internal Server Error
  Content-Type: application/json

  {
    "error": "Something went wrong, please try again later..."
  }
  ```

  **Notes**:
  - The endpoint requires user authentication to delete a transaction from their account.
  - The ID of the transaction to be deleted is specified as part of the URL.
  - If there is a transaction corresponding to the specified ID and belonging to the current user, it will be deleted from the database.
  - In case of success, the ID of the deleted transaction is returned.
  - In case of errors during the transaction deletion, an appropriate error message will be returned.

*Remember to protect user information and treat it as sensitive data. Ensure to use secure connections (HTTPS) to protect data transmission during API requests.*

## PiggyPocket API Documentation - User Statistics Endpoint

This document provides a description of the API endpoint for retrieving user statistics (`/api/stats/@me`) in the PiggyPocket application.

### API Endpoint

The following API endpoint is available for retrieving user statistics:

- **GET /api/stats/@me**

  This endpoint allows fetching statistics related to the current user's expenses and earnings for the last 12 months.

  Example request:
  ```
  GET /api/stats/@me HTTP/1.1
  Host: example.com
  Authorization: <token>
  ```

  Example success response:
  ```
  HTTP/1.1 200 OK
  Content-Type: application/json

  {
    "category": [
      {
        "category": "Groceries",
        "total_amount": 250.0
      },
      {
        "category": "Transportation",
        "total_amount": 120.0
      },
      ...
    ],
    "monthlyExpenses": [
      {
        "month": "2022-05",
        "total_amount": 350.0
      },
      {
        "month": "2022-06",
        "total_amount": 450.0
      },
      ...
    ],
    "monthlyIncome": [
      {
        "month": "2022-05",
        "total_amount": 2000.0
      },
      {
        "month": "2022-06",
        "total_amount": 1800.0
      },
      ...
    ],
    "weeklyTransactions": [
      {
        "day_of_week": "1",
        "transaction_count": 5
      },
      {
        "day_of_week": "2",
        "transaction_count": 8
      },
      ...
    ]
  }
  ```

  Example error response:
  ```
  HTTP/1.1 500 Internal Server Error
  Content-Type: application/json

  {
    "error": "Error retrieving stats data"
  }
  ```

  **Notes**:
  - The endpoint requires user authentication via the access token.
  - The provided statistics include information about expense categories, monthly expenses, monthly earnings, and weekly transactions of the user for the last 12 months.
  - Data is grouped and returned in JSON format.
  - In case of success, a JSON object containing the statistics is returned.
  - In case of errors during the retrieval of statistical data, an appropriate error message will be returned.

*Remember to protect user information and treat it as sensitive data. Ensure to use secure connections (HTTPS) to protect data transmission during API requests.*

---

## PiggyPocket API Documentation - User Data Endpoint

This document provides a description of the API endpoint for retrieving all user data (`/api/data/@me`) in the PiggyPocket application.

### API Endpoint

The following API endpoint is available for retrieving all user data:

- **GET /api/data/@me**

  This endpoint allows fetching all user information, including expenses and associated reports.

  Example request:
  ```
  GET /api/data/@me HTTP/1.1
  Host: example.com
  Authorization: <token>
  ```

  Example success response:
  ```
  HTTP/1.1 200 OK
  Content-Type: application/json

  {
    "user": {
      "id": "123456789",
      "name": "Mario Rossi",
      "email": "mario@example.com",
      "picture": "https://example.com/profile-picture.jpg"
    },
    "expenses": [
      {
        "id": "tr123456789",
        "user_id": "123456789",
        "date": "2023-05-20",
        "amount": 50.0,
        "description": "Grocery shopping",
        "category": "Groceries",
        "payee": "Esselunga"
      },
      {
        "id": "tr987654321",
        "user_id": "123456789",
        "date": "2023-05-18",
        "amount": 25.0,
        "description": "Gasoline",
        "category": "Transportation",
        "payee": "Q8"
      },
      ...
    ],
    "reports": [
      {
        "id": "r123456789",
        "user_id": "123456789",
        "year": 2023,
        "month": 5,
        "content": "This is the report for May 2023."
      },
      {
        "id": "r987654321",
        "user_id": "123456789",
        "year": 2023,
        "month": 4,
        "content": "This is the report for April 2023."
      },
      ...
    ]
  }
  ```

  Example error response:
  ```
  HTTP/1.1 500 Internal Server Error
  Content-Type: application/json

  {
    "error": "Error retrieving user data"
  }
  ```

  **Notes**:
  - The endpoint requires user authentication via the access token.
  - All user information is returned, including user details, expenses, and associated reports.
  - Expense data is sorted by descending date.
  - Report data is sorted by date (year and month) in descending order.
  - In case of success, a JSON object containing user information, expenses, and reports is returned.
  - In case of errors during the retrieval of user data, an appropriate error message will be returned.

*Remember to protect user information and treat it as sensitive data. Ensure to use secure connections (HTTPS) to protect data transmission during API requests.*

## PiggyPocket API Documentation - Overview Endpoint

This document provides a description of the API endpoint for retrieving user overview data (`/api/overview/@me`) in the PiggyPocket application.

### API Endpoint

The following API endpoint is available for retrieving user overview data:

- **GET /api/overview/@me**

  This endpoint allows you to retrieve the transaction count, total expenses, and total income grouped by month.

  Example request:
  ```
  GET /api/overview/@me HTTP/1.1
  Host: example.com
  Authorization: <token>
  ```

  Example response (success):
  ```
  HTTP/1.1 200 OK
  Content-Type: application/json

  {
    "transactionCount": [
      {
        "month": "2023-05",
        "total_count": 10
      },
      {
        "month": "2023-04",
        "total_count": 8
      },
      ...
    ],
    "totalExpenses": [
      {
        "month": "2023-05",
        "total_amount": -500.0
      },
      {
        "month": "2023-04",
        "total_amount": -400.0
      },
      ...
    ],
    "totalIncome": [
      {
        "month": "2023-05",
        "total_amount": 1000.0
      },
      {
        "month": "2023-04",
        "total_amount": 800.0
      },
      ...
    ]
  }
  ```

  Example response (error):
  ```
  HTTP/1.1 500 Internal Server Error
  Content-Type: application/json

  {
    "error": "Error retrieving overview data"
  }
  ```

  **Notes**:
  - The endpoint requires user authentication via the access token.
  - The response includes the transaction count, total expenses, and total income grouped by month.
  - Data is sorted by month in descending order.
  - In case of success, a JSON object containing the transaction count, total expenses, and total income is returned.
  - In case of errors during the retrieval of overview data, an appropriate error message will be returned.

*Remember to protect user information and treat it as sensitive data. Ensure secure connections (HTTPS) are used to protect data transmission during API requests.*

## PiggyPocket API Documentation - Single Report Endpoint

This document provides a description of the API endpoint for retrieving a user's single report data (`/api/reports/@me/:yearmonth`) in the PiggyPocket application.

### API Endpoint

The following API endpoint is available for retrieving a user's single report data:

- **GET /api/reports/@me/:yearmonth**

  This endpoint allows you to retrieve specific user report data based on the provided year and month.

  Example request:
  ```
  GET /api/reports/@me/2023-05 HTTP/1.1
  Host: example.com
  Authorization: <token>
  ```

  Example response (success):
  ```
  HTTP/1.1 200 OK
  Content-Type: application/json

  {
    "id": "report_id",
    "user_id": "user_id",
    "year": 2023,
    "month": 5,
    "content": "Report content"
  }
  ```

  Example response (no report found):
  ```
  HTTP/1.1 200 OK
  Content-Type: application/json

  {
    "content": ""
  }
  ```

  Example response (error):
  ```
  HTTP/1.1 500 Internal Server Error
  Content-Type: application/json

  {
    "error": "Error retrieving report data"
  }
  ```

  **Notes**:
  - The endpoint requires user authentication via the access token.
  - The report's year and month are specified in the URL path as `:yearmonth` in the "YYYY-MM" format (e.g., "2023-05" for May 2023).
  - A search is made in the database for the report corresponding to the user, provided year, and month.
  - In case of success, a JSON object containing the report data, including the report ID, user ID, year, month, and report content, is returned.
  - If no report is found corresponding to the user, provided year, and month, an empty JSON object with the "content" field set to an empty string is returned.
  - In case of errors during the retrieval of the report data, an appropriate error message will be returned.

*Remember to protect user information and treat it as sensitive data. Ensure secure connections (HTTPS) are used to protect data transmission during API requests.*

## PiggyPocket API Documentation - Create/Update Report Endpoint

This document provides a description of the API endpoint for creating or updating a user's report in the PiggyPocket application (`/api/reports/@me/:yearmonth`).

### API Endpoint

The following API endpoint is available for creating or updating a user's report:

- **POST /api/reports/@me/:yearmonth**

  This endpoint allows you to create or update a user's report based on the provided year and month. It uses artificial intelligence to generate a response based on the user's expenses.

  Example request:
  ```
  POST /api/reports/@me/2023-05 HTTP/1.1
  Host: example.com
  Authorization: <token>
  Content-Type: application/json

  {}
  ```

  Example response (success):
  ```
  HTTP/1.1 200 OK
  Content-Type: application/json

  {
    "content": "Here are some tips to improve your financial situation:\n\n- Reduce housing expenses by seeking cheaper accommodations or roommates.\n- Be mindful of your food expenses, look for deals and promotions at supermarkets.\n- Consider using budget management apps or tools to track your monthly expenses."
  }
  ```

  Example response (error):
  ```
  HTTP/1.1 500 Internal Server Error
  Content-Type: application/json

  {
    "error": "Error creating report"
  }
  ```

  **Notes**:
  - The endpoint requires user authentication via the access token.
  - The report's year and month are specified in the URL path as `:yearmonth` in the "YYYY-MM" format (e.g., "2023-05" for May 2023).
  - The POST request does not require any data in the request body. User expense information is internally retrieved by the server.
  - The server automatically generates a prompt based on the user's expenses for the specified month.
  - The prompt is sent to artificial intelligence to get a personalized response based on the user's expenses.
  - In case of success, the response generated by artificial intelligence is returned as the "content" field in the JSON response object.
  - In case of an error during the creation or update of the report, an error JSON object with an "error" field describing the specific error will be returned.

*Remember to protect user information and treat it as sensitive data. Ensure secure connections (HTTPS) are used to protect data transmission during API requests.*