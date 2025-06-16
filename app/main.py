from fastapi import FastAPI, APIRouter, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from app.routes import home
import os
from fastapi.responses import JSONResponse
from app.core.sql_generator import generate_sql_script

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(home.router)

# Get the absolute path to the static directory
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")

# Mount static files with explicit directory
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Jinja2 Templates
templates = Jinja2Templates(directory="app/templates")

router = APIRouter()

@router.post("/generate-sql")
async def generate_sql(file: UploadFile = File(...)):
    print("Generating SQL")
    content = await file.read()
    print(content)
    try:
        content_str = content.decode("utf-8")
        success, message, sql_script = generate_sql_script(content_str)
        return JSONResponse({"success": success, "message": message, "sql_script": sql_script})
    except Exception as e:
        return JSONResponse({"success": False, "message": str(e), "sql_script": ""})


app.include_router(router)