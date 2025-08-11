document.addEventListener("DOMContentLoaded", () => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return `${date.getDate()}-${
      date.getMonth() + 1
    }-${date.getFullYear()} | ${String(date.getHours()).padStart(
      2,
      "0"
    )}:${String(date.getMinutes()).padStart(2, "0")}:${String(
      date.getSeconds()
    ).padStart(2, "0")}`;
  };

  let allTransactions = [];

  const params = {
    from: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString(),
    to: new Date().toISOString(),
    take: 50,
    skip: 0,
  };

  simlBC.listWithdrawals(params, (err, data) => {
    if (err) {
      console.error("Error fetching transactions:", err);
      return;
    }

    const pendingContainer = document.getElementById(
      "pending-withdrawals"
    );
    const historyContainer = document.getElementById(
      "authorized-withdrawals"
    );

    if (!pendingContainer || !historyContainer) {
      console.error("Container elements not found");
      return;
    }

    pendingContainer.innerHTML = "";
    historyContainer.innerHTML = "";

    if (!data || !data.items || data.items.length === 0) {
      pendingContainer.innerHTML = "<p>No pending withdrawals found.</p>";
      historyContainer.innerHTML = "<p>No withdrawal history found.</p>";
      return;
    }

    allTransactions = data.items;

    data.items.forEach((item, index) => {
      const formattedDate = formatDate(item.initiatedAt);
      const amount = `P${parseFloat(item.amount).toFixed(2)}`;
      const accountNumber = item.accountNumber;

      if (item.status === "Pending") {
        const rowHtml = `
          <div class="withdrawal-info-row-grid">
            <div class="withdrawal-mobile-flex">
              <div class="text-caps-grey is-left-text is-large is-hidden-desktop">Account</div>
              <div>${accountNumber}</div>
            </div>
            <div class="withdrawal-mobile-flex">
              <div class="text-caps-grey is-left-text is-large is-hidden-desktop">Amount</div>
              <div>${amount}</div>
            </div>
            <div class="withdrawal-mobile-flex">
              <div class="text-caps-grey is-left-text is-large is-hidden-desktop">Date</div>
              <div>${formattedDate}</div>
            </div>
            <a href="#" class="buttons is-small gradient-yellow w-button" data-id="${item.id}" data-index="${index}">REVERSE</a>
          </div>`;
        pendingContainer.innerHTML += rowHtml;
      }

      if (item.status === "Authorized") {
        const rowHtml = `
          <div class="withdrawal-info-row-grid">
            <div class="withdrawal-mobile-flex">
              <div class="text-caps-grey is-left-text is-large is-hidden-desktop">Account</div>
              <div>${accountNumber}</div>
            </div>
            <div class="withdrawal-mobile-flex">
              <div class="text-caps-grey is-left-text is-large is-hidden-desktop">Amount</div>
              <div>${amount}</div>
            </div>
            <div class="withdrawal-mobile-flex">
              <div class="text-caps-grey is-left-text is-large is-hidden-desktop">Date</div>
              <div>${formattedDate}</div>
            </div>
          </div>`;
        historyContainer.innerHTML += rowHtml;
      }
    });
  });

  const reverseWithdrawal = (transactionID) => {
    Swal.fire({
      title: "Processing...",
      text: "Please wait while we reverse your withdrawal.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    simlBC.cancelPendingWithdrawal(transactionID, (err, data) => {
      Swal.close();

      if (err) {
        console.error("Error reversing withdrawal:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to reverse the withdrawal. Please try again later.",
        });
        return;
      }

      if (data.has_updated) {
        Swal.fire({
          icon: "success",
          title: "Withdrawal Reversed",
          html: `<div>You have successfully reversed the transaction.</div>`,
          confirmButtonText: "OK",
          customClass: {
            popup: "swal2-popup swal2-modal swal2-icon-success swal2-show",
            title: "swal2-title",
            htmlContainer: "swal2-html-container",
            confirmButton: "swal2-confirm swal2-styled",
          },
          buttonsStyling: false,
        }).then(() => {
          window.location.reload();
        });
      }
    });
  };

  document.addEventListener("click", (e) => {
    if (e.target.matches("[data-id]")) {
      e.preventDefault();

      const transactionIndex = parseInt(e.target.getAttribute("data-index"));

      if (isNaN(transactionIndex) || !allTransactions[transactionIndex]) {
        console.error("Transaction not found in stored data");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Transaction data not found. Cannot reverse withdrawal.",
        });
        return;
      }

      const transaction = allTransactions[transactionIndex];
      console.log("Attempting to cancel transaction:", transaction);

      reverseWithdrawal(transaction.id);
    }
  });
});
