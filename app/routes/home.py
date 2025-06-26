import logging
logger = logging.getLogger(__name__)

from fastapi import APIRouter, Request, Form, UploadFile, File
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse
from app.core.effective_date_generator import generate_sql_script
from app.core.policy_amendment_generator import generate_sql_update_policy
from app.core.update_policy_status_generator import generate_sql_update_status
from app.core.glp_update_generator import generate_glp_update_sql
from app.core.epd_update_generator import generate_epd_update_script

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

@router.post("/generate-glp-update-sql")
async def generate_glp_update_sql_route(request: Request):
    """Generate SQL script for GLP update functionality."""
    try:
        form_data = await request.form()
        
        username = form_data.get("username", "").strip()
        policy_number = form_data.get("policy_number", "").strip()
        effective_date = form_data.get("effective_date", "").strip()
        glp_amount = form_data.get("glp_amount", "").strip()
        epd_date = form_data.get("epd_date", "").strip()
        note = form_data.get("note", "").strip()
        
        # Validate required fields
        if not all([username, policy_number, effective_date, glp_amount, epd_date, note]):
            return JSONResponse(
                status_code=400,
                content={"success": False, "message": "All fields are required"}
            )
        
        # Validate GLP amount
        try:
            glp_amount_int = int(glp_amount)
            if glp_amount_int <= 0:
                return JSONResponse(
                    status_code=400,
                    content={"success": False, "message": "GLP Amount must be a positive integer"}
                )
        except ValueError:
            return JSONResponse(
                status_code=400,
                content={"success": False, "message": "GLP Amount must be a valid integer"}
            )
        
        # Generate SQL script
        sql_script = generate_glp_update_sql(
            username=username,
            policy_number=policy_number,
            effective_date=effective_date,
            glp_amount=glp_amount_int,
            epd_date=epd_date,
            note=note
        )
        
        return JSONResponse(
            content={"success": True, "sql_script": sql_script}
        )
        
    except ValueError as e:
        return JSONResponse(
            status_code=400,
            content={"success": False, "message": str(e)}
        )
    except Exception as e:
        logger.error(f"Error generating GLP update SQL: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Internal server error"}
        )

@router.post("/generate-epd-update-sql")
async def generate_epd_update_sql_route(
    username: str = Form(...),
    policy_no: str = Form(...),
    epd_date: str = Form(...)
):
    """Generate SQL script for EPD update functionality."""
    try:
        if not all([username, policy_no, epd_date]):
            return JSONResponse(
                status_code=400,
                content={"success": False, "message": "All fields are required"}
            )
        
        sql_script = generate_epd_update_script(
            username=username,
            policy_no=policy_no,
            epd_date=epd_date
        )
        
        return JSONResponse(
            content={"success": True, "sql_script": sql_script}
        )
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Internal server error"}
        )
