document.addEventListener('DOMContentLoaded', () => {
    const workerGrid = document.getElementById('worker-grid');
    const filterForm = document.getElementById('worker-filter-form');
    const notificationsList = document.getElementById('notifications-list');
    
    // Fetch workers from API
    const fetchWorkers = async (filters = {}) => {
      try {
        // Build query string from filters
        const queryParams = new URLSearchParams();
        
        if (filters.location) queryParams.append('location', filters.location);
        if (filters.skills) queryParams.append('skills', filters.skills);
        if (filters.minExperience) queryParams.append('minExperience', filters.minExperience);
        if (filters.maxDailyWage) queryParams.append('maxDailyWage', filters.maxDailyWage);
        
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        
        const response = await fetch(`/api/workers${queryString}`);
        
        if (response.ok) {
          const data = await response.json();
          return data.workers;
        } else {
          return [];
        }
      } catch (error) {
        console.error('Error fetching workers:', error);
        return [];
      }
    };
    
    // Render workers in grid
    const renderWorkers = (workers) => {
      if (workerGrid) {
        workerGrid.innerHTML = '';
        
        if (workers.length === 0) {
          workerGrid.innerHTML = '<div class="no-results">No workers found matching your criteria.</div>';
          return;
        }
        
        workers.forEach(worker => {
          const workerCard = document.createElement('div');
          workerCard.className = 'worker-card';
          
          // Format skills as tags
          const skillsHtml = worker.skills.map(skill => 
            `<span class="skill-tag">${skill}</span>`
          ).join('');
          
          // Format availability dates
          const startDate = new Date(worker.availability.startDate);
          const endDate = new Date(worker.availability.endDate);
          const formattedDateRange = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
          
          workerCard.innerHTML = `
            <div class="worker-header">
              <h3 class="worker-name">${worker.fullName}</h3>
            </div>
            <div class="worker-body">
              <div class="worker-info">
                <i class="fas fa-map-marker-alt"></i>
                <span>${worker.location}</span>
              </div>
              <div class="worker-info">
                <i class="fas fa-briefcase"></i>
                <span>${worker.experience} years experience</span>
              </div>
              <div class="worker-info">
                <i class="fas fa-calendar-alt"></i>
                <span>Available: ${formattedDateRange}</span>
              </div>
              <div class="worker-info">
                <i class="fas fa-star"></i>
                <span>Rating: ${worker.averageRating || 'No ratings yet'}</span>
              </div>
              <div class="worker-skills">
                ${skillsHtml}
              </div>
            </div>
            <div class="worker-footer">
              <div class="daily-wage">$${worker.dailyWage}/day</div>
              <button class="btn hire-btn" data-id="${worker._id}">Hire Now</button>
            </div>
          `;
          
          workerGrid.appendChild(workerCard);
        });
        
        // Add event listeners to hire buttons
        document.querySelectorAll('.hire-btn').forEach(button => {
          button.addEventListener('click', () => {
            openHireModal(button.dataset.id);
          });
        });
      }
    };
    
    // Handle filter form submission
    if (filterForm) {
      filterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const filters = {
          location: filterForm.location.value,
          skills: filterForm.skills.value,
          minExperience: filterForm.minExperience.value,
          maxDailyWage: filterForm.maxDailyWage.value
        };
        
        const workers = await fetchWorkers(filters);
        renderWorkers(workers);
      });
      
      // Reset filters
      const resetBtn = filterForm.querySelector('button[type="reset"]');
      if (resetBtn) {
        resetBtn.addEventListener('click', async () => {
          setTimeout(async () => {
            const workers = await fetchWorkers();
            renderWorkers(workers);
          }, 100);
        });
      }
    }
    
    // Open hire modal
    const openHireModal = (workerId) => {
      // Create modal element
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.id = 'hire-modal';
      
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split('T')[0];
      
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h2>Hire Worker</h2>
            <span class="close-modal">&times;</span>
          </div>
          <div class="modal-body">
            <form id="hire-form">
              <div class="form-group">
                <label for="start-date">Start Date</label>
                <input type="date" id="start-date" name="startDate" class="form-control" min="${today}" required>
              </div>
              <div class="form-group">
                <label for="end-date">End Date</label>
                <input type="date" id="end-date" name="endDate" class="form-control" min="${today}" required>
              </div>
              <div class="form-group">
                <label for="offer-amount">Daily Wage Offer ($)</label>
                <input type="number" id="offer-amount" name="offerAmount" class="form-control" min="1" step="0.01" required>
              </div>
              <div class="form-group">
                <label for="job-description">Job Description</label>
                <textarea id="job-description" name="jobDescription" class="form-control" rows="4" required></textarea>
              </div>
              <input type="hidden" name="workerId" value="${workerId}">
              <button type="submit" class="btn btn-block">Send Hire Request</button>
            </form>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Show modal
      setTimeout(() => {
        modal.style.display = 'flex';
      }, 10);
      
      // Close modal when clicking X
      modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.style.display = 'none';
        setTimeout(() => {
          modal.remove();
        }, 300);
      });
      
      // Close modal when clicking outside
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
          setTimeout(() => {
            modal.remove();
          }, 300);
        }
      });
      
      // Handle hire form submission
      const hireForm = document.getElementById('hire-form');
      hireForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
          startDate: hireForm.startDate.value,
          endDate: hireForm.endDate.value,
          offerAmount: parseFloat(hireForm.offerAmount.value),
          jobDescription: hireForm.jobDescription.value
        };
        
        try {
          const response = await fetch(`/api/farmers/hire/${workerId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
          });
          
          const data = await response.json();
          
          if (response.ok) {
            showAlert('Hire request sent successfully!', 'success');
            modal.style.display = 'none';
            setTimeout(() => {
              modal.remove();
            }, 300);
          } else {
            showAlert(data.message, 'error');
          }
        } catch (error) {
          console.error('Error sending hire request:', error);
          showAlert('An error occurred. Please try again.', 'error');
        }
      });
    };
    
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
          
          notificationElement.innerHTML = `
            <div class="notification-header">
              <span class="notification-sender">${notification.sender.username}</span>
              <span class="notification-time">${formattedDate}</span>
            </div>
            <div class="notification-content">
              ${notification.message}
            </div>
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
    
    // Initialize farmer dashboard
    const initFarmerDashboard = async () => {
      const workers = await fetchWorkers();
      renderWorkers(workers);
      
      fetchAndDisplayNotifications();
      
      // Set up notification refresh interval
      setInterval(fetchAndDisplayNotifications, 60000); // Refresh every minute
    };
    
    // Check if on farmer dashboard page
    if (document.getElementById('farmer-dashboard')) {
      initFarmerDashboard();
    }
  });
  