// ⚡ LIGHTNING LINKBUILDER — GOD-TIER FINAL v17
// First Name + Last Name + Everything = 100% PERFECT

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
    max-height: 70vh;           /* This makes it scrollable */
    overflow-y: auto;           /* This enables vertical scroll */
    overflow-x: hidden;
    border: 1px solid #ccc;
    scrollbar-width: thin;      /* Firefox */
    scrollbar-color: #0066cc #f0f0f0;
  }

  /* Beautiful custom scrollbar for Chrome/Edge/Safari */
  .llb-suggestion::-webkit-scrollbar {
    width: 8px;
  }
  .llb-suggestion::-webkit-scrollbar-track {
    background: #f0f0f0;
    border-radius: 10px;
  }
  .llb-suggestion::-webkit-scrollbar-thumb {
    background: #0066cc;
    border-radius: 10px;
    border: 2px solid #f0f0f0;
  }
  .llb-suggestion::-webkit-scrollbar-thumb:hover {
    background: #0052aa;
  }

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

// PERFECT FIELD DETECTION — NO CONFLICTS EVER
function getFieldType(el) {
  const str = [el.id, el.name, el.placeholder, el.autocomplete,
               el.getAttribute('aria-label'), el.labels?.[0]?.textContent,
               el.closest('label')?.textContent, el.closest('div')?.textContent || '']
              .join(' ').toLowerCase();

  // 1. Password
  if (el.type === 'password') return 'password';

  // 2. Email
  if (el.type === 'email' || /email|e-mail|mail/i.test(str)) return 'email';

  // 3. Website — highest priority for link builders
  if (/website|site|url|domain|link|web.?address|blog|your.?site/i.test(str)) return 'website';

  // 4. Username
  if (/username|user.?name|login|handle|nick|screen.?name/i.test(str)) return 'username';

  // 5. Company / Business
  if (/company|business|organization|brand|site.?name|blog.?name|company.?name|your.?business/i.test(str)) return 'company';

  // 6. Phone
  if (/phone|mobile|tel|cell|contact.?number/i.test(str)) return 'phone';

  // 7. Address & Location
  if (/address|street|location|city|state|province|zip|post.?code|postal|country/i.test(str)) {
    if (/city|town/i.test(str)) return 'city';
    if (/state|province|region/i.test(str)) return 'region';
    if (/zip|post.?code|postal/i.test(str)) return 'zip';
    if (/country/i.test(str)) return 'country';
    return 'address';
  }

  // 8. NAME FIELDS
  if (/name|person|contact/i.test(str)) {
    if (/first|given|fname|forename/i.test(str)) return 'firstName';
    if (/last|surname|lname|family|second/i.test(str)) return 'lastName';
    if (/full.?name/i.test(str)) return 'firstName';
    return 'firstName'; 
  }

  // 9. TITLE / HEADLINE
  if (/title|headline|subject|topic|job.?title|post.?title/i.test(str)) return 'title';

  return 'unknown';
}

// QUAD-CLICK = FILL EVERYTHING + CHECK CONSENT BOXES
let clicks = 0;
document.addEventListener('click', async e => {
  if (['INPUT','TEXTAREA','BUTTON','A','SELECT','LABEL'].includes(e.target.tagName)) return;
  
  clicks++;
  if (clicks === 1) setTimeout(() => clicks = 0, 600);
  
  if (clicks === 4) {
    clicks = 0;
    
    const {data} = await getProfileData();
    if (!data || Object.keys(data).length === 0) {
      toast("⚠️ No data saved! Open popup → fill → save");
      return;
    }

    let filled = 0;
    let checked = 0;

    // Fill all fields
    document.querySelectorAll('input, textarea, select').forEach(el => {
      if (el.readOnly || el.disabled) return;

      const type = getFieldType(el);

      if (data[type]) {
        smartFill(el, data[type]);
        filled++;
      }
      // Special: Full Name handling
      else if (type === 'unknown' && /full.?name/i.test(el.placeholder || el.name || '')) {
        const full = `${data.firstName || ''} ${data.lastName || ''}`.trim();
        if (full) {
          smartFill(el, full);
          filled++;
        }
      }
    });

    // 2. CHECK BOXES
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      if (cb.disabled || cb.checked) return;
      const label = (cb.closest('label')?.textContent || cb.parentElement?.textContent || cb.getAttribute('aria-label') || '').toLowerCase();
      if (/agree|accept|consent|terms|privacy|policy|newsletter|confirmation|subscribe|yes|opt.?in/i.test(label)) {
        cb.checked = true;
        cb.dispatchEvent(new Event('change', { bubbles: true }));
        checked++;
      }
    });

    toast(`⚡ Filled ${filled} fields + Checked ${checked} boxes!`);
  }
}, true);

// MANUAL CLICK MENU
document.addEventListener('focusin', async e => {
  const input = e.target;
  if (!['INPUT','TEXTAREA','SELECT'].includes(input.tagName)) return;

  const {data} = await getProfileData();
  if (!data || Object.keys(data).length === 0) return;

  if (suggestionBox) suggestionBox.remove();

  suggestionBox = document.createElement('div');
  suggestionBox.className = 'llb-suggestion';
  suggestionBox.innerHTML = `<div class="llb-header">⚡ Choose Value</div>`;

  const fields = [
    {key: 'firstName', label: 'First Name'},
    {key: 'lastName', label: 'Last Name'},
    {key: 'email', label: 'Email'},
    {key: 'username', label: 'Username'},
    {key: 'website', label: 'Website URL'},
    {key: 'company', label: 'Company / Site'},
    {key: 'title', label: 'Title / Subject'},
    {key: 'phone', label: 'Phone'},
    {key: 'address', label: 'Address'},
    {key: 'password', label: 'Password'}
  ];

  fields.forEach(f => {
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