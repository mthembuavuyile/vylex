import { db, auth } from './firebase.js';
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { updateProfile } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { DOMElements } from './dom.js';
import { CONSTANTS, setButtonLoading } from './utils.js';

export async function handleProfileFormSubmit(e) {
    e.preventDefault(); if (!auth.currentUser) return;
    setButtonLoading(DOMElements.saveProfileButton, true, CONSTANTS.SAVE_PROFILE_TEXT);
    DOMElements.profileFormFeedback.textContent = ''; DOMElements.profileFormFeedback.className = 'text-sm';
  
    const newName = DOMElements.profileNameInput.value.trim();
    try {
        await updateProfile(auth.currentUser, { displayName: newName });
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userDocRef, { name: newName });
  
        updateUserInfoUI(newName, auth.currentUser.email, auth.currentUser.photoURL);
        DOMElements.profileFormFeedback.textContent = 'Profile updated successfully!';
        DOMElements.profileFormFeedback.classList.add('text-green-600');
    } catch (error) {
        console.error("Error updating profile:", error);
        DOMElements.profileFormFeedback.textContent = 'Failed to update profile. Please try again.';
        DOMElements.profileFormFeedback.classList.add('text-red-600');
    } finally {
        setButtonLoading(DOMElements.saveProfileButton, false, CONSTANTS.SAVE_PROFILE_TEXT);
    }
}
  
export async function handleBillingSettingsFormSubmit(e) {
    e.preventDefault();
    setButtonLoading(DOMElements.saveBillingSettings, true, CONSTANTS.SAVE_BILLING_SETTINGS_TEXT);
    DOMElements.billingSettingsFeedback.textContent = '';
    DOMElements.billingSettingsFeedback.className = 'text-sm';
  
    const defaultRate = parseFloat(DOMElements.defaultHourlyRate.value) || 0;
  
    try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userDocRef, { defaultHourlyRate: defaultRate });
        DOMElements.billingSettingsFeedback.textContent = 'Billing settings updated successfully!';
        DOMElements.billingSettingsFeedback.classList.add('text-green-600');
    } catch (error) {
        console.error("Error updating billing settings:", error);
        DOMElements.billingSettingsFeedback.textContent = 'Failed to update billing settings. Please try again.';
        DOMElements.billingSettingsFeedback.classList.add('text-red-600');
    } finally {
        setButtonLoading(DOMElements.saveBillingSettings, false, CONSTANTS.SAVE_BILLING_SETTINGS_TEXT);
    }
}

export function updateUserInfoUI(name, email, photoURL) {
    const avatar = photoURL || CONSTANTS.DEFAULT_AVATAR_SVG;
    DOMElements.welcomeMessage.textContent = `Welcome back, ${name.split(' ')[0]}! 👋`;
    DOMElements.userNameDisplay.textContent = name;
    DOMElements.userNameDisplay.classList.remove('anim-pulse', 'bg-gray-200', 'w-24', 'h-4');
    DOMElements.userEmailDisplay.textContent = email;
    DOMElements.userAvatarDisplay.src = avatar;
    DOMElements.userAvatarButton.src = avatar;
    DOMElements.dropdownUserName.textContent = name;
    DOMElements.dropdownUserEmail.textContent = email;
    DOMElements.profileNameInput.value = name;
    DOMElements.profileEmailInput.value = email;
}
