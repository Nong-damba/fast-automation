export function initGlpUpdate() {
    const glpForm = document.getElementById('glp-form');
    const glpGenerateBtn = document.getElementById('glp-generate-btn');
    const glpSqlSection = document.getElementById('glp-sql-section');
    const glpSqlCode = document.getElementById('glp-sql-code');
    const glpCopyBtn = document.getElementById('glp-copy-btn');
    const glpDownloadBtn = document.getElementById('glp-download-btn');
    const glpEditBtn = document.getElementById('glp-edit-btn');

    glpForm && glpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('glp-username').value.trim();
        const policyNumber = document.getElementById('glp-policy').value.trim();
        const effectiveDate = document.getElementById('glp-effective-date').value;
        const glpAmount = document.getElementById('glp-amount').value.trim();
        const epdDate = document.getElementById('glp-epd-date').value;
        const note = document.getElementById('glp-note').value.trim();
        
        if (!username || !policyNumber || !effectiveDate || !glpAmount || !epdDate || !note) {
            alert('Please fill in all fields.');
            return;
        }
        
        glpGenerateBtn.disabled = true;
        glpGenerateBtn.textContent = 'Generating...';
        
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('policy_number', policyNumber);
            formData.append('effective_date', effectiveDate);
            formData.append('glp_amount', glpAmount);
            formData.append('epd_date', epdDate);
            formData.append('note', note);
            
            const response = await fetch('/generate-glp-update-sql', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                glpSqlCode.textContent = data.sql_script;
                glpSqlSection.style.display = 'block';
                hljs.highlightElement(glpSqlCode);
            } else {
                alert(data.message || 'Error generating SQL script');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error generating SQL script. Please try again.');
        }
        
        glpGenerateBtn.disabled = false;
        glpGenerateBtn.textContent = 'Generate SQL';
    });

    glpEditBtn && glpEditBtn.addEventListener('click', () => {
        if (glpSqlCode.isContentEditable) {
            glpSqlCode.contentEditable = 'false';
            glpSqlCode.style.border = "1px solid transparent";
            glpEditBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
        } else {
            glpSqlCode.contentEditable = 'true';
            glpSqlCode.style.border = "1px solid #ccc";
            glpEditBtn.innerHTML = '<i class="fas fa-save"></i> Save';
            glpSqlCode.focus();
        }
    });

    // Copy and download for GLP Update
    glpCopyBtn && glpCopyBtn.addEventListener('click', () => {
        const text = glpSqlCode.textContent;
        navigator.clipboard.writeText(text).then(() => {
            const originalText = glpCopyBtn.innerHTML;
            glpCopyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                glpCopyBtn.innerHTML = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy SQL to clipboard');
        });
    });

    glpDownloadBtn && glpDownloadBtn.addEventListener('click', () => {
        const text = glpSqlCode.textContent;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'glp_update.sql';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });

    // --- GLP Table View Logic ---
    const glpViewRowsBtn = document.getElementById('glp-view-rows-btn');
    const glpReloadTableBtn = document.getElementById('glp-reload-table-btn');
    const glpTableSection = document.getElementById('glp-table-section');
    const glpTableContainer = document.getElementById('glp-table-container');
    let lastGlpTableRequest = null;

    async function fetchAndRenderGlpTable(server, database, policyNumber, effectiveDate) {
        glpTableContainer.innerHTML = '<div>Loading...</div>';
        try {
            const response = await fetch('/fetch-current-rows-glp-update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ server, database, policy_number: policyNumber, effective_date: effectiveDate })
            });
            const data = await response.json();
            if (data.error) {
                glpTableContainer.innerHTML = `<div class=\"error\">${data.error}</div>`;
            } else if (data.columns && data.rows) {
                if (data.rows.length === 0) {
                    glpTableContainer.innerHTML = '<div>No data found for this policy number and effective date.</div>';
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
                    glpTableContainer.innerHTML = tableHtml;
                }
            } else {
                glpTableContainer.innerHTML = '<div>Unexpected response from server.</div>';
            }
            glpTableSection.style.display = 'block';
        } catch (err) {
            glpTableContainer.innerHTML = `<div class=\"error\">${err.message}</div>`;
        }
    }

    function getGlpCurrentSelections() {
        const server = document.getElementById('glp-server-select').value;
        const database = document.getElementById('glp-database-select').value;
        const policyNumber = document.getElementById('glp-policy').value.trim();
        const effectiveDate = document.getElementById('glp-effective-date').value;
        return { server, database, policyNumber, effectiveDate };
    }

    glpViewRowsBtn && glpViewRowsBtn.addEventListener('click', () => {
        const { server, database, policyNumber, effectiveDate } = getGlpCurrentSelections();
        if (!server || !database || !policyNumber || !effectiveDate) {
            alert('Please select server, database, and enter a policy number and effective date.');
            return;
        }
        lastGlpTableRequest = { server, database, policyNumber, effectiveDate };
        fetchAndRenderGlpTable(server, database, policyNumber, effectiveDate);
    });

    glpReloadTableBtn && glpReloadTableBtn.addEventListener('click', () => {
        if (lastGlpTableRequest) {
            fetchAndRenderGlpTable(lastGlpTableRequest.server, lastGlpTableRequest.database, lastGlpTableRequest.policyNumber, lastGlpTableRequest.effectiveDate);
        } else {
            alert('No table to reload. Please view current rows first.');
        }
    });
} 