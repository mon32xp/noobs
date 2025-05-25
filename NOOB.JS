
    let score = 0;
    let gold = 0;
    let clicks = 0;
    let level = 1;
    let combo = 0;
    let clickPower = 1;
    let comboTimer = null;
    let doublePointsActive = false;
    let autoClickerActive = false;
    let megaComboActive = false;
    let goldenRushActive = false;
    let achievements = [];
    let lastClickTime = 0;

    // متغيرات المتجر
    let shopItems = {
      clickBooster: { owned: false, cost: 10 },
      luckyCharm: { owned: false, cost: 25 },
      timeExtender: { owned: false, cost: 30 },
      comboMaster: { owned: false, cost: 40 },
      goldMagnet: { owned: false, cost: 60 },
      rainbow: { owned: false, cost: 100 }
    };

    // متغيرات المهارات
    let skills = {
      strength: { level: 0, maxLevel: 10, baseCost: 5 },
      speed: { level: 0, maxLevel: 10, baseCost: 8 },
      luck: { level: 0, maxLevel: 10, baseCost: 12 },
      focus: { level: 0, maxLevel: 10, baseCost: 15 },
      persistence: { level: 0, maxLevel: 10, baseCost: 20 },
      wisdom: { level: 0, maxLevel: 10, baseCost: 25 }
    };

    const wasim = document.getElementById('wasim');
    const texts = document.getElementById('texts');

    const phrases = [
      'وسيم نوب! 😎',
      'وسيم نوب للأبد! 🔥',
      'نوب وسيم! ⭐',
      'وسيم = نوب 💯',
      'نوووووب! 🎯',
      'وسيمة!👩 ',
      'نوب بامتياز 🏆',
      'وسيم كينج نوب! 🎮',
      'نوب وسيم برو! 💎',
      'وسيم ماستر نوب! 🌟'
    ];

    // إعداد أحداث اللمس والنقر
    wasim.addEventListener('touchstart', handleTouch, { passive: false });
    wasim.addEventListener('click', clickWasim);

    function handleTouch(event) {
      event.preventDefault();
      const touch = event.touches[0];
      clickWasim({
        clientX: touch.clientX,
        clientY: touch.clientY
      });
    }

    function switchTab(tabName) {
      // إخفاء جميع التبويبات
      document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
      });
      document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
      });

      // إظهار التبويب المحدد
      document.getElementById(tabName + 'Tab').classList.add('active');
      event.target.classList.add('active');

      // تحديث المتجر والمهارات عند فتحهما
      if (tabName === 'shop') updateShop();
      if (tabName === 'skills') updateSkills();
    }
