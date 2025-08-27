# Conversation API

A NestJS-based API for managing conversations and messages, built with Prisma and MongoDB. This API supports creating, updating, retrieving, archiving, and soft-deleting conversations and messages, with support for attachments and pagination.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Notes on Type Safety](#notes-on-type-safety)

## Prerequisites

- **Node.js**: Version 18.x or higher
- **MongoDB**: A running MongoDB instance (local or cloud-based, e.g., MongoDB Atlas)
- **npm**: Ensure npm is installed with Node.js
- **Git**: For cloning the repository

## Installation

1. **Clone the Repository**:

   ```bash
   git clone <repository-url>
   cd conversation-api
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the project root with the following variables:
   ```
   DATABASE_URL=mongodb://<username>:<password>@<host>:<port>/<database>?authSource=admin
   PORT=5000
   API_KEY=your-api-key
   ALLOWED_ORIGINS=http://localhost:3000
   ```

   - `DATABASE_URL`: Your MongoDB connection string.
   - `PORT`: The port the API will run on (default: 5000).
   - `API_KEY`: A secret key for API authentication.
   - `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins.

## Configuration

- **Prisma**: The application uses Prisma as the ORM, with MongoDB as the database provider. The schema is defined in `prisma/schema.prisma`.
- **Swagger**: API documentation is available at `/api` once the server is running.
- **CORS**: Configured to allow requests from origins specified in `ALLOWED_ORIGINS`.
- **Validation**: Uses `class-validator` and `class-transformer` for request validation and transformation.

## Running the Application

1. **Generate Prisma Client**:
   Generate the Prisma client based on the schema:

   ```bash
   npx prisma generate
   ```

2. **Synchronize Database Schema**:
   Use Prisma to push the schema defined in `prisma/schema.prisma` to your MongoDB database. This is useful during development to apply schema changes without generating migrations:

   ```bash
   npx prisma db push
   ```

3. **Start the Application**:
   - Development mode (with hot-reload):
     ```bash
     npm run start:dev
     ```
   - Production mode:
     ```bash
     npm run start:prod
     ```

4. **Access the API**:
   - The API will be available at `http://localhost:5000`.
   - Swagger documentation is accessible at `http://localhost:5000/api`.

## API Endpoints

All endpoints require an `X-API-Key` header with the value specified in the `API_KEY` environment variable.

### Conversations

- **POST /conversations**
  - Creates a new conversation.
  - **Body**: See `CreateConversationDto` in `src/conversations/dto/create-conversation.dto.ts`.
  - **Example**:
    ```json
    {
      "customer": {
        "id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "919999888877"
      },
      "advisor": {
        "id": "507f1f77bcf86cd799439012",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "phone": "12025550123"
      },
      "channel": {
        "id": "507f1f77bcf86cd799439013",
        "name": "waba"
      },
      "session": {
        "id": "507f1f77bcf86cd799439014",
        "status": "open"
      },
      "created_by": "user_123",
      "created_by_client": "automation_system",
      "status": "active"
    }
    ```

- **GET /conversations?page=&limit=**
  - Retrieves all active conversations with pagination.
  - **Query Parameters**:
    - `page` (optional, default: 1): Page number.
    - `limit` (optional, default: 10): Number of conversations per page.

- **GET /conversations/:id**
  - Retrieves a conversation by ID.

- **PATCH /conversations/:id**
  - Updates a conversation.
  - **Body**: See `UpdateConversationDto` in `src/conversations/dto/update-conversation.dto.ts`.

- **DELETE /conversations/:id**
  - Soft deletes a conversation (sets status to `inactive`).

- **POST /conversations/:id/archive**
  - Archives a conversation (sets status to `archive`).

### Messages

- **POST /messages**
  - Creates a new message.
  - **Body**: See `CreateMessageDto` in `src/messages/dto/create-message.dto.ts`.
  - **Example**:
    ```json
    {
      "conversation_id": "507f1f77bcf86cd799439015",
      "content": "Hello",
      "direction": "incoming",
      "attachment": {
        "type": "image",
        "url": "https://example.com/image.jpg",
        "mime_type": "image/jpeg"
      }
    }
    ```

- **GET /messages?conversation_id=&page=&limit=**
  - Retrieves messages, optionally filtered by conversation ID, with pagination.
  - **Query Parameters**:
    - `conversation_id` (optional): Filter by conversation.
    - `page` (optional, default: 1): Page number.
    - `limit` (optional, default: 10): Number of messages per page.

- **GET /messages/:id**
  - Retrieves a message by ID.

- **PATCH /messages/:id**
  - Updates a message.
  - **Body**: See `UpdateMessageDto` in `src/messages/dto/update-message.dto.ts`.

- **DELETE /messages/:id**
  - Soft deletes a message (sets status to `inactive`).

## Testing

The application includes unit tests for the Conversations and Messages modules using Jest.

- **Run Tests**:

  ```bash
  npm run test
  ```

- **Run Tests with Coverage**:

  ```bash
  npm run test:cov
  ```

- **Test Structure**:
  - Tests are located in:
    - `src/conversations/conversations.controller.spec.ts`
    - `src/conversations/conversations.service.spec.ts`
    - `src/messages/messages.controller.spec.ts`
    - `src/messages/messages.service.spec.ts`
  - Tests cover:
    - Controller methods (`create`, `findAll`, `findOne`, `update`, `remove`, `archive`).
    - Service methods with mocks for Prisma operations.
    - Error handling for invalid ObjectIDs, missing conversations/messages, and duplicate fields.
  - **Mocking**:
    - The `PrismaService` is mocked to simulate database interactions.
    - The `ApiKeyGuard` is mocked to bypass authentication during tests.

## Project Structure

```
conversation-api/
├── prisma/
│   └── schema.prisma              # Prisma schema for MongoDB
├── src/
│   ├── common/
│   │   └── guards/
│   │       └── api-key.guard.ts   # API key authentication guard
│   ├── conversations/
│   │   ├── dto/                   # Data Transfer Objects
│   │   ├── conversations.controller.ts
│   │   ├── conversations.service.ts
│   │   ├── conversations.module.ts
│   │   └── conversations.service.spec.ts
│   ├── messages/
│   │   ├── dto/
│   │   ├── messages.controller.ts
│   │   ├── messages.service.ts
│   │   ├── messages.module.ts
│   │   └── messages.service.spec.ts
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── types/
│   │   └── enums.ts               # TypeScript enums and Swagger metadata
│   ├── app.module.ts              # Root module
│   ├── main.ts                    # Application entry point
│   └── swagger.config.ts          # Swagger configuration
├── .env                           # Environment variables
├── package.json
└── README.md
```
