from fastapi import APIRouter, Form
from fastapi.responses import JSONResponse
from app.core.epd_update_generator import generate_epd_update_script

router = APIRouter()

@router.post("/generate-epd-update-sql")
async def generate_epd_update_sql_route(
    username: str = Form(...),
    policy_no: str = Form(...),
    epd_date: str = Form(...)
):
    try:
        if not all([username, policy_no, epd_date]):
            return JSONResponse(status_code=400, content={"success": False, "message": "All fields are required"})

        sql_script = generate_epd_update_script(username=username, policy_no=policy_no, epd_date=epd_date)
        return JSONResponse(content={"success": True, "sql_script": sql_script})

    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "message": "Internal server error"})
