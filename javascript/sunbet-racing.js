document.addEventListener("DOMContentLoaded", function () {
  async function setLoggedInToken() {
    const iframeElem = document.getElementById("ts3-online");
    if (!iframeElem) {
      console.error("Cannot find Turfsport iframe");
      return;
    }

    const config = window.siml_bedeClientConfig;
    if (!config) {
      console.error("Configuration not found in window.siml_bedeClientConfig");
      return;
    }

    const { turfsport_server, sunbet_rt_baseurl } = config;

    if (!turfsport_server || !sunbet_rt_baseurl) {
      console.error("Turfsport URL or Base URL is not defined in the configuration");
      return;
    }

    console.log("Turfsport URL:", turfsport_server);
    console.log("Sunbet RT Base URL:", sunbet_rt_baseurl);

    // Call the turfsportLobby function
    simlBC.turfsportLobby(function (err, result) {
      if (err) {
        console.error("Error getting session token:", err);
        return;
      }

      console.log("Successful token:", result);
      console.log("Session token:", result.session);

      // Set the iframe source
      iframeElem.src = result.turfsport_url;
      console.log("Iframe source set to:", iframeElem.src);
    });
  }

  setLoggedInToken();
});