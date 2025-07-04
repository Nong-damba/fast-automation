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

@router.post("/fetch-current-rows-glp-update")
async def fetch_current_rows_glp_update(request: Request):
    data = await request.json()
    server = data.get("server")
    database = data.get("database")
    policy_number = data.get("policy_number")
    effective_date = data.get("effective_date")

    if not all([server, database, policy_number, effective_date]):
        return JSONResponse(status_code=400, content={"error": "Missing server, database, policy_number, or effective_date."})

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

        # Get Poh_ID
        cursor.execute("SELECT Poh_ID FROM Cm_Opt_Poh_PolicyHdr_S WHERE Poh_POLICYNUMBER = ?", policy_number)
        poh_id_row = cursor.fetchone()
        poh_id = poh_id_row[0] if poh_id_row else None
        if not poh_id:
            return JSONResponse(content={"columns": [], "rows": [], "error": "No Poh_ID found for this policy number."})

        # Get Tul_ID
        cursor.execute('''
            SELECT Tul_ID
            FROM Cm_Opt_Tul_TrxResUL_S
            INNER JOIN Cm_Opt_Tre_TrxRes_S ON Tul_TRXRESID = Tre_ID
            INNER JOIN Cm_Opt_Txh_TrxHdr_S ON Tre_TRXHDRID = Txh_ID
            INNER JOIN Cm_Sys_Txt_TrxType_I ON Txh_TRXTYPEID = Txt_ID_I
            WHERE Txh_POLICYHDRID = ?
              AND Txt_DESCRIPTION_I = 'Anniversary'
              AND Txh_EFFECTIVEDATE = ?
              AND Txh_TRXSTATUS LIKE '%02'
        ''', poh_id, effective_date)
        tul_id_row = cursor.fetchone()
        tul_id = tul_id_row[0] if tul_id_row else None
        if not tul_id:
            return JSONResponse(content={"columns": [], "rows": [], "error": "No Tul_ID found for this policy number and effective date."})

        # Final SELECT
        cursor.execute('''
            SELECT
                Tul.Tul_CUMULATIVEGLP,
                Tul.Tul_USERID AS Tul_USERID,
                Tul.Tul_TIMESTAMP AS Tul_TIMESTAMP,
                Poh.Poh_EARLIESTPROCDATE,
                Poh.Poh_USERID AS Poh_USERID,
                Poh.Poh_TIMESTAMP AS Poh_TIMESTAMP
            FROM Cm_Opt_Tul_TrxResUL_S Tul
            CROSS APPLY (
                SELECT Poh_EARLIESTPROCDATE, Poh_USERID, Poh_TIMESTAMP
                FROM Cm_Opt_Poh_PolicyHdr_S 
                WHERE Poh_ID = ?
            ) Poh
            WHERE Tul.Tul_ID = ?
        ''', poh_id, tul_id)
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

    print("columns", columns)
    print("rows", rows)
    print("error", error)
    return JSONResponse(content={"columns": columns, "rows": rows, "error": error}) 