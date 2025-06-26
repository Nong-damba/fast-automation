from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates

from app.routes.effective_date import router as generate_sql_router
from app.routes.amend_contract import router as amend_contract_router
from app.routes.update_status import router as update_status_router
from app.routes.glp_update import router as glp_update_router
from app.routes.epd_update import router as epd_update_router

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")

@router.get("/")
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "title": "Home Page"})

# Include other routes
router.include_router(generate_sql_router)
router.include_router(amend_contract_router)
router.include_router(update_status_router)
router.include_router(glp_update_router)
router.include_router(epd_update_router)
