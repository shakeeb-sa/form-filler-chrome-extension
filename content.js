// ⚡ LIGHTNING LINKBUILDER — GOD-TIER FINAL v20
// HYBRID MODE: Real Data (Priority) + Fake Data (Fallback) + Smart Selects

let suggestionBox = null;

const style = document.createElement('style');
style.textContent = `
  .llb-suggestion {
    position: absolute;
    z-index: 2147483647;
    background: white;
    border-radius: 14px;
    box-shadow: 0 14px 45px rgba(0, 0, 0, 0.35);
    font-family: -apple-system, system-ui, sans-serif;
    min-width: 350px;
    max-height: 70vh;
    overflow-y: auto;
    overflow-x: hidden;
    border: 1px solid #ccc;
    scrollbar-width: thin;
    scrollbar-color: #0066cc #f0f0f0;
  }
  .llb-suggestion::-webkit-scrollbar { width: 8px; }
  .llb-suggestion::-webkit-scrollbar-track { background: #f0f0f0; border-radius: 10px; }
  .llb-suggestion::-webkit-scrollbar-thumb { background: #0066cc; border-radius: 10px; border: 2px solid #f0f0f0; }
  .llb-suggestion::-webkit-scrollbar-thumb:hover { background: #0052aa; }

  .llb-header {
    background: linear-gradient(90deg, #0066ff, #00ccff);
    color: white;
    padding: 16px 24px;
    font-weight: bold;
    font-size: 17px;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .llb-item {
    padding: 17px 24px;
    cursor: pointer;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all .15s;
    font-size: 15px;
  }
  .llb-item:hover {background: #ebf5ff;}
  .llb-item strong {color: #0066cc;}
  .llb-item small {
    color: #555;
    font-size: 13px;
    max-width: 210px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .llb-toast {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #00b894;
    color: white;
    padding: 18px 48px;
    border-radius: 50px;
    font-weight: bold;
    font-size: 18px;
    z-index: 2147483647;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
    animation: toast 3.3s forwards;
  }
  @keyframes toast {
    0%,100% {opacity: 0; transform: translateX(-50%) translateY(-30px)}
    12%,88% {opacity: 1; transform: translateX(-50%) translateY(0)}
  }
`;
document.head.appendChild(style);

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'llb-toast Marcello';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3300);
}

function getProfileData() {
  return new Promise(resolve => {
    chrome.storage.sync.get(null, items => {
      const active = items.activeProfile || 'profile1';
      resolve({ data: items[active] || {}, profileName: active });
    });
  });
}

function smartFill(el, value) {
  el.focus();
  el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.blur(); 
}

// --- FAKE DATA ENGINE ---
function generateFake(type) {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  
  // --- EXISTING FAKE DATA LISTS ---
  const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"];
  const streets = ["Main St", "Oak Ave", "Maple Dr", "Cedar Ln", "Park Blvd"];
  const companies = ["TechCorp", "Global Solutions", "Alpha Agency", "NextGen Media"];
  const titles = ["Marketing Director", "Content Manager", "SEO Specialist", "Owner"];
  const subjects = ["Inquiry regarding your website", "Collaboration Proposal", "Partnership Opportunity"];

  // --- YOUR SPECIFIC HARDCODED VALUES ---
  if (type === 'dob') return "11/11/2000";
  if (type === 'gender') return "male";
  if (type === 'language') return "English";
  if (type === 'timezone') return "Eastern Time (US & Canada)"; 
  if (type === 'fax') return "222-211-2911";
  if (type === 'secondaryEmail') return "info@gmail.com";
  if (type === 'price') return "10";
  if (type === 'social') return pick(["https://twitter.com/user", "https://linkedin.com/in/user", "https://facebook.com/user"]);
  if (type === 'companySize') return pick(["1-10", "11-50", "50-200"]);
  
  // Standard Fields
  if (type === 'city') return pick(cities);
  if (type === 'address') return `${Math.floor(Math.random() * 9000) + 100} ${pick(streets)}`;
  if (type === 'billing' || type === 'shipping') return "United States"; 
  if (type === 'zip') return Math.floor(Math.random() * 90000) + 10000;
  if (type === 'region') return pick(["CA", "NY", "TX", "FL", "IL"]);
  if (type === 'country') return "United States";
  if (type === 'phone') return `+1 ${Math.floor(Math.random() * 800) + 200}-${Math.floor(Math.random() * 800) + 200}-${Math.floor(Math.random() * 8999) + 1000}`;
  if (type === 'company') return pick(companies);
  if (type === 'title') return pick(titles);
  if (type === 'subject') return pick(subjects);

  return null; 
}

