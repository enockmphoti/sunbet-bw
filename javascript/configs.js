// Description: Configuration script for simlBC client based on environment
// This script sets up the configuration for the simlBC client based on the environment (staging or production).
  (function () {
    const isStaging = window.location.hostname.includes("webflow.io");

    const baseDomain = isStaging
      ? "https://weapistg.sunbet.co.za"
      : "https://weapiprd.sunbet.co.za";

    window.siml_bedeClientConfig = {
      session_path: `${baseDomain}/pub/int/SIMLBede`,
      ingress_session_path: `${baseDomain}/pub/int`,
      bede_player_path: isStaging
        ? `${baseDomain}/pub/ext/bede-player`
        : "https://pr01-spine.sun.bedegaming.com/api/v5",
      bede_site_code: "sunbet.co.bw",
      kambi_url: isStaging
        ? "https://cts-static.kambi.com/client/sunbetbw/kambi-bootstrap.js"
        : "https://client-static.bc.kambicdn.com/client/sunbetbw/kambi-bootstrap.js",
      turfsport_server: isStaging
        ? "https://abcbookmaker.demo.tsretail.co.za/horse-racing"
        : "https://tshr.sunbet.co.bw",
      sunbet_rt_baseurl:isStaging
      ? "https://weapirtstg.sunbet.co.za/pub/int/sunbet-rt/bw"
      : "https://weapirtprd.sunbet.co.za/pub/int/sunbet-rt/bw",
      scoutgames_white_label:"sunbet",
      scoutgames_environment:"local",
      scoutgames_currency:"BWP",
      scoutgames_data_root_url:"https://fantasy-game.api.scoutgg-stg.net",
      scoutgames_asset_host:"https://fantasy-game.api.scoutgg-stg.net",
      scoutgames_server:"https://sunbet-static.api.scoutgg-stg.net/application.js",  
    };
  })();
  
  console.log(window.siml_bedeClientConfig);


  //creating the Environment variable
  function getEnvironment() {
    let envCode = "";

    const isStaging = window.location.hostname.includes("webflow.io");

    if (isStaging) {
      return envCode = "cts";
    }else{
      return envCode = "prod";
    }

  }