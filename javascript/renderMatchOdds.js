function formatDateTime(inputDate) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dateObj = new Date(inputDate);

    const day = dateObj.getUTCDate();
    const month = months[dateObj.getUTCMonth()];
    //const year = dateObj.getUTCFullYear();

    const hours = dateObj.getUTCHours();
    const minutes = dateObj.getUTCMinutes();

    const formattedDate = `${day} ${month}`;

    // Convert hours to 12-hour format
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');

    const formattedTime = `${formattedHours}:${formattedMinutes} ${period}`;

    return { date: formattedDate, time: formattedTime };
}


function convertToISO(dateString) {
    const parsedDate = new Date(dateString);

    if (isNaN(parsedDate.getTime())) {
        console.error("Invalid date format");
        return null;
    }

    const offset = parsedDate.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(parsedDate.getTime() - offset);

    // Convert the date to ISO format
    return adjustedDate.toISOString();
}
function renderMatchOdds() {



        var array = Array.from(document.querySelectorAll('.is-sports-banner.w-dyn-item'));


        array.forEach(function (item) {

            var eventId = item.getAttribute('event-id');
            console.log(eventId);
            var matchType = item.getAttribute('match-type');
            console.log(matchType);
            var activeDate = item.getAttribute('active-date');
            var expiryDate = item.getAttribute('expiry-date');
            var currentDate = new Date();
            var newDate = convertToISO(currentDate);
            if (matchType !== "soccer") {
            item.querySelectorAll('[draw-event]').forEach(function(drawEl) {
            drawEl.style.display = 'none';
            });

            item.querySelectorAll('.sports-banner-dynamic-content-structure-2').forEach(function(sportsBannerEl) {
            sportsBannerEl.style.paddingBottom = '3vw';
            });
            }

            if(newDate > convertToISO(expiryDate) || newDate < convertToISO(activeDate)) {
            item.style.display = 'none';
            return; 
            }

            if (eventId) {

                $.ajax({

                    url: 'https://eu-offering-api.kambicdn.com/offering/v2018/siwc/betoffer/event/' + eventId + '.json?lang=en_ZA&market=ZA&client_id=2&channel_id=1&ncid=1678793197196&includeParticipants=true',
                    type: 'GET',
                    dataType: 'json',
                    success: function (data) {

                        if (data) {

                            switch (matchType) {

                                case "soccer":
                                    var results = data.betOffers;


                                    if (data.events[0].state === "NOT_STARTED") {
                                        var state = "PRE-MATCH";
                                        $("#state" + eventId).text(state);
                                        $('div[match-status]').text(state);
                                    }

                                    if (data.events[0].state === "STARTED") {
                                        var state = "LIVE";
                                        $("#live-state" + eventId).text(state);
                                        $('div[match-status]').text(state);
                                    }



                                    for (var i = 0; i < results.length; i++) {

                                        if (results[i].criterion.label === "Full Time") {

                                            if (!results[i].suspended) {

                                                var line1 = (results[i].outcomes[0].odds / 1000).toFixed(2);
                                                var line2 = (results[i].outcomes[1].odds / 1000).toFixed(2);
                                                var line3 = (results[i].outcomes[2].odds / 1000).toFixed(2);
                                                var matchData = { "Team1": line1, "Draw": line2, "Team2": line3, };
                                                //w3.displayObject("id" + eventId, matchData);
                                                $('div[home-event="' + eventId + '"]').text(line1);
                                                $('div[away-event="' + eventId + '"]').text(line3);
                                                $('div[draw-event="' + eventId + '"]').text(line2);

                                            } else if (results[i].suspended === true) {
                                                var matchData = { "Team1": "- . --", "Draw": "- . --", "Team2": "- . --" };
                                                //w3.displayObject("id" + eventId, matchData);
                                                $('div[home-event="' + eventId + '"]').text("- . --");
                                                $('div[away-event="' + eventId + '"]').text("- . --");
                                                $('div[draw-event="' + eventId + '"]').text("- . --");
                                            }

                                        }

                                    }
                                    break;
                                case "match":
                                    var results = data.betOffers;
                                    console.log('Match',results);

                                    if (data.events[0].state === "NOT_STARTED") {
                                        var state = "PRE-MATCH";
                                        $("#state" + eventId).text(state);
                                        $('div[match-status]').text(state);
                                    }

                                    if (data.events[0].state === "STARTED") {
                                        var state = "LIVE";
                                        $("#live-state" + eventId).text(state);
                                        $('div[match-status]').text(state);
                                    }

                                    for (var i = 0; i < results.length; i++) {

                                        if ((results[i].criterion.label === "Regular Time") || (results[i].criterion.label === "Including Overtime")) {

                                            if (!results[i].suspended) {

                                                var odds1 = (results[i].outcomes[0].odds / 1000).toFixed(2);
                                                var odds2 = (results[i].outcomes[1].odds / 1000).toFixed(2);
                                                var rugbymatchData = { "odds1": odds1, "odds2": odds2 };
                                                //w3.displayObject("id" + eventId, rugbymatchData);
                                                $('div[home-event="' + eventId + '"]').text(odds1);
                                                $('div[away-event="' + eventId + '"]').text(odds2);
                                                //$('div[draw-event]').text(line3);

                                            } else if (results[i].suspended === true) {
                                                var rugbymatchData = { "odds1": "- . --", "odds2": "- . --" };
                                                //w3.displayObject("id" + eventId, rugbymatchData);
                                                $('div[home-event="' + eventId + '"]').text("- . --");
                                                $('div[away-event="' + eventId + '"]').text("- . --");
                                                //$('div[draw-event]').text("- . --");
                                            }

                                        }

                                    }
                                    break;
                                case "handicap":
                                    var results = data.betOffers;
                                    console.log('Handicap',results);
                                    if (data.events[0].state === "NOT_STARTED") {
                                        var state = "PRE-MATCH";
                                        $("#state" + eventId).text(state);
                                        $('div[match-status]').text(state);
                                    }

                                    if (data.events[0].state === "STARTED") {
                                        var state = "LIVE";
                                        $("#live-state" + eventId).text(state);
                                        $('div[match-status]').text(state);
                                    }

                                    for (var i = 0; i < results.length; i++) {

                                        if ((results[i].criterion.label === "Regular Time") || (results[i].criterion.label === "Handicap - Including Overtime")) {

                                            if (!results[i].suspended) {

                                                var odds1 = (results[i].outcomes[0].odds / 1000).toFixed(2);
                                                var line1 = (results[i].outcomes[0].line / 1000).toFixed(2);
                                                var odds2 = (results[i].outcomes[1].odds / 1000).toFixed(2);
                                                var line2 = (results[i].outcomes[1].line / 1000).toFixed(2);
                                                var handicapData = { "odds1": odds1, "line1": line1, "odds2": odds2, "line2": "+" + line2 };
                                                //w3.displayObject("id" + eventId, handicapData);
                                                console.log('Handicap data',handicapData);

                                                $('div[home-event="' + eventId + '"]').text(line1);
                                                //$('div[away-event]').text(line3);
                                                $('div[draw-event="' + eventId + '"]').text(line2); 

                                            } else if (results[i].suspended === true) {
                                                var handicapData = { "odds1": "- . --", "line1": "- . --", "odds2": "- . --", "line2": "- . --" };
                                                //w3.displayObject("id" + eventId, handicapData);
                                                $('div[home-event]').text("- . --");
                                                $('div[away-event]').text("- . --");
                                                }
                                        }

                                    }
                                    break;
                                case "cricket":
                                    var results = data.betOffers;
                                    console.log('Cricket',results);
                                    if (data.events[0].state === "NOT_STARTED") {
                                        var state = "PRE-MATCH";
                                        $("#state" + eventId).text(state);
                                        $('div[match-status]').text(state);
                                    }

                                    if (data.events[0].state === "STARTED") {
                                        var state = "LIVE";
                                        $("#live-state" + eventId).text(state);
                                        $('div[match-status]').text(state);
                                    }

                                    for (var i = 0; i < results.length; i++) {

                                        if (results[i].criterion.label === "Season Finishing Position") {

                                            if (!results[i].suspended) {

                                                if (results[i].outcomes[1].label === "X") {

                                                    if (results[i].outcomes[0].status === "OPEN") {
                                                        var odds1 = (results[i].outcomes[0].odds / 1000).toFixed(2);
                                                        
                                                    } else if (results[i].outcomes[0].status === "SUSPENDED") {
                                                        var odds1 = "- . --"
                                                    }

                                                    var draw = (results[i].outcomes[1].line / 1000).toFixed(2);
                                                    var odds2 = (results[i].outcomes[2].odds / 1000).toFixed(2);

                                                    var cricketMatchData = { "odds1": odds1, "draw": draw, "odds2": odds2 };
                                                    console.log('Cricket Data:',cricketMatchData);
                                                    $('div[home-event="' + eventId + '"]').text(odds1);
                                                    console.log('Draw:',draw);
                                                    $('div[draw-event="' + eventId + '"]').text(draw);
                                                    console.log('Away Odds:',odds2);
                                                    $('div[away-event="' + eventId + '"]').text(odds2);
                                                    console.log('hOme Odds:',odds1);
                                                    //w3.displayObject("id" + eventId, cricketMatchData);

                                                }
                                                else if (results[i].outcomes[1].label === "2") {

                                                    if (results[i].outcomes[0].status === "OPEN") {
                                                        var odds1 = (results[i].outcomes[0].odds / 1000).toFixed(2);
                                                    } else if (results[i].outcomes[0].status === "SUSPENDED") {
                                                        var odds1 = "- . --"
                                                    }

                                                    var odds2 = (results[i].outcomes[1].odds / 1000).toFixed(2);

                                                    var cricketMatchData = { "odds1": odds1, "odds2": odds2 };
                                                    //w3.displayObject("id" + eventId, cricketMatchData);
                                                    $('div[home-event="' + eventId + '"]').text(odds1);
                                                    $('div[away-event="' + eventId + '"]').text(odds2);

                                                }


                                            } else if (results[i].suspended === true) {
                                                var cricketMatchData = { "odds1": "- . --", "odds2": "- . --" };
                                                //w3.displayObject("id" + eventId, cricketMatchData);
                                                $('div[home-event="' + eventId + '"]').text("- . --");
                                                $('div[away-event="' + eventId + '"]').text("- . --");
                                            }
                                        }

                                    }
                                    break;
                                case "tennis":
                                    var results = data.betOffers;
                                    if (data.events[0].state === "NOT_STARTED") {
                                        var state = "PRE-MATCH";
                                        $("#state" + eventId).text(state);
                                        $('div[match-status]').text(state);
                                    }
                                    if (data.events[0].state === "STARTED") {
                                        var state = "LIVE";
                                        $("#live-state" + eventId).text(state);
                                        $('div[match-status]').text(state);
                                    }

                                    for (var i = 0; i < results.length; i++) {

                                        if (results[i].criterion.label === "Match Odds") {

                                            if (!results[i].suspended) {



                                                if (results[i].outcomes[0].status === "OPEN") {
                                                    var odds1 = (results[i].outcomes[0].odds / 1000).toFixed(2);
                                                } else if (results[i].outcomes[0].status === "SUSPENDED") {
                                                    var odds1 = "- . --"
                                                }
                                                var odds2 = (results[i].outcomes[1].odds / 1000).toFixed(2);

                                                var tennisMatchData = { "odds1": odds1, "odds2": odds2 };
                                                //w3.displayObject("id" + eventId, tennisMatchData);
                                                $('div[home-event="' + eventId + '"]').text(odds1);
                                                $('div[away-event="' + eventId + '"]').text(odds2);


                                            } else if (results[i].suspended === true) {
                                                var tennisMatchData = { "odds1": "- . --", "odds2": "- . --" };
                                                //w3.displayObject("id" + eventId, tennisMatchData);
                                                $('div[home-event="' + eventId + '"]').text("- . --");
                                                $('div[away-event="' + eventId + '"]').text("- . --");
                                            }
                                        }

                                    }
                                    break;
                                case "formula1":
                                    var results = data.betOffers;
                                    if (data.events[0].state === "NOT_STARTED") {
                                        var state = "PRE-MATCH";
                                        $("#state" + eventId).text(state);
                                        $('div[match-status]').text(state);
                                    }
                                    if (data.events[0].state === "STARTED") {
                                        var state = "LIVE";
                                        $("#live-state" + eventId).text(state);
                                        $('div[match-status]').text(state);
                                    }

                                    for (var i = 0; i < results.length; i++) {


                                        if ((results[i].betOfferType.name === "Winner") && (results[i].criterion.label === "Winner")) {

                                            const sortedListByOdds = sortListByProperty(results[i].outcomes, 'odds');

                                            if (!results[i].suspended) {

                                                if (sortedListByOdds[0].status === "OPEN") {
                                                    var winner0 = sortedListByOdds[0].label;
                                                    var odds0 = (sortedListByOdds[0].odds / 1000).toFixed(2);
                                                    $('div[home-event="' + eventId + '"]').text(odds0);
                                                } else if (sortedListByOdds[0].status === "SUSPENDED") {
                                                    var winner0 = sortedListByOdds[0].label;
                                                    var odds0 = "- . --"
                                                    $('div[home-event="' + eventId + '"]').text('- . --');
                                                }

                                                if (sortedListByOdds[1].status === "OPEN") {
                                                    var winner1 = sortedListByOdds[1].label;
                                                    var odds1 = (sortedListByOdds[1].odds / 1000).toFixed(2);
                                                    $('div[away-event="' + eventId + '"]').text(odds1);
                                                } else if (sortedListByOdds[1].status === "SUSPENDED") {
                                                    var winner1 = sortedListByOdds[1].label;
                                                    var odds1 = "- . --"
                                                    $('div[away-event="' + eventId + '"]').text('- . --');
                                                }

                                                if (sortedListByOdds[2].status === "OPEN") {
                                                    var winner2 = sortedListByOdds[2].label;
                                                    var odds2 = (sortedListByOdds[2].odds / 1000).toFixed(2);
                                                } else if (sortedListByOdds[2].status === "SUSPENDED") {
                                                    var winner2 = sortedListByOdds[2].label;
                                                    var odds2 = "- . --"
                                                    $('div[draw-event="' + eventId + '"]').text('- . --');
                                                }

                                                var tformula1Data = { "winner0": winner0, "odds0": odds0, "winner1": winner1, "odds1": odds1, "winner2": winner2, "odds2": odds2 };
                                                //w3.displayObject("id" + eventId, tformula1Data);
                                                console.log(tformula1Data);


                                            } else if (results[i].suspended === true) {
                                                var tformula1Data = { "winner0": winner0, "odds0": "- . --", "winner1": winner1, "odds1": "- . --", "winner2": winner2, "odds2": "- . --" };
                                                //w3.displayObject("id" + eventId, tformula1Data);
                                                $('div[home-event="' + eventId + '"]').text("- . --");
                                                $('div[away-event="' + eventId + '"]').text("- . --");
                                                $('div[draw-event="' + eventId + '"]').text("- . --");
                                            }
                                        }

                                    }
                                    break;
                                case "ufc":
                                    var results = data.betOffers;
                                    if (data.events[0].state === "NOT_STARTED") {
                                        var state = "PRE-MATCH";
                                        $("#state" + eventId).text(state);
                                        $('div[match-status]').text(state);
                                    }
                                    if (data.events[0].state === "STARTED") {
                                        var state = "LIVE";
                                        $("#live-state" + eventId).text(state);
                                        $('div[match-status]').text(state);
                                    }

                                    for (var i = 0; i < results.length; i++) {

                                        if (results[i].criterion.label === "Bout Odds") {

                                            if (!results[i].suspended) {

                                                if (results[i].outcomes[0].status === "OPEN") {
                                                    var odds1 = (results[i].outcomes[0].odds / 1000).toFixed(2);
                                                    $('div[home-event="' + eventId + '"]').text(odds1);
                                                    console.log('Odds1:',odds1);
                                                } else if (results[i].outcomes[0].status === "SUSPENDED") {
                                                    var odds1 = "- . --"
                                                    $('div[home-event="' + eventId + '"]').text('- . --');
                                                }
                                                var odds2 = (results[i].outcomes[1].odds / 1000).toFixed(2);
                                                $('div[away-event="' + eventId + '"]').text(odds2);
                                                console.log('Odds2:',odds1);

                                                var ufcMatchData = { "odds1": odds1, "odds2": odds2 };
                                                //w3.displayObject("id" + eventId, ufcMatchData);
                                                console.log(ufcMatchData);


                                            } else if (results[i].suspended === true) {
                                                var ufcMatchData = { "odds1": "- . --", "odds2": "- . --" };
                                                //w3.displayObject("id" + eventId, ufcMatchData);
                                                $('div[home-event="' + eventId + '"]').text("- . --");
                                                $('div[away-event="' + eventId + '"]').text("- . --");
                                            }
                                        }

                                    }
                                    break;
                            }

                        }

                    },

                    error: function () {


                        $('#id' + eventId).attr("style", "display:none;");

                    }
                });
            }

        });
    }


document.addEventListener('DOMContentLoaded', function() {
    renderMatchOdds();

    document.addEventListener('click', function(e) {
        var div = e.target.closest('div.swiper-slide.is-sports-banner.w-dyn-item');
        if (div && div.classList.contains('swiper-slide-active')) {
            var link = div.getAttribute('link');
            // console.log('Div clicked, redirecting to:', link);
            if (link) {
                e.preventDefault();
                window.location.href = link;
            }
        }
    });
});