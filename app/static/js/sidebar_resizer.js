export function initSidebarResizer() {
    const sidebar = document.querySelector('.sidebar');
    const resizer = document.querySelector('.sidebar-resizer');
    let isResizing = false;

    if (sidebar && resizer) {
        resizer.addEventListener('mousedown', function(e) {
            if (window.innerWidth <= 768) return; // Disable on mobile
            isResizing = true;
            document.body.style.cursor = 'ew-resize';
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', function(e) {
            if (!isResizing) return;
            let newWidth = e.clientX - sidebar.getBoundingClientRect().left;
            newWidth = Math.max(120, Math.min(350, newWidth));
            sidebar.style.width = newWidth + 'px';
        });

        document.addEventListener('mouseup', function(e) {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        });

        // Responsive: reset sidebar width on resize if mobile
        window.addEventListener('resize', function() {
            if (window.innerWidth <= 768) {
                sidebar.style.width = '';
            }
        });
    }
} 