////////////////////////////////////////////////////////////////////STUDIO FORM ADVANCED NAVIGATION////////////////////////////////////////////////////////////////
// This code handles advanced navigation for Studio Forms, allowing users to navigate through form slides and reset
function sfpAdvancedNavigation() {
  let e = "sfp-advanced-navigation-js";
  StudioForm.forEach((t) => {
    ["studio-form", "sf"].forEach((r) => {
      let i = `${r}-${t.name}`,
        o = `[${i}^="to-"]`;
      document.querySelectorAll(o).forEach((r) => {
        !r.getAttribute(e) &&
          (r.setAttribute(e, ""),
          r.addEventListener("click", () => {
            let e = r.getAttribute(i).slice(3),
              o = t.logic.find((t) => t.name == e || t.index == e)?.index,
              d = [...Array(o + 1).keys()];
            (!(d[d.length - 1] > t.record[t.record.length - 1].index) ||
              t.reportValidity()) &&
              ((e = r.getAttribute("sfp-removed-slides")) &&
                e
                  .split(",")
                  .forEach((e) => (d = d.filter((t) => t != e.trim()))),
              (t.record = d));
          }));
      }),
        document.querySelectorAll(`[${i}="reset"]`).forEach((r) => {
          !r.getAttribute(e + "-reset") &&
            (r.setAttribute(e + "-reset", ""),
            r.addEventListener("click", () => sfpMemoryWrite(t, {})));
        });
    });
  });
}
window.StudioForm = window.StudioForm || [];
window.StudioForm.push(sfpAdvancedNavigation);

window.StudioForm = window.StudioForm || [];
window.StudioForm.push(withdrawControl);

function withdrawControl() {
  // Values
  const sf = StudioForm.withdraw_form;
  let globalBalanceData = null;

  // Modal display logic
  ["sf-transition", "sf-transition-api"].forEach((str) =>
    sf.elements.mask.addEventListener(str, (e) => {
      const showNeedHelp = sf.record[sf.record.length - 1] > 4;
      gsap.set('[sunbet-withdraw="wallet-balance"]', {
        display: showNeedHelp ? "none" : "flex",
      });
      gsap.set('[sunbet-withdraw="need-help"]', {
        display: showNeedHelp ? "flex" : "none",
      });
    })
  );

  // sf - to add bank account
  function sfToAddBankAccount() {
    sf.resolve = false;
    sf.to("add-bank-account");
    sf.resolve = true;

    // Message
    Swal.fire({
      title: "Missing bank account!",
      text: "Please add a bank account for withdrawals before proceeding",
    });
  }

  // Throw swal error
  function throwSwalErr(err, noThen = false) {
    if (!err) return;

    const error = err.errors[0];
    Swal.fire({
      icon: "error",
      title: error.code,
      text: error.detail,
    }).then((result) => {
      if (typeof noThen == "function") noThen();
      if (noThen) return;

      document.querySelector('[sunbet-modals="login"]').click();

      window.addEventListener("sunbet-modals-close", renderBalances, {
        once: true,
      });
    });

    return true;
  }

  // Balance
  function renderBalances(event) {
    if (event && !event.detail.successClose) return;

    simlBC.getBalances((err, data) => {
      if (throwSwalErr(err)) return;

      const cash = document.querySelector(
        '[sunbet-withdraw="digitalPlayableCash"]'
      );
      const bonus = document.querySelector(
        '[sunbet-withdraw="digitalTotalBonus"]'
      );
      const total = document.querySelector(
        '[sunbet-withdraw="digitalTotalCash"]'
      );
      const loader = document.querySelector(
        '[sunbet-withdraw="wallet-balance-loader"]'
      );

      const d = data[0];
      cash.innerHTML = d.digitalPlayableCash;
      bonus.innerHTML = d.digitalTotalBonus;
      total.innerHTML = d.digitalTotalCash;
      loader.classList.remove("is-hidden", "is-loading");

      globalBalanceData = d;
    });
  }
  renderBalances();

  // Event listener
  ["sf-promise", "sf-promise-api"].forEach((str) =>
    sf.elements.mask.addEventListener(str, async (e) => {
      const d = e.detail;
      const currentSlide = sf.logic[d.current];
      const nextSlide = sf.logic[d.next];
      const isFirst = currentSlide.index == 0;
      let resolve = isFirst;

      console.log("Current Slide:", currentSlide);
      console.log("Next Slide:", nextSlide);
      console.log("Is First Slide:", isFirst);

      if (isFirst) {
        const trigger = document.querySelector(
          '[sunbet-withdraw="amount-studio-form-trigger"]'
        );

        trigger.setAttribute(
          "studio-form-withdraw_form",
          "to-" + nextSlide.name
        );
        trigger.setAttribute(
          "sfp-removed-slides",
          Array.from({ length: nextSlide.index - 1 }, (_, i) => i + 1).join()
        );
      }

      if (nextSlide?.name == "eft") await populateEFTAccounts();
      if (nextSlide?.name == "myzaka") await populateMobileNumber();
      if (nextSlide?.name == "orange-money") await populateOrangeMobileNumber();

      if (currentSlide.name == "add-bank-account") await addBankAccount(d);

      if (!isFirst && nextSlide && nextSlide.name.indexOf("-confirmation") < 0)
        // await amountLogic(d);

      console.log("Resolve Before Update:", resolve);
      sf.resolve = resolve;
      console.log("Resolve After Update:", sf.resolve);
    })
  );
///////////////////////////////////////////////////////////////STUDIO FORM ADVANCED NAVIGATION ENDS       ////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////EFT Logic/////////////////////////////////////////////////////////////////////////////////
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
}


