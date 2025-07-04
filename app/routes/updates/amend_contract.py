from fastapi import APIRouter, Form
from fastapi.responses import JSONResponse
from app.core.sql_code_generator.policy_amendment_generator import generate_sql_update_policy

router = APIRouter()

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

