document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');
  const userTypeOptions = document.querySelectorAll('.user-type-option');
  const userTypeInput = document.getElementById('user-type');
  
  // User type selection
  if (userTypeOptions.length > 0) {
    userTypeOptions.forEach(option => {
      option.addEventListener('click', () => {
        // Remove selected class from all options
        userTypeOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Add selected class to clicked option
        option.classList.add('selected');
        
        // Update hidden input value
        userTypeInput.value = option.dataset.type;
      });
    });
  }
  
  // Form submission
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Get form data
      const formData = {
        username: registerForm.username.value,
        email: registerForm.email.value,
        password: registerForm.password.value,
        userType: userTypeInput.value
      };
      
      // Validate form data
      if (!formData.username || !formData.email || !formData.password || !formData.userType) {
        showAlert('Please fill in all fields.', 'error');
        return;
      }
      
      try {
        // Updated to POST to `/register` (not `/api/auth/register`)
        const response = await fetch('/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Redirect based on user type
          window.location.href = formData.userType === 'worker' ? 
            '/dashboard-worker?message=Registration successful&type=success' : 
            '/dashboard-farmer?message=Registration successful&type=success';
        } else {
          showAlert(data.message, 'error');
        }
      } catch (error) {
        console.error('Error registering:', error);
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
