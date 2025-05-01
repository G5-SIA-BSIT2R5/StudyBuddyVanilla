document.addEventListener('DOMContentLoaded', function() {
  // Mobile sidebar functionality
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('mobile-sidebar');
  const backdrop = document.getElementById('backdrop');
  const sidebarClose = document.getElementById('sidebar-close');

  function openSidebar() {
    sidebar.classList.add('open');
    backdrop.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    backdrop.classList.remove('visible');
    document.body.style.overflow = '';
  }

  menuToggle.addEventListener('click', openSidebar);
  sidebarClose.addEventListener('click', closeSidebar);
  backdrop.addEventListener('click', closeSidebar);

  // Create toast notification function
  window.createToast = function(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'opacity 0.3s, transform 0.3s';
      
      setTimeout(() => {
        toastContainer.removeChild(toast);
      }, 300);
    }, 3000);
  };
});
