export function initUpdateStatus() {
    const statusForm = document.getElementById('status-form');
    const statusGenerateBtn = document.getElementById('status-generate-btn');
    const statusSqlSection = document.getElementById('status-sql-section');
    const statusSqlCode = document.getElementById('status-sql-code');
    const statusCopyBtn = document.getElementById('status-copy-btn');
    const statusDownloadBtn = document.getElementById('status-download-btn');
    const statusEditBtn = document.getElementById('status-edit-btn');

    statusForm && statusForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('status-username').value.trim();
        const policyNumber = document.getElementById('status-policy').value.trim();
        const status = document.getElementById('status-select').value;
        if (!username || !policyNumber) {
            alert('Please fill in all fields.');
            return;
        }
        statusGenerateBtn.disabled = true;
        statusGenerateBtn.textContent = 'Generating...';
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('policy_number', policyNumber);
            formData.append('status', status);
            const response = await fetch('/generate-update-status-sql', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.success) {
                statusSqlCode.textContent = data.sql_script;
                statusSqlSection.style.display = 'block';
                hljs.highlightElement(statusSqlCode);
            } else {
                alert(data.message || 'Error generating SQL script');
            }
        } catch (error) {
            alert('Error generating SQL script. Please try again.');
        }
        statusGenerateBtn.disabled = false;
        statusGenerateBtn.textContent = 'Generate SQL';
    });

    statusEditBtn && statusEditBtn.addEventListener('click', () => {
        if (statusSqlCode.isContentEditable) {
            statusSqlCode.contentEditable = 'false';
            statusSqlCode.style.border = "1px solid transparent";
            statusEditBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
        } else {
            statusSqlCode.contentEditable = 'true';
            statusSqlCode.style.border = "1px solid #ccc";
            statusEditBtn.innerHTML = '<i class="fas fa-save"></i> Save';
            statusSqlCode.focus();
        }
    });

    // Copy and download for Update Policy Status
    statusCopyBtn && statusCopyBtn.addEventListener('click', () => {
        const text = statusSqlCode.textContent;
        navigator.clipboard.writeText(text).then(() => {
            const originalText = statusCopyBtn.innerHTML;
            statusCopyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                statusCopyBtn.innerHTML = originalText;
            }, 2000);
        }).catch(err => {
            alert('Failed to copy SQL to clipboard');
        });
    });

    statusDownloadBtn && statusDownloadBtn.addEventListener('click', () => {
        const text = statusSqlCode.textContent;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'update_policy_status.sql';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });

    // --- Policy Status Table View Logic ---
    const statusViewRowsBtn = document.getElementById('status-view-rows-btn');
    const statusReloadTableBtn = document.getElementById('status-reload-table-btn');
    const statusTableSection = document.getElementById('status-table-section');
    const statusTableContainer = document.getElementById('status-table-container');
    let lastStatusTableRequest = null;

    async function fetchAndRenderStatusTable(server, database, policyNumber) {
        statusTableContainer.innerHTML = '<div>Loading...</div>';
        try {
            const response = await fetch('/fetch-current-rows-update-policy-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ server, database, policy_number: policyNumber })
            });
            const data = await response.json();
            if (data.error) {
                statusTableContainer.innerHTML = `<div class=\"error\">${data.error}</div>`;
            } else if (data.columns && data.rows) {
                if (data.rows.length === 0) {
                    statusTableContainer.innerHTML = '<div>No data found for this policy number.</div>';
                } else {
                    // Transpose: fields as rows, records as columns
                    let tableHtml = '<div style="overflow-x:auto;overflow-y:auto;max-height:350px;">';
                    tableHtml += '<table class="epd-data-table" style="min-width:500px;width:auto;border-collapse:collapse;margin-top:10px;">';
                    tableHtml += '<thead><tr>';
                    tableHtml += '<th style="background:#f8f8f8;border:1px solid #eaeaea;padding:8px 10px;text-align:left;font-weight:600;">Field</th>';
                    data.rows.forEach((_, idx) => {
                        tableHtml += `<th style=\"background:#f8f8f8;border:1px solid #eaeaea;padding:8px 10px;text-align:left;font-weight:600;\">Record ${idx+1}</th>`;
                    });
                    tableHtml += '</tr></thead><tbody>';
                    data.columns.forEach((col, colIdx) => {
                        const rowStyle = colIdx % 2 === 0 ? 'background:#fff;' : 'background:#fafbfc;';
                        tableHtml += `<tr style=\"${rowStyle}\"><td style=\"border:1px solid #eaeaea;padding:8px 10px;font-weight:600;\">${col}</td>`;
                        data.rows.forEach(row => {
                            tableHtml += `<td style=\"border:1px solid #eaeaea;padding:8px 10px;\">${row[colIdx] !== null ? row[colIdx] : ''}</td>`;
                        });
                        tableHtml += '</tr>';
                    });
                    tableHtml += '</tbody></table></div>';
                    statusTableContainer.innerHTML = tableHtml;
                }
            } else {
                statusTableContainer.innerHTML = '<div>Unexpected response from server.</div>';
            }
            statusTableSection.style.display = 'block';
        } catch (err) {
            statusTableContainer.innerHTML = `<div class=\"error\">${err.message}</div>`;
        }
    }

    function getStatusCurrentSelections() {
        const server = document.getElementById('status-server-select').value;
        const database = document.getElementById('status-database-select').value;
        const policyNumber = document.getElementById('status-policy').value.trim();
        return { server, database, policyNumber };
    }

    statusViewRowsBtn && statusViewRowsBtn.addEventListener('click', () => {
        const { server, database, policyNumber } = getStatusCurrentSelections();
        if (!server || !database || !policyNumber) {
            alert('Please select server, database, and enter a policy number.');
            return;
        }
        lastStatusTableRequest = { server, database, policyNumber };
        fetchAndRenderStatusTable(server, database, policyNumber);
    });

    statusReloadTableBtn && statusReloadTableBtn.addEventListener('click', () => {
        if (lastStatusTableRequest) {
            fetchAndRenderStatusTable(lastStatusTableRequest.server, lastStatusTableRequest.database, lastStatusTableRequest.policyNumber);
        } else {
            alert('No table to reload. Please view current rows first.');
        }
    });
} 