////////////////////////////////////////////////////////////////////////////MYZAKA LOGIC/////////////////////////////////////////////////////////////////////////////////
// Trigger MyZaka logic when navigating to MyZaka slide
// MyZaka Withdrawal + Register Entity Webflow Logic

// Trigger MyZaka logic when navigating to MyZaka slide
document.addEventListener("DOMContentLoaded", function () {
  const withdrawBtn = document.querySelector("#myzaka-withdrawal-button");
  if (withdrawBtn) {
    withdrawBtn.addEventListener("click", function (e) {
      e.preventDefault();
      myZakaLogic();
    });
  }
});

// Auto-populate mobile number from user profile
async function populateMobileNumber() {
  const mobileInput = document.querySelector('#phone');
  if (!mobileInput) return;

  const response = await new Promise((resolve) =>
    simlBC.getProfile((err, data) => resolve({ error: err, data: data }))
  );

  if (response.error) return;
  const mobileNumber = response.data.player.profile.personal.telephone;
  if (mobileNumber) {
    mobileInput.value = mobileNumber;
    mobileInput.setAttribute("readonly", true);
  }
}

async function myZakaLogic() {
  const phoneInput = document.querySelector('#phone');
  const amountInput = document.querySelector('#amount-3');
  const nameInput = document.querySelector('#account-holder-name');

  console.log("Phone Input:", phoneInput);
  console.log("Amount Input:", amountInput);  
  console.log("Name Input:", nameInput);

  const phone = phoneInput?.value.trim();
  const amount = parseFloat(amountInput?.value.trim());
  const accountHolderName = nameInput?.value.trim();

  if (!amount || amount < 50 || amount > 10000) {
    Swal.fire({ icon: "error", title: "Invalid Amount", text: "Enter amount between P50 and P10 000." });
    return;
  }

  if (!phone || phone.length < 8) {
    Swal.fire({ icon: "error", title: "Invalid Mobile Number", text: "Please enter a valid mobile number." });
    return;
  }

  if (!accountHolderName) {
    Swal.fire({ icon: "error", title: "Missing Account Holder Name", text: "Please enter the account holder's name." });
    return;
  }

  // Check if MyZaka entity exists
  const entityResponse = await new Promise((resolve) =>
    simlBC.getPaymentEntities((err, data) => resolve({ error: err, data: data }))
  );

  console.log("Payment Entities Response:", entityResponse); // Debugging log
  if (entityResponse.error) {
    Swal.fire({ icon: "error", title: "Error Fetching Payment Entities", text: entityResponse.error.errors[0].detail });
    return;
  }
 console.log("Payment Entities Data:", entityResponse.data);
  const myZakaEntity = entityResponse.data.paymentEntities.find(
    (entity) =>
      entity.paymentEntityType === "Bank" &&
      entity.paymentEntityStatus === "Verified" &&
      entity.details.bankName === "MyZaka"
  );
  console.log("MyZaka Entity:", myZakaEntity); // Debugging log

   // --- Step 2: Withdraw if entity found ---
  if (myZakaEntity) {
    const withdrawalData = {
      amount: amount,
      currency_code: "BWP",
      payment_entity_id: myZakaEntity.id,
    };
 console.log("Withdrawal Data:", withdrawalData);
    const withdrawResponse = await new Promise((resolve) =>
      simlBC.requestWithdrawal(withdrawalData, (err, data) => resolve({ error: err, data }))
    );
    console.log("Withdrawal Response:", withdrawResponse);
    if (withdrawResponse.error) {
      Swal.fire({ icon: "error", title: "Withdrawal Failed", text: withdrawResponse.error.errors[0].detail });
      return;
    }

    Swal.fire({
  icon: "success",
  title: "Withdrawal Successful",
  text: `You have successfully withdrawn P${amount} to MyZaka Money.`,
}).then(() => {
  window.location.reload(); 
});

    return;
  }



console.log("MYZAKA WITHDRAWAL ENTITY CREATION"); // Debugging log
// Register MyZaka entity with OTP modal
  // --- Step 3: Register new MyZaka Money entity after OTP ---
  // Define OTP Modal HTML
  const otpModalHTML = `
    <div class="single-form-block is-forgot">
      <div sm-data="script" id="w-node-dfc94cfb-8d8b-5e28-9e2b-b7b829e09584-73a96268" class="hide w-embed"></div>
      <div class="login-form-content-wrapper is-forgot">
        <div>
          <div class="code-embed w-embed">
            <!-- SVG Content Here -->
          </div>
          <div class="modal-heading">PASSWORD VERIFICATION</div>
        </div>
  
        <div class="form-content-main is-forgot w-form">
          <form id="wf-form-otp_form" name="wf-form-otp_form" data-name="otp_form" method="get" class="form-slide">
            <div class="form-slide">
              <div class="form-slide">
                <div id="modal-message" style="display: none; margin-bottom: 20px; padding: 10px 15px; border-radius: 8px; font-size: 14px;">
                  <span id="modal-message-text"></span>
                </div>
  
                <div class="is-position-relative">
                  <input class="form-input-text-field is-login-icon w-input" 
                    autofocus="true" 
                    maxlength="256" 
                    name="otp" 
                    data-name="otp" 
                    placeholder="Enter your one time password here" 
                    type="number" 
                    id="otp-input" 
                    required="">
                  <div class="form-field-icon is-orange w-embed">
                    <!-- SVG Icon Here -->
                  </div>
                </div>
  
                <div class="login-form-forgot-link-flex-wrapper is-centred">
                  <a href="#" class="text-link-small">Didn't receive password?</a>
                </div>
              </div>
  
              <div class="form-two-button-grid-wrapper">
                <a sm-data="closer" href="#" class="form-button w-button">Cancel</a>
                <button 
                  id="verify-otp"
                  class="buttons is-medium gradient-yellow w-button">
                  Verify
                </button>
              </div>
            </div>
          </form>
  
          <div class="w-form-done">
            <div>Thank you! Your submission has been received!</div>
          </div>
          <div class="form-error-message w-form-fail">
            <div>Please enter valid credentials!</div>
          </div>
        </div>
  
        <div sm-data="closer" id="w-node-dfc94cfb-8d8b-5e28-9e2b-b7b829e095a7-73a96268" class="close-button-form">
          <div class="x-line is-left"></div>
          <div class="x-line"></div>
        </div>
      </div>
    </div>
  
    <div sm-data="script">
      <script>
        const messageContainer = document.getElementById('modal-message');
        const messageText = document.getElementById('modal-message-text');
        
        function showModalMessage(message, type) {
          messageContainer.style.display = 'block';
          messageText.textContent = message;
          
          if (type === 'error') {
            messageContainer.style.backgroundColor = '#FF464F20';
            messageContainer.style.color = '#FF464F';
            messageContainer.style.border = '1px solid #FF464F';
          } else if (type === 'success') {
            messageContainer.style.backgroundColor = '#4CAF5020';
            messageContainer.style.color = '#4CAF50';
            messageContainer.style.border = '1px solid #4CAF50';
          }
  
          setTimeout(() => {
            const modalElement = document.querySelector('sunbet-modal');
            if (modalElement) {
              sunbetModalsClose(modalElement, false, type === 'success');
            }
          }, 2000);
        }
  
        function hideModalMessage() {
          messageContainer.style.display = 'none';
        }
  
        document.getElementById('verify-otp').addEventListener('click', function(e) {
          e.preventDefault();
          const otpValue = document.getElementById('otp-input').value;
          
          if (!otpValue) {
            showModalMessage('Please enter the verification code', 'error');
            return;
          }
          
          hideModalMessage();
          
          window.dispatchEvent(new CustomEvent('otp-submitted', { 
            detail: { 
              otp: otpValue,
              messageHandlers: {
                showSuccess: (msg) => showModalMessage(msg || 'Verification successful!', 'success'),
                showError: (msg) => showModalMessage(msg || 'Invalid verification code', 'error')
              }
            } 
          }));
        });
      </script>
    </div>
  `;

  const modalKey = "otp-verification-modal";
  sessionStorage.setItem("__sunbet_modal_assests__" + modalKey, otpModalHTML);

  simlBC.requestSessionPin(300, "mobile", function (err) {
    if (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to Send OTP",
        text: err.errors[0]?.detail || "OTP failed.",
      });
      return;
    }

    sunbetModalsRender(modalKey);

    const otpHandler = function (event) {
      const otp = event.detail.otp;
      const messageHandlers = event.detail.messageHandlers;

      simlBC.verifySessionPin(300, otp, async function (verifyErr, verifyData) {
        if (verifyErr || !verifyData.valid) {
          messageHandlers?.showError("Invalid OTP. Please try again.");
          return;
        }
        console.log("OTP Verified Successfully");
        // --- Step 4: Register MyZaka entity ---
        const entityPayload = {
          accountHolder: accountHolderName,
          details: {
            bankName: "MyZaka",
            accountNumber: phone,
            branchCode: "00000",
          },
        };
        console.log("Payload for Registering MyZaka Entity:", entityPayload);
        const registerResponse = await new Promise((resolve) =>
          simlBC.registerWithdrawalEntity(entityPayload, (err, data) =>
            resolve({ error: err, data })
          )
        );
        console.log("Register Entity Response:", registerResponse);

        if (registerResponse.error) {
          messageHandlers?.showError(
            registerResponse.error.errors[0]?.detail || "Failed to register MyZaka Money"
          );
          return;
        }

        if (registerResponse.data?.paymentEntityStatus === "Verified") {
          const withdrawalData = {
            amount: amount,
            currency_code: "BWP",
            payment_entity_id: registerResponse.data.id,
          };

          const withdrawAfterRegistration = await new Promise((resolve) =>
            simlBC.requestWithdrawal(withdrawalData, (err, data) =>
              resolve({ error: err, data })
            )
          );
          console.log("Withdrawal After Registration Response:", withdrawAfterRegistration);
          if (withdrawAfterRegistration.error) {
            messageHandlers?.showError(
              withdrawAfterRegistration.error.errors[0]?.detail || "Withdrawal failed"
            );
            return;
          }

          Swal.fire({
            icon: "success",
            title: "Withdrawal Successful",
            text: `You have successfully withdrawn P${amount} to MyZaka Money.`,
          }).then(() => {
  window.location.reload(); // Reload the whole page after user clicks "OK"
});
        }

        window.removeEventListener("otp-submitted", otpHandler);
      });
    };

    window.addEventListener("otp-submitted", otpHandler);
  });
}
/////////////////////////////////////////////////////////////////////////////////////////MYZAKA LOGIC ENDS/////////////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////////////////////////////////EFT AUTO POPULATE/////////////////////////////////////////////////////////////////////////////////
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
/////////////////////////////////////////////////////////////////////////////////EFT AUTO POPULATE ENDS/////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////ORANGE MONEY LOGIC/////////////////////////////////////////////////////////////////////////////////////

