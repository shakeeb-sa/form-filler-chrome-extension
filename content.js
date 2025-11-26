// ⚡ LIGHTNING LINKBUILDER — GOD-TIER FINAL v20
// HYBRID MODE: Real Data (Priority) + Fake Data (Fallback) + Smart Selects

let suggestionBox = null;

const style = document.createElement("style");
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
  const t = document.createElement("div");
  t.className = "llb-toast Marcello";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3300);
}

function getProfileData() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(null, (items) => {
      const active = items.activeProfile || "profile1";
      resolve({ data: items[active] || {}, profileName: active });
    });
  });
}

function smartFill(el, value) {
  el.focus();
  el.value = value;
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  el.blur();
}

// --- FAKE DATA ENGINE ---
function generateFake(type) {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // --- EXISTING FAKE DATA LISTS ---
  const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"];
  const streets = ["Main St", "Oak Ave", "Maple Dr", "Cedar Ln", "Park Blvd"];
  const companies = [
    "TechCorp",
    "Global Solutions",
    "Alpha Agency",
    "NextGen Media",
  ];
  const titles = [
    "Marketing Director",
    "Content Manager",
    "SEO Specialist",
    "Owner",
  ];
  const subjects = [
    "Inquiry regarding your website",
    "Collaboration Proposal",
    "Partnership Opportunity",
  ];

  // --- YOUR SPECIFIC HARDCODED VALUES ---
  if (type === "dob") return "11/11/2000";
  if (type === "gender") return "male";
  if (type === "language") return "English";
  if (type === "timezone") return "Eastern Time (US & Canada)";
  if (type === "fax") return "222-211-2911";
  if (type === "secondaryEmail") return "info@gmail.com";
  if (type === "price") return "10";
  if (type === "social")
    return pick([
      "https://twitter.com/user",
      "https://linkedin.com/in/user",
      "https://facebook.com/user",
    ]);
  if (type === "companySize") return pick(["1-10", "11-50", "50-200"]);

  // Standard Fields
  if (type === "city") return pick(cities);
  if (type === "address")
    return `${Math.floor(Math.random() * 9000) + 100} ${pick(streets)}`;
  if (type === "billing" || type === "shipping") return "United States";
  if (type === "zip") return Math.floor(Math.random() * 90000) + 10000;
  if (type === "region") return pick(["CA", "NY", "TX", "FL", "IL"]);
  if (type === "country") return "United States";
  if (type === "phone")
    return `+1 ${Math.floor(Math.random() * 800) + 200}-${
      Math.floor(Math.random() * 800) + 200
    }-${Math.floor(Math.random() * 8999) + 1000}`;
  if (type === "company") return pick(companies);
  if (type === "title") return pick(titles);
  if (type === "subject") return pick(subjects);

  return null;
}

function getFieldType(el) {
  const str = [
    el.id,
    el.name,
    el.placeholder,
    el.autocomplete,
    el.getAttribute("aria-label"),
    el.labels?.[0]?.textContent,
    el.closest("label")?.textContent,
    el.closest("div")?.textContent || "",
  ]
    .join(" ")
    .toLowerCase();

  // Standard checks
  if (el.type === "password") return "password";
  if (el.type === "email" || /email|e-mail|mail/i.test(str)) {
    if (/secondary|alt|backup|other/i.test(str)) return "secondaryEmail";
    return "email";
  }
  if (/website|site|url|domain|link|web.?address/i.test(str)) {
    if (/social|twitter|facebook|linkedin|instagram/i.test(str))
      return "social";
    return "website";
  }

  // --- SPECIFIC DETECTORS ---
  if (/fax/i.test(str)) return "fax";
  if (/birth|dob|date.?of.?birth/i.test(str)) return "dob";
  if (/gender|sex\b|male|female/i.test(str)) return "gender";
  if (/language/i.test(str)) return "language";
  if (/time.?zone/i.test(str)) return "timezone";
  if (/size|employees|count/i.test(str)) return "companySize";
  if (/price|budget|cost|amount/i.test(str)) return "price";
  if (/billing/i.test(str)) return "billing";
  if (/shipping/i.test(str)) return "shipping";
  // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
  // ADD THIS EXACT BLOCK HERE (RIGHT AFTER THE ABOVE LINES)
  // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
  if (
    /category|cat.?id|type.?of.?post|section|classified/i.test(str) ||
    el.id === "catId" ||
    el.name === "catId"
  ) {
    return "category";
  }
  // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←

  if (/username|user.?name|login|handle/i.test(str)) return "username";
  if (/company|business|organization/i.test(str)) return "company";
  if (/phone|mobile|tel|cell/i.test(str)) return "phone";

  if (
    /address|street|location|city|state|province|zip|post.?code|country/i.test(
      str
    )
  ) {
    if (/city|town/i.test(str)) return "city";
    if (/state|province|region/i.test(str)) return "region";
    if (/zip|post.?code/i.test(str)) return "zip";
    if (/country/i.test(str)) return "country";
    return "address";
  }

  if (/name|person|contact/i.test(str)) {
    if (/first|given|fname/i.test(str)) return "firstName";
    if (/last|surname|lname/i.test(str)) return "lastName";
    return "firstName";
  }

  if (/subject|topic|re:/i.test(str)) return "subject";
  if (/title|headline|job/i.test(str)) return "title";

  return "unknown";
}

