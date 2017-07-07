 $(document).ready(function() {
        
        refreshInfo();

        setInterval(function () 
        {
            refreshInfo();
        },15000)

        $("#editStreamLink").on("click",function(e){
            e.preventDefault();
            
            $("#game").empty();

            $.get( "/games", function( data ) {
                if(data && data != ""){
                    for(var i =0; i< data.top.length ;i++)
                    {
                        $("#game").append('<option>'+data.top[i].game.name+'</option>');
                    }
                }
            });
            
            $("#editStreamModal").modal('show');
        });

        $("#streamSubmitBtn").on("click",function(e){
            e.preventDefault();
            
            
            var form = $("#updateStreamForm");

            var formData = $("#updateStreamForm").serialize();

            var url = "/updateStreamInfo"; 

            $.ajax({
                type: "POST",
                url: url,
                data: formData, 
                success: function(data)
                {
                    $('#editStreamModal').modal('toggle');

                    var notfiyOpt = 
                    {
                        'style':'flip',
                        'message':'Changes have made successfully!',
                        'position':'top-left',
                        'type':'success',
                        'showClose':true
                    }
                    $('body').pgNotification(notfiyOpt).show();

                    refreshInfo();
                },
                error:function(data)
                {
                    $('#editStreamModal').modal('toggle');

                    var notfiyOpt = 
                    {
                        'style':'flip',
                        'message':'An error occrued while making changes!',
                        'position':'top-left',
                        'type':'danger',
                        'showClose':true
                    }
                    $('body').pgNotification(notfiyOpt).show();
                },
                });
            
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

    function refreshInfo()
    {
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
                
                $("#liveIndTxt").removeClass("text-primary").addClass("text-danger");
                $("#liveIndTxt").html('<i class="fa fa-circle m-l-10"></i> LIVE');
            }else{
                $("#liveIndTxt").removeClass("text-danger").addClass("text-primary");
                $("#liveIndTxt").html('<i class="fa fa-circle m-l-10"></i> OFFLINE');
            }
        });

        $.get( "/viewer", function( data ) {
            if(data && data != ""){
                $("#viewerTbody").empty();
                for(var i =0; i< data.chatters.viewers.length ;i++)
                {
                    $("#viewerTbody").append('<tr><td class="v-align-middle semi-bold">'+data.chatters.viewers[i]+'</td></tr>');
                }
            }
        });

        $.get( "/follower", function( data ) {
            if(data && data != ""){
                var follows = data.follows;
                $("#followerTbody").empty();
                for(var i =0; i< follows.length ;i++)
                {
                    var createdDate = new Date(follows[i].created_at);
                    $("#followerTbody").append('<tr><td class="v-align-middle semi-bold">'+follows[i].user.display_name+'</td><td class="v-align-middle">'+createdDate.toDateString()+'</td></tr>');
                }
            }
        });

        $.get( "/subscriber", function( data ) {
            if(data && data != ""){
                $( "#subCountTxt" ).html( data._total );
            }
        });
    }