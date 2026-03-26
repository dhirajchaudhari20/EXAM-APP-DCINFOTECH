
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('chatModal');
  const maximizeBtn = document.getElementById('maximizeBtn');
  let maximized = false;

  function isDesktop() {
    return window.innerWidth > 600;
  }

  function setMaxBtnVisibility() {
    if (isDesktop()) maximizeBtn.style.display = '';
    else maximizeBtn.style.display = 'none';
    if (!isDesktop() && maximized) restoreModal();
  }

 function maximizeModal() {
  modal.classList.add('maximized');
  document.body.style.overflow = 'hidden';
  maximized = true;
  maximizeBtn.innerHTML = '&#9633;';
  maximizeBtn.title = "Restore";
}

function restoreModal() {
  modal.classList.remove('maximized');
  document.body.style.overflow = '';
  maximized = false;
  maximizeBtn.innerHTML = '&#9723;';
  maximizeBtn.title = "Maximize";
}

  maximizeBtn.addEventListener('click', function() {
    if (maximized) {
      restoreModal();
    } else {
      maximizeModal();
    }
  });

  window.addEventListener('resize', setMaxBtnVisibility);
  setMaxBtnVisibility();
});