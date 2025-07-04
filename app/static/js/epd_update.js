export function initEpdUpdate() {
    const epdForm = document.getElementById('epd-form');
    const epdGenerateBtn = document.getElementById('epd-generate-btn');
    const epdSqlSection = document.getElementById('epd-sql-section');
    const epdSqlCode = document.getElementById('epd-sql-code');
    const epdCopyBtn = document.getElementById('epd-copy-btn');
    const epdDownloadBtn = document.getElementById('epd-download-btn');
    const epdEditBtn = document.getElementById('epd-edit-btn');

    epdForm && epdForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('epd-username').value.trim();
        const policyNo = document.getElementById('epd-policy').value.trim();
        const epdDate = document.getElementById('epd-date').value;

        if (!username || !policyNo || !epdDate) {
            alert('Please fill in all fields.');
            return;
        }

        epdGenerateBtn.disabled = true;
        epdGenerateBtn.textContent = 'Generating...';

        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('policy_no', policyNo);
            formData.append('epd_date', epdDate);

            const response = await fetch('/generate-epd-update-sql', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                epdSqlCode.textContent = data.sql_script;
                epdSqlSection.style.display = 'block';
                hljs.highlightElement(epdSqlCode);
            } else {
                alert(data.message || 'Error generating SQL script');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error generating SQL script. Please try again.');
        }

        epdGenerateBtn.disabled = false;
        epdGenerateBtn.textContent = 'Generate SQL';
    });

    epdEditBtn && epdEditBtn.addEventListener('click', () => {
        if (epdSqlCode.isContentEditable) {
            epdSqlCode.contentEditable = 'false';
            epdSqlCode.style.border = "1px solid transparent";
            epdEditBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
        } else {
            epdSqlCode.contentEditable = 'true';
            epdSqlCode.style.border = "1px solid #ccc";
            epdEditBtn.innerHTML = '<i class="fas fa-save"></i> Save';
            epdSqlCode.focus();
        }
    });

    epdCopyBtn && epdCopyBtn.addEventListener('click', () => {
        const text = epdSqlCode.textContent;
        navigator.clipboard.writeText(text).then(() => {
            const originalText = epdCopyBtn.innerHTML;
            epdCopyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                epdCopyBtn.innerHTML = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy SQL to clipboard');
        });
    });

    epdDownloadBtn && epdDownloadBtn.addEventListener('click', () => {
        const text = epdSqlCode.textContent;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'epd_update.sql';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });

    // --- EPD Table View Logic ---
    const epdViewRowsBtn = document.getElementById('epd-view-rows-btn');
    const epdReloadTableBtn = document.getElementById('epd-reload-table-btn');
    const epdTableSection = document.getElementById('epd-table-section');
    const epdTableContainer = document.getElementById('epd-table-container');
    const epdLogsSection = document.getElementById('epd-logs-section');
    let lastTableRequest = null;

    async function fetchAndRenderTable(server, database, policyNumber) {
        epdTableContainer.innerHTML = '<div>Loading...</div>';
        epdLogsSection.style.display = 'none';
        epdLogsSection.innerHTML = '';
        try {
            const response = await fetch('/fetch-current-rows-epd-update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ server, database, policy_number: policyNumber })
            });
            const data = await response.json();
            if (data.error) {
                epdTableContainer.innerHTML = `<div class=\"error\">${data.error}</div>`;
            } else if (data.columns && data.rows) {
                if (data.rows.length === 0) {
                    epdTableContainer.innerHTML = '<div>No data found for this policy number.</div>';
                } else {
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
                    epdTableContainer.innerHTML = tableHtml;
                }
            } else {
                epdTableContainer.innerHTML = '<div>Unexpected response from server.</div>';
            }
            epdTableSection.style.display = 'block';
        } catch (err) {
            epdTableContainer.innerHTML = `<div class=\"error\">${err.message}</div>`;
        }
    }

    function getCurrentSelections() {
        const server = document.getElementById('epd-server-select').value;
        const database = document.getElementById('epd-database-select').value;
        const policyNumber = document.getElementById('epd-policy').value.trim();
        return { server, database, policyNumber };
    }

    epdViewRowsBtn && epdViewRowsBtn.addEventListener('click', () => {
        const { server, database, policyNumber } = getCurrentSelections();
        if (!server || !database || !policyNumber) {
            alert('Please select server, database, and enter a policy number.');
            return;
        }
        lastTableRequest = { server, database, policyNumber };
        fetchAndRenderTable(server, database, policyNumber);
    });

    epdReloadTableBtn && epdReloadTableBtn.addEventListener('click', () => {
        if (lastTableRequest) {
            fetchAndRenderTable(lastTableRequest.server, lastTableRequest.database, lastTableRequest.policyNumber);
        } else {
            alert('No table to reload. Please view current rows first.');
        }
    });

    // --- Keep logs section separate ---
    // (Assume logs are handled elsewhere, but ensure this section is not affected by table reloads)
} 