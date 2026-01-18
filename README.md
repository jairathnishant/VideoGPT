# YouTube GPT

A full-stack application that integrates YouTube search functionality with an AI-powered backend API. This project enables users to search for YouTube videos through a chat-like interface and retrieve detailed video information.

## Project Structure

```
ytgpt/
├── backend/              # FastAPI backend server
│   ├── main.py          # Main application with YouTube search and chat endpoints
│   ├── .env             # Environment variables (API keys)
│   ├── .env.example     # Example environment configuration
│   └── .venv/           # Python virtual environment
├── frontend/            # Frontend application
├── .gitignore           # Git ignore rules
└── README.md            # Project documentation
```

## Features

- **YouTube Search API Integration**: Search YouTube videos using the official YouTube Data API
- **FastAPI Backend**: Modern, high-performance Python web framework
- **RESTful Chat Endpoint**: `/chat` endpoint for processing user queries
- **Video Information Extraction**: Retrieves comprehensive video metadata including:
  - Title, channel name, and publication date
  - View counts and likes
  - Thumbnails and video descriptions
  - Direct YouTube links

## Prerequisites

- Python 3.8+
- YouTube Data API key (from [Google Cloud Console](https://console.cloud.google.com/))
- pip or conda package manager

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd ytgpt
```

### 2. Set up the backend

Navigate to the backend directory:
```bash
cd backend
```

Create a Python virtual environment:
```bash
python -m venv .venv
```

Activate the virtual environment:

**On Windows:**
```bash
.venv\Scripts\activate
```

**On macOS/Linux:**
```bash
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install fastapi uvicorn python-dotenv google-auth-oauthlib google-auth-httplib2 google-api-python-client pydantic
```

### 4. Configure environment variables

Copy the example configuration file:
```bash
cp .env.example .env
```

Edit `.env` and add your YouTube API key:
```
YOUTUBE_API_KEY=your_api_key_here
```

## Getting Your YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the **YouTube Data API v3**
4. Create an API key in the Credentials section
5. Copy your API key and add it to the `.env` file

## Running the Application

### Start the FastAPI server

From the `backend` directory:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### View API Documentation

- **Interactive Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Chat Endpoint
**POST** `/chat`

Search for YouTube videos matching a query.

**Request Body:**
```json
{
  "message": "python programming tutorial"
}
```

**Response:**
```json
{
  "query": "python programming tutorial",
  "results": [
    {
      "video_id": "dQw4w9WgXcQ",
      "title": "Video Title",
      "channel": "Channel Name",
      "published_at": "2023-01-01T00:00:00Z",
      "description": "Video description...",
      "thumbnail": "https://...",
      "views": 1000000,
      "likes": 50000,
      "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    }
  ]
}
```

## API Response Details

Each video result includes:
- **video_id**: YouTube video ID
- **title**: Video title
- **channel**: Channel name
- **published_at**: Publication timestamp
- **description**: Video description (limited to 500 characters)
- **thumbnail**: Medium-sized thumbnail URL
- **views**: Total view count
- **likes**: Total like count
- **url**: Direct YouTube watch link

## Development

### Project Stack

- **Backend Framework**: FastAPI
- **Web Server**: Uvicorn
- **Data Validation**: Pydantic
- **External API**: Google YouTube Data API v3
- **Environment Management**: python-dotenv

### Code Structure

- **ChatRequest**: Pydantic model for incoming chat requests
- **youtube_search()**: Core function for searching and fetching YouTube video data
- **chat()**: Endpoint handler that processes user queries and returns top 5 results

## Troubleshooting

### "YouTube API key is not set in environment variables"
- Ensure your `.env` file exists and contains `YOUTUBE_API_KEY`
- Make sure you're in the `backend` directory when running the server
- Verify the API key is valid in the Google Cloud Console

### "Connection refused" on localhost:8000
- Check if the uvicorn server is running
- Verify the port 8000 is not in use by another application
- Try using a different port: `uvicorn main:app --port 8001`

### No videos returned from search
- Check your internet connection
- Verify your YouTube API quota hasn't been exceeded
- Try a simpler search query

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]

## Support

[Add support information here]
