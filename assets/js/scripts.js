 $(document).ready(function() {
        // Initializes search overlay plugin.
        // Replace onSearchSubmit() and onKeyEnter() with 
        // your logic to perform a search and display results
        $('[data-pages="search"]').search({
            searchField: '#overlay-search',
            closeButton: '.overlay-close',
            suggestions: '#overlay-suggestions',
            brand: '.brand',
            onSearchSubmit: function(searchString) {
                console.log("Search for: " + searchString);
            },
            onKeyEnter: function(searchString) {
                console.log("Live search for: " + searchString);
                var searchField = $('#overlay-search');
                var searchResults = $('.search-results');
                clearTimeout($.data(this, 'timer'));
                searchResults.fadeOut("fast");
                var wait = setTimeout(function() {
                    searchResults.find('.result-name').each(function() {
                        if (searchField.val().length != 0) {
                            $(this).html(searchField.val());
                            searchResults.fadeIn("fast");
                        }
                    });
                }, 500);
                $(this).data('timer', wait);
            }
        });

        $.get( "/channel", function( data ) {
            if(data && data != ""){
                $( "#gameTxt" ).html( data.game );
                $( "#followerCountTxt" ).html( data.followers );
                $( "#statusTxt" ).html( data.status );
            }else
            {
                //$('#offlineModal').modal('show');            
            }
        });
        var streamStartDate = new Date();
        $.get( "/stream", function( data ) {
            if(data && data != ""){
                $( "#viewerCountTxt" ).html( data.viewers );
                $( "#averageFpsTxt" ).html( data.average_fps );
                $( "#delayTxt" ).html( data.delay );
                streamStartDate = new Date(data.created_at);
                $( "#streamStartTxt" ).html( streamStartDate.toDateString() + " " +streamStartDate.getHours() + ":"+ streamStartDate.getMinutes() );
                
                setInterval(function () {
                    $("#streamDurationTxt").html(msToTime(new Date() - streamStartDate) );
                }, 1000);
            }
        });

        $.get( "/viewer", function( data ) {
            if(data && data != ""){
                for(var i =0; i< data.chatters.viewers.length ;i++)
                {
                    $("#viewerTable tbody").append('<tr><td class="v-align-middle semi-bold">'+data.chatters.viewers[i]+'</td></tr>');
                }
            }
        });

        $.get( "/follower", function( data ) {
            if(data && data != ""){
                var follows = data.follows;
                for(var i =0; i< follows.length ;i++)
                {
                    var createdDate = new Date(follows[i].created_at);
                    $("#followerTable tbody").append('<tr><td class="v-align-middle semi-bold">'+follows[i].user.display_name+'</td><td class="v-align-middle">'+createdDate.toDateString()+'</td></tr>');
                }
            }
        });

        $.get( "/subscriber", function( data ) {
            if(data && data != ""){
                $( "#subCountTxt" ).html( data._total );
            }
        });
    })

    function msToTime(duration) {
        var milliseconds = parseInt((duration%1000)/100)
            , seconds = parseInt((duration/1000)%60)
            , minutes = parseInt((duration/(1000*60))%60)
            , hours = parseInt((duration/(1000*60*60))%24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return hours + ":" + minutes + ":" + seconds ;
    }