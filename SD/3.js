
    let progress = 0;
    let timer;
    let gameTimer;
    let gameOver = false;
    let timeLeft;
    let clickCount = 0;
    let isPaused = false;
    let difficulty = 'medium';
    let bestScore = parseInt(localStorage.getItem('wasim-best-score') || '0');
    let coins = parseInt(localStorage.getItem('wasim-coins') || '100');
    let ownedItems = JSON.parse(localStorage.getItem('wasim-items') || '{}');
    let activePowerups = {};
    let dirtSpots = [];
    let autoCleanInterval;
    
    const difficulties = {
      easy: { time: 15, increment: 7, target: 100 },
      medium: { time: 10, increment: 5, target: 100 },
      hard: { time: 8, increment: 3, target: 100 }
    };
    
    const shopItems = {
      strong_sponge: { name: '🧽 إسفنجة قوية', effect: 'increment_boost', value: 1.5 },
      magic_soap: { name: '🧴 صابون سحري', effect: 'score_multiplier', value: 2 },
      extra_time: { name: '⏰ وقت إضافي', effect: 'time_bonus', value: 5 },
      auto_clean: { name: '💨 تنظيف تلقائي', effect: 'auto_clean', value: 2 },
      dirt_protection: { name: '🌟 حماية من الأوساخ', effect: 'dirt_reduction', value: 0.5 }
    };
    
    document.getElementById('best-score').textContent = bestScore;
    document.getElementById('coins').textContent = coins;
    
    function createDirtSpots(count = 8) {
      const overlay = document.getElementById('dirt-overlay');
      overlay.innerHTML = '';
      dirtSpots = [];
      
      for (let i = 0; i < count; i++) {
        const spot = document.createElement('div');
        spot.className = 'dirt-spot';
        const size = Math.random() * 30 + 20;
        spot.style.width = size + 'px';
        spot.style.height = size + 'px';
        spot.style.left = Math.random() * 80 + 10 + '%';
        spot.style.top = Math.random() * 80 + 10 + '%';
        spot.style.animationDelay = Math.random() * 2 + 's';
        overlay.appendChild(spot);
        dirtSpots.push(spot);
      }
    }
    
    function removeDirtSpot() {
      if (dirtSpots.length > 0) {
        const randomIndex = Math.floor(Math.random() * dirtSpots.length);
        const spot = dirtSpots[randomIndex];
        spot.style.animation = 'none';
        spot.style.transform = 'scale(0)';
        spot.style.transition = 'transform 0.3s';
        setTimeout(() => {
          if (spot.parentNode) {
            spot.parentNode.removeChild(spot);
          }
        }, 300);
        dirtSpots.splice(randomIndex, 1);
      }
    }
    
    function addRandomDirt() {
      if (gameOver || (activePowerups.dirt_protection && Math.random() < 0.7)) return;
      
      const overlay = document.getElementById('dirt-overlay');
      const spot = document.createElement('div');
      spot.className = 'dirt-spot';
      const size = Math.random() * 25 + 15;
      spot.style.width = size + 'px';
      spot.style.height = size + 'px';
      spot.style.left = Math.random() * 80 + 10 + '%';
      spot.style.top = Math.random() * 80 + 10 + '%';
      spot.style.transform = 'scale(0)';
      spot.style.transition = 'transform 0.5s';
      overlay.appendChild(spot);
      dirtSpots.push(spot);
      
      setTimeout(() => {
        spot.style.transform = 'scale(1)';
      }, 100);
    }
    
    function setDifficulty(level) {
      difficulty = level;
      document.querySelectorAll('.difficulty-btn').forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');
      restartGame();
    }
    
    function goToHome() {
      window.location.href = "index.html"; 
    }
    
    function cleanWasim(event) {
      if (gameOver || isPaused) return;
      
      event.preventDefault();
      
      const config = difficulties[difficulty];
      let increment = config.increment;
      
      // تطبيق تحسينات المتجر
      if (activePowerups.strong_sponge) {
        increment *= activePowerups.strong_sponge;
      }
      
      progress += increment;
      clickCount++;
      
      if (progress > config.target) progress = config.target;
      
      const progressPercent = (progress / config.target) * 100;
      document.getElementById("soap-bar").style.width = progressPercent + "%";
      document.getElementById("progress-text").textContent = Math.round(progressPercent) + "%";
      document.getElementById("click-count").textContent = clickCount;
      
      // إزالة بقعة وسخ عشوائية
      if (Math.random() < 0.6) {
        removeDirtSpot();
      }
      
      // إضافة تأثيرات التنظيف
      createClickEffect(event);
      createSoapBubble(event);
      
      // اهتزاز خفيف للجوال
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      if (progress >= config.target) {
        winGame();
      }
    }
    
    function createClickEffect(event) {
      const container = document.getElementById('game-container');
      const rect = container.getBoundingClientRect();
      const x = (event.clientX || event.touches[0].clientX) - rect.left;
      const y = (event.clientY || event.touches[0].clientY) - rect.top;
      
      const effect = document.createElement('div');
      effect.className = 'click-effect';
      effect.style.left = (x - 15) + 'px';
      effect.style.top = (y - 15) + 'px';
      
      container.appendChild(effect);
      
      setTimeout(() => {
        if (container.contains(effect)) {
          container.removeChild(effect);
        }
      }, 600);
    }
    
    function createSoapBubble(event) {
      const container = document.getElementById('game-container');
      const rect = container.getBoundingClientRect();
      const x = (event.clientX || event.touches[0].clientX) - rect.left;
      const y = (event.clientY || event.touches[0].clientY) - rect.top;
      
      // إنشاء عدة فقاعات صابون
      for (let i = 0; i < 3; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'soap-bubble';
        const size = Math.random() * 20 + 10;
        bubble.style.width = size + 'px';
        bubble.style.height = size + 'px';
        bubble.style.left = (x - size/2 + (Math.random() - 0.5) * 40) + 'px';
        bubble.style.top = (y - size/2 + (Math.random() - 0.5) * 40) + 'px';
        
        container.appendChild(bubble);
        
        setTimeout(() => {
          if (container.contains(bubble)) {
            container.removeChild(bubble);
          }
        }, 1000);
      }
    }
    
    function updateTimer() {
      if (isPaused) return;
      
      document.getElementById("timer").textContent = timeLeft;
      
      // إضافة أوساخ جديدة أحياناً
      if (Math.random() < 0.3) {
        addRandomDirt();
      }
      
      if (timeLeft <= 0) {
        loseGame();
        return;
      }
      
      timeLeft--;
    }
    
    function winGame() {
      gameOver = true;
      clearInterval(gameTimer);
      if (autoCleanInterval) clearInterval(autoCleanInterval);
      
      let score = Math.round((timeLeft + 1) * 10 + (100 - clickCount));
      
      // تطبيق مضاعف النقاط
      if (activePowerups.magic_soap) {
        score *= activePowerups.magic_soap;
      }
      
      const coinsEarned = Math.floor(score / 10);
      coins += coinsEarned;
      localStorage.setItem('wasim-coins', coins.toString());
      document.getElementById('coins').textContent = coins;
      
      if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('wasim-best-score', bestScore.toString());
        document.getElementById('best-score').textContent = bestScore;
        document.getElementById("message").innerHTML = `🎉 رقم قياسي جديد!<br>وسيم صار نظيف! النتيجة: ${score}<br>ربحت ${coinsEarned} عملة! 🪙`;
      } else {
        document.getElementById("message").innerHTML = `🎉 أحسنت!<br>وسيم صار نظيف! النتيجة: ${score}<br>ربحت ${coinsEarned} عملة! 🪙`;
      }
      
      // اهتزاز للاحتفال
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 200]);
      }
    }
    
    function loseGame() {
      gameOver = true;
      clearInterval(gameTimer);
      if (autoCleanInterval) clearInterval(autoCleanInterval);
      document.getElementById("message").textContent = "💩 انتهى الوقت! وسيم هرب وهو وسخ!";
      
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
    }
    
    function startGame() {
      const config = difficulties[difficulty];
      timeLeft = config.time;
      
      // تطبيق الوقت الإضافي
      if (activePowerups.extra_time) {
        timeLeft += activePowerups.extra_time;
      }
      
      gameTimer = setInterval(updateTimer, 1000);
      updateTimer();
      
      // بدء التنظيف التلقائي
      if (activePowerups.auto_clean) {
        autoCleanInterval = setInterval(() => {
          if (!gameOver && !isPaused) {
            progress += activePowerups.auto_clean;
            if (progress > config.target) progress = config.target;
            
            const progressPercent = (progress / config.target) * 100;
            document.getElementById("soap-bar").style.width = progressPercent + "%";
            document.getElementById("progress-text").textContent = Math.round(progressPercent) + "%";
            
            if (Math.random() < 0.4) {
              removeDirtSpot();
            }
            
            if (progress >= config.target) {
              winGame();
            }
          }
        }, 1000);
      }
      
      createDirtSpots();
    }
    
    function togglePause() {
      isPaused = !isPaused;
      const pauseBtn = document.getElementById('pause-btn');
      
      if (isPaused) {
        pauseBtn.innerHTML = "▶️ متابعة";
        document.getElementById("message").textContent = "⏸️ اللعبة متوقفة مؤقتاً";
      } else {
        pauseBtn.innerHTML = "⏸️ إيقاف مؤقت";
        document.getElementById("message").textContent = "";
      }
    }
    
    function restartGame() {
      progress = 0;
      gameOver = false;
      isPaused = false;
      clickCount = 0;
      clearInterval(gameTimer);
      if (autoCleanInterval) clearInterval(autoCleanInterval);
      
      document.getElementById("soap-bar").style.width = "0%";
      document.getElementById("progress-text").textContent = "0%";
      document.getElementById("message").textContent = "";
      document.getElementById("click-count").textContent = "0";
      document.getElementById("pause-btn").innerHTML = "⏸️ إيقاف مؤقت";
      
      // إعادة تعيين التحسينات النشطة
      setupActivePowerups();
      updatePowerupDisplay();
      
      startGame();
    }
    
    function openShop() {
      document.getElementById('shop-modal').style.display = 'block';
      document.getElementById('shop-coins').textContent = coins;
      updateShopItems();
    }
    
    function closeShop() {
      document.getElementById('shop-modal').style.display = 'none';
    }
    
    function updateShopItems() {
      const items = document.querySelectorAll('.shop-item');
      items.forEach((item, index) => {
        const itemKeys = Object.keys(shopItems);
        const itemKey = itemKeys[index];
        const buyBtn = item.querySelector('.buy-btn');
        const price = parseInt(item.querySelector('.item-price').textContent);
        
        if (ownedItems[itemKey]) {
          buyBtn.textContent = 'مملوك ✓';
          buyBtn.classList.add('owned');
          buyBtn.disabled = true;
        } else if (coins < price) {
          buyBtn.disabled = true;
          buyBtn.textContent = 'غير كافي';
        } else {
          buyBtn.disabled = false;
          buyBtn.textContent = 'شراء';
          buyBtn.classList.remove('owned');
        }
      });
    }
    
    function buyItem(itemKey, price) {
      if (coins >= price && !ownedItems[itemKey]) {
        coins -= price;
        ownedItems[itemKey] = true;
        localStorage.setItem('wasim-coins', coins.toString());
        localStorage.setItem('wasim-items', JSON.stringify(ownedItems));
        
        document.getElementById('coins').textContent = coins;
        document.getElementById('shop-coins').textContent = coins;
        
        updateShopItems();
        setupActivePowerups();
        updatePowerupDisplay();
        
        // إضافة رسالة تأكيد
        const itemName = shopItems[itemKey].name;
        alert(`تم شراء ${itemName} بنجاح! 🎉`);
      }
    }
    
    function setupActivePowerups() {
      activePowerups = {};
      
      Object.keys(ownedItems).forEach(itemKey => {
        if (ownedItems[itemKey] && shopItems[itemKey]) {
          const item = shopItems[itemKey];
          activePowerups[item.effect] = item.value;
        }
      });
    }
    
    function updatePowerupDisplay() {
      const powerupContainer = document.getElementById('active-powerups');
      const powerupList = document.getElementById('powerup-list');
      
      if (Object.keys(activePowerups).length === 0) {
        powerupContainer.style.display = 'none';
        return;
      }
      
      powerupContainer.style.display = 'block';
      powerupList.innerHTML = '';
      
      Object.keys(ownedItems).forEach(itemKey => {
        if (ownedItems[itemKey] && shopItems[itemKey]) {
          const powerup = document.createElement('div');
          powerup.className = 'power-up';
          powerup.textContent = shopItems[itemKey].name;
          powerupList.appendChild(powerup);
        }
      });
    }
    
    // منع التكبير عند النقر المزدوج
    document.addEventListener('touchstart', function(event) {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    }, { passive: false });
    
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
    
    // إغلاق المتجر عند النقر خارجه
    document.getElementById('shop-modal').addEventListener('click', function(event) {
      if (event.target === this) {
        closeShop();
      }
    });
    
    // تهيئة اللعبة
    setupActivePowerups();
    updatePowerupDisplay();
    startGame();