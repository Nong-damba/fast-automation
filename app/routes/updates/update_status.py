from fastapi import APIRouter, Form
from fastapi.responses import JSONResponse
from app.core.sql_code_generator.update_policy_status_generator import generate_sql_update_status

router = APIRouter()

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
