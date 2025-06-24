# Status to UUID mapping
STATUS_MAPPING = {
    "Pending Lapse": "00000000-0000-0000-0000-000000000001",
    "Issued": "00000000-0000-0000-0000-000000000002",
    "Pre Term": "00000000-0000-0000-0000-000000000003",
    "Active": "00000000-0000-0000-0000-000000000004",
    "Disability": "00000000-0000-0000-0000-000000000005",
    "Death Waiver": "00000000-0000-0000-0000-000000000006",
    "Paid Up": "00000000-0000-0000-0000-000000000007",
    "Daily Cost": "00000000-0000-0000-0000-000000000008",
    "ETI": "00000000-0000-0000-0000-000000000009",
    "RPU": "00000000-0000-0000-0000-000000000010",
    "Matured": "00000000-0000-0000-0000-000000000011",
    "Expired": "00000000-0000-0000-0000-000000000012",
    "Terminated": "00000000-0000-0000-0000-000000000013",
    "Max Loan Surrender": "00000000-0000-0000-0000-000000000014",
    "Lapsed": "00000000-0000-0000-0000-000000000015",
    "Do not Reinstate": "00000000-0000-0000-0000-000000000016",
    "Cancel Not Taken": "00000000-0000-0000-0000-000000000017",
    "Surrendered": "00000000-0000-0000-0000-000000000018",
    "Converted": "00000000-0000-0000-0000-000000000019",
    "Reissued": "00000000-0000-0000-0000-000000000020",
    "Rescission": "00000000-0000-0000-0000-000000000021",
    "Annuitized": "00000000-0000-0000-0000-000000000022",
    "Death Claim Approved": "00000000-0000-0000-0000-000000000023",
    "Rider Claimed or Exercised": "00000000-0000-0000-0000-000000000024",
    "Death Claim Pending": "00000000-0000-0000-0000-000000000025",
    "Pending": "00000000-0000-0000-0000-000000000026",
    "APL": "00000000-0000-0000-0000-000000000027",
    "Over Loaned": "00000000-0000-0000-0000-000000000028",
    "Claim Payout": "00000000-0000-0000-0000-000000000029",
    "Claim Paid": "00000000-0000-0000-0000-000000000030",
    "Pending Claim": "00000000-0000-0000-0000-000000000031",
    "Terminated - Conv Pd": "00000000-0000-0000-0000-000000000032",
    "Incomplete": "00000000-0000-0000-0000-000000000033",
    "Suspended - Active": "00000000-0000-0000-0000-000000000034",
    "Suspend - Not Active": "00000000-0000-0000-0000-000000000035",
    "Approved": "00000000-0000-0000-0000-000000000036",
    "Declined": "00000000-0000-0000-0000-000000000037",
    "Postponed": "00000000-0000-0000-0000-000000000038",
    "Payout": "00000000-0000-0000-0000-000000000039",
    "Due and Unpaid": "00000000-0000-0000-0000-000000000040",
    "Death Claim Paid": "00000000-0000-0000-0000-000000000041",
    "Active Restricted": "00000000-0000-0000-0000-000000000042",
    "Unemployed": "00000000-0000-0000-0000-000000000043",
    "Canceled-Free Look": "00000000-0000-0000-0000-000000000044"
}

def generate_sql_update_status(username, policy_number, status):
    """
    Generate SQL script for updating policy status
    
    Args:
        username (str): Username of the person making the change
        policy_number (str): Policy number to update
        status (str): New status for the policy
    
    Returns:
        str: Complete SQL script content
    """
    # Validate input
    if not username or not policy_number or not status:
        raise ValueError("All parameters are required")
    
    if status not in STATUS_MAPPING:
        raise ValueError(f"Invalid status: {status}")
    
    # Get the UUID for the status
    status_uuid = STATUS_MAPPING[status]
    
    # Generate SQL
    sql_template = f"""
BEGIN
    BEGIN TRY
        BEGIN TRAN

        -- Input variables
        DECLARE @UserLogin NVARCHAR(100) = '{username}'; -- Replace with actual username
        DECLARE @PolicyNumber NVARCHAR(50) = '{policy_number}'; -- Replace with actual policy number
        DECLARE @NewStatus UNIQUEIDENTIFIER = '{status_uuid}'; -- ID

        -- Get user ID from login
        DECLARE @UserID UNIQUEIDENTIFIER = (
            SELECT Usr_ID 
            FROM Cc_Opt_Usr_UserLogin_S 
            WHERE Usr_LOGIN = @UserLogin
        );

        -- Perform the update
        UPDATE Cm_Opt_Poh_PolicyHdr_S
        SET 
            Poh_STATUS = @NewStatus,
            Poh_USERID = @UserID,
            Poh_TIMESTAMP = GETDATE()
        WHERE 
            Poh_POLICYNUMBER = @PolicyNumber;

        COMMIT TRAN;
        PRINT 'Policy status updated successfully.';
    END TRY
    BEGIN CATCH
        SELECT 
            ERROR_NUMBER() AS ErrorNumber,
            ERROR_SEVERITY() AS ErrorSeverity,
            ERROR_STATE() AS ErrorState,
            ERROR_PROCEDURE() AS ErrorProcedure,
            ERROR_LINE() AS ErrorLine,
            ERROR_MESSAGE() AS ErrorMessage;
        ROLLBACK TRAN;
        PRINT 'An error occurred. Update failed.';
    END CATCH
END;
"""
    return sql_template 