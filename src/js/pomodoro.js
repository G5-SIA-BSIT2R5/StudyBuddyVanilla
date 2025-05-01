document.addEventListener('DOMContentLoaded', function() {
    // Timer elements
    const timerDisplay = document.getElementById('timer-display');
    const timeElement = timerDisplay.querySelector('.time');
    const timerTitle = document.getElementById('timer-title');
    const timerInfo = timerDisplay.querySelector('.timer-info');
    const sessionCountElement = document.getElementById('session-count');
    const startButton = document.getElementById('timer-start');
    const resetButton = document.getElementById('timer-reset');
    const settingsButton = document.getElementById('timer-settings-btn');
    const timerSettings = document.getElementById('timer-settings');
    const applySettingsButton = document.getElementById('apply-settings');
    const focusSlider = document.getElementById('focus-slider');
    const breakSlider = document.getElementById('break-slider');
    const focusValue = document.getElementById('focus-value');
    const breakValue = document.getElementById('break-value');
  
    // Timer variables
    let minutes = 25;
    let seconds = 0;
    let isRunning = false;
    let isBreak = false;
    let timer;
    let sessionCount = 0;
    let focusTime = 25;
    let breakTime = 5;
  
    // Update display function
    function updateDisplay() {
      timeElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      
      if (isBreak) {
        timerTitle.textContent = 'Break Timer';
        timerInfo.querySelector('span').textContent = 'Break time - Relax!';
      } else {
        timerTitle.textContent = 'Focus Timer';
        timerInfo.querySelector('span').textContent = 'Focus time - Stay productive!';
      }
      
      sessionCountElement.textContent = sessionCount;
    }
  
    // Timer functionality
    function startTimer() {
      if (isRunning) return;
      
      isRunning = true;
      startButton.innerHTML = '<i class="fas fa-pause"></i> Pause';
      
      timer = setInterval(function() {
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(timer);
            const nextIsBreak = !isBreak;
            
            if (nextIsBreak) {
              // Moving to break
              minutes = breakTime;
              seconds = 0;
              window.createToast('Break Time! Time to take a short break.', 'success');
              sessionCount++;
            } else {
              // Moving to focus
              minutes = focusTime;
              seconds = 0;
              window.createToast('Focus Time! Time to get back to work.', 'success');
            }
            
            isBreak = nextIsBreak;
            isRunning = false;
            startButton.innerHTML = '<i class="fas fa-play"></i> Start';
            updateDisplay();
          } else {
            minutes--;
            seconds = 59;
            updateDisplay();
          }
        } else {
          seconds--;
          updateDisplay();
        }
      }, 1000);
    }
  
    function pauseTimer() {
      clearInterval(timer);
      isRunning = false;
      startButton.innerHTML = '<i class="fas fa-play"></i> Start';
    }
  
    function resetTimer() {
      clearInterval(timer);
      isRunning = false;
      isBreak = false;
      minutes = focusTime;
      seconds = 0;
      startButton.innerHTML = '<i class="fas fa-play"></i> Start';
      updateDisplay();
    }
  
    // Event listeners
    startButton.addEventListener('click', function() {
      if (isRunning) {
        pauseTimer();
      } else {
        startTimer();
      }
    });
  
    resetButton.addEventListener('click', resetTimer);
  
    settingsButton.addEventListener('click', function() {
      timerDisplay.classList.toggle('hidden');
      timerSettings.classList.toggle('hidden');
    });
  
    // Settings functionality
    focusSlider.addEventListener('input', function() {
      focusValue.textContent = this.value;
    });
  
    breakSlider.addEventListener('input', function() {
      breakValue.textContent = this.value;
    });
  
    applySettingsButton.addEventListener('click', function() {
      focusTime = parseInt(focusSlider.value);
      breakTime = parseInt(breakSlider.value);
      
      if (!isBreak) {
        minutes = focusTime;
        seconds = 0;
      } else {
        minutes = breakTime;
        seconds = 0;
      }
      
      updateDisplay();
      timerDisplay.classList.remove('hidden');
      timerSettings.classList.add('hidden');
      
      window.createToast('Timer settings updated!', 'success');
    });
  
    // Initialize display
    updateDisplay();
  });