function goToHome() {
  window.location.href = "index.html"; 
}

    function clickWasim(event) {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastClickTime;
      
      clicks++;
      combo++;
      
      // فحص النقر السريع
      if (timeDiff < 200 && clicks > 10) {
        checkSpeedAchievement();
      }
      
      lastClickTime = currentTime;
      
      // حساب قوة النقر الإجمالية
      let totalClickPower = clickPower;
      totalClickPower += skills.strength.level * 2; // كل مستوى قوة يضيف 2
      if (shopItems.clickBooster.owned) totalClickPower += 3;
      
      // حساب النقاط
      let points = Math.max(1, Math.floor(combo / 2) + totalClickPower);
      if (doublePointsActive) points *= 2;
      if (megaComboActive) points *= 3;
      if (skills.focus.level > 0) points += Math.floor(skills.focus.level / 2);
      
      score += points;
      
      // هل سنحصل على ذهب؟
      let goldEarned = 0;
      let goldChance = 0.1 + (skills.luck.level * 0.05); // 10% أساسية + 5% لكل مستوى حظ
      if (shopItems.luckyCharm.owned) goldChance += 0.15;
      if (goldenRushActive) goldChance += 0.3;
      
      if (Math.random() < goldChance) {
        goldEarned = Math.max(1, Math.floor(level / 2) + skills.wisdom.level);
        if (shopItems.goldMagnet.owned) goldEarned = Math.floor(goldEarned * 1.5);
        gold += goldEarned;
      }
      
      // تحديث المستوى
      const newLevel = Math.floor(score / 100) + 1;
      if (newLevel > level) {
        level = newLevel;
        showLevelUp();
      }
      
      // إضافة الأنيميشن
      wasim.classList.add('clicked');
      setTimeout(() => wasim.classList.remove('clicked'), 600);
      
      // تأثيرات بصرية خاصة
      if (shopItems.rainbow.owned) {
        wasim.style.background = `linear-gradient(45deg, hsl(${Math.random() * 360}, 70%, 60%), hsl(${Math.random() * 360}, 70%, 60%))`;
        setTimeout(() => {
          wasim.style.background = 'linear-gradient(45deg, #ff6b6b, #ee5a52)';
        }, 300);
      }
      
      // إضافة نص طائر
      createFloatingText(event, goldEarned > 0 ? `+${points} | 💰${goldEarned}` : `+${points}`);
      
      // إضافة نص جديد
      const newText = document.createElement('div');
      newText.classList.add('new-text');
      const phrase = phrases[Math.floor(Math.random() * phrases.length)];
      let textContent = `${phrase} <strong>(+${points} نقطة)`;
      if (goldEarned > 0) textContent += ` 💰+${goldEarned}`;
      textContent += '</strong>';
      newText.innerHTML = textContent;
      
      if (combo >= 5) {
        const comboText = document.createElement('div');
        comboText.classList.add('combo');
        comboText.textContent = `🔥 كومبو ${combo}x! 🔥`;
        texts.appendChild(comboText);
      }
      
      // فحص المعالم
      if (score % 500 === 0 && score > 0) {
        newText.classList.add('score-milestone');
        newText.innerHTML += ` 🎉 معلم ${score} نقطة!`;
      }
      
      texts.appendChild(newText);
      texts.scrollTop = texts.scrollHeight;
      
      // إزالة النصوص القديمة
      if (texts.childElementCount > 15) {
        texts.removeChild(texts.firstChild);
      }
      
      // تحديث العرض
      updateDisplay();
      
      // إعادة تعيين مؤقت الكومبو
      clearTimeout(comboTimer);
      let comboTimeout = 3000;
      if (shopItems.comboMaster.owned) comboTimeout = 5000;
      comboTimeout += skills.persistence.level * 200;
      
      comboTimer = setTimeout(() => {
        combo = 0;
        updateDisplay();
      }, comboTimeout);
      
      // فحص الإنجازات
      checkAchievements();
      
      // تحديث أزرار القوى
      updatePowerButtons();
      
      // اهتزاز خفيف للجوال
      if (navigator.vibrate) {
        navigator.vibrate(30 + skills.speed.level * 5);
      }
    }

    function createFloatingText(event, text) {
      const floatingText = document.createElement('div');
      floatingText.classList.add('floating-text');
      floatingText.textContent = text;
      
      const rect = wasim.getBoundingClientRect();
      const x = rect.left + Math.random() * rect.width;
      const y = rect.top + rect.height/2;
      
      floatingText.style.left = x + 'px';
      floatingText.style.top = y + 'px';
      floatingText.style.position = 'fixed';
      
      document.body.appendChild(floatingText);
      
      setTimeout(() => {
        if (document.body.contains(floatingText)) {
          document.body.removeChild(floatingText);
        }
      }, 2000);
    }

    function showLevelUp() {
      const levelUpText = document.createElement('div');
      levelUpText.classList.add('new-text', 'score-milestone');
      levelUpText.innerHTML = `🎊 تهانينا! وصلت للمستوى ${level}! 🎊`;
      texts.appendChild(levelUpText);
      texts.scrollTop = texts.scrollHeight;
      
      // اهتزاز قوي للمستوى الجديد
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }

    function updateDisplay() {
      document.getElementById('score').textContent = score.toLocaleString();
      document.getElementById('gold').textContent = gold.toLocaleString();
      document.getElementById('clicks').textContent = clicks.toLocaleString();
      document.getElementById('level').textContent = level;
      document.getElementById('combo').textContent = combo;
      
      // حساب قوة النقر الإجمالية
      let totalClickPower = clickPower + skills.strength.level * 2;
      if (shopItems.clickBooster.owned) totalClickPower += 3;
      document.getElementById('clickPower').textContent = totalClickPower;
    }

    function updatePowerButtons() {
      const doubleBtn = document.getElementById('doublePoints');
      const autoBtn = document.getElementById('autoClicker');
      const megaBtn = document.getElementById('megaCombo');
      const goldenBtn = document.getElementById('goldenRush');
      
      doubleBtn.disabled = score < 100;
      autoBtn.disabled = score < 200;
      megaBtn.disabled = score < 300;
      goldenBtn.disabled = score < 150;
      
      // إضافة تأثيرات بصرية للقوى النشطة
      doubleBtn.classList.toggle('powerup-active', doublePointsActive);
      autoBtn.classList.toggle('powerup-active', autoClickerActive);
      megaBtn.classList.toggle('powerup-active', megaComboActive);
      goldenBtn.classList.toggle('powerup-active', goldenRushActive);
    }

    function activateDoublePoints() {
      if (score >= 100 && !doublePointsActive) {
        score -= 100;
        doublePointsActive = true;
        updateDisplay();
        
        let duration = 15000;
        if (shopItems.timeExtender.owned) duration = 25000;
        
        setTimeout(() => {
          doublePointsActive = false;
          updatePowerButtons();
        }, duration);
        
        addMessage(`🚀 نقاط مضاعفة مفعلة لمدة ${duration/1000} ثانية!`);
        updatePowerButtons();
      }
    }

    function activateAutoClicker() {
      if (score >= 200 && !autoClickerActive) {
        score -= 200;
        autoClickerActive = true;
        updateDisplay();
        
        let duration = 20000;
        let interval = 800 - (skills.speed.level * 50);
        if (shopItems.timeExtender.owned) duration = 30000;
        
        const autoInterval = setInterval(() => {
          if (!autoClickerActive) {
            clearInterval(autoInterval);
            return;
          }
          const rect = wasim.getBoundingClientRect();
          clickWasim({ 
            clientX: rect.left + rect.width/2, 
            clientY: rect.top + rect.height/2 
          });
        }, Math.max(200, interval));
        
        setTimeout(() => {
          autoClickerActive = false;
          updatePowerButtons();
        }, duration);
        
        addMessage(`🤖 نقر تلقائي مفعل لمدة ${duration/1000} ثانية!`);
        updatePowerButtons();
      }
    }

    function activateMegaCombo() {
      if (score >= 300 && !megaComboActive) {
        score -= 300;
        megaComboActive = true;
        updateDisplay();
        
        let duration = 12000;
        if (shopItems.timeExtender.owned) duration = 20000;
        
        setTimeout(() => {
          megaComboActive = false;
          updatePowerButtons();
        }, duration);
        
        addMessage(`⚡ كومبو عملاق مفعل لمدة ${duration/1000} ثانية!`);
        updatePowerButtons();
      }
    }

    function activateGoldenRush() {
      if (score >= 150 && !goldenRushActive) {
        score -= 150;
        goldenRushActive = true;
        updateDisplay();
        
        let duration = 10000;
        if (shopItems.timeExtender.owned) duration = 18000;
        
        setTimeout(() => {
          goldenRushActive = false;
          updatePowerButtons();
        }, duration);
        
        addMessage(`💰 ذهب مضاعف مفعل لمدة ${duration/1000} ثانية!`);
        updatePowerButtons();
      }
    }

    function addMessage(message) {
      const newText = document.createElement('div');
      newText.classList.add('new-text');
      newText.innerHTML = `📢 ${message}`;
      texts.appendChild(newText);
      texts.scrollTop = texts.scrollHeight;
    }

    // وظائف المتجر
    function updateShop() {
      Object.keys(shopItems).forEach(itemKey => {
        const button = document.getElementById(itemKey);
        const item = shopItems[itemKey];
        
        if (item.owned) {
          button.classList.add('owned');
          button.innerHTML = button.innerHTML.replace(/\d+ ذهب/, 'مُشترى ✅');
          button.disabled = true;
        } else {
          button.disabled = gold < item.cost;
        }
      });
    }

    function buyShopItem(itemKey) {
      const item = shopItems[itemKey];
      if (gold >= item.cost && !item.owned) {
        gold -= item.cost;
        item.owned = true;
        updateDisplay();
        updateShop();
        
        const itemNames = {
          clickBooster: 'معزز النقر',
          luckyCharm: 'تعويذة الحظ',
          timeExtender: 'موسع الوقت',
          comboMaster: 'سيد الكومبو',
          goldMagnet: 'مغناطيس الذهب',
          rainbow: 'قوس قزح'
        };
        
        addMessage(`🛒 تم شراء ${itemNames[itemKey]} بنجاح!`);
        
        // اهتزاز للشراء
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
      }
    }

    // وظائف المهارات
    function updateSkills() {
      Object.keys(skills).forEach(skillKey => {
        const skill = skills[skillKey];
        const button = document.getElementById(skillKey + 'Skill');
        const levelSpan = document.getElementById(skillKey + 'Level');
        const costSpan = document.getElementById(skillKey + 'Cost');
        
        levelSpan.textContent = skill.level;
        
        if (skill.level >= skill.maxLevel) {
          button.classList.add('maxed');
          button.disabled = true;
          costSpan.textContent = 'مكتمل';
        } else {
          const cost = getSkillCost(skillKey);
          costSpan.textContent = cost;
          button.disabled = gold < cost;
        }
      });
    }

    function getSkillCost(skillKey) {
      const skill = skills[skillKey];
      return Math.floor(skill.baseCost * Math.pow(1.5, skill.level));
    }

    function upgradeSkill(skillKey) {
      const skill = skills[skillKey];
      if (skill.level < skill.maxLevel) {
        const cost = getSkillCost(skillKey);
        if (gold >= cost) {
          gold -= cost;
          skill.level++;
          updateDisplay();
          updateSkills();
          
          const skillNames = {
            strength: 'القوة',
            speed: 'السرعة',
            luck: 'الحظ',
            focus: 'التركيز',
            persistence: 'المثابرة',
            wisdom: 'الحكمة'
          };
          
          addMessage(`⚡ تم ترقية ${skillNames[skillKey]} إلى مستوى ${skill.level}!`);
          
          // اهتزاز للترقية
          if (navigator.vibrate) {
            navigator.vibrate([150, 75, 150]);
          }
        }
      }
    }

    // فحص الإنجازات (محدثة)
    function checkAchievements() {
      const achievementsList = [
        { id: 'first_click', name: 'أول خطوة', desc: 'أول نقرة!', check: () => clicks >= 1 },
        { id: 'ten_clicks', name: 'مبتدئ', desc: '10 نقرات', check: () => clicks >= 10 },
        { id: 'fifty_clicks', name: 'متحمس', desc: '50 نقرة', check: () => clicks >= 50 },
        { id: 'hundred_clicks', name: 'محترف', desc: '100 نقرة', check: () => clicks >= 100 },
        { id: 'five_hundred_clicks', name: 'ماهر', desc: '500 نقرة', check: () => clicks >= 500 },
        { id: 'thousand_clicks', name: 'خبير', desc: '1000 نقرة', check: () => clicks >= 1000 },
        { id: 'level_5', name: 'صاعد', desc: 'وصول للمستوى 5', check: () => level >= 5 },
        { id: 'level_10', name: 'متقدم', desc: 'وصول للمستوى 10', check: () => level >= 10 },
        { id: 'combo_10', name: 'كومبو ماستر', desc: 'كومبو 10x', check: () => combo >= 10 },
        { id: 'combo_25', name: 'كومبو ليجند', desc: 'كومبو 25x', check: () => combo >= 25 },
        { id: 'first_gold', name: 'أول ذهب', desc: 'احصل على أول قطعة ذهب', check: () => gold >= 1 },
        { id: 'rich', name: 'ثري', desc: 'اجمع 100 ذهب', check: () => gold >= 100 },
        { id: 'shopaholic', name: 'مدمن تسوق', desc: 'اشتر 3 عناصر', check: () => Object.values(shopItems).filter(item => item.owned).length >= 3 },
        { id: 'skilled', name: 'ماهر', desc: 'ارق مهارة إلى مستوى 5', check: () => Object.values(skills).some(skill => skill.level >= 5) },
        { id: 'master', name: 'سيد', desc: 'اكمل مهارة واحدة', check: () => Object.values(skills).some(skill => skill.level >= 10) }
      ];

      achievementsList.forEach(achievement => {
        if (!achievements.includes(achievement.id) && achievement.check()) {
          achievements.push(achievement.id);
          showAchievement(achievement);
        }
      });
    }

    function checkSpeedAchievement() {
      if (!achievements.includes('speed_demon')) {
        achievements.push('speed_demon');
        showAchievement({ id: 'speed_demon', name: 'شيطان السرعة', desc: 'نقر سريع' });
      }
    }

    function showAchievement(achievement) {
      const achievementEl = document.createElement('div');
      achievementEl.classList.add('achievement');
      achievementEl.innerHTML = `🏆 إنجاز جديد: <strong>${achievement.name}</strong><br>${achievement.desc}`;
      document.getElementById('achievements').appendChild(achievementEl);
      
      // اهتزاز للإنجاز
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 200]);
      }
      
      setTimeout(() => {
        achievementEl.style.opacity = '0.8';
      }, 5000);
    }

    function resetGame() {
      if (confirm('هل تريد حقاً إعادة تشغيل اللعبة؟ سيتم فقدان جميع التقدم!')) {
        score = 0;
        gold = 0;
        clicks = 0;
        level = 1;
        combo = 0;
        clickPower = 1;
        achievements = [];
        doublePointsActive = false;
        autoClickerActive = false;
        megaComboActive = false;
        goldenRushActive = false;
        lastClickTime = 0;
        
        // إعادة تعيين المتجر
        Object.keys(shopItems).forEach(key => {
          shopItems[key].owned = false;
        });
        
        // إعادة تعيين المهارات
        Object.keys(skills).forEach(key => {
          skills[key].level = 0;
        });
        
        clearTimeout(comboTimer);
        
        texts.innerHTML = '';
        document.getElementById('achievements').innerHTML = '';
        
        updateDisplay();
        updatePowerButtons();
        updateShop();
        updateSkills();
        
        addMessage('🎮 تم إعادة تشغيل اللعبة! ابدأ من جديد!');
      }
    }

    // منع التكبير والسحب
    document.addEventListener('gesturestart', function (e) {
      e.preventDefault();
    });

    document.addEventListener('touchmove', function(e) {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });

    // تحديث أولي
    updateDisplay();
    updatePowerButtons();
    updateShop();
    updateSkills();
    addMessage('🎉 مرحباً بك في لعبة وسيم نوب المطورة! ابدأ بالنقر لكسب النقاط والذهب!');