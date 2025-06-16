from fastapi import APIRouter, Request, Form
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse
from app.core.sql_generator import generate_sql_update_policy

templates = Jinja2Templates(directory="app/templates")
router = APIRouter()

@router.get("/")
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "title": "Home Page"})

@router.post("/generate-amend-contract-sql")
async def generate_amend_contract_sql(
    username: str = Form(...),
    current_policy: str = Form(...),
    amended_policy: str = Form(...)
):
    try:
        sql_script = generate_sql_update_policy(current_policy, amended_policy, username)
        return JSONResponse({"success": True, "sql_script": sql_script})
    except Exception as e:
        return JSONResponse({"success": False, "message": str(e), "sql_script": ""})
