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
        
        $.get( "/stream", function( data ) {
            if(data && data != ""){
                $( "#viewerCountTxt" ).html( data.viewers );
                $( "#averageFpsTxt" ).html( data.average_fps );
                $( "#delayTxt" ).html( data.delay );
                $( "#streamStartTxt" ).html( data.created_at );
                
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
                    $("#followerTable tbody").append('<tr><td class="v-align-middle semi-bold">'+follows[i].user.display_name+'</td><td class="v-align-middle">'+follows[i].created_at+'</td></tr>');
                }
            }
        });
    })