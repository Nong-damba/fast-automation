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
} 