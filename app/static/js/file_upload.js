export function initFileUpload() {
    const fileInput = document.getElementById('file-input');
    const fileName = document.getElementById('file-name');
    const uploadForm = document.getElementById('upload-form');
    const generateSqlBtn = document.getElementById('generate-sql-btn');
    const sqlSection = document.getElementById('sql-section');
    const sqlCode = document.getElementById('sql-code');
    
    // Initially disable the generate button
    generateSqlBtn.disabled = true;
    generateSqlBtn.style.opacity = '0.5';
    generateSqlBtn.style.cursor = 'not-allowed';

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            fileName.textContent = file.name;
            // Enable the generate button when a file is selected
            generateSqlBtn.disabled = false;
            generateSqlBtn.style.opacity = '1';
            generateSqlBtn.style.cursor = 'pointer';
        } else {
            fileName.textContent = 'No file selected';
            // Disable the generate button when no file is selected
            generateSqlBtn.disabled = true;
            generateSqlBtn.style.opacity = '0.5';
            generateSqlBtn.style.cursor = 'not-allowed';
        }
    });

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = fileInput.files[0];
        if (!file) {
            alert('Please select a file first');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/generate-effective-date-sql', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                sqlCode.textContent = data.sql_script;
                sqlSection.style.display = 'block';
                // Highlight the SQL code
                hljs.highlightElement(sqlCode);
            } else {
                alert(data.message || 'Error generating SQL script');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error generating SQL script. Please try again.');
        }
    });

    // --- Effective Date Table View Logic ---
    const viewRowsBtn = document.getElementById('view-rows-btn');
    const reloadTableBtn = document.getElementById('reload-table-btn');
    const tableSection = document.getElementById('table-section');
    const tableContainer = document.getElementById('table-container');
    let lastTableRequest = null;
    let lastPolicyNumbers = [];

    // Helper to extract policy numbers from the uploaded file
    async function extractPolicyNumbersFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const text = e.target.result;
                // Expecting lines like: <policy_number> <YYYY-MM-DD>
                const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('<') && !l.includes('username'));
                const policyNumbers = lines.map(line => line.split(/\s+/)[0]).filter(Boolean);
                resolve(policyNumbers);
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    async function fetchAndRenderTable(server, database, policyNumbers) {
        tableContainer.innerHTML = '<div>Loading...</div>';
        try {
            const response = await fetch('/fetch-current-rows-update-effective-date', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ server, database, policy_numbers: policyNumbers })
            });
            const data = await response.json();
            if (data.error) {
                tableContainer.innerHTML = `<div class=\"error\">${data.error}</div>`;
            } else if (data.columns && data.rows) {
                if (data.rows.length === 0) {
                    tableContainer.innerHTML = '<div>No data found for these policy numbers.</div>';
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
                    tableContainer.innerHTML = tableHtml;
                }
            } else {
                tableContainer.innerHTML = '<div>Unexpected response from server.</div>';
            }
            tableSection.style.display = 'block';
        } catch (err) {
            tableContainer.innerHTML = `<div class=\"error\">${err.message}</div>`;
        }
    }

    viewRowsBtn && viewRowsBtn.addEventListener('click', async () => {
        const server = document.getElementById('server-select').value;
        const database = document.getElementById('database-select').value;
        const file = fileInput.files[0];
        if (!server || !database || !file) {
            alert('Please select server, database, and upload a file.');
            return;
        }
        const policyNumbers = await extractPolicyNumbersFromFile(file);
        if (!policyNumbers.length) {
            alert('No policy numbers found in the file.');
            return;
        }
        lastTableRequest = { server, database };
        lastPolicyNumbers = policyNumbers;
        fetchAndRenderTable(server, database, policyNumbers);
    });

    reloadTableBtn && reloadTableBtn.addEventListener('click', () => {
        if (lastTableRequest && lastPolicyNumbers.length) {
            fetchAndRenderTable(lastTableRequest.server, lastTableRequest.database, lastPolicyNumbers);
        } else {
            alert('No table to reload. Please view current rows first.');
        }
    });
} 