function getFieldType(el) {
  const str = [el.id, el.name, el.placeholder, el.autocomplete,
               el.getAttribute('aria-label'), el.labels?.[0]?.textContent,
               el.closest('label')?.textContent, el.closest('div')?.textContent || '']
              .join(' ').toLowerCase();

  // Standard checks
  if (el.type === 'password') return 'password';
  if (el.type === 'email' || /email|e-mail|mail/i.test(str)) {
      if (/secondary|alt|backup|other/i.test(str)) return 'secondaryEmail';
      return 'email';
  }
  if (/website|site|url|domain|link|web.?address/i.test(str)) {
      if (/social|twitter|facebook|linkedin|instagram/i.test(str)) return 'social';
      return 'website';
  }

  // --- SPECIFIC DETECTORS ---
  if (/fax/i.test(str)) return 'fax';
  if (/birth|dob|date.?of.?birth/i.test(str)) return 'dob';
  if (/gender|sex\b|male|female/i.test(str)) return 'gender';
  if (/language/i.test(str)) return 'language';
  if (/time.?zone/i.test(str)) return 'timezone';
  if (/size|employees|count/i.test(str)) return 'companySize';
  if (/price|budget|cost|amount/i.test(str)) return 'price';
  if (/billing/i.test(str)) return 'billing';
  if (/shipping/i.test(str)) return 'shipping';
  // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
  // ADD THIS EXACT BLOCK HERE (RIGHT AFTER THE ABOVE LINES)
  // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
  if (/category|cat.?id|type.?of.?post|section|classified/i.test(str) || 
      el.id === 'catId' || el.name === 'catId') {
    return 'category';
  }
  // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
  
  if (/username|user.?name|login|handle/i.test(str)) return 'username';
  if (/company|business|organization/i.test(str)) return 'company';
  if (/phone|mobile|tel|cell/i.test(str)) return 'phone';

  if (/address|street|location|city|state|province|zip|post.?code|country/i.test(str)) {
    if (/city|town/i.test(str)) return 'city';
    if (/state|province|region/i.test(str)) return 'region';
    if (/zip|post.?code/i.test(str)) return 'zip';
    if (/country/i.test(str)) return 'country';
    return 'address';
  }

  if (/name|person|contact/i.test(str)) {
    if (/first|given|fname/i.test(str)) return 'firstName';
    if (/last|surname|lname/i.test(str)) return 'lastName';
    return 'firstName'; 
  }

  if (/subject|topic|re:/i.test(str)) return 'subject'; 
  if (/title|headline|job/i.test(str)) return 'title';

  return 'unknown';
}

