def generate_sql_fund_name_change(username, cusip_id, parent_company_code, new_fund_name, new_fund_description):
    """
    Generate SQL script for fund name change
    
    Args:
        username (str): Username of the person making the change
        cusip_id (str): CUSIP ID of the fund
        parent_company_code (str): Parent company code
        new_fund_name (str): New fund name
        new_fund_description (str): New fund description
    
    Returns:
        str: Complete SQL script content
    """
    # Validate input
    if not username or not cusip_id or not parent_company_code or not new_fund_name or not new_fund_description:
        raise ValueError("All parameters are required")

    # Generate SQL 
    sql_template = f"""-- Fund Name change
BEGIN
DECLARE @UserLogin NVARCHAR(100) = '{username}';
DECLARE @CUSIP NVARCHAR(50) = '{cusip_id}';
DECLARE @ParentComCode NVARCHAR(10) = '{parent_company_code}';
DECLARE @NewFundName NVARCHAR(255) = '{new_fund_name}';
DECLARE @NewFundDesc NVARCHAR(255) = '{new_fund_description}';


        -- Get user ID from login
        DECLARE @UserID UNIQUEIDENTIFIER = (
            SELECT TOP 1 Usr_ID 
            FROM Cc_Opt_Usr_UserLogin_S 
            WHERE Usr_LOGIN = @UserLogin
        );

        -- Safety check: user must exist
        IF @UserID IS NULL
        BEGIN
            THROW 50001, 'Invalid username. User ID not found.', 1;
        END

-- temp table to store the Fnd_ID with the matching cusip id in a separate temporary table
DECLARE @UpdatedFunds TABLE (
    Fnd_ID UNIQUEIDENTIFIER,
    OldDescription NVARCHAR(255)
);
BEGIN TRY
    BEGIN TRAN;
    -- filling the @updatedfunds table
    INSERT INTO @UpdatedFunds (Fnd_ID, OldDescription)
    SELECT DISTINCT f.Fnd_ID, f.Fnd_DESCRIPTION
    FROM Cm_Sys_Fnd_Fund_S f
    INNER JOIN Cm_JON_PRODMODELFORMNUM_Fnd_Fcr_S fc ON fc.Pmf_FUNDID = f.Fnd_ID
    INNER JOIN Cm_Cfg_Pmf_ProdModelFormNum_S pmf ON pmf.pmf_id = fc.Pmf_PRODMODELFORMNUMID
    INNER JOIN Cm_Cfg_Com_Company_S com ON com.Com_ID = pmf.Pmf_ISSUINGCOMPANYID
    INNER JOIN Cm_Cfg_Com_Company_S par ON par.Com_ID = com.Com_PARENTCOMPANY
    WHERE f.Fnd_CUSIP = @CUSIP AND par.Com_CODE = @ParentComCode;
    -- Fund name change update
    UPDATE f
    SET
        f.Fnd_NAME = @NewFundName,
        f.Fnd_DESCRIPTION = @NewFundDesc,
        f.Fnd_TIMESTAMP = GETDATE(),
        f.Fnd_USERID = @UserID
    FROM Cm_Sys_Fnd_Fund_S f
    INNER JOIN @UpdatedFunds u ON f.Fnd_ID = u.Fnd_ID;
    -- Fund Stream Name update
    UPDATE s
    SET s.Fst_NAME = REPLACE(s.Fst_NAME, u.OldDescription, @NewFundDesc)
    FROM Cm_Opt_Fst_FundStream_S s
    INNER JOIN @UpdatedFunds u ON s.Fst_FUNDID = u.Fnd_ID
    WHERE s.Fst_NAME LIKE u.OldDescription + '%';
    COMMIT;
END TRY
BEGIN CATCH
    ROLLBACK;
    PRINT 'Error: ' + ERROR_MESSAGE();
END CATCH
END;"""
    return sql_template 