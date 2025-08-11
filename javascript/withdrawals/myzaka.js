import { validateInputs, processWithdrawal } from './withdrawalUtils.js';

export async function handleMyZakaWithdrawal() {
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

  await processWithdrawal(myZakaEntity.id, amount, phone, "Account Holder");
}