// --- INTELLIGENT QUAD-CLICK LOGIC ---
let clicks = 0;
document.addEventListener('click', async e => {
  const isInteractive = e.target.closest('a, button, input, textarea, select, label, [role="button"]');
  if (isInteractive) return;
  
  clicks++;
  if (clicks === 1) setTimeout(() => clicks = 0, 600);
  
  if (clicks === 4) {
  clicks = 0;

  // MODIFIER COMBINATIONS
  const isSelectMode     = (e.ctrlKey || e.metaKey) && !e.altKey;        // Ctrl/Cmd + 4 clicks → Smart Selects (your current one)
  const isSubmitMode     = (e.ctrlKey || e.metaKey) && e.altKey;         // Ctrl + Alt + 4 clicks → Submit Button Hunter
  const isRegularFill    = !e.ctrlKey && !e.metaKey && !e.altKey;        // Plain 4 clicks → Normal text fill

  const {data} = await getProfileData();
  if (!data || Object.keys(data).length === 0) {
    toast("⚠️ No data saved! Open popup → fill → save");
    return;
  }

    // ────────────────────────────────
  //  ★★★ CTRL + ALT + 4 CLICKS = AUTO SUBMIT (ULTRA SAFE VERSION) ★★★
  // ────────────────────────────────
  if (isSubmitMode) {
    const submitKeywords = [
      'submit', 'post', 'publish', 'register', 'sign up', 'signup', 
      'login', 'sign in', 'signin', 'create', 'save', 'continue', 
      'post ad', 'post listing', 'place order', 'complete', 'finish',
      'proceed', 'next', 'add listing', 'list now'
    ];

    const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"], a[role="button"]'))
      .filter(btn => {
        // 1. Must be visible
        if (!btn.offsetParent || btn.offsetWidth < 30 || btn.offsetHeight < 20) return false;
        if (btn.disabled) return false;

        // 2. Text must contain a submit keyword
        const text = (btn.textContent || btn.value || btn.title || btn.getAttribute('aria-label') || '').toLowerCase().trim();
        if (!submitKeywords.some(kw => text.includes(kw))) return false;

        // 3. CRITICAL: EXCLUDE ANY BUTTON INSIDE EDITORS OR TOOLBARS
        const parent = btn.closest('div, span, td, li');
        if (!parent) return true;

        const parentText = parent.textContent.toLowerCase();
        const parentClass = (parent.className || '').toLowerCase();
        const parentId = (parent.id || '').toLowerCase();

        // Blacklist known editor toolbar patterns
        const blacklist = [
          'mce', 'cke', 'tox', 'ql-', 'editor', 'toolbar', 'format', 'bold', 'italic', 'bullet', 'list',
          'wp-', 'admin', 'dashboard', 'menu', 'nav', 'sidebar', 'header', 'footer', 'modal', 'popup'
        ];

        if (blacklist.some(term => parentClass.includes(term) || parentId.includes(term))) {
          return false;
        }

        // Extra safety: if button is tiny or inside a <b>, <strong>, <i>, etc. → skip
        if (btn.closest('b, strong, i, em, u, span[style*="bold"], div[style*="font-weight"]')) return false;

        return true;
      });

    if (buttons.length > 0) {
      const target = buttons[0];
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        target.click();
        toast(`Submitted: "${target.textContent.trim() || target.value}"`);
      }, 500);
    } else {
      toast("No real submit button found");
    }

    return; // Stops everything else — 100% isolated
  }

    // ============================================================
    // MODE 1: SMART DROPDOWN SEQUENCE (CTRL + 4 CLICKS)
    // ============================================================
          if (isSelectMode) {
      const allSelects = Array.from(document.querySelectorAll('select'));
      if (allSelects.length === 0) {
        toast("⚠️ No dropdowns found.");
        return;
      }

      // --- HELPER: FIRE EVENTS (Trigger UI Updates) ---
      const fireEvents = (el) => {
        try {
          el.dispatchEvent(new Event('focus', { bubbles: true }));
          el.dispatchEvent(new Event('click', { bubbles: true })); // Added click
          el.dispatchEvent(new Event('change', { bubbles: true }));
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('blur', { bubbles: true }));
        } catch (e) { console.log(e); }
      };

      // --- HELPER: ROBUST MATCHER ---
      const processSingleSelect = (element, forcedType = null) => {
        // Unhide element if it's hidden (Fixes opacity: 0 issue)
        if (element.style.opacity === '0') element.style.opacity = '1';
        if (element.style.visibility === 'hidden') element.style.visibility = 'visible';

        // 1. PRIORITY: USA
        if (forcedType === 'country') {
          for (let i = 0; i < element.options.length; i++) {
            const t = (element.options[i].text || "").toLowerCase().trim();
            if (['united states', 'usa', 'us'].includes(t)) {
              element.selectedIndex = i;
              fireEvents(element);
              return true;
            }
          }
        }

        // 2. GET DATA
        const type = forcedType || getFieldType(element);
        let userVal = null;
        if (type === 'region') userVal = (data['region'] || data['state'] || data['province'] || "");
        else userVal = data[type] || "";
        
        userVal = userVal.toLowerCase().trim();
        if (!userVal) return false;

        // 3. FIND BEST MATCH
        // We look for the option that matches the user's input best
        let bestMatchIndex = -1;
        
        for (let i = 0; i < element.options.length; i++) {
          const optText = (element.options[i].text || "").toLowerCase().trim();
          const optVal = (element.options[i].value || "").toLowerCase().trim();
          if (optVal === "" || optText.includes("select")) continue; // Skip placeholders

          // A. Exact Match (Highest Priority)
          if (optText === userVal || optVal === userVal) {
            bestMatchIndex = i;
            break; // Stop looking, we found perfection
          }

          // B. "New York City" vs "New York" Match
          // If User says "New York City", but Option is "New York" -> Match
          // If User says "New York", but Option is "New York City" -> Match
          const userSimple = userVal.replace(/\bcity\b/g, '').trim();
          const optSimple = optText.replace(/\bcity\b/g, '').trim();
          
          if (userSimple === optSimple && userSimple.length > 2) {
             bestMatchIndex = i;
          }
        }

        if (bestMatchIndex > -1) {
          element.selectedIndex = bestMatchIndex;
          element.options[bestMatchIndex].selected = true; // Force selection state
          fireEvents(element);
          toast(`✅ Found: ${element.options[bestMatchIndex].text}`);
          return true;
        }

        return false;
      };

      // --- HELPER: WAIT FOR LIST TO POPULATE ---
      const waitForOptions = async (element) => {
        let attempts = 0;
        // Wait while options are less than 2 (usually just "Select...")
        while (element.options.length < 2 && attempts < 30) { 
          await wait(200); // Check every 200ms
          attempts++;
          // Pulse opacity to show it's "thinking"
          element.style.opacity = (attempts % 2 === 0) ? '0.5' : '1';
        }
        element.style.opacity = '1'; // Ensure visible
      };

      // --- IDENTIFY DROPDOWNS ---
      let countryEl = null, regionEl = null, cityEl = null, otherSelects = [];
      allSelects.forEach(s => {
        if (s.disabled) return; // Don't select disabled initially
        let type = getFieldType(s);
        const nameStr = (s.id + " " + s.name).toLowerCase();
        
        // Strict ID checks because getFieldType can be fuzzy
        if (nameStr.includes('country')) type = 'country';
        else if (nameStr.includes('state') || nameStr.includes('region')) type = 'region';
        else if (nameStr.includes('city')) type = 'city';

        if (type === 'country') countryEl = s;
        else if (type === 'region') regionEl = s;
        else if (type === 'city') cityEl = s;
        else otherSelects.push({ el: s, type: type });
      });

      // --- EXECUTE SEQUENCE ---
            // --- EXECUTE SEQUENCE ---
      (async () => {

        // === NEW: CATEGORY-ONLY LOGIC (runs first, leaves everything else untouched) ===
        if (data.category) {
            const categorySelect = allSelects.find(s => 
                getFieldType(s) === 'category' || 
                /cat.?id|category/i.test(s.id + s.name)
            );

            if (categorySelect) {
                toast("Setting Category...");
                
                if (categorySelect.disabled) categorySelect.disabled = false;
                if (categorySelect.style.opacity === '0') categorySelect.style.opacity = '1';

                const target = data.category.trim().toLowerCase();
                let found = false;

                for (let i = 0; i < categorySelect.options.length; i++) {
                    const text = categorySelect.options[i].textContent.trim().toLowerCase()
                                      .replace(/^[-\s>&nbsp;]+/g, '');

                    if (text.includes(target) || target.includes(text.replace(/services|opportunities/gi, '').trim())) {
                        categorySelect.selectedIndex = i;
                        fireEvents(categorySelect);
                        toast(`Category → ${categorySelect.options[i].textContent.trim()}`);
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    const fallbackTexts = [/other/i, /general/i, /everything else/i, /misc/i, /all categories/i];
                    for (let i = 0; i < categorySelect.options.length; i++) {
                        const txt = categorySelect.options[i].textContent.toLowerCase();
                        if (fallbackTexts.some(re => re.test(txt))) {
                            categorySelect.selectedIndex = i;
                            fireEvents(categorySelect);
                            toast(`Fallback → ${categorySelect.options[i].textContent.trim()}`);
                            found = true;
                            break;
                        }
                    }
                }

                if (!found && categorySelect.options.length > 2) {
                    categorySelect.selectedIndex = 2;
                    fireEvents(categorySelect);
                    toast("Picked random category");
                }

                await wait(1200);
            }
        }
        // === END OF CATEGORY LOGIC ===

        // 1. Country
        if (countryEl) {
          toast("Setting Country...");
          processSingleSelect(countryEl, 'country');
          
          toast("Waiting 1s for State/Region...");
          await wait(1000); 
        }
        // ... rest of your original code continues perfectly ...
        
        
        // 1. Country
        if (countryEl) {
          toast("🇺🇸 Setting Country...");
          processSingleSelect(countryEl, 'country');
          
          // HARD WAIT: 3 Seconds for Region list to load
          toast("⏳ Waiting 1s for State/Region...");
          await wait(1000); 
        }

        // 2. Region
        if (regionEl) {
          // Ensure it's enabled
          if(regionEl.disabled) regionEl.disabled = false;
          
          // Double check: ensure options are actually there
          await waitForOptions(regionEl); 

          toast("🗺️ Setting Region...");
          processSingleSelect(regionEl, 'region');
          
          // HARD WAIT: 3 Seconds for City list to load
          toast("⏳ Waiting 1s for Cities...");
          await wait(1000); 
        }

        // 3. City
        if (cityEl) {
          // Ensure it's enabled
          if(cityEl.disabled) cityEl.disabled = false;
          
          // Double check: ensure options are actually there
          await waitForOptions(cityEl);

          toast("🏙️ Setting City...");
          const found = processSingleSelect(cityEl, 'city');
          
          if (!found) {
            // Fallback if specific city not found
            toast("🎲 City not found, picking random...");
            if (cityEl.options.length > 1) {
                cityEl.selectedIndex = Math.floor(Math.random() * (cityEl.options.length - 1)) + 1;
                fireEvents(cityEl);
            }
          }
        }

        // 4. Others
        otherSelects.forEach(o => processSingleSelect(o.el, o.type));

        toast(`⚡ Sequence Complete!`);
      })();

      return;
    }

    
    // ============================================================
    // MODE 2: TEXT FIELDS & INPUTS (STANDARD 4 CLICKS)
    // ============================================================
    let filled = 0;
    let checked = 0;

    document.querySelectorAll('input, textarea').forEach(el => {
      if (el.readOnly || el.disabled) return;
      const forbiddenTypes = ['submit', 'button', 'image', 'reset', 'hidden', 'file', 'checkbox', 'radio'];
      if (forbiddenTypes.includes(el.type)) return;

      let type = getFieldType(el);
      let valueToFill = null;

      if (data[type] && data[type].trim() !== "") {
          valueToFill = data[type];
      } else {
          if(type === 'subject' && data['title']) {
             valueToFill = data['title'];
          } else {
             valueToFill = generateFake(type);
          }
      }

      if (valueToFill) {
        smartFill(el, valueToFill);
        filled++;
      } else {
        smartFill(el, "Business");
        filled++;
      }
    });

    // Checkbox Handling
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      if (cb.disabled || cb.checked) return;
      const label = (cb.closest('label')?.textContent || cb.parentElement?.textContent || cb.getAttribute('aria-label') || '').toLowerCase();
      if (/agree|accept|consent|terms|privacy|policy|newsletter|confirmation|subscribe|yes|opt.?in/i.test(label)) {
        cb.checked = true;
        cb.dispatchEvent(new Event('change', { bubbles: true }));
        checked++;
      }
    });

    toast(`⚡ Filled ${filled} Text Fields + ${checked} Boxes!`);
  }
}, true);

