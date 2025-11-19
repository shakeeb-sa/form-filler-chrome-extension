document.addEventListener('DOMContentLoaded', () => {
    const status = document.getElementById('status');
    const formFields = [
        'username', 'email', 'password', 'firstName', 'lastName',
        'company', 'phone', 'address', 'city', 'zip', 'region'
    ];
    const profileRadios = document.querySelectorAll('input[name="profile"]');
    
    let allData = {}; // To store all profile data locally

    // --- UTILITY FUNCTIONS ---
    
    // Updates the form fields with data from a specific profile object
    function displayProfileData(profileData = {}) {
        formFields.forEach(field => {
            const inputElement = document.getElementById(field);
            if (inputElement) {
                inputElement.value = profileData[field] || '';
            }
        });
    }
    
    // Gets the ID of the currently selected profile (e.g., "profile1")
    function getSelectedProfileId() {
        return document.querySelector('input[name="profile"]:checked').value;
    }

    // --- INITIALIZATION ---

    // 1. Load all data from storage when the popup opens
    chrome.storage.sync.get(null, (data) => {
        allData = data;
        const activeProfile = data.activeProfile || 'profile1';

        // 2. Set the correct radio button
        document.querySelector(`input[value="${activeProfile}"]`).checked = true;

        // 3. Display the data for the active profile
        displayProfileData(allData[activeProfile]);
    });

    // --- EVENT LISTENERS ---

    // 4. Listen for changes in the profile selection
    profileRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            const newActiveProfile = event.target.value;
            // Save the newly selected profile as the active one
            chrome.storage.sync.set({ activeProfile: newActiveProfile });
            // Update the form to show the data for the new profile
            displayProfileData(allData[newActiveProfile]);
        });
    });

    // 5. Listen for the Save button click
    document.getElementById('saveButton').addEventListener('click', () => {
        const activeProfileId = getSelectedProfileId();
        const dataToSave = {};

        // Collect current form data
        formFields.forEach(field => {
            const inputElement = document.getElementById(field);
            if (inputElement) {
                dataToSave[field] = inputElement.value;
            }
        });

        // Save the collected data under the active profile's key
        chrome.storage.sync.set({ [activeProfileId]: dataToSave }, () => {
            // Also update our local state
            allData[activeProfileId] = dataToSave;
            
            status.textContent = `Data saved to ${activeProfileId.replace('e', 'e ')}!`;
            setTimeout(() => { status.textContent = ''; }, 2500);
        });
    });
});