// ----------------------------------------------
// 1. Auto-populate Orange Mobile Number
// ----------------------------------------------
async function populateOrangeMobileNumber() {
  const orangeInput = document.querySelector('#phone-3');
  if (!orangeInput) {
    console.error("Orange number input field not found.");
    return;
  }

  const response = await new Promise((resolve) =>
    simlBC.getProfile((err, data) => resolve({ error: err, data }))
  );

  if (response.error) {
    console.error("Error fetching user profile:", response.error);
    return;
  }

  const mobileNumber = response.data.player.profile.personal.telephone;
  if (mobileNumber) {
    orangeInput.value = mobileNumber;
    orangeInput.setAttribute("readonly", true);
  } else {
    console.error("Mobile number not found in user profile.");
  }
}

// ----------------------------------------------
// 2. Orange Money Withdrawal Logic
// ----------------------------------------------
async function orangeMoneyLogic() {
  const phoneInput = document.querySelector('#phone-3');
  const amountInput = document.querySelector('#amount-5');
  const accountHolderInput = document.querySelector('#account-holder-name-orange');

  console.log("Phone Input:", phoneInput);
  console.log("Amount Input:", amountInput);
  console.log("Account Holder Input:", accountHolderInput);

  if (!phoneInput || !amountInput || !accountHolderInput) {
    console.error("Required Orange inputs are missing.");
    return;
  }

  const phone = phoneInput.value.trim();
  const amount = parseFloat(amountInput.value.trim());
  const accountHolderName = accountHolderInput.value.trim();

  // --- Basic Validations ---
  if (!amount || amount < 50 || amount > 10000) {
    Swal.fire({ icon: "error", title: "Invalid Amount", text: "Enter a valid amount (P50 - P10 000)" });
    return;
  }

  if (!phone || phone.length < 8) {
    Swal.fire({ icon: "error", title: "Invalid Phone Number", text: "Enter a valid mobile number" });
    return;
  }

  if (!accountHolderName) {
    Swal.fire({ icon: "error", title: "Missing Account Holder Name", text: "Please enter the account holder's name." });
    return;
  }

  // --- Step 1: Check for existing Orange Money entity ---
  const entityResponse = await new Promise((resolve) =>
    simlBC.getPaymentEntities((err, data) => resolve({ error: err, data }))
  );
  console.log("Payment Entities Response:", entityResponse);
  if (entityResponse.error) {
    Swal.fire({ icon: "error", title: "Failed to Fetch Payment Entities", text: entityResponse.error.errors[0].detail });
    return;
  }
 console.log("Payment Entities Data:", entityResponse.data);
  const orangeEntity = entityResponse.data.paymentEntities.find(
    (entity) =>
      entity.paymentEntityType === "Bank" &&
      entity.paymentEntityStatus === "Verified" &&
      entity.details.bankName === "Orange"
  );
 console.log("Found Orange Money Entity:", orangeEntity);
  // --- Step 2: Withdraw if entity found ---
  if (orangeEntity) {
    const withdrawalData = {
      amount,
      currency_code: "BWP",
      payment_entity_id: orangeEntity.id,
    };
 console.log("Withdrawal Data:", withdrawalData);
    const withdrawRes = await new Promise((resolve) =>
      simlBC.requestWithdrawal(withdrawalData, (err, data) => resolve({ error: err, data }))
    );
    console.log("Withdrawal Response:", withdrawRes);
    if (withdrawRes.error) {
      Swal.fire({ icon: "error", title: "Withdrawal Failed", text: withdrawRes.error.errors[0].detail });
      return;
    }

    Swal.fire({
  icon: "success",
  title: "Withdrawal Successful",
  text: `You have successfully withdrawn P${amount} to Orange Money.`,
}).then(() => {
  window.location.reload(); // Reload the whole page after user clicks "OK"
});

    return;
  }

  // --- Step 3: Register new Orange Money entity after OTP ---
  // Define OTP Modal HTML
  const otpModalHTML = `
    <div class="single-form-block is-forgot">
      <div sm-data="script" id="w-node-dfc94cfb-8d8b-5e28-9e2b-b7b829e09584-73a96268" class="hide w-embed"></div>
      <div class="login-form-content-wrapper is-forgot">
        <div>
          <div class="code-embed w-embed">
            <!-- SVG Content Here -->
          </div>
          <div class="modal-heading">PASSWORD VERIFICATION</div>
        </div>
  
        <div class="form-content-main is-forgot w-form">
          <form id="wf-form-otp_form" name="wf-form-otp_form" data-name="otp_form" method="get" class="form-slide">
            <div class="form-slide">
              <div class="form-slide">
                <div id="modal-message" style="display: none; margin-bottom: 20px; padding: 10px 15px; border-radius: 8px; font-size: 14px;">
                  <span id="modal-message-text"></span>
                </div>
  
                <div class="is-position-relative">
                  <input class="form-input-text-field is-login-icon w-input" 
                    autofocus="true" 
                    maxlength="256" 
                    name="otp" 
                    data-name="otp" 
                    placeholder="Enter your one time password here" 
                    type="number" 
                    id="otp-input" 
                    required="">
                  <div class="form-field-icon is-orange w-embed">
                    <!-- SVG Icon Here -->
                  </div>
                </div>
  
                <div class="login-form-forgot-link-flex-wrapper is-centred">
                  <a href="#" class="text-link-small">Didn't receive password?</a>
                </div>
              </div>
  
              <div class="form-two-button-grid-wrapper">
                <a sm-data="closer" href="#" class="form-button w-button">Cancel</a>
                <button 
                  id="verify-otp"
                  class="buttons is-medium gradient-yellow w-button">
                  Verify
                </button>
              </div>
            </div>
          </form>
  
          <div class="w-form-done">
            <div>Thank you! Your submission has been received!</div>
          </div>
          <div class="form-error-message w-form-fail">
            <div>Please enter valid credentials!</div>
          </div>
        </div>
  
        <div sm-data="closer" id="w-node-dfc94cfb-8d8b-5e28-9e2b-b7b829e095a7-73a96268" class="close-button-form">
          <div class="x-line is-left"></div>
          <div class="x-line"></div>
        </div>
      </div>
    </div>
  
    <div sm-data="script">
      <script>
        const messageContainer = document.getElementById('modal-message');
        const messageText = document.getElementById('modal-message-text');
        
        function showModalMessage(message, type) {
          messageContainer.style.display = 'block';
          messageText.textContent = message;
          
          if (type === 'error') {
            messageContainer.style.backgroundColor = '#FF464F20';
            messageContainer.style.color = '#FF464F';
            messageContainer.style.border = '1px solid #FF464F';
          } else if (type === 'success') {
            messageContainer.style.backgroundColor = '#4CAF5020';
            messageContainer.style.color = '#4CAF50';
            messageContainer.style.border = '1px solid #4CAF50';
          }
  
          setTimeout(() => {
            const modalElement = document.querySelector('sunbet-modal');
            if (modalElement) {
              sunbetModalsClose(modalElement, false, type === 'success');
            }
          }, 2000);
        }
  
        function hideModalMessage() {
          messageContainer.style.display = 'none';
        }
  
        document.getElementById('verify-otp').addEventListener('click', function(e) {
          e.preventDefault();
          const otpValue = document.getElementById('otp-input').value;
          
          if (!otpValue) {
            showModalMessage('Please enter the verification code', 'error');
            return;
          }
          
          hideModalMessage();
          
          window.dispatchEvent(new CustomEvent('otp-submitted', { 
            detail: { 
              otp: otpValue,
              messageHandlers: {
                showSuccess: (msg) => showModalMessage(msg || 'Verification successful!', 'success'),
                showError: (msg) => showModalMessage(msg || 'Invalid verification code', 'error')
              }
            } 
          }));
        });
      </script>
    </div>
  `;

  const modalKey = "otp-verification-modal";
  sessionStorage.setItem("__sunbet_modal_assests__" + modalKey, otpModalHTML);

  simlBC.requestSessionPin(300, "mobile", function (err) {
    if (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to Send OTP",
        text: err.errors[0]?.detail || "OTP failed.",
      });
      return;
    }

    sunbetModalsRender(modalKey);

    const otpHandler = function (event) {
      const otp = event.detail.otp;
      const messageHandlers = event.detail.messageHandlers;

      simlBC.verifySessionPin(300, otp, async function (verifyErr, verifyData) {
        if (verifyErr || !verifyData.valid) {
          messageHandlers?.showError("Invalid OTP. Please try again.");
          return;
        }
        console.log("OTP Verified Successfully");
        // --- Step 4: Register Orange entity ---
        const payload = {
          accountHolder: accountHolderName,
          details: {
            bankName: "Orange",
            accountNumber: phone,
            branchCode: "00000",
          },
        };
        console.log("Payload for Registering Orange Entity:", payload);
        const registerRes = await new Promise((resolve) =>
          simlBC.registerWithdrawalEntity(payload, (err, data) =>
            resolve({ error: err, data })
          )
        );
        console.log("Register Entity Response:", registerRes);

        if (registerRes.error) {
          messageHandlers?.showError(
            registerRes.error.errors[0]?.detail || "Failed to register Orange Money"
          );
          return;
        }

        if (registerRes.data?.paymentEntityStatus === "Verified") {
          const withdrawalData = {
            amount,
            currency_code: "BWP",
            payment_entity_id: registerRes.data.id,
          };

          const withdrawAfterReg = await new Promise((resolve) =>
            simlBC.requestWithdrawal(withdrawalData, (err, data) =>
              resolve({ error: err, data })
            )
          );
          console.log("Withdrawal After Registration Response:", withdrawAfterReg);
          if (withdrawAfterReg.error) {
            messageHandlers?.showError(
              withdrawAfterReg.error.errors[0]?.detail || "Withdrawal failed"
            );
            return;
          }

          Swal.fire({
            icon: "success",
            title: "Withdrawal Successful",
            text: `You have successfully withdrawn P${amount} to Orange Money.`,
          }).then(() => {
  window.location.reload(); // Reload the whole page after user clicks "OK"
});
        }

        window.removeEventListener("otp-submitted", otpHandler);
      });
    };

    window.addEventListener("otp-submitted", otpHandler);
  });
}

// ----------------------------------------------
// 3. Attach Logic to DOM Events
// ----------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  populateOrangeMobileNumber();

  const orangeBtn = document.querySelector("#orangeWithdrawButton");
  if (orangeBtn) {
    orangeBtn.addEventListener("click", function (e) {
      e.preventDefault();
      orangeMoneyLogic();
    });
  }
});
//////////////////////////////////////////////////////////ORANGE MONEY LOGIC ENDS/////////////////////////////////////////////////////////