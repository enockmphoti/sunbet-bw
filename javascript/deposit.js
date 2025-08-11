(async () => {

  const scriptsToBeLoaded = [
    "https://cdn.jsdelivr.net/npm/sweetalert2@11",
    //"https://js.walletdoc.com/v1/walletdoc.js",
    // "http://localhost:1234/index.4e23d365.js",
    "https://cdn.jsdelivr.net/npm/@bmg.studio/form@1.4.12/sf.js",
  ];

  // Delete previous SF instance if existant
  if (window.StudioForm && !Array.isArray(StudioForm)) {
    // Remove sf redundant load
    scriptsToBeLoaded.pop();

    // Delete prexisting form instance & reinitiate
    if (StudioForm.deposit_form) {
      delete StudioForm.deposit_form;
    }
  }

  // Load helper scripts
  await Promise.all(
    scriptsToBeLoaded.map(
      (src) =>
        new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = src;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        })
    )
  );
  await new Promise((resolve) => setTimeout(resolve, 10));
  StudioForm.init();

  // Values
  const sf = StudioForm.deposit_form;


  // * Render & deposit logic *

  // Balance
  function updateBalance() {
    simlBC.getBalances((err, data) => {
      if (!data) return;

      const cash = data[0].digitalPlayableCash;
      localStorage.setItem("sunbetPreviousCashBalance", cash);
      document.querySelector('[sunbet-deposit="balance"]').innerHTML = cash;
      document.querySelector('[sunbet="balance"]').innerHTML = cash;
    });
  }
  updateBalance();
  const intervalId = setInterval(function () {
    if (!document.querySelector('[sunbet-deposit="balance"]')) {
      clearInterval(intervalId);
      return;
    }

    updateBalance();
  }, 5000);

  // Amount radios
  document.querySelectorAll('[name="amount"]').forEach((radio) => {
    radio.onclick = () => {
      radio
        .closest("[sf-name]")
        .querySelector('[name="deposit_amount"]').value = radio.value;
    };
  });


    // iFrame mount
  //   "sf-transition",
  // ].forEach((evtStr) =>
  //   sf.elements.mask.addEventListener(evtStr, (e) => {
  //     if (e.detail.direction != "prev") return;

  //     const mount = document.getElementById("iframe_mount");

  //     mount.innerHTML = "";
  //     gsap.set(mount, { minHeight: "" });
  //   })
  // );
  // function iframeMountPrevStepNameTagWrite() {
  //   const iframeMountPrevStepNameTag = document.querySelector(
  //     '[sunbet-deposit="iframe-prev-step-name"]'
  //   );

  //   iframeMountPrevStepNameTag.innerHTML =
  //     sf.logic[sf.record[sf.record.length - 1]].name;
  // }

  // Player ID
  document.querySelectorAll('[sunbet-deposit="player-id-2"]').forEach(async (el) => {
      await new Promise((resolve) => {
        simlBC.getProfile((err, data) => {
          resolve(data);
          el.innerHTML = data.player.id;
          el.parentElement.onclick = () => navigator.clipboard.writeText(data.player.id);
        });
      });
  });

  // Event listener
  sf.elements.mask.addEventListener("sf-promise", async (e) => {
    // Show loader
    //loader.style.display = "";

    // Values
    const formData = sf.data();
    const stepData = sf.data(e.detail.current);
    const currentSlide = sf.logic[e.detail.current];
    const paymentMethod =
      formData[formData.payment_option + "_option"] || formData.payment_option;

    // Await
    let response = null;


    // OTT

    if (paymentMethod == "voucher") {
      response = await new Promise((resolve) =>
        simlBC.ottCreate(stepData.voucher_code, (err, data) =>
          resolve({ error: err.error, data: data })
        )
      );

              // Error popup
    if (response?.error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: response.error.message || response.error.errors[0]?.detail,
      });
    }

      console.log("Data 9: ", response);

      const { data } = response;
      if (data) {
        // Values
        const { reference } = data.success.message;

        // 2nd API
        response = await new Promise((resolve) =>
          simlBC.ottCheck(reference, (err, data) =>
            resolve({ error: err, data: data })
          )
        );

        console.log("Data 2: ", response);

        const { data } = response;
        if (data)
          Swal.fire({
            icon: "success",
            title: "Successfully redeemed OTT voucher!",
          });

        // updateBalance();
      }
    }

    // ORANGE MONEY
    if (paymentMethod == "orange") {
      response = await new Promise((resolve) =>
        simlBC.orangeDeposit(stepData.deposit_amount, stepData.mobile_number, (err, data) =>
          resolve({ error: err, data: data })
        )


      );

     const { data } = response;
      if (data) {

        console.log("Success Orange: ", data);
        await checkOrangePayments(data.success.message.reference);
        sf.resolve = true;

      }


    }

