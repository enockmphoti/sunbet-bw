(function () {
  const configEl = document.getElementById('global_config_attributes');
  const targetEl = document.getElementById('BitvilleFrame');

  if (!configEl || !targetEl) {
    console.warn("❌ Missing #global_config_attributes or #BitvilleFrame");
    return;
  }

  const bitville_player_url = configEl.getAttribute('data-bitville_player_url');
  const bitville_brand_id = configEl.getAttribute('data-bitville_brand_id');
  const gameCredentials = window.simlBC?.getGameCredentials();

  if (gameCredentials?.gameToken && gameCredentials?.playerId) {
    const lch = new ProductComponentHandler();
    lch.setParam("url", `${bitville_player_url}?brandId=${bitville_brand_id}&token=${gameCredentials.gameToken}&playerId=${gameCredentials.playerId}&currencyCode=BWP&languageCode=en`);
    lch.createComponent({
      name: "sunbet",
      element: "#BitvilleFrame"
    });
    console.log("✅ Bitville iframe loaded.");
  } else {
    console.warn("❌ Not logged in — triggering login popup.");

    // Try common login triggers used at Sunbet
    if (typeof window.simlBC?.showLogin === "function") {
      window.simlBC.showLogin();
    } else {
      // fallback
      document.dispatchEvent(new CustomEvent('trigger-login'));
    }
  }
})();