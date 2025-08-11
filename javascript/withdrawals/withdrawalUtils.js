export function validateInputs(amount, phone, accountHolderName, minAmount, maxAmount) {
    if (!amount || amount < minAmount || amount > maxAmount) {
      Swal.fire({
        icon: "error",
        title: "Invalid Amount",
        text: `Please enter a valid amount (between ${minAmount} and ${maxAmount}).`,
      });
      return false;
    }
  
    if (!phone || phone.length < 8) {
      Swal.fire({
        icon: "error",
        title: "Invalid Mobile Number",
        text: "Please enter a valid mobile number.",
      });
      return false;
    }
  
    if (!accountHolderName) {
      Swal.fire({
        icon: "error",
        title: "Missing Account Holder Name",
        text: "Please enter the account holder's name.",
      });
      return false;
    }
  
    return true;
  }
  
  export async function processWithdrawal(entityId, amount, phone, accountHolderName) {
    const withdrawalData = {
      amount: amount,
      currency_code: "BWP",
      payment_entity_id: entityId,
      phone_number: phone,
      account_holder_name: accountHolderName,
    };
  
    console.log("Withdrawal Data:", withdrawalData);
  
    const withdrawalResponse = await new Promise((resolve) =>
      simlBC.requestWithdrawal(withdrawalData, (err, data) =>
        resolve({ error: err, data: data })
      )
    );
  
    if (withdrawalResponse.error) {
      Swal.fire({
        icon: "error",
        title: "Withdrawal Failed",
        text: withdrawalResponse.error.errors[0].detail,
      });
      return false;
    }
  
    Swal.fire({
      icon: "success",
      title: "Withdrawal Successful",
      text: `You have successfully withdrawn P${amount} to ${phone}.`,
    });
  
    return true;
  }