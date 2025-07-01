def generate_sql_update_policy(current_policy_no, amended_policy_no, user_login):
    """
    Generate SQL script for updating policy number
    
    Args:
        current_policy_no (str): Current policy number
        amended_policy_no (str): New policy number to set
        user_login (str): Username of the person making the change
    
    Returns:
        str: Complete SQL script content
    """
    # Validate input
    if not current_policy_no or not amended_policy_no or not user_login:
        raise ValueError("All parameters are required")

    # Generate SQL 
    sql_template = f"""
BEGIN
    BEGIN TRY
        BEGIN TRAN

        -- Input variables
        DECLARE @UserLogin NVARCHAR(100) = '{user_login}'; -- person making the change
        DECLARE @CurrentPolicyNumber NVARCHAR(50) = '{current_policy_no}'; -- current policy number
        DECLARE @AmendedPolicyNumber NVARCHAR(50) = '{amended_policy_no}'; -- new policy number to set

        -- Get user ID from login
        DECLARE @userid UNIQUEIDENTIFIER = ISNULL(
            (SELECT TOP 1 Usr_ID 
            FROM Cc_Opt_Usr_UserLogin_S 
            WHERE Usr_LOGIN = @UserLogin),
            'FFFFFFFF-0000-0000-0000-000000000000'
        );

        -- Get policy ID using current policy number
        DECLARE @Poh_id_value UNIQUEIDENTIFIER = (
            SELECT Poh_ID 
            FROM Cm_Opt_Poh_PolicyHdr_S 
            WHERE Poh_POLICYNUMBER = @CurrentPolicyNumber
        );

        -- Update the policy number, timestamp, and user info
        UPDATE Cm_Opt_Poh_PolicyHdr_S
        SET 
            Poh_POLICYNUMBER = @AmendedPolicyNumber,
            Poh_TIMESTAMP = GETDATE(),
            Poh_USERID = @userid
        WHERE 
            Poh_ID = @Poh_id_value;

        COMMIT TRAN;
        PRINT 'Policy number updated successfully';
    END TRY
    BEGIN CATCH
        -- Error handling block
        SELECT 
            ERROR_NUMBER() AS ErrorNumber,
            ERROR_SEVERITY() AS ErrorSeverity,
            ERROR_STATE() AS ErrorState,
            ERROR_PROCEDURE() AS ErrorProcedure,
            ERROR_LINE() AS ErrorLine,
            ERROR_MESSAGE() AS ErrorMessage;

        ROLLBACK TRAN;
        PRINT 'An error occurred Update failed';
    END CATCH
END;
"""
    return sql_template 