// --- MANUAL CLICK MENU ---
document.addEventListener('focusin', async e => {
  const input = e.target;
  if (!['INPUT','TEXTAREA','SELECT'].includes(input.tagName)) return;
  if (['submit', 'button', 'image', 'reset', 'hidden', 'file', 'checkbox', 'radio'].includes(input.type)) return;

  const {data} = await getProfileData();
  if (!data || Object.keys(data).length === 0) return;

  if (suggestionBox) suggestionBox.remove();

    suggestionBox = document.createElement('div');
  suggestionBox.className = 'llb-suggestion';
  
  suggestionBox.innerHTML = `
    <div class="llb-header" style="display: flex; justify-content: space-between; align-items: center;">
        <span>⚡ Choose Value</span>
        <span id="llb-close-btn" style="cursor: pointer; font-size: 24px; line-height: 20px; opacity: 0.8;">&times;</span>
    </div>`;

  suggestionBox.querySelector('#llb-close-btn').addEventListener('click', (e) => {
      e.stopPropagation(); 
      suggestionBox.remove();
      suggestionBox = null;
  });

    const fields = [
    {key: 'firstName', label: 'First Name'},
    {key: 'lastName', label: 'Last Name'},
    {key: 'email', label: 'Email'},
    {key: 'username', label: 'Username'},
    {key: 'password', label: 'Password'},
    {key: 'company', label: 'Company / Site'},
    {key: 'title', label: 'Title / Subject'},
    {key: 'website', label: 'Website URL'},
    {key: 'phone', label: 'Phone'},
    {key: 'address', label: 'Address'},
    {key: 'city', label: 'City'},
    {key: 'region', label: 'Region / State'},
    {key: 'zip', label: 'Zip / Postal'},
    {key: 'fake', label: '🎲 Generate Fake for this field'}
  ];

  fields.forEach(f => {
    if(f.key === 'fake') {
        const item = document.createElement('div');
        item.className = 'llb-item';
        item.style.background = '#fff0f0';
        item.innerHTML = `<strong>${f.label}</strong>`;
        item.onclick = () => {
            const type = getFieldType(input);
            const fake = generateFake(type);
            if(fake) {
                smartFill(input, fake);
                toast(`generated: ${fake}`);
            } else {
                toast(`⚠️ Can't fake this type (${type})`);
            }
            suggestionBox.remove();
        };
        suggestionBox.appendChild(item);
        return;
    }

    if (!data[f.key]) return;
    
    let display = data[f.key];
    if (f.key === 'password') display = '••••••••';

    const item = document.createElement('div');
    item.className = 'llb-item';
    item.innerHTML = `<strong>${f.label}</strong><small>${display}</small>`;
    item.onclick = () => {
      smartFill(input, data[f.key]);
      suggestionBox.remove();
      toast(`${f.label} inserted`);
    };
    suggestionBox.appendChild(item);
  });

  const reminder = document.createElement('div');
  reminder.className = 'llb-item';
  reminder.innerHTML = `<strong>4 clicks anywhere = Fill All</strong>`;
  reminder.style.background = '#e8f5e8';
  reminder.style.fontWeight = 'bold';
  suggestionBox.appendChild(reminder);

  document.body.appendChild(suggestionBox);

  const rect = input.getBoundingClientRect();
  suggestionBox.style.top = `${window.scrollY + rect.bottom + 10}px`;
  suggestionBox.style.left = `${window.scrollX + rect.left}px`;
});

document.addEventListener('click', e => {
  if (suggestionBox && !suggestionBox.contains(e.target) && !['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) {
    suggestionBox.remove();
    suggestionBox = null;
  }
});

// Helper to pause execution
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));