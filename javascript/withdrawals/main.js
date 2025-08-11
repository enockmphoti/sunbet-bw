// Alert to confirm the script is loaded
alert("JavaScript file loaded successfully!");

import { handleOrangeMoneyWithdrawal } from './orangeMoney.js';
import { handleEFTWithdrawal } from './eft.js';
import { handleMyZakaWithdrawal } from './myzaka.js';
import { sfpAdvancedNavigation } from './sfpAdvancedNavigation.js';
// import { withdrawControl } from './withdrawControl.js';

document.addEventListener("DOMContentLoaded", function () {
    alert("Withdrawal options are now available. Please select your preferred method.");
    const orangeWithdrawButton = document.getElementById("orangeWithdrawButton");
    const eftWithdrawButton = document.getElementById("eftWithdrawButton");
    const myZakaWithdrawButton = document.getElementById("myzakaWithdrawButton");

    if (orangeWithdrawButton) {
        orangeWithdrawButton.addEventListener("click", async (e) => {
            e.preventDefault();
            await handleOrangeMoneyWithdrawal();
        });
    }

    if (eftWithdrawButton) {
        eftWithdrawButton.addEventListener("click", async (e) => {
            e.preventDefault();
            await handleEFTWithdrawal();
        });
    }

    if (myZakaWithdrawButton) {
        myZakaWithdrawButton.addEventListener("click", async (e) => {
            e.preventDefault();
            await handleMyZakaWithdrawal();
        });
    }

    // Initialize StudioForm
    window.StudioForm = window.StudioForm || [];
    window.StudioForm.push(sfpAdvancedNavigation);
    window.StudioForm.push(withdrawControl);

    console.log("StudioForm initialized with navigation and withdrawal control.");
});