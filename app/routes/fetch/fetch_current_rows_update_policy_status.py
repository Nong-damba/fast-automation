from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import pyodbc
import datetime
import os
import dotenv

dotenv.load_dotenv()

username_env = os.getenv("SQL_USERNAME")
password_env = os.getenv("SQL_PASSWORD")

router = APIRouter()

@router.post("/fetch-current-rows-update-policy-status")
async def fetch_current_rows_update_policy_status(request: Request):
    data = await request.json()
    server = data.get("server")
    database = data.get("database")
    policy_number = data.get("policy_number")

    # print("username", username_env)
    # print("password", password_env)

    # print(os.getenv("USERNAME"))
    # print(os.getenv("PASSWORD"))

    if not all([server, database, policy_number]):
        return JSONResponse(status_code=400, content={"error": "Missing server, database, or policy_number."})

    conn = None
    rows = []
    columns = []
    error = None
    try:
        conn_str = (
            f"DRIVER={{ODBC Driver 18 for SQL Server}};"
            f"SERVER={server};"
            f"DATABASE={database};"
            f"UID={username_env};"
            f"PWD={password_env};"
            f"Encrypt=yes;"
            f"TrustServerCertificate=yes;"
        )

        # conn_str = (
        #     f"DRIVER={{SQL Server}};"
        #     f"SERVER={server};"
        #     f"DATABASE={database};"
        #     "Trusted_Connection=yes;"
        # )


        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        query = (
            f"SELECT Poh_TIMESTAMP, Poh_USERID, Poh_STATUS "
            f"FROM Cm_Opt_Poh_PolicyHdr_S WHERE Poh_POLICYNUMBER = '{policy_number}'"
        )
        cursor.execute(query)
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