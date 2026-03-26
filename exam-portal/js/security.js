(function () {
    'use strict';

    // Disable Right Click
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        return false;
    });

    // Disable Shortcuts - DISABLED/RELAXED
    // document.addEventListener('keydown', function (e) {
    //     // F12 (DevTools)
    //     if (e.key === 'F12') {
    //         e.preventDefault();
    //         return false;
    //     }

    //     // Ctrl+Shift+I / Cmd+Option+I (DevTools)
    //     if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
    //         e.preventDefault();
    //         return false;
    //     }

    //     // Ctrl+Shift+J / Cmd+Option+J (Console)
    //     if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
    //         e.preventDefault();
    //         return false;
    //     }

    //     // Ctrl+Shift+C / Cmd+Option+C (Inspect Element)
    //     if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
    //         e.preventDefault();
    //         return false;
    //     }

    //     // Ctrl+U (View Source)
    //     if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
    //         e.preventDefault();
    //         return false;
    //     }

    //     // Ctrl+S (Save)
    //     if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) {
    //         e.preventDefault();
    //         return false;
    //     }

    //     // Ctrl+P (Print)
    //     if ((e.ctrlKey || e.metaKey) && (e.key === 'P' || e.key === 'p')) {
    //         e.preventDefault();
    //         return false;
    //     }

    //     // Ctrl+A (Select All) - Optional, but good for preventing mass copy
    //     if ((e.ctrlKey || e.metaKey) && (e.key === 'A' || e.key === 'a')) {
    //         e.preventDefault();
    //         return false;
    //     }

    //     // Ctrl+C (Copy)
    //     if ((e.ctrlKey || e.metaKey) && (e.key === 'C' || e.key === 'c')) {
    //         e.preventDefault();
    //         return false;
    //     }

    //     // Ctrl+V (Paste)
    //     if ((e.ctrlKey || e.metaKey) && (e.key === 'V' || e.key === 'v')) {
    //         e.preventDefault();
    //         return false;
    //     }
    // });

    // Disable Selection via CSS - DISABLED/RELAXED
    // const style = document.createElement('style');
    // style.innerHTML = `
    //     body {
    //         -webkit-user-select: none; /* Safari */
    //         -ms-user-select: none; /* IE 10 and IE 11 */
    //         user-select: none; /* Standard syntax */
    //     }
    //     input, textarea {
    //         -webkit-user-select: auto;
    //         -ms-user-select: auto;
    //         user-select: auto;
    //     }
    // `;
    // document.head.appendChild(style);

})();
