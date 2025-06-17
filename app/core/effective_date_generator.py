def generate_sql_script(input_content):
    """
    Generate SQL script from input content containing username and policy data
    
    Args:
        input_content (str): Content of the input file
    
    Returns:
        tuple: (success, message, sql_script)
    """
    try:
        # Process input content
        lines = [line.strip() for line in input_content.split('\n') if line.strip()]
        
        if not lines:
            return False, "Error: Input is empty", None
        
        # Get username
        username = lines[0]
        
        # Process policy data
        policy_data = []
        for line in lines[1:]:
            parts = line.split()
            if len(parts) >= 2:
                policy_number = parts[0]
                effective_date = parts[1]
                policy_data.append((policy_number, effective_date))
        
        if not policy_data:
            return False, "Error: No policy data found", None
        
        # Generate SQL script
        sql_script = generate_sql_content(username, policy_data)
        
        return True, f"Processed {len(policy_data)} policies for user: {username}", sql_script
        
    except Exception as e:
        return False, f"Error: {str(e)}", None


def generate_sql_content(username, policy_data):
    """
    Generate the SQL script content
    
    Args:
        username (str): Username for user lookup
        policy_data (list): List of (policy_number, effective_date) tuples
    
    Returns:
        str: Complete SQL script content
    """
    
    sql_lines = [
        "BEGIN",
        "    BEGIN TRY",
        "        BEGIN TRAN",
        "",
        f"        DECLARE @User NVARCHAR(MAX) = '{username}'",
        "        DECLARE @TmpUsr UNIQUEIDENTIFIER = ISNULL(",
        "            (SELECT TOP 1 Usr_ID",
        "             FROM [dbo].[Cc_Opt_Usr_UserLogin_S]",
        "             WHERE Usr_LOGIN = @User),",
        "            'FFFFFFFF-0000-0000-0000-000000000000'",
        "        );",
        ""
    ]
    
    # Update statements
    for i, (policy_number, effective_date) in enumerate(policy_data):
        if i > 0:
            sql_lines.append("")
        
        sql_lines.extend([
            "        UPDATE Cm_Opt_Txh_TrxHdr_S",
            f"        SET txh_effectivedate = '{effective_date}',",
            "            txh_userid = @TmpUsr,",
            "            txh_timestamp = GETDATE()",
            "        WHERE txh_id IN (",
            "            SELECT Txh_id",
            "            FROM Cm_Opt_Poh_PolicyHdr_S poh",
            "            INNER JOIN Cm_Opt_Txh_TrxHdr_s txh ON Txh_POLICYHDRID = Poh_ID",
            "            INNER JOIN Cm_Sys_Pst_PolicyStatus_I ON Poh_STATUS = Pst_ID_I",
            "            INNER JOIN Cm_Sys_Txt_TrxType_I ON Txh_TRXTYPEID = Txt_ID_I",
            "            INNER JOIN Cm_Sys_Txs_TrxStatus_I ON Txs_ID_I = Txh_TRXSTATUS",
            "            INNER JOIN cm_ten_company_poh_s ON poh_id = com_policyhdrid",
            "            INNER JOIN cm_cfg_com_company_s ON com_companyid = com_id",
            f"            WHERE poh_policynumber = '{policy_number}'",
            "              AND txt_description_i IN ('Annutized Conversion Summary','Build Payout Values')",
            "        );"
        ])
    
    # Error handling
    sql_lines.extend([
        "",
        "        COMMIT TRAN",
        "        PRINT 'Effective date updated successfully'",
        "    END TRY",
        "    BEGIN CATCH",
        "        SELECT",
        "            ERROR_NUMBER() AS ErrorNumber,",
        "            ERROR_SEVERITY() AS ErrorSeverity,",
        "            ERROR_STATE() AS ErrorState,",
        "            ERROR_PROCEDURE() AS ErrorProcedure,",
        "            ERROR_LINE() AS ErrorLine,",
        "            ERROR_MESSAGE() AS ErrorMessage;",
        "        ROLLBACK TRAN",
        "        PRINT 'An error occurred Update failed'",
        "    END CATCH",
        "END;"
    ])
    
    return "\n".join(sql_lines) 