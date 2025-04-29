document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Get form data
      const formData = {
        email: loginForm.email.value,
        password: loginForm.password.value
      };
      
      // Validate form data
      if (!formData.email || !formData.password) {
        showAlert('Please fill in all fields.', 'error');
        return;
      }
      
      try {
        const response = await fetch('/login', {  // changed to `/login` (POST)
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
          window.location.href = data.user.userType === 'worker' ? 
            '/dashboard-worker?message=Login successful&type=success' : 
            '/dashboard-farmer?message=Login successful&type=success';
        } else {
          showAlert(data.message, 'error');
        }
      } catch (error) {
        console.error('Error logging in:', error);
        showAlert('An error occurred. Please try again.', 'error');
      }
    });
  }
  
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
});
