# Import standard libraries
import os
from typing import List, Dict, Any

# Import FastAPI and Pydantic for API and data validation
from fastapi import FastAPI
from pydantic import BaseModel

# Import environment variable loader
from dotenv import load_dotenv

# Import Google API client for YouTube integration
from googleapiclient.discovery import build

from fastapi.middleware.cors import CORSMiddleware

# Load environment variables from .env file
load_dotenv()

# Initialize FastAPI application
app = FastAPI(title = "YouTube GPT Backend")

# Load YouTube API key from environment variables
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")

# Request model for chat endpoint
class ChatRequest(BaseModel):
    message: str  # User's search query

def youtube_search(query:str, max_results:int =10) -> List[Dict[str, Any]]:
    """
    Search YouTube for videos matching a query.
    
    Process:
    1) search.list -> get videoIds matching the query
    2) videos.list -> get detailed stats/snippet data in bulk
    """
    # Validate YouTube API key is configured
    if not YOUTUBE_API_KEY:
        raise RuntimeError("YouTube API key is not set in environment variables.")
    
    # Initialize YouTube API client
    yt = build("youtube", "v3", developerKey = YOUTUBE_API_KEY)

    # Step 1: Search for videos matching the query and extract video IDs
    search_rest = yt.search().list(
        part = "id",    
        q = query,
        type = "video",
        maxResults = max_results,
        safeSearch = "moderate",
    ).execute()

    # Extract video IDs from search results
    video_ids = [item["id"]["videoId"] for item in search_rest.get("items", [])]
    
    # Return empty list if no videos found
    if not video_ids:
        return []
    
    # Step 2: Fetch detailed video information for all video IDs
    videos_resp = yt.videos().list(
        part = "snippet, statistics, contentDetails",
        id = ",".join(video_ids),
        maxResults = max_results,
    ).execute()

    # Parse and format video results
    results = []
    for v in videos_resp.get("items", []):
        # Extract snippet and statistics data
        snippet = v.get("snippet", {})
        stats = v.get("statistics", {})
        
        # Append formatted video data to results
        results.append({
            "video_id": v["id"],
            "title": snippet.get("title"),
            "channel": snippet.get("channelTitle"),
            "published_at": snippet.get("publishedAt"),
            "description": snippet.get("description", "")[:500],  # Limit description to 500 chars
            "thumbnail": (snippet.get("thumbnails", {}).get("medium", {}) or {}).get("url"),
            "views": int(stats.get("viewCount", 0)),
            "likes": int(stats.get("likeCount", 0)) if "likeCount" in stats else 0,
            "url": f"https://www.youtube.com/watch?v={v['id']}",
        })
    
    return results
    
# Chat endpoint for processing user queries
@app.post("/chat")
def chat(req: ChatRequest):
    """Handle chat requests by searching YouTube and returning top results."""
    
    # Search YouTube for videos matching the user's query
    candidates = youtube_search(req.message, max_results=10)

    # Return only the top 5 results
    top5 = candidates[:5]
    return{
        "query": req.message,
        "results": top5
    }

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)