// --- INTELLIGENT QUAD-CLICK LOGIC ---
let clicks = 0;
document.addEventListener(
  "click",
  async (e) => {
    const isInteractive = e.target.closest(
      'a, button, input, textarea, select, label, [role="button"]'
    );
    if (isInteractive) return;

    clicks++;
    if (clicks === 1) setTimeout(() => (clicks = 0), 600);

    if (clicks === 4) {
      clicks = 0;

      // MODIFIER COMBINATIONS
      const isSelectMode = (e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey; // Ctrl + 4 clicks
      const isSubmitMode = (e.ctrlKey || e.metaKey) && e.altKey; // Ctrl + Alt + 4 clicks
      const isHardSelectMode = (e.ctrlKey || e.metaKey) && e.shiftKey; // Ctrl + Shift + 4 clicks

      // NEW: Shift + 4 Clicks (Hard Input Mode)
      const isHardInputMode =
        e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey;

      // Modified: Plain 4 clicks (Regular Fill) - Ensure Shift is NOT held
      const isRegularFill =
        !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey;

      const { data } = await getProfileData();
      if (!data || Object.keys(data).length === 0) {
        toast("⚠️ No data saved! Open popup → fill → save");
        return;
      }

      // ────────────────────────────────
      //  ★★★ CTRL + ALT + 4 CLICKS = AUTO SUBMIT (ULTRA SAFE VERSION) ★★★
      // ────────────────────────────────
      if (isSubmitMode) {
        const submitKeywords = [
          "submit",
          "post",
          "publish",
          "register",
          "sign up",
          "signup",
          "login",
          "sign in",
          "signin",
          "create",
          "save",
          "continue",
          "post ad",
          "post listing",
          "place order",
          "complete",
          "finish",
          "proceed",
          "next",
          "add listing",
          "list now",
        ];

        const buttons = Array.from(
          document.querySelectorAll(
            'button, input[type="submit"], input[type="button"], a[role="button"]'
          )
        ).filter((btn) => {
          // 1. Must be visible
          if (
            !btn.offsetParent ||
            btn.offsetWidth < 30 ||
            btn.offsetHeight < 20
          )
            return false;
          if (btn.disabled) return false;

          // 2. Text must contain a submit keyword
          const text = (
            btn.textContent ||
            btn.value ||
            btn.title ||
            btn.getAttribute("aria-label") ||
            ""
          )
            .toLowerCase()
            .trim();
          if (!submitKeywords.some((kw) => text.includes(kw))) return false;

          // 3. CRITICAL: EXCLUDE ANY BUTTON INSIDE EDITORS OR TOOLBARS
          const parent = btn.closest("div, span, td, li");
          if (!parent) return true;

          const parentText = parent.textContent.toLowerCase();
          const parentClass = (parent.className || "").toLowerCase();
          const parentId = (parent.id || "").toLowerCase();

          // Blacklist known editor toolbar patterns
          const blacklist = [
            "mce",
            "cke",
            "tox",
            "ql-",
            "editor",
            "toolbar",
            "format",
            "bold",
            "italic",
            "bullet",
            "list",
            "wp-",
            "admin",
            "dashboard",
            "menu",
            "nav",
            "sidebar",
            "header",
            "footer",
            "modal",
            "popup",
          ];

          if (
            blacklist.some(
              (term) => parentClass.includes(term) || parentId.includes(term)
            )
          ) {
            return false;
          }

          // Extra safety: if button is tiny or inside a <b>, <strong>, <i>, etc. → skip
          if (
            btn.closest(
              'b, strong, i, em, u, span[style*="bold"], div[style*="font-weight"]'
            )
          )
            return false;

          return true;
        });

        if (buttons.length > 0) {
          const target = buttons[0];
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(() => {
            target.click();
            toast(`Submitted: "${target.textContent.trim() || target.value}"`);
          }, 500);
        } else {
          toast("No real submit button found");
        }

        return; // Stops everything else — 100% isolated
      }

      // ────────────────────────────────
      //  ★★★ CTRL + SHIFT + 4 CLICKS = HARD SELECT (CLEANUP MODE) ★★★
      // ────────────────────────────────
      if (isHardSelectMode) {
        let fixedCount = 0;
        const allSelects = Array.from(document.querySelectorAll("select"));

        // Helper to fire events
        const fireEvents = (el) => {
          try {
            el.dispatchEvent(new Event("focus", { bubbles: true }));
            el.dispatchEvent(new Event("click", { bubbles: true }));
            el.dispatchEvent(new Event("change", { bubbles: true }));
            el.dispatchEvent(new Event("input", { bubbles: true }));
            el.dispatchEvent(new Event("blur", { bubbles: true }));
          } catch (e) {}
        };

        allSelects.forEach((el) => {
          // 1. Safety Checks: Must be visible and enabled
          if (el.disabled || el.offsetParent === null) return;

          // 2. Check if it's already filled
          // We consider it "Empty" if value is blank OR text says "Select/Choose"
          const currentTxt = (
            el.options[el.selectedIndex]?.text || ""
          ).toLowerCase();
          const currentVal = el.value;
          const isFilled =
            currentVal !== "" &&
            !currentTxt.includes("select") &&
            !currentTxt.includes("choose") &&
            !currentTxt.includes("none");

          if (isFilled) return; // Don't touch what the Core Logic already did!

          // 3. Find a valid option to pick
          const validIndices = [];
          for (let i = 0; i < el.options.length; i++) {
            const txt = (el.options[i].text || "").toLowerCase();
            const val = el.options[i].value;

            // Must not be disabled, empty, or a placeholder label
            if (
              !el.options[i].disabled &&
              val !== "" &&
              !txt.includes("select") &&
              !txt.includes("choose")
            ) {
              validIndices.push(i);
            }
          }

          // 4. Select Random Valid Option
          if (validIndices.length > 0) {
            const randomIdx =
              validIndices[Math.floor(Math.random() * validIndices.length)];
            el.selectedIndex = randomIdx;
            fireEvents(el);
            fixedCount++;
          } else if (el.options.length > 1) {
            // Desperation move: just pick index 1 if logic fails
            el.selectedIndex = 1;
            fireEvents(el);
            fixedCount++;
          }
        });

        if (fixedCount > 0)
          toast(`🧹 Hard Select: Filled ${fixedCount} missed dropdowns!`);
        else toast("✅ All dropdowns appear to be filled.");

        return; // Stop here
      }

      // ────────────────────────────────
      //  ★★★ SHIFT + 4 CLICKS = HARD INPUT (CLEANUP TEXT) ★★★
      // ────────────────────────────────
      if (isHardInputMode) {
        let filledCount = 0;

        const inputs = document.querySelectorAll("input, textarea");

        inputs.forEach((el) => {
          // 1. Safety Checks
          if (
            el.readOnly ||
            el.disabled ||
            el.type === "hidden" ||
            el.offsetParent === null
          )
            return;
          const forbiddenTypes = [
            "submit",
            "button",
            "image",
            "reset",
            "file",
            "checkbox",
            "radio",
          ];
          if (forbiddenTypes.includes(el.type)) return;

          // 2. Only target EMPTY fields
          if (el.value && el.value.trim() !== "") return; // Don't overwrite existing work!

          // 3. Determine Value
          const type = getFieldType(el);
          let fakeVal = generateFake(type);

          // Fallback if generateFake returns null (e.g., unknown text fields)
          if (!fakeVal) {
            if (type === "email") fakeVal = "info@example.com";
            else if (type === "phone") fakeVal = "555-0123";
            else if (type === "number") fakeVal = "1";
            else fakeVal = "N/A"; // Safe fallback for unknown text areas
          }

          // 4. Force Fill
          smartFill(el, fakeVal);
          filledCount++;
        });

        if (filledCount > 0)
          toast(`✍️ Hard Fill: Force filled ${filledCount} empty inputs!`);
        else toast("✅ All text fields appear to be filled.");

        return; // Stop here
      }

      // ============================================================
      // MODE 1: SMART DROPDOWN SEQUENCE (CTRL + 4 CLICKS)
      // ============================================================
      if (isSelectMode) {
        const allSelects = Array.from(document.querySelectorAll("select"));
        if (allSelects.length === 0) {
          toast("⚠️ No dropdowns found.");
          return;
        }

        // --- HELPER: FIRE EVENTS (Trigger UI Updates) ---
        const fireEvents = (el) => {
          try {
            el.dispatchEvent(new Event("focus", { bubbles: true }));
            el.dispatchEvent(new Event("click", { bubbles: true })); // Added click
            el.dispatchEvent(new Event("change", { bubbles: true }));
            el.dispatchEvent(new Event("input", { bubbles: true }));
            el.dispatchEvent(new Event("blur", { bubbles: true }));
          } catch (e) {
            console.log(e);
          }
        };

        // --- HELPER: ROBUST MATCHER ---
        const processSingleSelect = (element, forcedType = null) => {
          // Unhide element if it's hidden (Fixes opacity: 0 issue)
          if (element.style.opacity === "0") element.style.opacity = "1";
          if (element.style.visibility === "hidden")
            element.style.visibility = "visible";

          // 1. PRIORITY: USA
          if (forcedType === "country") {
            for (let i = 0; i < element.options.length; i++) {
              const t = (element.options[i].text || "").toLowerCase().trim();
              if (["united states", "usa", "us"].includes(t)) {
                element.selectedIndex = i;
                fireEvents(element);
                return true;
              }
            }
          }

          // 2. GET DATA
          const type = forcedType || getFieldType(element);
          let userVal = null;
          if (type === "region")
            userVal = data["region"] || data["state"] || data["province"] || "";
          else userVal = data[type] || "";

          userVal = userVal.toLowerCase().trim();
          if (!userVal) return false;

          // 3. FIND BEST MATCH
          // We look for the option that matches the user's input best
          let bestMatchIndex = -1;

          for (let i = 0; i < element.options.length; i++) {
            const optText = (element.options[i].text || "")
              .toLowerCase()
              .trim();
            const optVal = (element.options[i].value || "")
              .toLowerCase()
              .trim();
            if (optVal === "" || optText.includes("select")) continue; // Skip placeholders

            // A. Exact Match (Highest Priority)
            if (optText === userVal || optVal === userVal) {
              bestMatchIndex = i;
              break; // Stop looking, we found perfection
            }

            // B. "New York City" vs "New York" Match
            // If User says "New York City", but Option is "New York" -> Match
            // If User says "New York", but Option is "New York City" -> Match
            const userSimple = userVal.replace(/\bcity\b/g, "").trim();
            const optSimple = optText.replace(/\bcity\b/g, "").trim();

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
            element.style.opacity = attempts % 2 === 0 ? "0.5" : "1";
          }
          element.style.opacity = "1"; // Ensure visible
        };

        // --- IDENTIFY DROPDOWNS ---
        let countryEl = null,
          regionEl = null,
          cityEl = null,
          otherSelects = [];
        allSelects.forEach((s) => {
          if (s.disabled) return; // Don't select disabled initially
          let type = getFieldType(s);
          const nameStr = (s.id + " " + s.name).toLowerCase();

          // Strict ID checks because getFieldType can be fuzzy
          if (nameStr.includes("country")) type = "country";
          else if (nameStr.includes("state") || nameStr.includes("region"))
            type = "region";
          else if (nameStr.includes("city")) type = "city";

          if (type === "country") countryEl = s;
          else if (type === "region") regionEl = s;
          else if (type === "city") cityEl = s;
          else otherSelects.push({ el: s, type: type });
        });

        // --- EXECUTE SEQUENCE ---
        // --- EXECUTE SEQUENCE ---
        (async () => {
          // === NEW: CATEGORY-ONLY LOGIC (runs first, leaves everything else untouched) ===
          if (data.category) {
            const categorySelect = allSelects.find(
              (s) =>
                getFieldType(s) === "category" ||
                /cat.?id|category/i.test(s.id + s.name)
            );

            if (categorySelect) {
              toast("Setting Category...");

              if (categorySelect.disabled) categorySelect.disabled = false;
              if (categorySelect.style.opacity === "0")
                categorySelect.style.opacity = "1";

              const target = data.category.trim().toLowerCase();
              let found = false;

              for (let i = 0; i < categorySelect.options.length; i++) {
                const text = categorySelect.options[i].textContent
                  .trim()
                  .toLowerCase()
                  .replace(/^[-\s>&nbsp;]+/g, "");

                if (
                  text.includes(target) ||
                  target.includes(
                    text.replace(/services|opportunities/gi, "").trim()
                  )
                ) {
                  categorySelect.selectedIndex = i;
                  fireEvents(categorySelect);
                  toast(
                    `Category → ${categorySelect.options[i].textContent.trim()}`
                  );
                  found = true;
                  break;
                }
              }

              if (!found) {
                const fallbackTexts = [
                  /other/i,
                  /general/i,
                  /everything else/i,
                  /misc/i,
                  /all categories/i,
                ];
                for (let i = 0; i < categorySelect.options.length; i++) {
                  const txt =
                    categorySelect.options[i].textContent.toLowerCase();
                  if (fallbackTexts.some((re) => re.test(txt))) {
                    categorySelect.selectedIndex = i;
                    fireEvents(categorySelect);
                    toast(
                      `Fallback → ${categorySelect.options[
                        i
                      ].textContent.trim()}`
                    );
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
            processSingleSelect(countryEl, "country");

            toast("Waiting 1s for State/Region...");
            await wait(1000);
          }
          // ... rest of your original code continues perfectly ...

          // 1. Country
          if (countryEl) {
            toast("🇺🇸 Setting Country...");
            processSingleSelect(countryEl, "country");

            // HARD WAIT: 3 Seconds for Region list to load
            toast("⏳ Waiting 1s for State/Region...");
            await wait(1000);
          }

          // 2. Region
          if (regionEl) {
            // Ensure it's enabled
            if (regionEl.disabled) regionEl.disabled = false;

            // Double check: ensure options are actually there
            await waitForOptions(regionEl);

            toast("🗺️ Setting Region...");
            processSingleSelect(regionEl, "region");

            // HARD WAIT: 3 Seconds for City list to load
            toast("⏳ Waiting 1s for Cities...");
            await wait(1000);
          }

          // 3. City
          if (cityEl) {
            // Ensure it's enabled
            if (cityEl.disabled) cityEl.disabled = false;

            // Double check: ensure options are actually there
            await waitForOptions(cityEl);

            toast("🏙️ Setting City...");
            const found = processSingleSelect(cityEl, "city");

            if (!found) {
              // Fallback if specific city not found
              toast("🎲 City not found, picking random...");
              if (cityEl.options.length > 1) {
                cityEl.selectedIndex =
                  Math.floor(Math.random() * (cityEl.options.length - 1)) + 1;
                fireEvents(cityEl);
              }
            }
          }

          // 4. Others
          otherSelects.forEach((o) => processSingleSelect(o.el, o.type));

          // CHECK FOR LEFTOVERS
          const remainingMissed = Array.from(
            document.querySelectorAll("select")
          ).filter((s) => {
            if (s.disabled || s.offsetParent === null) return false;
            const txt = (s.options[s.selectedIndex]?.text || "").toLowerCase();
            return (
              s.value === "" || txt.includes("select") || txt.includes("choose")
            );
          });

          if (remainingMissed.length > 0) {
            toast(
              `⚡ Done! (⚠️ ${remainingMissed.length} missed → Use Ctrl+Shift+Click)`
            );
          } else {
            toast(`⚡ Sequence Complete!`);
          }
        })();

        return;
      }

      // ============================================================
      // MODE 2: TEXT FIELDS & INPUTS (STANDARD 4 CLICKS)
      // ============================================================
      let filled = 0;
      let checked = 0;

      document.querySelectorAll("input, textarea").forEach((el) => {
        if (el.readOnly || el.disabled) return;
        const forbiddenTypes = [
          "submit",
          "button",
          "image",
          "reset",
          "hidden",
          "file",
          "checkbox",
          "radio",
        ];
        if (forbiddenTypes.includes(el.type)) return;

        let type = getFieldType(el);
        let valueToFill = null;

        if (data[type] && data[type].trim() !== "") {
          valueToFill = data[type];
        } else {
          if (type === "subject" && data["title"]) {
            valueToFill = data["title"];
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
      document.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
        if (cb.disabled || cb.checked) return;
        const label = (
          cb.closest("label")?.textContent ||
          cb.parentElement?.textContent ||
          cb.getAttribute("aria-label") ||
          ""
        ).toLowerCase();
        if (
          /agree|accept|consent|terms|privacy|policy|newsletter|confirmation|subscribe|yes|opt.?in/i.test(
            label
          )
        ) {
          cb.checked = true;
          cb.dispatchEvent(new Event("change", { bubbles: true }));
          checked++;
        }
      });

      // ... (smartFill logic above remains the same) ...

      // ────────────────────────────────────────────────────────────
      //  ★★★ UNIVERSAL FILE UPLOADER TRIGGER (NEW) ★★★
      // ────────────────────────────────────────────────────────────
      const fileInputs = Array.from(
        document.querySelectorAll('input[type="file"]')
      );
      const validUploaders = fileInputs.filter((el) => !el.disabled);

      if (validUploaders.length > 0) {
        const uploader = validUploaders[0];

        // Scroll so you see it
        if (uploader.offsetParent !== null) {
          uploader.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        setTimeout(() => {
          toast("📂 Opening File Picker...");

          // Handle hidden inputs (common in modern designs)
          const isHidden =
            uploader.style.display === "none" ||
            uploader.style.visibility === "hidden" ||
            uploader.style.opacity === "0" ||
            uploader.offsetParent === null;

          if (isHidden && uploader.id) {
            const label = document.querySelector(`label[for="${uploader.id}"]`);
            if (label) {
              label.click();
              return;
            }
          }
          // Standard Click
          uploader.click();
        }, 500);
      }

      // CHECK FOR EMPTY INPUTS
      const missedInputs = Array.from(
        document.querySelectorAll(
          'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea'
        )
      ).filter(
        (el) =>
          !el.disabled &&
          !el.readOnly &&
          el.offsetParent !== null &&
          el.value === ""
      );

      if (missedInputs.length > 0) {
        toast(
          `⚡ Filled ${filled} | ${checked} Boxes (⚠️ ${missedInputs.length} empty → Use Shift+Click)`
        );
      } else {
        toast(`⚡ Filled ${filled} Text Fields + ${checked} Boxes!`);
      }
    } // End of isRegularFill block
  },
  true
);

// --- MANUAL CLICK MENU ---
document.addEventListener("focusin", async (e) => {
  const input = e.target;
  if (!["INPUT", "TEXTAREA", "SELECT"].includes(input.tagName)) return;
  if (
    [
      "submit",
      "button",
      "image",
      "reset",
      "hidden",
      "file",
      "checkbox",
      "radio",
    ].includes(input.type)
  )
    return;

  const { data } = await getProfileData();
  if (!data || Object.keys(data).length === 0) return;

  if (suggestionBox) suggestionBox.remove();

  suggestionBox = document.createElement("div");
  suggestionBox.className = "llb-suggestion";

  suggestionBox.innerHTML = `
    <div class="llb-header" style="display: flex; justify-content: space-between; align-items: center;">
        <span>⚡ Choose Value</span>
        <span id="llb-close-btn" style="cursor: pointer; font-size: 24px; line-height: 20px; opacity: 0.8;">&times;</span>
    </div>`;

  suggestionBox
    .querySelector("#llb-close-btn")
    .addEventListener("click", (e) => {
      e.stopPropagation();
      suggestionBox.remove();
      suggestionBox = null;
    });

  const fields = [
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "username", label: "Username" },
    { key: "password", label: "Password" },
    { key: "company", label: "Company / Site" },
    { key: "title", label: "Title / Subject" },
    { key: "website", label: "Website URL" },
    { key: "phone", label: "Phone" },
    { key: "address", label: "Address" },
    { key: "city", label: "City" },
    { key: "region", label: "Region / State" },
    { key: "zip", label: "Zip / Postal" },
    { key: "fake", label: "🎲 Generate Fake for this field" },
  ];

  fields.forEach((f) => {
    if (f.key === "fake") {
      const item = document.createElement("div");
      item.className = "llb-item";
      item.style.background = "#fff0f0";
      item.innerHTML = `<strong>${f.label}</strong>`;
      item.onclick = () => {
        const type = getFieldType(input);
        const fake = generateFake(type);
        if (fake) {
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
    if (f.key === "password") display = "••••••••";

    const item = document.createElement("div");
    item.className = "llb-item";
    item.innerHTML = `<strong>${f.label}</strong><small>${display}</small>`;
    item.onclick = () => {
      smartFill(input, data[f.key]);
      suggestionBox.remove();
      toast(`${f.label} inserted`);
    };
    suggestionBox.appendChild(item);
  });

  const reminder = document.createElement("div");
  reminder.className = "llb-item";
  reminder.innerHTML = `<strong>4 clicks anywhere = Fill All</strong>`;
  reminder.style.background = "#e8f5e8";
  reminder.style.fontWeight = "bold";
  suggestionBox.appendChild(reminder);

  document.body.appendChild(suggestionBox);

  const rect = input.getBoundingClientRect();
  suggestionBox.style.top = `${window.scrollY + rect.bottom + 10}px`;
  suggestionBox.style.left = `${window.scrollX + rect.left}px`;
});

document.addEventListener("click", (e) => {
  if (
    suggestionBox &&
    !suggestionBox.contains(e.target) &&
    !["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)
  ) {
    suggestionBox.remove();
    suggestionBox = null;
  }
});

// Helper to pause execution
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ────────────────────────────────
//  ★★★ NAVIGATION SHORTCUTS ★★★
// ────────────────────────────────
document.addEventListener("dblclick", (e) => {
  // 1. Shift + Alt + Double Click -> Converter (NO Refresh)
  if (e.altKey && e.shiftKey) {
    chrome.runtime.sendMessage({ type: "ACTIVATE_CONVERTER" });
    return; // Stop here so we don't trigger the other one
  }

  // 2. Alt + Double Click -> Fakemail (Refreshes)
  if (e.altKey) {
    chrome.runtime.sendMessage({ type: "ACTIVATE_FAKEMAIL" });
  }
});

// ============================================================
// ⚡ SUPER RIGHT-CLICK HANDLER
// 1. Ctrl + Double Right Click = Text Menu
// 2. Alt  + Double Right Click = Auto Submit/Publish
// ============================================================
(() => {
  let lastRightClickTime = 0;
  let currentRightClickTarget = null;

  document.addEventListener(
    "contextmenu",
    (e) => {
      // We only care if CTRL or ALT is held
      if (!e.ctrlKey && !e.altKey) return;

      const currentTime = new Date().getTime();
      const timeDiff = currentTime - lastRightClickTime;

      if (timeDiff < 600) {
        // --- DOUBLE CLICK DETECTED ---
        e.preventDefault();
        e.stopPropagation();

        currentRightClickTarget = e.target;
        lastRightClickTime = 0; // Reset timer

        // ➤ JOB 1: TEXT MENU (Ctrl + Double Right Click)
        if (e.ctrlKey) {
          if (typeof toast === "function") toast("⚡ Opening Text Menu...");
          createOverlayMenu(e.clientX, e.clientY);
          return;
        }

        // ➤ JOB 2: AUTO SUBMIT (Alt + Double Right Click)
        if (e.altKey) {
          if (typeof toast === "function") toast("🚀 Auto Submitting...");
          triggerAutoSubmit();
          return;
        }
      } else {
        // First click: Prevent default to allow for double click detection
        e.preventDefault();
        e.stopPropagation();
        lastRightClickTime = currentTime;
        removeOverlayMenu();
      }
    },
    true
  );

  // -------------------------------------------------------
  // LOGIC: AUTO SUBMIT (Extracted & Upgraded)
  // -------------------------------------------------------
  function triggerAutoSubmit() {
    const submitKeywords = [
      "submit",
      "post",
      "publish",
      "register",
      "sign up",
      "signup",
      "login",
      "sign in",
      "signin",
      "create",
      "save",
      "continue",
      "post ad",
      "post listing",
      "place order",
      "complete",
      "finish",
      "proceed",
      "next",
      "add listing",
      "list now",
    ];

    const buttons = Array.from(
      document.querySelectorAll(
        'button, input[type="submit"], input[type="button"], a[role="button"], div[role="button"], span[role="button"]'
      )
    ).filter((btn) => {
      // 1. Must be visible
      if (!btn.offsetParent || btn.offsetWidth < 30 || btn.offsetHeight < 20)
        return false;
      if (btn.disabled) return false;

      // 2. Text must contain a submit keyword
      const text = (
        btn.textContent ||
        btn.value ||
        btn.title ||
        btn.getAttribute("aria-label") ||
        ""
      )
        .toLowerCase()
        .trim();
      if (!submitKeywords.some((kw) => text.includes(kw))) return false;

      // 3. EXCLUDE EDITORS / TOOLBARS
      const parent = btn.closest("div, span, td, li");
      if (!parent) return true;

      const parentClass = (parent.className || "").toLowerCase();
      const parentId = (parent.id || "").toLowerCase();
      const blacklist = [
        "mce",
        "cke",
        "tox",
        "ql-",
        "editor",
        "toolbar",
        "format",
        "wp-",
        "admin",
        "menu",
        "nav",
        "header",
      ];

      if (
        blacklist.some(
          (term) => parentClass.includes(term) || parentId.includes(term)
        )
      ) {
        return false;
      }
      return true;
    });

    if (buttons.length > 0) {
      // Sort by visual prominence (usually the last button in DOM is the main one, or distinct style)
      const target = buttons[buttons.length - 1];

      target.scrollIntoView({ behavior: "smooth", block: "center" });

      // Highlights the button briefly
      target.style.outline = "3px solid #e74c3c";
      target.style.boxShadow = "0 0 15px rgba(231, 76, 60, 0.5)";

      setTimeout(() => {
        target.click();
        if (typeof toast === "function")
          toast(`Clicked: "${target.textContent.trim() || target.value}"`);
        target.style.outline = "";
        target.style.boxShadow = "";
      }, 300);
    } else {
      if (typeof toast === "function")
        toast("⚠️ No clear 'Submit' button found.");
    }
  }

  // -------------------------------------------------------
  // LOGIC: TEXT MENU (Existing)
  // -------------------------------------------------------
  document.addEventListener("click", (e) => {
    if (
      e.target.id !== "qtf-overlay-menu" &&
      !e.target.className.includes("qtf-item")
    ) {
      removeOverlayMenu();
    }
  });

  // --- CONVERSION ENGINES ---

  function toMarkdown(html) {
    let temp = document.createElement("div");
    temp.innerHTML = html;
    temp
      .querySelectorAll("a")
      .forEach((a) => a.replaceWith(`[${a.textContent}](${a.href})`));
    temp
      .querySelectorAll("b, strong")
      .forEach((b) => b.replaceWith(`**${b.textContent}**`));
    temp
      .querySelectorAll("i, em")
      .forEach((i) => i.replaceWith(`*${i.textContent}*`));
    let text = temp.innerHTML.replace(/<br\s*\/?>/gi, "\n");
    return text.replace(/<[^>]+>/g, "").trim();
  }

  function toReferenceMarkdown(html) {
    let temp = document.createElement("div");
    temp.innerHTML = html;
    let refs = [];
    let counter = 1;

    temp.querySelectorAll("a").forEach((a) => {
      const currentRef = counter++;
      a.replaceWith(`[${a.textContent}][${currentRef}]`);
      refs.push(`[${currentRef}]: ${a.href}`);
    });

    temp
      .querySelectorAll("b, strong")
      .forEach((b) => b.replaceWith(`**${b.textContent}**`));
    temp
      .querySelectorAll("i, em")
      .forEach((i) => i.replaceWith(`*${i.textContent}*`));

    let body = temp.innerHTML
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .trim();

    if (refs.length > 0) return body + "\n\n" + refs.join("\n");
    return body;
  }

  function toBBCode(html) {
    let temp = document.createElement("div");
    temp.innerHTML = html;
    temp
      .querySelectorAll("a")
      .forEach((a) => a.replaceWith(`[url=${a.href}]${a.textContent}[/url]`));
    temp
      .querySelectorAll("b, strong")
      .forEach((b) => b.replaceWith(`[b]${b.textContent}[/b]`));
    temp
      .querySelectorAll("i, em")
      .forEach((i) => i.replaceWith(`[i]${i.textContent}[/i]`));
    let text = temp.innerHTML.replace(/<br\s*\/?>/gi, "\n");
    return text.replace(/<[^>]+>/g, "").trim();
  }

  // --- UPGRADED MENU FUNCTION ---
  function createOverlayMenu(x, y) {
    removeOverlayMenu();

    chrome.storage.sync.get(["masterHTML"], (result) => {
      const master = result.masterHTML || "";

      if (!master) {
        if (typeof toast === "function")
          toast("⚠️ No Source HTML found. Save in Popup first.");
        return;
      }

      // ⚡ CLEAN HTML (Removes <p> at start and </p> at end)
      const htmlClean = master
        .replace(/^\s*<p[^>]*>/i, "") // Remove opening <p>
        .replace(/<\/p>\s*$/i, ""); // Remove closing </p>

      // ⚡ GENERATE CONVERSIONS
      const markdown = toMarkdown(master);
      const bbcode = toBBCode(master);
      const reference = toReferenceMarkdown(master);

      const itemsToRender = [
        { text: htmlClean, label: "HTML Code (Clean)", isRich: false }, // <--- FIXED
        { text: markdown, label: "Markdown (Inline)", isRich: false },
        { text: bbcode, label: "BBCode", isRich: false },
        { text: reference, label: "Markdown (Reference Style)", isRich: false },
        { text: master, label: "⭐ Original / Rich Text", isRich: true },
      ];

      const menu = document.createElement("div");
      menu.id = "qtf-overlay-menu";

      Object.assign(menu.style, {
        position: "fixed",
        top: y + "px",
        left: x + "px",
        zIndex: "2147483648",
        backgroundColor: "#fff",
        border: "1px solid #aaa",
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        borderRadius: "8px",
        minWidth: "250px",
        fontFamily: "Segoe UI, sans-serif",
        fontSize: "13px",
        color: "#333",
        textAlign: "left",
        padding: "5px 0",
      });

      itemsToRender.forEach((item) => {
        const menuEl = document.createElement("div");
        menuEl.className = "qtf-item";

        let previewText = item.text;
        if (item.isRich) {
          const temp = document.createElement("div");
          temp.innerHTML = item.text;
          previewText = temp.textContent || item.text;
        }

        menuEl.innerHTML = `
        <div style="font-weight:bold; color:${
          item.isRich ? "#e67e22" : "#2ecc71"
        }; font-size:11px; margin-bottom:3px;">
            ${item.label}
        </div>
        <div style="color:#555; font-size:12px; font-family: monospace; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width: 230px;">
            ${escapeHtml(previewText)}
        </div>
      `;

        Object.assign(menuEl.style, {
          padding: "8px 15px",
          cursor: "pointer",
          borderBottom: "1px solid #f0f0f0",
          background: "#fff",
          transition: "background 0.1s",
        });

        menuEl.onmouseenter = () => (menuEl.style.backgroundColor = "#f0fcf0");
        menuEl.onmouseleave = () => (menuEl.style.backgroundColor = "#fff");

        menuEl.onmousedown = (e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSnippetSelection(item.text, item.isRich);
        };

        menu.appendChild(menuEl);
      });

      document.body.appendChild(menu);

      const rect = menu.getBoundingClientRect();
      if (rect.right > window.innerWidth)
        menu.style.left = window.innerWidth - rect.width - 20 + "px";
      if (rect.bottom > window.innerHeight)
        menu.style.top = window.innerHeight - rect.height - 20 + "px";
    });
  }

  function removeOverlayMenu() {
    const menu = document.getElementById("qtf-overlay-menu");
    if (menu) menu.remove();
  }

  function escapeHtml(text) {
    if (!text) return "";
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function handleSnippetSelection(text, isRich) {
    removeOverlayMenu();

    if (isRich) {
      try {
        const blobHtml = new Blob([text], { type: "text/html" });
        const blobText = new Blob([text.replace(/<[^>]*>?/gm, "")], {
          type: "text/plain",
        });
        const data = [
          new ClipboardItem({
            ["text/html"]: blobHtml,
            ["text/plain"]: blobText,
          }),
        ];
        navigator.clipboard.write(data);
      } catch (e) {
        navigator.clipboard.writeText(text);
      }
    } else {
      navigator.clipboard.writeText(text);
    }

    if (typeof toast === "function") toast("✅ Copied & Pasted!");

    if (currentRightClickTarget) {
      insertSnippetLogic(currentRightClickTarget, text, isRich);
    }
  }

  function insertSnippetLogic(target, text, isRich) {
    target.focus();

    if (isRich) {
      const success = document.execCommand("insertHTML", false, text);
      if (success) return;
    }

    const success = document.execCommand("insertText", false, text);
    if (success) return;

    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
      const proto =
        target.tagName === "INPUT"
          ? window.HTMLInputElement.prototype
          : window.HTMLTextAreaElement.prototype;
      const nativeSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;

      if (nativeSetter) nativeSetter.call(target, target.value + text);
      else target.value += text;

      target.dispatchEvent(new Event("input", { bubbles: true }));
      target.dispatchEvent(new Event("change", { bubbles: true }));
      return;
    }

    if (target.isContentEditable || document.designMode === "on") {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();

        if (isRich) {
          const frag = range.createContextualFragment(text);
          range.insertNode(frag);
        } else {
          range.insertNode(document.createTextNode(text));
        }
        target.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }
  }
})();

// ============================================================
// 🚀 SMART URL SWAPPER (Profile Collision Check)
// ============================================================
(async function initUrlSwapper() {
  // 1. Get User Data
  const { data } = await getProfileData();
  const myUsername = data.username; // Ensure this key matches your storage key

  if (!myUsername) return; // No username saved? Do nothing.

  // 2. Parse Current URL
  const path = window.location.pathname; // e.g., "/user/motobuys"
  const segments = path.split("/").filter((s) => s.length > 0); // ["user", "motobuys"]

  // 3. Logic: Identify the "Suspect" Username in the URL
  let suspectIndex = -1;
  let mode = "none";

  // TIER 1: Common Prefix Paths
  const profilePrefixes = [
    "user",
    "users",
    "u",
    "profile",
    "profiles",
    "p",
    "member",
    "members",
    "author",
    "account",
    "channel",
    "c",
    "id",
  ];

  // Check if the *second to last* segment is a prefix (e.g. /u/name)
  if (segments.length >= 2) {
    const secondLast = segments[segments.length - 2].toLowerCase();
    if (profilePrefixes.includes(secondLast)) {
      suspectIndex = segments.length - 1; // The last part is the username
      mode = "prefix";
    }
  }

  // TIER 2: The "@" Syntax (e.g. /@motobuys)
  if (segments.length > 0 && suspectIndex === -1) {
    const last = segments[segments.length - 1];
    if (last.startsWith("@")) {
      suspectIndex = segments.length - 1;
      mode = "at";
    }
  }

  // TIER 3: Root Level (e.g. /motobuys) - The "Ignore List" Strategy
  if (segments.length === 1 && suspectIndex === -1) {
    const potentialUser = segments[0].toLowerCase();

    // Words that are DEFINITELY NOT usernames
    const ignoreList = [
      "about",
      "contact",
      "terms",
      "privacy",
      "help",
      "support",
      "login",
      "signin",
      "signup",
      "register",
      "search",
      "explore",
      "home",
      "index",
      "category",
      "shop",
      "cart",
      "checkout",
      "blog",
      "news",
      "articles",
      "features",
      "pricing",
      "plans",
      "api",
      "dev",
      "jobs",
      "careers",
      "sitemap",
      "robots",
    ];

    if (!ignoreList.includes(potentialUser)) {
      suspectIndex = 0;
      mode = "root";
    }
  }

  // 4. Evaluate & Act
  if (suspectIndex !== -1) {
    const currentSuspect = segments[suspectIndex];

    // Clean logic: Remove "@" if checking an @-style URL
    const cleanSuspect = currentSuspect.startsWith("@")
      ? currentSuspect.substring(1)
      : currentSuspect;
    const cleanMyUser = myUsername.startsWith("@")
      ? myUsername.substring(1)
      : myUsername;

    // STOP if:
    // 1. We are already on our own page (collision avoided)
    // 2. The suspect is ridiculously long (probably a blog post slug, not a user)
    if (cleanSuspect.toLowerCase() === cleanMyUser.toLowerCase()) return;
    if (cleanSuspect.length > 40) return;

    // 5. Create the New URL
    const newSegments = [...segments];
    // Preserve the "@" if the site uses it
    newSegments[suspectIndex] = (mode === "at" ? "@" : "") + cleanMyUser;
    const newPath = "/" + newSegments.join("/");
    const targetUrl = window.location.origin + newPath + window.location.search;

    // 6. Show the UI (Non-intrusive Button)
    createSwapButton(cleanMyUser, targetUrl);
  }

  function createSwapButton(user, url) {
    const btn = document.createElement("div");
    btn.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:16px;">⚡</span>
        <div style="display:flex; flex-direction:column; line-height:1.2;">
          <span style="font-size:10px; opacity:0.8; color:#ccc;">CHECK PROFILE</span>
          <span style="font-weight:bold; color:white;">Go to /${user}?</span>
        </div>
      </div>
    `;

    Object.assign(btn.style, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      zIndex: "2147483647",
      background: "#2d3436",
      color: "white",
      padding: "10px 16px",
      borderRadius: "8px",
      boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
      cursor: "pointer",
      fontFamily: "system-ui, sans-serif",
      fontSize: "13px",
      transition: "transform 0.2s, opacity 0.2s",
      border: "1px solid #444",
    });

    // Hover Effect
    btn.onmouseenter = () => (btn.style.transform = "translateY(-2px)");
    btn.onmouseleave = () => (btn.style.transform = "translateY(0)");

    // Click Action
    btn.onclick = () => {
      btn.innerHTML = "🚀 Switching...";
      window.location.href = url;
    };

    // Close Button (X)
    const close = document.createElement("span");
    close.innerHTML = "&times;";
    Object.assign(close.style, {
      position: "absolute",
      top: "-8px",
      left: "-8px",
      background: "#d63031",
      color: "white",
      width: "18px",
      height: "18px",
      borderRadius: "50%",
      textAlign: "center",
      lineHeight: "16px",
      fontSize: "14px",
      cursor: "pointer",
      fontWeight: "bold",
      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
    });
    close.onclick = (e) => {
      e.stopPropagation();
      btn.remove();
    };

    btn.appendChild(close);
    document.body.appendChild(btn);
  }
})();
