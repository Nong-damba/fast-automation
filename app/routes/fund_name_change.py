from fastapi import APIRouter, Form
from fastapi.responses import JSONResponse
from app.core.fund_name_change_generator import generate_sql_fund_name_change

router = APIRouter()

@router.post("/generate-fund-name-change-sql")
async def generate_fund_name_change_sql(
    username: str = Form(...),
    cusip_id: str = Form(...),
    parent_company_code: str = Form(...),
    new_fund_name: str = Form(...),
    new_fund_description: str = Form(...)
):
    try:
        sql_script = generate_sql_fund_name_change(
            username, 
            cusip_id, 
            parent_company_code, 
            new_fund_name, 
            new_fund_description
        )
        return JSONResponse({"success": True, "sql_script": sql_script})
    except Exception as e:
        return JSONResponse({"success": False, "message": str(e), "sql_script": ""}) 