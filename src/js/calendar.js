
document.addEventListener('DOMContentLoaded', function() {
    // Calendar elements
    const calendarContainer = document.getElementById('calendar-container');
    const calendarHeader = document.getElementById('calendar-header');
    const calendarGrid = document.getElementById('calendar-grid');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const monthYearDisplay = document.getElementById('month-year');
    const addEventButton = document.getElementById('add-event');
    const eventModal = document.getElementById('event-modal');
    const closeEventModal = document.getElementById('close-event-modal');
    const eventForm = document.getElementById('event-form');
    const eventList = document.getElementById('event-list');
    
    // Calendar variables
    let currentDate = new Date();
    let selectedDate = null;
    let events = JSON.parse(localStorage.getItem('ustp-events')) || {};
    
    // Initialize calendar if we're on the calendar page
    if (calendarContainer) {
      initCalendar();
    }
    
    function initCalendar() {
      renderCalendar();
      
      // Event listeners for calendar navigation
      prevMonthBtn.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
      });
      
      nextMonthBtn.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
      });
      
      // Event form handling
      eventForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveEvent();
      });
      
      // Close event modal
      closeEventModal.addEventListener('click', function() {
        eventModal.classList.add('hidden');
      });
      
      // Add new event button
      addEventButton.addEventListener('click', function() {
        selectedDate = new Date(currentDate);
        openEventModal();
      });
      
      // Close modal when clicking outside
      window.addEventListener('click', function(e) {
        if (e.target === eventModal) {
          eventModal.classList.add('hidden');
        }
      });
    }
    
    function renderCalendar() {
      // Update month and year display
      const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
      monthYearDisplay.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
      
      // Clear previous calendar
      calendarGrid.innerHTML = '';
      
      // Add day headers
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      dayNames.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
      });
      
      // Get first day of month
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      // Add empty cells for days before first day of month
      for (let i = 0; i < firstDay.getDay(); i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDay);
      }
      
      // Add days of the month
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        
        const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()+1}-${i}`;
        if (events[dateKey] && events[dateKey].length > 0) {
          dayEl.classList.add('has-events');
        }
        
        // Check if this is today
        const today = new Date();
        if (i === today.getDate() && 
            currentDate.getMonth() === today.getMonth() && 
            currentDate.getFullYear() === today.getFullYear()) {
          dayEl.classList.add('today');
        }
        
        // Day number
        const dayNumber = document.createElement('span');
        dayNumber.className = 'day-number';
        dayNumber.textContent = i;
        dayEl.appendChild(dayNumber);
        
        // Event indicator
        if (events[dateKey] && events[dateKey].length > 0) {
          const eventCount = document.createElement('span');
          eventCount.className = 'event-count';
          eventCount.textContent = events[dateKey].length;
          dayEl.appendChild(eventCount);
        }
        
        // Click on a day to add/view events
        dayEl.addEventListener('click', function() {
          selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
          openEventModal();
        });
        
        calendarGrid.appendChild(dayEl);
      }
      
      // Display events for the current month in the events list
      displayMonthEvents();
    }
    
    function displayMonthEvents() {
      if (!eventList) return;
      
      eventList.innerHTML = '';
      
      // Get all events for current month
      const monthEvents = [];
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      
      for (const dateKey in events) {
        if (dateKey.startsWith(`${currentYear}-${currentMonth}-`)) {
          events[dateKey].forEach(event => {
            monthEvents.push({
              date: dateKey,
              ...event
            });
          });
        }
      }
      
      // Sort events by date
      monthEvents.sort((a, b) => {
        const dateA = new Date(a.date.replace(/-/g, '/'));
        const dateB = new Date(b.date.replace(/-/g, '/'));
        
        if (dateA - dateB === 0) {
          // If same day, sort by time
          return a.time.localeCompare(b.time);
        }
        
        return dateA - dateB;
      });
      
      // Display events or empty state
      if (monthEvents.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = '<p>No events for this month. Add an event to get started!</p>';
        eventList.appendChild(emptyState);
        return;
      }
      
      // Group events by date
      const groupedEvents = {};
      monthEvents.forEach(event => {
        if (!groupedEvents[event.date]) {
          groupedEvents[event.date] = [];
        }
        groupedEvents[event.date].push(event);
      });
      
      // Create event items
      for (const date in groupedEvents) {
        const dateObj = new Date(date.replace(/-/g, '/'));
        const dateHeader = document.createElement('div');
        dateHeader.className = 'event-date-header';
        dateHeader.textContent = dateObj.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });
        eventList.appendChild(dateHeader);
        
        groupedEvents[date].forEach(event => {
          const eventItem = document.createElement('div');
          eventItem.className = `event-item ${event.type}`;
          
          eventItem.innerHTML = `
            <div class="event-time">${event.time}</div>
            <div class="event-details">
              <div class="event-title">${event.title}</div>
              <div class="event-description">${event.description || ''}</div>
            </div>
            <button class="icon-button delete-event" data-date="${date}" data-id="${event.id}">
              <i class="fas fa-trash-alt"></i>
            </button>
          `;
          
          eventList.appendChild(eventItem);
          
          // Add delete event listener
          const deleteBtn = eventItem.querySelector('.delete-event');
          deleteBtn.addEventListener('click', function() {
            const dateKey = this.getAttribute('data-date');
            const eventId = this.getAttribute('data-id');
            deleteEvent(dateKey, eventId);
          });
        });
      }
    }
    
    function openEventModal() {
      if (!eventModal) return;
      
      // Reset form
      document.getElementById('event-title').value = '';
      document.getElementById('event-description').value = '';
      document.getElementById('event-type').value = 'assignment';
      document.getElementById('event-time').value = '09:00';
      
      // Update modal title
      const modalTitle = document.getElementById('event-modal-title');
      if (modalTitle) {
        modalTitle.textContent = `Add Event - ${selectedDate.toLocaleDateString()}`;
      }
      
      // Show current events for selected date
      const currentEvents = document.getElementById('current-events');
      if (currentEvents) {
        currentEvents.innerHTML = '';
        
        const dateKey = formatDateKey(selectedDate);
        if (events[dateKey] && events[dateKey].length > 0) {
          events[dateKey].forEach(event => {
            const eventItem = document.createElement('div');
            eventItem.className = `modal-event-item ${event.type}`;
            
            eventItem.innerHTML = `
              <div>
                <strong>${event.time}</strong> - ${event.title}
              </div>
              <button class="icon-button delete-event" data-id="${event.id}">
                <i class="fas fa-trash-alt"></i>
              </button>
            `;
            
            currentEvents.appendChild(eventItem);
            
            // Add delete event listener
            const deleteBtn = eventItem.querySelector('.delete-event');
            deleteBtn.addEventListener('click', function() {
              const eventId = this.getAttribute('data-id');
              deleteEvent(dateKey, eventId);
              // Remove from modal without closing it
              this.closest('.modal-event-item').remove();
            });
          });
        } else {
          currentEvents.innerHTML = '<p>No events for this day</p>';
        }
      }
      
      // Show modal
      eventModal.classList.remove('hidden');
    }
    
    function saveEvent() {
      const title = document.getElementById('event-title').value.trim();
      if (!title) {
        window.createToast('Event title is required', 'error');
        return;
      }
      
      const description = document.getElementById('event-description').value.trim();
      const type = document.getElementById('event-type').value;
      const time = document.getElementById('event-time').value;
      
      // Format date key: YYYY-MM-DD
      const dateKey = formatDateKey(selectedDate);
      
      // Create event object
      const eventObj = {
        id: Date.now().toString(),
        title,
        description,
        type,
        time
      };
      
      // Add event to storage
      if (!events[dateKey]) {
        events[dateKey] = [];
      }
      events[dateKey].push(eventObj);
      
      // Save to localStorage
      localStorage.setItem('ustp-events', JSON.stringify(events));
      
      // Close modal
      eventModal.classList.add('hidden');
      
      // Refresh calendar
      renderCalendar();
      
      // Add to streak
      if (window.addActivityToStreak) {
        window.addActivityToStreak({
          type: 'calendar',
          description: `Added "${title}" event`
        });
      }
      
      // Show success message
      window.createToast('Event added successfully!', 'success');
    }
    
    function deleteEvent(dateKey, eventId) {
      if (events[dateKey]) {
        events[dateKey] = events[dateKey].filter(event => event.id !== eventId);
        
        // If no events left for this date, remove the date entry
        if (events[dateKey].length === 0) {
          delete events[dateKey];
        }
        
        // Save to localStorage
        localStorage.setItem('ustp-events', JSON.stringify(events));
        
        // Refresh calendar
        renderCalendar();
        
        // Show success message
        window.createToast('Event deleted!', 'error');
      }
    }
    
    function formatDateKey(date) {
      return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
    }
    
    // Export calendar functions to global scope
    window.calendar = {
      renderCalendar,
      openEventModal,
      saveEvent,
      deleteEvent
    };
  });
  