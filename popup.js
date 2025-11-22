document.addEventListener("DOMContentLoaded", () => {
  const status = document.getElementById("status");
  const masterInput = document.getElementById("masterInput"); // Ref to new input

  // Add 'category' to your existing fields list
  const formFields = [
    "username",
    "email",
    "password",
    "firstName",
    "lastName",
    "website",
    "company",
    "title",
    "phone",
    "address",
    "city",
    "zip",
    "region",
    "country",
    "category",
  ];

  const profileRadios = document.querySelectorAll('input[name="profile"]');
  let allData = {};

  // --- UTILITY FUNCTIONS ---
  function displayProfileData(profileData = {}) {
    formFields.forEach((field) => {
      const inputElement = document.getElementById(field);
      if (inputElement) {
        inputElement.value = profileData[field] || "";
      }
    });
  }

  function getSelectedProfileId() {
    return document.querySelector('input[name="profile"]:checked').value;
  }

  // --- INITIALIZATION ---
  chrome.storage.sync.get(null, (data) => {
    allData = data;
    const activeProfile = data.activeProfile || "profile1";
    document.querySelector(`input[value="${activeProfile}"]`).checked = true;
    displayProfileData(allData[activeProfile]);

    // 🟢 LOAD MASTER HTML (Description)
    if (data.masterHTML) {
      masterInput.innerHTML = data.masterHTML;
    }
  });

  // --- EVENT LISTENERS ---
  profileRadios.forEach((radio) => {
    radio.addEventListener("change", (event) => {
      const newActiveProfile = event.target.value;
      chrome.storage.sync.set({ activeProfile: newActiveProfile });
      displayProfileData(allData[newActiveProfile]);
    });
  });

  document.getElementById("saveButton").addEventListener("click", () => {
    const activeProfileId = getSelectedProfileId();
    const dataToSave = {};

    // 1. Collect Standard Fields
    formFields.forEach((field) => {
      const inputElement = document.getElementById(field);
      if (inputElement) {
        dataToSave[field] = inputElement.value;
      }
    });

    // 🟢 2. CONVERT & PREPARE SNIPPETS
    const rawHTML = masterInput.innerHTML;
    const parserDiv = document.createElement("div");
    parserDiv.innerHTML = rawHTML;

    let htmlCode = "";
    let markdownCode = "";
    let bbCode = "";
    let otherCodeBody = "";
    let referenceLinks = [];
    let linkCounter = 1;

    parserDiv.childNodes.forEach((node) => {
      if (node.nodeType === 3) {
        // Text
        const t = node.textContent;
        htmlCode += t;
        markdownCode += t;
        bbCode += t;
        otherCodeBody += t;
      } else if (node.nodeType === 1 && node.tagName === "A") {
        // Links
        const t = node.textContent;
        const u = node.getAttribute("href");
        htmlCode += `<a href="${u}">${t}</a>`;
        markdownCode += `[${t}](${u})`;
        bbCode += `[url=${u}]${t}[/url]`;
        otherCodeBody += `[${t}][${linkCounter}]`;
        referenceLinks.push(`[${linkCounter}]: ${u}`);
        linkCounter++;
      } else if (node.nodeType === 1) {
        // Other tags
        const t = node.textContent;
        htmlCode += t;
        markdownCode += t;
        bbCode += t;
        otherCodeBody += t;
      }
    });

    let otherCode = otherCodeBody;
    if (referenceLinks.length > 0)
      otherCode += "\n\n" + referenceLinks.join("\n");

    const snippets = [htmlCode, markdownCode, bbCode, otherCode];

    // 🟢 3. SAVE EVERYTHING (Profile + Snippets + MasterHTML)
    chrome.storage.sync.set(
      {
        [activeProfileId]: dataToSave,
        snippets: snippets,
        masterHTML: rawHTML,
      },
      () => {
        allData[activeProfileId] = dataToSave;
        status.textContent = "All Data & Snippets Saved!";
        setTimeout(() => {
          status.textContent = "";
        }, 2500);
      }
    );
  });
});
