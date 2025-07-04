from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from app.core.sql_code_generator.glp_update_generator import generate_glp_update_sql

router = APIRouter()

@router.post("/generate-glp-update-sql")
async def generate_glp_update_sql_route(request: Request):
    try:
        form_data = await request.form()
        username = form_data.get("username", "").strip()
        policy_number = form_data.get("policy_number", "").strip()
        effective_date = form_data.get("effective_date", "").strip()
        glp_amount = form_data.get("glp_amount", "").strip()
        epd_date = form_data.get("epd_date", "").strip()
        note = form_data.get("note", "").strip()

        if not all([username, policy_number, effective_date, glp_amount, epd_date, note]):
            return JSONResponse(status_code=400, content={"success": False, "message": "All fields are required"})

        try:
            glp_amount_int = int(glp_amount)
            if glp_amount_int <= 0:
                return JSONResponse(status_code=400, content={"success": False, "message": "GLP Amount must be a positive integer"})
        except ValueError:
            return JSONResponse(status_code=400, content={"success": False, "message": "GLP Amount must be a valid integer"})

        sql_script = generate_glp_update_sql(
            username=username,
            policy_number=policy_number,
            effective_date=effective_date,
            glp_amount=glp_amount_int,
            epd_date=epd_date,
            note=note
        )

        return JSONResponse(content={"success": True, "sql_script": sql_script})
        
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "message": "Internal server error"})
