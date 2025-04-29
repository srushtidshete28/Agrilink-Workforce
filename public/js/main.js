document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/current-user');
        const data = await response.json();
        
        if (response.ok) {
          return data.user;
        } else {
          return null;
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        return null;
      }
    };
    
    // Update navigation based on auth status
    const updateNavigation = (user) => {
      const authNav = document.getElementById('auth-nav');
      
      if (authNav) {
        if (user) {
          // User is logged in
          authNav.innerHTML = 
          authNav.innerHTML = `
          <li><a href="${user.userType === 'worker' ? '/dashboard-worker' : '/dashboard-farmer'}">Dashboard</a></li>
          <li><a href="/profile">Profile</a></li>
          <li><a href="#" id="logout-link">Logout</a></li>
        `;
        
          
          
          // Add logout event listener
          document.getElementById('logout-link').addEventListener('click', async (e) => {
            e.preventDefault();
            
            try {
              const response = await fetch('/api/auth/logout');
              if (response.ok) {
                window.location.href = '/';
              }
            } catch (error) {
              console.error('Error logging out:', error);
            }
          });
        } else {
          // User is not logged in
          authNav.innerHTML = 
          authNav.innerHTML = `
          <li><a href="/login">Login</a></li>
          <li><a href="/register">Register</a></li>
        `;
        
        }
      }
    };
    
    // Check for flash messages in URL params
    const checkFlashMessages = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const message = urlParams.get('message');
      const type = urlParams.get('type') || 'info';
      
      if (message) {
        showAlert(message, type);
        
        // Remove message from URL
        const url = new URL(window.location);
        url.searchParams.delete('message');
        url.searchParams.delete('type');
        window.history.replaceState({}, '', url);
      }
    };
    
    // Display alert message
    const showAlert = (message, type = 'info') => {
      const alertContainer = document.getElementById('alert-container');
      
      if (alertContainer) {
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${type}`;
        alertElement.textContent = message;
        
        alertContainer.appendChild(alertElement);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
          alertElement.remove();
        }, 5000);
      }
    };
    
    // Initialize
    const init = async () => {
      const user = await checkAuth();
      updateNavigation(user);
      checkFlashMessages();
    };
    
    init();
  });
  