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

@router.post("/fetch-current-rows-update-effective-date")
async def fetch_current_rows_update_effective_date(request: Request):
    data = await request.json()
    server = data.get("server")
    database = data.get("database")
    policy_numbers = data.get("policy_numbers")  # Should be a list

    if not all([server, database, policy_numbers]) or not isinstance(policy_numbers, list) or not policy_numbers:
        return JSONResponse(status_code=400, content={"error": "Missing server, database, or policy_numbers (list)."})

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
            "Trusted_Connection=yes;"
        )
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        # Build the parameterized IN clause
        placeholders = ','.join(['?'] * len(policy_numbers))
        query = f'''
            SELECT 
                poh.Poh_POLICYNUMBER,
                txh.txh_effectivedate,
                txh.txh_userid,
                txh.txh_timestamp
            FROM Cm_Opt_Poh_PolicyHdr_S poh
            INNER JOIN Cm_Opt_Txh_TrxHdr_S txh ON txh.Txh_POLICYHDRID = poh.Poh_ID
            INNER JOIN Cm_Sys_Pst_PolicyStatus_I pst ON poh.Poh_STATUS = pst.Pst_ID_I
            INNER JOIN Cm_Sys_Txt_TrxType_I txt ON txh.Txh_TRXTYPEID = txt.Txt_ID_I
            INNER JOIN Cm_Sys_Txs_TrxStatus_I txs ON txh.Txh_TRXSTATUS = txs.Txs_ID_I
            INNER JOIN cm_ten_company_poh_s ten ON poh.Poh_ID = ten.com_policyhdrid
            INNER JOIN cm_cfg_com_company_s com ON ten.com_companyid = com.com_id
            WHERE poh.Poh_POLICYNUMBER IN ({placeholders})
              AND txt.txt_description_i IN ('Annutized Conversion Summary', 'Build Payout Values');
        '''
        cursor.execute(query, *policy_numbers)
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