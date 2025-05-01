document.addEventListener('DOMContentLoaded', function() {
    // Streak elements
    const streakCountElement = document.getElementById('streak-count');
    const lastActivityElement = document.getElementById('last-activity');
    
    // Streak variables
    let streakData = JSON.parse(localStorage.getItem('ustp-streak')) || {
      currentStreak: 0,
      lastActivity: null,
      activities: [],
      longestStreak: 0
    };
    
    // Update streak display
    function updateStreakDisplay() {
      if (streakCountElement) {
        streakCountElement.textContent = streakData.currentStreak;
      }
      
      if (lastActivityElement && streakData.lastActivity) {
        const lastDate = new Date(streakData.lastActivity);
        lastActivityElement.textContent = lastDate.toLocaleDateString();
      }
    }
    
    // Check and update streak
    function checkStreak() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (streakData.lastActivity) {
        const lastActivity = new Date(streakData.lastActivity);
        lastActivity.setHours(0, 0, 0, 0);
        
        const timeDiff = today.getTime() - lastActivity.getTime();
        const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
        
        if (dayDiff > 1) {
          // Streak broken
          streakData.currentStreak = 1;
        } else if (dayDiff === 1) {
          // Streak continues
          streakData.currentStreak += 1;
          
          // Update longest streak
          if (streakData.currentStreak > streakData.longestStreak) {
            streakData.longestStreak = streakData.currentStreak;
          }
        }
      } else {
        // First activity
        streakData.currentStreak = 1;
      }
      
      streakData.lastActivity = today.toISOString();
      saveStreakData();
    }
    
    // Add activity to streak
    window.addActivityToStreak = function(activity) {
      const today = new Date();
      
      // Only count one activity per type per day for streak purposes
      const todayStr = today.toISOString().split('T')[0];
      const alreadyHasActivityToday = streakData.activities.some(act => 
        act.date.split('T')[0] === todayStr && act.type === activity.type
      );
      
      // Add activity to history
      streakData.activities.push({
        type: activity.type,
        description: activity.description,
        date: today.toISOString()
      });
      
      // Only update streak if this is first activity of this type today
      if (!alreadyHasActivityToday) {
        checkStreak();
      }
      
      // Keep only last 100 activities
      if (streakData.activities.length > 100) {
        streakData.activities = streakData.activities.slice(-100);
      }
      
      saveStreakData();
      updateStreakDisplay();
    };
    
    function saveStreakData() {
      localStorage.setItem('ustp-streak', JSON.stringify(streakData));
    }
    
    // Initialize streak display
    updateStreakDisplay();
    
    // Populate streak activity in streak page if we're on the streak page
    const streakActivityList = document.getElementById('streak-activity-list');
    if (streakActivityList) {
      populateStreakActivities();
    }
    
    function populateStreakActivities() {
      streakActivityList.innerHTML = '';
      
      if (streakData.activities.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = '<p>No activities yet. Complete tasks to build your streak!</p>';
        streakActivityList.appendChild(emptyState);
        return;
      }
      
      // Group activities by date
      const groupedActivities = {};
      
      streakData.activities.forEach(activity => {
        const date = activity.date.split('T')[0];
        if (!groupedActivities[date]) {
          groupedActivities[date] = [];
        }
        groupedActivities[date].push(activity);
      });
      
      // Sort dates in descending order
      const sortedDates = Object.keys(groupedActivities).sort().reverse();
      
      sortedDates.forEach(date => {
        const dateGroup = document.createElement('div');
        dateGroup.className = 'date-group';
        
        const dateHeader = document.createElement('h3');
        dateHeader.className = 'date-header';
        const activityDate = new Date(date);
        dateHeader.textContent = activityDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        
        dateGroup.appendChild(dateHeader);
        
        const activitiesList = document.createElement('div');
        activitiesList.className = 'activities-list';
        
        groupedActivities[date].forEach(activity => {
          const activityItem = document.createElement('div');
          activityItem.className = 'activity-item';
          
          let iconClass;
          switch (activity.type) {
            case 'todo':
              iconClass = 'fa-check-circle';
              break;
            case 'note':
              iconClass = 'fa-sticky-note';
              break;
            case 'timer':
              iconClass = 'fa-clock';
              break;
            case 'calendar':
              iconClass = 'fa-calendar-check';
              break;
            default:
              iconClass = 'fa-star';
          }
          
          activityItem.innerHTML = `
            <div class="activity-icon">
              <i class="fas ${iconClass}"></i>
            </div>
            <div class="activity-details">
              <p>${activity.description}</p>
              <span class="activity-time">${new Date(activity.date).toLocaleTimeString()}</span>
            </div>
          `;
          
          activitiesList.appendChild(activityItem);
        });
        
        dateGroup.appendChild(activitiesList);
        streakActivityList.appendChild(dateGroup);
      });
    }
  });
  