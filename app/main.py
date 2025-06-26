from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from app.home import router as home_router
import os


app = FastAPI()


# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get the absolute path to the static directory
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")

# Mount static files with explicit directory
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Jinja2 Templates
templates = Jinja2Templates(directory="app/templates")

# Include the home router
app.include_router(home_router)