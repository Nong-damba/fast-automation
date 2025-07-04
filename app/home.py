from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates

from app.routes.updates.effective_date import router as generate_sql_router
from app.routes.updates.amend_contract import router as amend_contract_router
from app.routes.updates.update_status import router as update_status_router
from app.routes.updates.glp_update import router as glp_update_router
from app.routes.updates.epd_update import router as epd_update_router
from app.routes.updates.fund_name_change import router as fund_name_change_router
from app.routes.core.run_sql import router as run_sql_router
from app.routes.config.dropdown_config import router as dropdown_config_router
from app.routes.fetch.fetch_current_rows_EPD_update import router as fetch_current_rows_epd_update_router
from app.routes.fetch.fetch_current_rows_update_policy_status import router as fetch_current_rows_update_policy_status_router
from app.routes.fetch.fetch_current_rows_glp_update import router as fetch_current_rows_glp_update_router
from app.routes.fetch.fetch_current_rows_update_effective_date import router as fetch_current_rows_update_effective_date_router
from app.routes.fetch.fetch_current_rows_fund_name_change import router as fetch_current_rows_fund_name_change_router


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
router.include_router(fund_name_change_router)
router.include_router(run_sql_router)
router.include_router(fetch_current_rows_epd_update_router)
router.include_router(fetch_current_rows_update_policy_status_router)
router.include_router(fetch_current_rows_glp_update_router)
router.include_router(fetch_current_rows_update_effective_date_router)
router.include_router(fetch_current_rows_fund_name_change_router)
router.include_router(dropdown_config_router)


