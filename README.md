# Thumbnail Service

Written by Ivana Lee

API service for generating image thumbnails using a job-based architecture.
This service handles image uploads, processes them asynchronously, and provides endpoints to check job status and retrieve generated thumbnails.

## Features

-   Image upload
-   Asynchronous thumbnail generation
-   Job status tracking
-   Rate limiting
-   File size restrictions
-   Error handling

## Prerequisites

-   Node.js 20 or higher
-   Docker and Docker Compose
-   Redis (automatically set up with docker compose)

## Getting Started

### Using Docker (Recommended)

1. Clone the repository:

```bash
git clone <repository-url>
cd thumbnail-service
```

2. Start the services:

```bash
docker-compose up -d
```

The service will run on port 3000

### Manual Setup

1. Install dependencies:

```bash
npm install
```

2. Build the project:

```bash
npm run build
```

3. Start the server:

```bash
npm start
```

## Environment Variables

-   `PORT`: Server port (default: 3000)
-   `REDIS_URL`: Redis connection URL
-   `MAX_FILE_SIZE`: Maximum file size in bytes (default: 10MB)

## Development

### Running Tests

```bash
npm test
```

### Development Mode

```bash
npm run dev
```

## API Endpoints

### Upload Image

```http
POST /jobs/upload
Content-Type: multipart/form-data

Form Data:
- image: <file>

Response:
{
    "jobId": "string"
}
```

### Check Job Status

```http
GET /jobs/status/:jobId

Response:
{
    "status": "processing" | "succeeded" | "failed"
}
```

### Get Thumbnail

```http
GET /jobs/thumbnail/:jobId

Response:
- Image file (PNG)
```

### List All Jobs

```http
GET /jobs

Response:
{
    "jobs": [
        {
            "id": "string",
            "status": "string",
            "originalFilename": "string",
            "storedFilename": "string"
        }
    ]
}
```

## Technical Architecture

For this current implementation, I chose to use:

-   Express.js
-   BullMQ + Redis (Job queue)
-   Sharp (Image Processing / Resizing)
-   LowDB (Job metadata storage)

### Components

**API Layer (Express.js)**

   The reason I chose to use Express.js is because it is is very lightweight and minimal. There is also very little boilerplate, easy to setup and is very well documented.

In the application, it is in charge of:

    - Handling HTTP requests
    - Input validation
    - Rate limiting
    - Error handling

**Job Queue (BullMQ + Redis)**

   I opted to use a job queue to handle thumbnail generation asynchronously. I believe job queues are a better fit for asynchronous image resizing, as opposed to webhooks. This is because job queues are able to run asynchronously without a persist connection. Workers can also be scaled independently and implmentation is simple.

I decided to use BullMQ and Redis. BullMQ works on top of Redis, making it appropriate for long-running background tasks (like thumbnail processing). Redis is a fast, in-memory data store that is very simple and easy to use.

Redis & BullMQ handle the following responsibilities:

    - Asynchronous thumbnail generation
    - Job status tracking

**Image Processing (Sharp)**

   Sharp is a well known Node.js library for image processing and is able to process images efficient, using very little RAM.

Sharp is used for:

    - Image resizing
    - Format conversion (png)

**Storage**

   For storage, I decided to use LowDB for job metadata and file system storage for images and generated thumbnails. This is due to simpilicity and performance. Storing files directly in the file system has very little setup and no external storage or extra dependencies are necessary.

    Given the scope of the assignment I thought it would be a good fit.

## Trade-offs, Limitations and Future Improvements

### File system storage

For this assignment I chose to store uploads and generated thumbnails on local file storage. This works well for smaller sized applications. However, if scaling this would not scale well. Instead, cloud object storage (S3 etc..) could be utilized instead for scalability.

### LowDB for Job Metadata

I decided to use LowDB to store job metadata as it is very light-weight and good for a small project. It also does not require extra configuration as it stores data in a local JSON file. However, since LowDB reads the entire file into memory, it only works well with smaller datasets. Concurrency would also be an issue as there is no built-in locking mechanisms or transaction systems. If scaling to production, a NoSQL database would be more appropriate (MongoDB, DynamoDB)

### User Authentication

Currently this implementation has no user authentication. Given the scope of the assignment I believe this is ok. However, if scaled for real world use, this would be dangerous as the user's information is not protected. If scaling, creating a user model with account creation and login endpoints with JWT token authentication would be ideal.

### Logging / Monitoring

Currently nothing is implemented for logging or monitoring. Tools like Datadog would be useful to centralize logs and analyze usage patterns, processing times and errors.
