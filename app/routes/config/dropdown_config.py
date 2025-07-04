from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

# create a router for the dropdown config
from app.core.config import DROPDOWN_CONFIG

router = APIRouter()

@router.get("/dropdown-config")
async def get_dropdown_config():
    print("DROPDOWN_CONFIG", DROPDOWN_CONFIG)
    return JSONResponse(content=DROPDOWN_CONFIG)

