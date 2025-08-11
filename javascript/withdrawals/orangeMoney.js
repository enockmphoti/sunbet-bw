import { validateInputs, processWithdrawal } from './withdrawalUtils.js';

export async function handleOrangeMoneyWithdrawal() {

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
    await processWithdrawal(createEntityResponse.data.id, amount, phone, accountHolderName);
  
}