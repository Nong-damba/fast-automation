from fastapi import APIRouter, Request, Form, UploadFile, File
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse
from app.core.effective_date_generator import generate_sql_script
from app.core.policy_amendment_generator import generate_sql_update_policy
from app.core.update_policy_status_generator import generate_sql_update_status

templates = Jinja2Templates(directory="app/templates")
router = APIRouter()

@router.get("/")
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "title": "Home Page"})

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

@router.post("/generate-update-status-sql")
async def generate_update_status_sql(
    username: str = Form(...),
    policy_number: str = Form(...),
    status: str = Form(...)
):
    try:
        sql_script = generate_sql_update_status(username, policy_number, status)
        return JSONResponse({"success": True, "sql_script": sql_script})
    except Exception as e:
        return JSONResponse({"success": False, "message": str(e), "sql_script": ""})
