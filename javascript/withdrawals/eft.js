import { validateInputs, processWithdrawal } from './withdrawalUtils.js';

export async function handleEFTWithdrawal() {
    document.addEventListener("DOMContentLoaded", function () {
  const eftWithdrawBtn = document.querySelector("#eft-withdrawal-button");

  if (eftWithdrawBtn) {
    eftWithdrawBtn.addEventListener("click", function (e) {
      e.preventDefault();
      eftLogic(); // Trigger logic on button click only
    });
  }
});

  // EFT logic
  async function eftLogic() {
    const amountInput = document.querySelector("#amount");
    const accountSelect = document.querySelector('[sunbet-withdraw="eft-select"]');

    if (!amountInput || !accountSelect) {
      console.error("Required inputs for EFT are missing.");
      return;
    }

    const amount = parseFloat(amountInput.value.trim());
    const selectedAccount = accountSelect.value;

    // Validate inputs
    if (!amount || amount < 50 || amount > 5000) {
      Swal.fire({
        icon: "error",
        title: "Invalid Input",
        text: "Please enter a valid amount (between P50 and P5000).",
      });
      return;
    }

    if (!selectedAccount) {
      Swal.fire({
        icon: "error",
        title: "No Account Selected",
        text: "Please select an account to withdraw to.",
      });
      return;
    }

    // Fetch payment entities to find the EFT payment entity ID
    const response = await new Promise((resolve) =>
      simlBC.getPaymentEntities((err, data) =>
        resolve({ error: err, data: data })
      )
    );

    if (response.error) {
      Swal.fire({
        icon: "error",
        title: "Error Fetching Payment Entities",
        text: response.error.errors[0].detail,
      });
      return;
    }

    const eftEntity = response.data.paymentEntities.find(
      (entity) =>
        entity.paymentEntityType === "Bank" &&
        entity.paymentEntityStatus === "Verified" &&
        entity.accountNumber === selectedAccount
    );

    if (!eftEntity) {
      Swal.fire({
        icon: "error",
        title: "EFT Entity Not Found",
        text: "Please ensure your selected account is verified.",
      });
      return;
    }

    // Prepare withdrawal payload
    const withdrawalData = {
      amount: amount,
      currency_code: "BWP", // Replace with dynamic currency code if needed
      payment_entity_id: eftEntity.id, // Use the EFT payment entity ID
    };

    console.log("Withdrawal Data:", withdrawalData); // Debugging log

    // Call EFT withdrawal endpoint
    const withdrawalResponse = await new Promise((resolve) =>
      simlBC.requestWithdrawal(withdrawalData, (err, data) =>
        resolve({ error: err, data: data })
      )
    );

    // Handle response
    if (withdrawalResponse.error) {
      Swal.fire({
        icon: "error",
        title: "Withdrawal Failed",
        text: withdrawalResponse.error.errors[0].detail,
      });
      return;
    }

    Swal.fire({
      icon: "success",
      title: "Withdrawal Successful",
      text: `You have successfully withdrawn P${amount} to account ${selectedAccount}.`,
    }).then(() => {
  window.location.reload(); // Reload the whole page after user clicks "OK"
});
  }

  // Success
  function sfToSuccess() {
    const data = sf.data();
    const sfToName = data.payment_option + "-confirmation";
    const navigatorElements = document.querySelectorAll(
      '[sf-withdraw_form^="current-"]'
    );
    const confirmationNavigatorElements = document.querySelectorAll(
      '[sf-withdraw_form="current-{{ var }}"]'
    );

    gsap.set(navigatorElements, { pointerEvents: "none" });
    confirmationNavigatorElements.forEach((el) =>
      el.classList.add("sf-current")
    );

    sf.resolve = false;
    sf.to(sfToName);
    sf.resolve = true;

    renderBalances();
  }
  // Populate EFT accounts
async function populateEFTAccounts() {
  const accountSelect = document.querySelector('[sunbet-withdraw="eft-select"]');

  if (!accountSelect) {
    console.error("Account dropdown not found.");
    return;
  }

  // Store the currently selected value
  const selectedValue = accountSelect.value;

  // Fetch payment entities
  const entitiesResponse = await new Promise((resolve) =>
    simlBC.getPaymentEntities((err, data) => resolve({ error: err, data: data }))
  );

  console.log("Payment Entities Response:", entitiesResponse); // Debugging log

  if (entitiesResponse.error) {
    console.error("Error fetching payment entities:", entitiesResponse.error);
    Swal.fire({
      icon: "error",
      title: "Error Fetching Accounts",
      text: "Unable to fetch payment entities. Please try again later.",
    });
    return;
  }

  // Filter verified bank accounts
  const verifiedAccounts = entitiesResponse.data.paymentEntities.filter(
    (entity) =>
      entity.paymentEntityType === "Bank" &&
      entity.paymentEntityStatus === "Verified" &&
      entity.accountHolder !== "Unknown"
  );

  console.log("Verified Accounts:", verifiedAccounts); // Debugging log

  // Clear existing options
  accountSelect.innerHTML = '<option value="">Please select</option>';

  // Populate dropdown with verified accounts
  verifiedAccounts.forEach((account) => {
    const option = document.createElement("option");
    option.value = account.accountNumber;
    option.textContent = `${account.details.bankName}: ${account.accountNumber}`;
    accountSelect.appendChild(option);
  });

  // Restore the previously selected value if it exists
  if (selectedValue) {
    accountSelect.value = selectedValue;
  }

  console.log("Dropdown populated successfully."); // Debugging log
}

// Event listener for EFT slide
document.addEventListener("DOMContentLoaded", function () {
  const eftSlide = document.querySelector('[sf-name="eft"]');

  if (eftSlide) {
    eftSlide.addEventListener("click", async () => {
      await populateEFTAccounts();
    });
  }
});




  await processWithdrawal(eftEntity.id, amount, selectedAccount, "Account Holder");
}