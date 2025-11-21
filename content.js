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
    
    // CHECK MODIFIER KEYS
    const isSelectMode = e.ctrlKey || e.metaKey; // True if Ctrl (Win) or Cmd (Mac) is held

    const {data} = await getProfileData();
    if (!data || Object.keys(data).length === 0) {
      toast("⚠️ No data saved! Open popup → fill → save");
      return;
    }

    let filled = 0;
    let checked = 0;

    // DETERMINE SELECTOR BASED ON MODE
    // If Ctrl is held: ONLY target <select>
    // If Ctrl NOT held: ONLY target <input> and <textarea>
    const selector = isSelectMode ? 'select' : 'input, textarea';

    document.querySelectorAll(selector).forEach(el => {
      if (el.readOnly || el.disabled) return;
      const forbiddenTypes = ['submit', 'button', 'image', 'reset', 'hidden', 'file'];
      if (forbiddenTypes.includes(el.type)) return;

      let type = getFieldType(el);

      // ================================================
      // MODE 1: DROPDOWNS ONLY (Ctrl + 4 Clicks)
      // ================================================
      if (el.tagName === 'SELECT') {
          
          // 1. FORCE "USA" LOGIC
          if (type === 'country') {
              for (let i = 0; i < el.options.length; i++) {
                  const optText = (el.options[i].text || "").toLowerCase().trim();
                  const optVal = (el.options[i].value || "").toLowerCase().trim();
                  
                  if (optText === "united states" || optText === "usa" || optText === "us" || 
                      optVal === "us" || optVal === "usa" || optVal === "united states") {
                      
                      el.selectedIndex = i;
                      el.options[i].selected = true;
                      el.dispatchEvent(new Event('change', { bubbles: true }));
                      el.dispatchEvent(new Event('input', { bubbles: true }));
                      el.dispatchEvent(new Event('click', { bubbles: true }));
                      el.dispatchEvent(new Event('blur', { bubbles: true }));
                      filled++;
                      return; 
                  }
              }
          }

          // 2. STANDARD LOGIC
          let targetVal = data[type] ? data[type].toLowerCase() : null;
          let selectedIndex = -1;

          if (targetVal) {
              for (let i = 0; i < el.options.length; i++) {
                  const optText = (el.options[i].text || "").toLowerCase();
                  const optVal = (el.options[i].value || "").toLowerCase();
                  if (optText.includes(targetVal) || optVal === targetVal) {
                      selectedIndex = i;
                      break;
                  }
              }
          }

          // Fallback: Pick Random
          if (selectedIndex === -1 && el.options.length > 1) {
              selectedIndex = Math.floor(Math.random() * (el.options.length - 1)) + 1;
          } else if (selectedIndex === -1 && el.options.length === 1) {
              selectedIndex = 0;
          }

          if (selectedIndex > -1) {
              el.selectedIndex = selectedIndex;
              el.dispatchEvent(new Event('change', { bubbles: true }));
              el.dispatchEvent(new Event('input', { bubbles: true }));
              filled++;
          }
          return; // Done with Select
      }

      // ================================================
      // MODE 2: TEXT FIELDS ONLY (4 Clicks)
      // ================================================
      
      // We skip this entirely if we are in Select Mode because the selector didn't grab inputs
      if (['checkbox', 'radio'].includes(el.type)) return; // handled later for checkboxes

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

    // --- CHECKBOX HANDLING (Only runs on Standard Click, ignored on Ctrl Click) ---
    if (!isSelectMode) {
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
          if (cb.disabled || cb.checked) return;
          const label = (cb.closest('label')?.textContent || cb.parentElement?.textContent || cb.getAttribute('aria-label') || '').toLowerCase();
          if (/agree|accept|consent|terms|privacy|policy|newsletter|confirmation|subscribe|yes|opt.?in/i.test(label)) {
            cb.checked = true;
            cb.dispatchEvent(new Event('change', { bubbles: true }));
            checked++;
          }
        });
    }

    // --- DYNAMIC TOAST MESSAGE ---
    if (isSelectMode) {
        toast(`⚡ Set ${filled} Dropdowns! (Inputs Ignored)`);
    } else {
        toast(`⚡ Filled ${filled} Text Fields + ${checked} Boxes! (Selects Ignored)`);
    }
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