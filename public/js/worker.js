document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('worker-profile-form');
    const availabilityToggle = document.getElementById('availability-toggle');
    const notificationsList = document.getElementById('notifications-list');
    
    // Fetch worker profile data
    const fetchWorkerProfile = async () => {
      try {
        const response = await fetch('/api/workers/profile');
        
        if (response.ok) {
          const data = await response.json();
          return data.profile;
        } else {
          return null;
        }
      } catch (error) {
        console.error('Error fetching worker profile:', error);
        return null;
      }
    };
    
    // Populate profile form with data
    const populateProfileForm = (profile) => {
      if (profileForm && profile) {
        profileForm.fullName.value = profile.fullName;
        profileForm.location.value = profile.location;
        profileForm.phoneNumber.value = profile.phoneNumber;
        profileForm.experience.value = profile.experience;
        profileForm.dailyWage.value = profile.dailyWage;
        
        // Handle skills (convert array to comma-separated string)
        profileForm.skills.value = profile.skills.join(', ');
        
        // Handle availability dates
        if (profile.availability) {
          const startDate = new Date(profile.availability.startDate);
          const endDate = new Date(profile.availability.endDate);
          
          profileForm.availabilityStart.value = startDate.toISOString().split('T')[0];
          profileForm.availabilityEnd.value = endDate.toISOString().split('T')[0];
        }
        
        profileForm.bio.value = profile.bio || '';
        
        // Set availability toggle
        if (availabilityToggle) {
          availabilityToggle.checked = profile.isAvailable;
          
          // Update availability status text
          const statusText = document.getElementById('availability-status');
          if (statusText) {
            statusText.textContent = profile.isAvailable ? 'Available for Work' : 'Not Available';
          }
        }
      }
    };
    
    // Handle profile form submission
    if (profileForm) {
      profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = {
          fullName: profileForm.fullName.value,
          location: profileForm.location.value,
          phoneNumber: profileForm.phoneNumber.value,
          experience: parseInt(profileForm.experience.value),
          dailyWage: parseFloat(profileForm.dailyWage.value),
          skills: profileForm.skills.value.split(',').map(skill => skill.trim()),
          availability: {
            startDate: profileForm.availabilityStart.value,
            endDate: profileForm.availabilityEnd.value
          },
          bio: profileForm.bio.value
        };
        
        try {
          const response = await fetch('/api/workers/profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
          });
          
          const data = await response.json();
          
          if (response.ok) {
            showAlert('Profile updated successfully!', 'success');
          } else {
            showAlert(data.message, 'error');
          }
        } catch (error) {
          console.error('Error updating profile:', error);
          showAlert('An error occurred. Please try again.', 'error');
        }
      });
    }
    
    // Handle availability toggle
    if (availabilityToggle) {
      availabilityToggle.addEventListener('change', async () => {
        try {
          const response = await fetch('/api/workers/availability', {
            method: 'PUT'
          });
          
          const data = await response.json();
          
          if (response.ok) {
            showAlert(data.message, 'success');
            
            // Update availability status text
            const statusText = document.getElementById('availability-status');
            if (statusText) {
              statusText.textContent = data.isAvailable ? 'Available for Work' : 'Not Available';
            }
          } else {
            showAlert(data.message, 'error');
            // Revert toggle if error
            availabilityToggle.checked = !availabilityToggle.checked;
          }
        } catch (error) {
          console.error('Error toggling availability:', error);
          showAlert('An error occurred. Please try again.', 'error');
          // Revert toggle if error
          availabilityToggle.checked = !availabilityToggle.checked;
        }
      });
    }
    
    // Fetch and display notifications
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
        
        if (response.ok) {
          const data = await response.json();
          return data.notifications;
        } else {
          return [];
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }
    };
    
    // Render notifications
    const renderNotifications = (notifications) => {
      if (notificationsList) {
        notificationsList.innerHTML = '';
        
        if (notifications.length === 0) {
          notificationsList.innerHTML = '<div class="notification-item">No notifications yet</div>';
          return;
        }
        
        notifications.forEach(notification => {
          const notificationElement = document.createElement('div');
          notificationElement.className = `notification-item ${notification.read ? '' : 'unread'}`;
          
          // Format date
          const notificationDate = new Date(notification.createdAt);
          const formattedDate = notificationDate.toLocaleDateString() + ' ' + 
            notificationDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          let actionsHtml = '';
          
          // Add response buttons for hire requests
          if (notification.type === 'hire_request' && !notification.read) {
            actionsHtml = 
              <div class="notification-actions">
                <button class="btn btn-sm accept-hire" data-id="${notification._id}">Accept</button>
                <button class="btn btn-sm btn-secondary reject-hire" data-id="${notification._id}">Decline</button>
              </div>
            ;
          }
          
          notificationElement.innerHTML = `
            <div class="notification-header">
              <span class="notification-sender">${notification.sender.username}</span>
              <span class="notification-time">${formattedDate}</span>
            </div>
            <div class="notification-content">
              ${notification.message}
            </div>
            ${actionsHtml}
          `;
          
          notificationsList.appendChild(notificationElement);
          
          // Mark as read when clicked
          notificationElement.addEventListener('click', async () => {
            if (!notification.read) {
              await markNotificationAsRead(notification._id);
              notificationElement.classList.remove('unread');
            }
          });
        });
        
        // Add event listeners for hire response buttons
        document.querySelectorAll('.accept-hire').forEach(button => {
          button.addEventListener('click', async (e) => {
            e.stopPropagation();
            await respondToHireRequest(button.dataset.id, true);
          });
        });
        
        document.querySelectorAll('.reject-hire').forEach(button => {
          button.addEventListener('click', async (e) => {
            e.stopPropagation();
            await respondToHireRequest(button.dataset.id, false);
          });
        });
      }
    };
    
    // Mark notification as read
    const markNotificationAsRead = async (notificationId) => {
      try {
        await fetch(`/api/notifications/${notificationId}/read`, {
          method: 'PUT'
        });
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    };
    
    // Respond to hire request
    const respondToHireRequest = async (notificationId, accept) => {
      try {
        const response = await fetch(`/api/notifications/${notificationId}/respond`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ accept })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          showAlert(data.message, 'success');
          // Refresh notifications
          fetchAndDisplayNotifications();
        } else {
          showAlert(data.message, 'error');
        }
      } catch (error) {
        console.error('Error responding to hire request:', error);
        showAlert('An error occurred. Please try again.', 'error');
      }
    };
    
    // Fetch and display notifications
    const fetchAndDisplayNotifications = async () => {
      const notifications = await fetchNotifications();
      renderNotifications(notifications);
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
    
    // Initialize worker dashboard
    const initWorkerDashboard = async () => {
      const profile = await fetchWorkerProfile();
      if (profile) {
        populateProfileForm(profile);
      }
      
      fetchAndDisplayNotifications();
      
      // Set up notification refresh interval
      setInterval(fetchAndDisplayNotifications, 60000); // Refresh every minute
    };
    
    // Check if on worker dashboard page
    if (document.getElementById('worker-dashboard')) {
      initWorkerDashboard();
    }
  });