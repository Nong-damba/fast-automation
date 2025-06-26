def generate_epd_update_script(username: str, policy_no: str, epd_date: str) -> str:
    """
    Generates an SQL script to update the EPD for a policy.

    Args:
        username (str): The user's login name.
        policy_no (str): The policy number.
        epd_date (str): The new EPD date in 'YYYY-MM-DD' format.

    Returns:
        str: The generated SQL script.
    """
    epd_datetime = f"{epd_date} 00:00:00.000"
    
    return f"""-- EPD Update for policy number {policy_no}

BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Declare input values
        DECLARE @UserLogin NVARCHAR(100) = '{username}';
        DECLARE @PolicyNumber NVARCHAR(50) = '{policy_no}';
        DECLARE @NewEPD DATETIME = '{epd_datetime}';

        -- Get user ID
        DECLARE @UserID UNIQUEIDENTIFIER = (
            SELECT Usr_ID 
            FROM Cc_Opt_Usr_UserLogin_S 
            WHERE Usr_LOGIN = @UserLogin
        );

        -- Update EPD date for the policy
        UPDATE Cm_Opt_Poh_PolicyHdr_S 
        SET 
            Poh_EARLIESTPROCDATE = @NewEPD,
            Poh_USERID = @UserID,
            Poh_TIMESTAMP = GETDATE()
        WHERE 
            Poh_POLICYNUMBER = @PolicyNumber;

        COMMIT TRANSACTION;
        PRINT 'EPD for policy {policy_no} successfully updated to {epd_date}!';
    END TRY
    BEGIN CATCH

        SELECT 
            ERROR_NUMBER() AS ErrorNumber,
            ERROR_SEVERITY() AS ErrorSeverity,
            ERROR_STATE() AS ErrorState,
            ERROR_PROCEDURE() AS ErrorProcedure,
            ERROR_LINE() AS ErrorLine,
            ERROR_MESSAGE() AS ErrorMessage;
            
        ROLLBACK TRANSACTION;
        PRINT 'Error occurred. Transaction rolled back.';
    END CATCH
END;
""" 