from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
from app.core.effective_date_generator import generate_sql_effective_date

router = APIRouter()

@router.post("/generate-effective-date-sql")
async def generate_sql(file: UploadFile = File(...)):
    try:
        content = await file.read()
        content_str = content.decode("utf-8")
        success, message, sql_script = generate_sql_effective_date(content_str)
        return JSONResponse({"success": success, "message": message, "sql_script": sql_script})
    except Exception as e:
        return JSONResponse({"success": False, "message": str(e), "sql_script": ""})
