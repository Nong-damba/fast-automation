from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import pyodbc
import datetime
import os
import dotenv

dotenv.load_dotenv()

username = os.getenv("SQL_USERNAME")
password = os.getenv("SQL_PASSWORD")
    
router = APIRouter()

@router.post("/fetch-current-rows-fund-name-change")
async def fetch_current_rows_fund_name_change(request: Request):
    data = await request.json()
    server = data.get("server")
    database = data.get("database")
    cusip = data.get("cusip")
    parent_company_code = data.get("parent_company_code")

    if not all([server, database, cusip, parent_company_code]):
        return JSONResponse(status_code=400, content={"error": "Missing server, database, cusip, or parent_company_code."})

    conn = None
    rows = []
    columns = []
    error = None
    try:
        conn_str = (
            f"DRIVER={{ODBC Driver 18 for SQL Server}};"
            f"SERVER={server};"
            f"DATABASE={database};"
            f"UID={username};"
            f"PWD={password};"
            f"Encrypt=yes;"
            f"TrustServerCertificate=yes;"
        )
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        query = '''
            select distinct par.Com_CODE,Fnd_ID,Fnd_CUSIP, Fnd_CODE,Fnd_NAME, Fnd_DESCRIPTION
            from Cm_Sys_Fnd_Fund_S
            inner join Cm_JON_PRODMODELFORMNUM_Fnd_Fcr_S on Pmf_FUNDID = fnd_id
            inner join Cm_Cfg_Pmf_ProdModelFormNum_S on pmf_id = Pmf_PRODMODELFORMNUMID
            inner join Cm_Cfg_Com_Company_S com on Pmf_ISSUINGCOMPANYID = Com_ID
            inner join Cm_Cfg_Com_Company_S par on par.Com_ID = com.Com_PARENTCOMPANY
            where Fnd_CUSIP = ?
            and par.com_code = ?
        '''
        cursor.execute(query, cusip, parent_company_code)
        columns = [column[0] for column in cursor.description]
        rows = [
            [cell.isoformat() if isinstance(cell, datetime.datetime) else cell for cell in row]
            for row in cursor.fetchall()
        ]
    except Exception as e:
        error = str(e)
    finally:
        if conn:
            conn.close()
    return JSONResponse(content={"columns": columns, "rows": rows, "error": error}) 