function checkOrangePayments(reference, timeout = 60000) { // e.g., max 1 min
  return new Promise((resolve, reject) => {
    const intervalId = setInterval(() => {
      simlBC.orangeCheck(reference, (err, data) => {
        if (err) {
          clearInterval(intervalId);
          clearTimeout(timeoutId);
          resolve({ error: err });
        } else {
          console.log('Polling result:', data);
          if (data && data.status === "SUCCESS") {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
            resolve({ data: data });
          }
        }
      });
    }, 5000);

    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      resolve({ error: "Polling timed out" });
    }, timeout);
  });
}
    
    // MYZAKA
    if (paymentMethod == "myzaka") {
      response = await new Promise((resolve) =>
        simlBC.myZakaDeposit(stepData.deposit_amount, (err, data) =>
          resolve({ error: err, data: data })
        )


      );

     const { data } = response;
      if (data) {

        console.log("Success MyZaka: ", data);
        sf.resolve = true;

      }


    }
    //deposit history
        if (paymentMethod == "zakahistory") {
        window.location.href = "https://www.sunbet.co.za/zakahistory";
        return;
    }

    // Other vouchers
    if (["bluvoucher", "onevoucher"].includes(paymentMethod)) {
      response = await new Promise((resolve) =>
        simlBC.getPaymentKey(0, (err, data) =>
          resolve({ error: err, data: data })
        )
      );

      const { data } = response;
      if (data?.key) {
        // Animate
        gsap.to(component, { x: "100%", duration: 0.2 });

        // Promise
        const voucherPromise = new Promise((resolve) => {
          eftSec.checkout.settings.serviceUrl =
            "{protocol}://eftsecure.callpay.com/rpp-transaction/create-from-key";
          eftSec.checkout.settings.checkoutRedirect = true;
          eftSec.checkout.settings.onLoad = resolve;

          var obj = {
            paymentKey: data.key,
            paymentType: paymentMethod,
          };

          eftSec.checkout.init(obj);
        });
        await voucherPromise;
      }
    }

    // Error popup
    if (response?.error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: response.error.message || response.error.errors[0]?.detail,
      });
    }

    // Hide loader
    //loader.style.display = "none";
    if (sf.isAwaiting) sf.resolve = false;

    // Log
    // console.log(
    //   paymentMethod,
    //   'This is the data we have: ',
    //   stepData,
    //   formData
    // );
  });

  // Promo popup
  document
    .querySelector('[sunbet-deposit="promo-modal-trigger"]')
    .addEventListener("click", () => {
      Swal.fire({
        icon: "question",
        iconHtml:
          '<img src="https://cdn.prod.website-files.com/66956eb2aafafe3229e15ef3/66f06e639fcc1c59489d26cd_TAG%20SVG%202.svg">',
        title: "Enter Promo Code",
        input: "text",
        inputAttributes: {
          // pattern: '[A-Z-]*',
          required: true,
        },
        confirmButtonText: "Submit",
        showLoaderOnConfirm: true,
        preConfirm: promoPreConfirm,
        allowOutsideClick: () => !Swal.isLoading(),
      }).then(promoAfterConfirm);
    });



  async function promoPreConfirm(data) {
    // Values
    const promoCode = data;
    const substring = "SIGNUPPageBonus17";
    const substring2 = "MVGClaimBurn16";
    const substring3 = "DEP-";
    let response = {};

    const depositType1 = promoCode.includes(substring);
    const depositType2 = promoCode.includes(substring2);
    const depositType3 = promoCode.includes(substring3);

    // Guard
    if (!/^[A-Za-z][A-Za-z0-9-]*$/.test(promoCode))
      return {
        error: {
          message:
            "Promo code must start with a letter and can include letters, numbers, and hyphens.",
        },
      };

    // Switch cases
    if (!depositType1 && !depositType2 && !depositType3) {
      response = await new Promise((resolve) =>
        simlBC.activatePromo(promoCode, (err, data) => {
          resolve({
            error: err,
            data: data,
          });
        })
      );
    }

    if (depositType1 || depositType2) {
      response.error = { message: "Invalid promo code type!" };
    }

    if (depositType3) {
      response = await new Promise((resolve) =>
        simlBC.getSegment((err, data) => resolve({ error: err, data: data }))
      );

      // If getSegment call failed
      if (response.error) {
        response.error = { message: "Failed to fetch promo segments!" };
      } else if (response.data && response.data.length > 0) {
        // If getSegment call succeeded and data is not empty
        const segment = response.data.find(seg => promoCode === seg.name);
        if (segment) {
          await new Promise((resolve) =>
            simlBC.activateDepositBonus(segment.id, function (err, data) {
              resolve();
            })
          );
        } else {
          response.error = { message: "Invalid promo code!" };
        }
      } else {
        // getSegment call succeeded but data is empty
        response.error = { message: "No valid promo codes found!" };
      }
    }

    // Return
    return response;
  }

  function promoAfterConfirm(data) {
    // Values & logic
    const { value } = data;
    if (value.error)
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: value.error.message || value.error.errors[0]?.detail,
      });

    if (!value.error)
      Swal.fire({
        icon: "success",
        text: "Successfully redeemed promotion code!",
        confirmButtonText: "Continue",
      });
  }

  // Take action
  // console.log('Do what a successful deposit sidebar needs to do: ', player);
})();

