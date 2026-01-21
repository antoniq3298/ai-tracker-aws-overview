# AI Tracker – Frontend & AWS Architecture Overview

This project represents the frontend and architectural overview of an AI-powered training tracker application.

The application allows users to log workouts, track training load, and record how they felt during each session.  
Backend logic is implemented using a serverless AWS architecture.

---

## Key Features
- User authentication
- Training session input
- Tracking perceived exertion and user feeling
- Secure card payments
- Automated backend workflows

---

## AWS Architecture Overview

The backend is built using managed AWS services:

- **Amazon Cognito**  
  Handles user authentication and authorization.

- **AWS IAM**  
  Manages permissions and secure access between services.

- **Amazon API Gateway**  
  Exposes REST endpoints used by the frontend.

- **AWS Lambda**  
  Executes backend business logic for training data processing and payments.

- **AWS Step Functions**  
  Orchestrates workflows such as:
  - training data validation
  - AI processing
  - post-processing steps

- **Stripe**  
  Handles secure card payments (payment intent creation and confirmation).

---

## High-Level Flow

1. User signs in via Amazon Cognito.
2. Frontend sends authenticated requests to API Gateway.
3. API Gateway triggers Lambda functions.
4. Step Functions coordinate multi-step workflows.
5. Training load and user feeling data are processed and stored.
6. Stripe is used for handling card payments where required.

---

## Training Data Model (Conceptual)

A training entry includes:
- Date of workout
- Training duration
- Training intensity / load
- User-reported feeling (fatigue, readiness, mood)

This data is used to analyze workload trends over time.

---

## Repository Structure
ai-tracker-aws-overview/
│
├── frontend/ # Frontend source code
├── docs/ # Architecture documentation and diagrams
├── README.md
└── .gitignore

---

## Security Notes
- No AWS account IDs, ARNs, secrets, or tokens are included.
- Environment variables are documented but not committed.
- Stripe keys and Cognito identifiers are omitted intentionally.

---

## Notes
This repository focuses on frontend implementation and AWS architecture description.  
Infrastructure and backend resources are described conceptually and are not deployed from this repository.


# ai-tracker-aws-overview
