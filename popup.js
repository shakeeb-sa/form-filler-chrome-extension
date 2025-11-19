document.addEventListener('DOMContentLoaded', () => {
    const status = document.getElementById('status');
    const formFields = [
        'username', 'email', 'password', 'firstName', 'lastName',
        'company', 'title', 'phone', 'address', 'city', 'zip', 'region'
    ];
    
    const profileRadios = document.querySelectorAll('input[name="profile"]');
    let allData = {}; 

    // --- UTILITY FUNCTIONS ---
    function displayProfileData(profileData = {}) {
        formFields.forEach(field => {
            const inputElement = document.getElementById(field);
            if (inputElement) {
                inputElement.value = profileData[field] || '';
            }
        });
    }
    
    function getSelectedProfileId() {
        return document.querySelector('input[name="profile"]:checked').value;
    }

    // --- INITIALIZATION ---
    chrome.storage.sync.get(null, (data) => {
        allData = data;
        const activeProfile = data.activeProfile || 'profile1';
        document.querySelector(`input[value="${activeProfile}"]`).checked = true;
        displayProfileData(allData[activeProfile]);
    });

    // --- EVENT LISTENERS ---
    profileRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            const newActiveProfile = event.target.value;
            chrome.storage.sync.set({ activeProfile: newActiveProfile });
            displayProfileData(allData[newActiveProfile]);
        });
    });

    document.getElementById('saveButton').addEventListener('click', () => {
        const activeProfileId = getSelectedProfileId();
        const dataToSave = {};

        // Collect Standard Fields
        formFields.forEach(field => {
            const inputElement = document.getElementById(field);
            if (inputElement) {
                dataToSave[field] = inputElement.value;
            }
        });

        chrome.storage.sync.set({ [activeProfileId]: dataToSave }, () => {
            allData[activeProfileId] = dataToSave;
            status.textContent = `Data saved to ${activeProfileId.replace('e', 'e ')}!`;
            setTimeout(() => { status.textContent = ''; }, 2500);
        });
    });
});