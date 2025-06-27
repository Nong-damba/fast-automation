from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import pyodbc

router = APIRouter()

@router.post("/run-sql")
async def run_sql(request: Request):
    data = await request.json()
    server = data.get("server")
    database = data.get("database")
    query = data.get("query")
    
    logs = []
    rows_affected = None
    error = None
    conn = None

    if not all([server, database, query]):
        return JSONResponse(status_code=400, content={"error": "Missing server, database, or query."})

    try:
        conn_str = (
            f"DRIVER={{SQL Server}};"
            f"SERVER={server};"
            f"DATABASE={database};"
            "Trusted_Connection=yes;"
        )
        logs.append(f"Connecting to server: {server}")
        conn = pyodbc.connect(conn_str, autocommit=False)
        logs.append(f"Connected to database: {database}")
        
        cursor = conn.cursor()
        logs.append("Executing the code...")
        
        cursor.execute(query)
        
        try:
            rows_affected = cursor.rowcount
            logs.append(f"Rows affected: {rows_affected}")
        except pyodbc.Error:
            logs.append("Could not determine rows affected (statement may not be a DML command).")
        
        conn.commit()
        logs.append("Code executed and transaction committed successfully.")
        
    except pyodbc.Error as ex:
        sqlstate = ex.args[0]
        error = f"Database Error ({sqlstate}): {ex}"
        logs.append(f"Error: {error}")
        if conn:
            try:
                conn.rollback()
                logs.append("Transaction rolled back.")
            except pyodbc.Error as rb_ex:
                logs.append(f"Error during rollback: {rb_ex}")

    except Exception as e:
        error = str(e)
        logs.append(f"Error: {error}")
        if conn:
            try:
                conn.rollback()
                logs.append("Transaction rolled back.")
            except pyodbc.Error as rb_ex:
                logs.append(f"Error during rollback: {rb_ex}")

    finally:
        if 'conn' in locals() and conn:
            conn.close()
            logs.append("Connection closed.")
            
    return JSONResponse(content={"logs": logs, "rows_affected": rows_affected, "error": error})
