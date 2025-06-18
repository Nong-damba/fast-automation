"""
GLP Update SQL Generator
Generates SQL scripts for updating GLP (Guaranteed Living Premium) amounts and related data.
"""

def generate_glp_update_sql(username: str, policy_number: str, effective_date: str, 
                           glp_amount: int, epd_date: str, note: str) -> str:
    """
    Generate SQL script for GLP update functionality.
    
    Args:
        username (str): User login name
        policy_number (str): Policy number
        effective_date (str): Effective date in YYYY-MM-DD format
        glp_amount (int): GLP amount (non-zero integer)
        epd_date (str): EPD date in YYYY-MM-DD format
        note (str): Note text for the update
    
    Returns:
        str: Generated SQL script
    """
    
    # Validate inputs
    if not username or not policy_number or not effective_date or not epd_date or not note:
        raise ValueError("All fields are required")
    
    if glp_amount <= 0:
        raise ValueError("GLP Amount must be a positive integer")
    
    # Generate the SQL script
    sql_script = f"""BEGIN
    BEGIN TRY
        BEGIN TRAN;

        -- Input Variables (replace with actual values or pass dynamically)
        DECLARE @UserLogin NVARCHAR(100) = '{username}';
        DECLARE @PolicyNumber NVARCHAR(50) = '{policy_number}';
        DECLARE @EffectiveDate DATE = '{effective_date}';
        DECLARE @GLPAmount MONEY = {glp_amount};
        DECLARE @EPDDate DATE = '{epd_date}';
        DECLARE @NoteText NVARCHAR(MAX) = '{note}';

        -- Get user ID
        DECLARE @UserID UNIQUEIDENTIFIER = (
            SELECT Usr_ID 
            FROM Cc_Opt_Usr_UserLogin_S 
            WHERE Usr_LOGIN = @UserLogin
        );

        -- Get Policy Header ID
        DECLARE @Poh_ID UNIQUEIDENTIFIER = (
            SELECT Poh_ID 
            FROM Cm_Opt_Poh_PolicyHdr_S 
            WHERE Poh_POLICYNUMBER = @PolicyNumber
        );

        -- Get Tul_ID for matching Anniversary transaction
        DECLARE @Tul_ID UNIQUEIDENTIFIER = (
            SELECT Tul_ID
            FROM Cm_Opt_Tul_TrxResUL_S
            INNER JOIN Cm_Opt_Tre_TrxRes_S ON Tul_TRXRESID = Tre_ID
            INNER JOIN Cm_Opt_Txh_TrxHdr_S ON Tre_TRXHDRID = Txh_ID
            INNER JOIN Cm_Sys_Txt_TrxType_I ON Txh_TRXTYPEID = Txt_ID_I
            WHERE 
                Txh_POLICYHDRID = @Poh_ID
                AND Txt_DESCRIPTION_I = 'Anniversary'
                AND Txh_EFFECTIVEDATE = @EffectiveDate
                AND Txh_TRXSTATUS LIKE '%02'
        );

        -- Generate a new GUID for Notes
        DECLARE @NoteID UNIQUEIDENTIFIER = NEWID();

        -- Update Cumulative GLP
        UPDATE Cm_Opt_Tul_TrxResUL_S 
        SET 
            Tul_CUMULATIVEGLP = @GLPAmount,
            Tul_USERID = @UserID,
            Tul_TIMESTAMP = GETDATE()
        WHERE Tul_ID = @Tul_ID;

        -- Update EPD
        UPDATE Cm_Opt_Poh_PolicyHdr_S 
        SET 
            Poh_EARLIESTPROCDATE = @EPDDate,
            Poh_USERID = @UserID,
            Poh_TIMESTAMP = GETDATE()
        WHERE Poh_POLICYNUMBER = @PolicyNumber;

        -- Insert User Note
        INSERT INTO Cm_Opt_Not_UserNotes_S (
            Not_ID,
            Not_NOTEPRIORITY,
            Not_DATEENTERED,
            Not_SUMMARY,
            Not_NOTECATEGORY,
            Not_NOTETYPE,
            Not_NOTES,
            Not_ROLE,
            Not_ALERTDISABLEDATE,
            Not_ALERTINDICATOR,
            Not_USERID,
            Not_TIMESTAMP,
            Not_ENDDATE
        )
        VALUES (
            @NoteID,
            '00000000-0000-0000-0000-000000000001', -- Priority
            GETDATE(),
            'EPD Update',
            '00000000-0000-0000-0000-000000000008', -- Category
            '00000000-0000-0000-0000-000000000001', -- Type
            @NoteText,
            NULL,
            NULL,
            NULL,
            @UserID,
            GETDATE(),
            NULL
        );

        -- Insert into Policy Header Notes Link Table
        INSERT INTO Cm_JON_POLICYHDR_Not_S (
            Poh_POLICYHDRID,
            Poh_USERNOTESID,
            Poh_USERID,
            Poh_TIMESTAMP
        )
        VALUES (
            @Poh_ID,
            @NoteID,
            @UserID,
            GETDATE()
        );

        -- Commit Transaction
        COMMIT TRAN;
        PRINT 'Successfully updated all data and notes.';

    END TRY
    BEGIN CATCH
        -- Handle errors
        SELECT 
            ERROR_NUMBER() AS ErrorNumber,
            ERROR_SEVERITY() AS ErrorSeverity,
            ERROR_STATE() AS ErrorState,
            ERROR_PROCEDURE() AS ErrorProcedure,
            ERROR_LINE() AS ErrorLine,
            ERROR_MESSAGE() AS ErrorMessage;
            
        ROLLBACK TRAN;
        PRINT 'Error occurred, transaction rolled back.';
    END CATCH
END;"""
    
    return sql_script 