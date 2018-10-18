$(document).ready(function() {
    
    //ajax get json hierarchy
    var object = (function() {
        var object = null;
        $.ajax({
            'async': false,
            'global': false,
            'url': "laundryrooms.json",
            'dataType': "json",
            'success': function (data) {
                object = data;
            }
        });
        return object;
    })();

    //build the selectors
    var selector = document.getElementById('selector');

    function buildTopSelector(array) {
        var topSelector = document.createElement('select');
        topSelector.classList.add("form-control");
        topSelector.classList.add("form-control-lg");
        topSelector.classList.add("top-select");

        //build default value
        var option = document.createElement("option");
        option.classList.add("top-selector");
        option.setAttribute("value", "selectProperty");
        option.setAttribute("id", "selectProperty");
        option.innerHTML = "Select a property...";

        topSelector.appendChild(option);

        for (var x=0; x<array.length; x++) {
            var option = document.createElement("option");
            option.classList.add("top-selector");
            option.setAttribute("value", array[x].pid);
            option.setAttribute("id", array[x].pid);
            option.innerHTML = array[x].propertyName;

            topSelector.appendChild(option);
        };

        return topSelector;
    };

    selector.appendChild(buildTopSelector(object.buildings));


    //create listeners for the top ids
    $(".top-select").change(function() {
        //first clear any lower levels if they are there
        $(".child-select").remove();
        $(".room-select").remove();

        //then build the property selector
        buildPropertySelector($(".top-select").val());
    });


    var tempArray = [];

    function buildPropertySelector(id) {
        var array = object.buildings;
        for (var x=0; x<array.length; x++) {
            if (id == array[x].pid) {
                tempArray = array[x].rooms;
                var childSelector = document.createElement('select');
                childSelector.classList.add("form-control");
                childSelector.classList.add("form-control-lg");
                childSelector.classList.add("child-select");

                //build the default value
                var defaultOption = document.createElement("option");
                defaultOption.setAttribute("value", tempArray[0].roomID);
                defaultOption.setAttribute("id", tempArray[0].roomID);
                defaultOption.innerHTML = "Select a building/section...";
                childSelector.appendChild(defaultOption);

                //build the values from json
                for (var i=0; i<tempArray.length; i++) {
                    var option = document.createElement("option");
                    option.setAttribute("value", tempArray[i].roomID);
                    option.setAttribute("id", tempArray[i].roomID);
                    option.innerHTML = tempArray[i].roomName;

                    childSelector.appendChild(option);
                };

                //append to the top div
                selector.appendChild(childSelector);
            };
        };
        //create listeners for the child ids
        $(".child-select").change(function() {

            //first remove the room selector if it exists
            $(".room-select").remove();

            //then build the room selector or room
            buildRoom($(".child-select").val());


            //create listeners for the room ids
            $(".room-select").change(function() {
                buildRoom($(".room-select").val());
            });
        });

    }

    var propertyArray = [];

    function buildRoom(id) {
        $('#roomData').html("");
        var array = tempArray;
        if ($.isNumeric(id)) {
            //pass values to roomBuilder function
            roomBuilder(id);
        }else {
            for (var x=0; x<array.length; x++) {
                if (id == array[x].roomID){
                    if (array[x].innerRooms || !$.isNumeric(array[x].roomID)){
                        propertyArray = array[x].innerRooms;
                        var childSelector = document.createElement('select');
                        childSelector.classList.add("form-control");
                        childSelector.classList.add("form-control-lg");
                        childSelector.classList.add("room-select");

                        //build the default value
                        var defaultOption = document.createElement("option");
                        defaultOption.setAttribute("value", array[x].roomID);
                        defaultOption.setAttribute("id", array[x].roomID);
                        defaultOption.innerHTML = "Select a room...";
                        childSelector.appendChild(defaultOption);

                        //build the values from json
                        for (var i=0; i<propertyArray.length; i++) {
                            var option = document.createElement("option");
                            option.setAttribute("value", propertyArray[i].roomID);
                            option.setAttribute("id", propertyArray[i].roomID);
                            option.innerHTML = propertyArray[i].roomName;

                            childSelector.appendChild(option);
                        };

                        //append to the top div
                        selector.appendChild(childSelector);
                    }
                };
            };
        };
    }

    function roomBuilder(id) {
        //function to build the room using LV api, and make it pretty

        $.get("https://cors-anywhere.herokuapp.com/https://api.laundryview.com/room/?api_key=8c31a4878805ea4fe690e48fddbfffe1&method=getAppliances&location=" + id).done(function (data) {

            var datapoint = document.getElementById("roomData");

            var appliances = $(data).find('appliance');

            var countAvailable = 0;
            var countInUse = 0;
            var countOutOfOrder = 0;

            //create the row
            var row = document.createElement('div');
            row.classList.add('row');

            //create the mobile toggle
            var mobiletoggle = document.createElement('div');
            mobiletoggle.classList.add('btn-group');
            mobiletoggle.classList.add('btn-group-lg');
            mobiletoggle.classList.add('d-sm-block');
            mobiletoggle.classList.add('d-md-none');
            mobiletoggle.classList.add('mx-auto');
            mobiletoggle.innerHTML = '<button type="button" class="btn btn-secondary active" id="showWashersColumn">Washers</button><button type="button" class="btn btn-secondary" id="showDryersColumn">Dryers</button>';

            //create the washer column
            var availableCounter = 0;
            var washcolumn = document.createElement('div');
            washcolumn.classList.add('col-md-5');
            washcolumn.classList.add('offset-md-1');
            washcolumn.setAttribute('id', 'washersColumn');
            var washTitle = "<h2 class='washers-title'>" + availableCounter + " Washers available <i class='fas fa-tint'></i></h2>";
            washcolumn.innerHTML = washTitle;

            //create the dryer column
            var dryAvailableCounter = 0;
            var drycolumn = document.createElement('div');
            drycolumn.classList.add('col-md-5');
            drycolumn.classList.add('d-none');
            drycolumn.classList.add('d-sm-none');
            drycolumn.classList.add('d-md-block');
            drycolumn.setAttribute('id', 'dryersColumn');
            var dryTitle = "<h2 class='dryers-title'>" + availableCounter + " Dryers available <i class='fas fa-tshirt'></i></h2>";
            drycolumn.innerHTML= dryTitle;


            for (var i=0; i<appliances.length; i++) {
                var type = $(appliances[i]).find('appliance_type').html();
                var statusOfMachine = $(appliances[i]).find('status').html();

                if (type == "WASHER") {
                    //build washer machine cards
                    var washcard = document.createElement('div');
                    washcard.classList.add('card');
                    var cardbody = document.createElement('div');
                    cardbody.classList.add('card-body');

                    var machineName = document.createElement('h5');
                    machineName.classList.add('card-title');
                    machineName.innerHTML = "Washer #" + $(appliances[i]).find('label').html();

                    var timeRemaining = document.createElement('h6');
                    timeRemaining.classList.add('card-subtitle');

                    var timeDone = document.createElement('p');
                    timeDone.classList.add('card-text');

                    var remainder = $(appliances[i]).find('time_remaining').html();

                    if (remainder == 'available' || remainder.lastIndexOf('cycle ended') > -1) {
                        //Card body becomes green for available
                        washcard.classList.add('washer-available');

                        //Set text to reflect status
                        timeRemaining.innerHTML = "Available";
                        availableCounter++;
                        countAvailable++;

                        //append everything
                        washcard.appendChild(cardbody);
                        cardbody.appendChild(machineName);
                        cardbody.appendChild(timeRemaining);
                        washcolumn.appendChild(washcard);

                    }
                    else if (remainder.lastIndexOf('est. time remaining') > -1) {
                        var innerRow = document.createElement('div');
                        innerRow.classList.add('row');

                        var firstCol = document.createElement('div');
                        firstCol.classList.add('col-md-6');

                        var secondCol = document.createElement('div');
                        secondCol.classList.add('col-md-6');

                        var time = remainder.match(/\d+/g).map(Number);

                        //calculate the percent done
                        var avgTime = $(appliances[i]).find('avg_cycle_time').html();
                        avgTime = parseInt(avgTime);
                        var percent = time[0]*100/avgTime;
                        percent = 100 - percent;
                        var percentHTML = '<div class="card-body"><div class="progress"><div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="' + percent + '" aria-valuemin="0" aria-valuemax="100" style="width: '+ percent +'%"></div></div></div>';
                        secondCol.innerHTML = percentHTML;

                        //card body becomes red for in use
                        washcard.classList.add('washer-in-use');

                        //set text to reflect status
                        timeRemaining.innerHTML = time[0] + " minutes remaining"
                        var computeDate = new Date();
                        computeDate.setMinutes(computeDate.getMinutes() + time[0]);
                        var hour = computeDate.getHours();
                        var ampm = "AM"
                        if (hour >= 12) {
                            hour -= 12;
                            ampm = "PM"
                        }
                        else if (hour == 00) {
                            hour = 12;
                        };
                        var minute = computeDate.getMinutes();
                        if (minute < 10) {
                            minute = "0" + minute;
                        }
                        
                        var unixTime = computeDate.getTime()/1000|0;

                        var timeFinish = hour +":"+ minute + " " + ampm;

                        timeDone.innerHTML = "Cycle finishes at " + timeFinish;

                        //create notify me button
                        var notifyme = document.createElement('button');
                        notifyme.classList.add('btn');
                        notifyme.classList.add('btn-primary');
                        notifyme.setAttribute('id', 'notifyMe');
                        notifyme.setAttribute('remain', unixTime);
                        notifyme.setAttribute('readable', timeFinish);
                        notifyme.setAttribute('machineName', $(machineName).text());
                        notifyme.classList.add('card-link');
                        notifyme.innerHTML = "Notify Me";


                        //append everything
                        firstCol.appendChild(cardbody);
                        innerRow.appendChild(firstCol);
                        innerRow.appendChild(secondCol);
                        washcard.appendChild(innerRow);
                        cardbody.appendChild(machineName);
                        cardbody.appendChild(timeRemaining);
                        cardbody.appendChild(timeDone);
                        cardbody.appendChild(notifyme);
                        washcolumn.appendChild(washcard);     
                        
                        countInUse++;
                    }
                    else if (remainder.lastIndexOf('extended cycle') > -1) {
                        var innerRow = document.createElement('div');
                        innerRow.classList.add('row');

                        var firstCol = document.createElement('div');
                        firstCol.classList.add('col-md-6');

                        var secondCol = document.createElement('div');
                        secondCol.classList.add('col-md-6');

                        var percentHTML = '<div class="card-body"><div class="progress"><div class="progress-bar progress-bar-striped progress-bar-animated bg-warning" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div></div></div>';
                        secondCol.innerHTML = percentHTML;
                        
                        //card body becomes red for in use
                        washcard.classList.add('washer-in-use');

                        //set text to reflect status
                        timeRemaining.innerHTML = "Extended Cycle";

                        //append everything
                        firstCol.appendChild(cardbody);
                        innerRow.appendChild(firstCol);
                        innerRow.appendChild(secondCol);
                        washcard.appendChild(innerRow);
                        cardbody.appendChild(machineName);
                        cardbody.appendChild(timeRemaining);
                        washcolumn.appendChild(washcard); 
                        
                        countInUse++;
                    }
                    else {
                        //card body becomes yellow for out of order
                        washcard.classList.add('washer-out-of-order');

                        //set text to reflect status
                        timeRemaining.innerHTML = "Out of Order";
                        //append everything
                        washcard.appendChild(cardbody);
                        cardbody.appendChild(machineName);
                        cardbody.appendChild(timeRemaining);
                        washcolumn.appendChild(washcard);

                        countOutOfOrder++;
                    };
                };
                if (type == "DRYER") {
                    //build drying machine cards
                    var drycard = document.createElement('div');
                    drycard.classList.add('card');
                    var cardbody = document.createElement('div');
                    cardbody.classList.add('card-body');

                    var machineName = document.createElement('h5');
                    machineName.classList.add('card-title');
                    machineName.innerHTML = "Dryer #" + $(appliances[i]).find('label').html();

                    var timeRemaining = document.createElement('h6');
                    timeRemaining.classList.add('card-subtitle');

                    var timeDone = document.createElement('p');
                    timeDone.classList.add('card-text');

                    var remainder = $(appliances[i]).find('time_remaining').html();

                    if (remainder == 'available' || remainder.lastIndexOf('cycle ended') > -1) {
                        //Card body becomes green for available
                        drycard.classList.add('dryer-available');

                        //Set text to reflect status
                        timeRemaining.innerHTML = "Available";
                        dryAvailableCounter++;
                        countAvailable++;

                        //append everything
                        drycard.appendChild(cardbody);
                        cardbody.appendChild(machineName);
                        cardbody.appendChild(timeRemaining);
                        drycolumn.appendChild(drycard);

                    }
                    else if (remainder.lastIndexOf('est. time remaining') > -1) {
                        var innerRow = document.createElement('div');
                        innerRow.classList.add('row');

                        var firstCol = document.createElement('div');
                        firstCol.classList.add('col-md-6');

                        var secondCol = document.createElement('div');
                        secondCol.classList.add('col-md-6');

                        var time = remainder.match(/\d+/g).map(Number);

                        //calculate the percent done
                        var avgTime = $(appliances[i]).find('avg_cycle_time').html();
                        avgTime = parseInt(avgTime);
                        var percent = time[0]*100/avgTime;
                        percent = 100 - percent;
                        var percentHTML = '<div class="card-body"><div class="progress"><div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="' + percent + '" aria-valuemin="0" aria-valuemax="100" style="width: '+ percent +'%"></div></div></div>';
                        secondCol.innerHTML = percentHTML;

                        //card body becomes red for in use
                        drycard.classList.add('dryer-in-use');

                        //set text to reflect status
                        timeRemaining.innerHTML = time[0] + " minutes remaining"
                        var computeDate = new Date();
                        computeDate.setMinutes(computeDate.getMinutes() + time[0]);
                        var hour = computeDate.getHours();
                        var ampm = "AM"
                        if (hour >= 12) {
                            hour -= 12;
                            ampm = "PM"
                        }else if (hour == 00) {
                            hour = 12;
                        };
                        var minute = computeDate.getMinutes();
                        if (minute < 10) {
                            minute = "0" + minute;
                        }

                        var unixTime = computeDate.getTime()/1000|0;

                        var timeFinish = hour +":"+ minute + " " + ampm;

                        timeDone.innerHTML = "Cycle finishes at " + timeFinish;

                        //create notify me button
                        var notifyme = document.createElement('button');
                        notifyme.classList.add('btn');
                        notifyme.classList.add('btn-primary');
                        notifyme.setAttribute('id', 'notifyMe');
                        notifyme.setAttribute('href', '#');
                        notifyme.setAttribute('remain', unixTime);
                        notifyme.setAttribute('readable', timeFinish);
                        notifyme.setAttribute('machineName', $(machineName).text());
                        notifyme.classList.add('card-link');
                        notifyme.innerHTML = "Notify Me";


                        //append everything
                        firstCol.appendChild(cardbody);
                        innerRow.appendChild(firstCol);
                        innerRow.appendChild(secondCol);
                        drycard.appendChild(innerRow);
                        cardbody.appendChild(machineName);
                        cardbody.appendChild(timeRemaining);
                        cardbody.appendChild(timeDone);
                        cardbody.appendChild(notifyme);
                        drycolumn.appendChild(drycard);   
                        
                        countInUse++;
                    }
                    else if (remainder.lastIndexOf('extended cycle') > -1) {
                        var innerRow = document.createElement('div');
                        innerRow.classList.add('row');

                        var firstCol = document.createElement('div');
                        firstCol.classList.add('col-md-6');

                        var secondCol = document.createElement('div');
                        secondCol.classList.add('col-md-6');

                        var percentHTML = '<div class="card-body"><div class="progress"><div class="progress-bar progress-bar-striped progress-bar-animated bg-warning" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div></div></div>';
                        secondCol.innerHTML = percentHTML;
                        
                        //card body becomes red for in use
                        drycard.classList.add('dryer-in-use');

                        //set text to reflect status
                        timeRemaining.innerHTML = "Extended Cycle";

                        //append everything
                        firstCol.appendChild(cardbody);
                        innerRow.appendChild(firstCol);
                        innerRow.appendChild(secondCol);
                        drycard.appendChild(innerRow);
                        cardbody.appendChild(machineName);
                        cardbody.appendChild(timeRemaining);
                        drycolumn.appendChild(drycard);
                        
                        countInUse++;
                    }
                    else {
                        //card body becomes yellow for out of order
                        drycard.classList.add('dryer-out-of-order');

                        //set text to reflect status
                        timeRemaining.innerHTML = "Out of Order";
                        //append everything
                        drycard.appendChild(cardbody);
                        cardbody.appendChild(machineName);
                        cardbody.appendChild(timeRemaining);
                        drycolumn.appendChild(drycard);

                        countOutOfOrder++;
                    };
                };





            };

            //build washer and dryer columns into dom
            row.appendChild(mobiletoggle);
            row.appendChild(washcolumn);
            row.appendChild(drycolumn);

            //append the row
            datapoint.appendChild(row);
            $('.washers-title').html("<h2 class='washers-title'>" + availableCounter + " Washers available <i class='fas fa-tint'></i></h2><div class='btn-group' role='group' aria-label='selector'><button type='button' class='btn btn-info active' id='showAllWashers'>Show All</button><button type='button' class='btn btn-info' id='showAvailableWashers'>Available</button><button type='button' class='btn btn-info' id='showInUseWashers'>In Use</button><button type='button' class='btn btn-info' id='showOutOfOrderWashers'>Out Of Order</button></div>");
            $('.dryers-title').html("<h2 class='dryers-title'>" + dryAvailableCounter + " Dryers available <i class='fas fa-tshirt'></i></h2><div class='btn-group' role='group' aria-label='selector'><button type='button' class='btn btn-info active' id='showAllDryers'>Show All</button><button type='button' class='btn btn-info' id='showAvailableDryers'>Available</button><button type='button' class='btn btn-info' id='showInUseDryers'>In Use</button><button type='button' class='btn btn-info' id='showOutOfOrderDryers'>Out Of Order</button></div>");

            //create listeners for the column toggle on mobile
            $('#showWashersColumn').on('click', function() {
                $('#showDryersColumn').removeClass('active');
                $('#showWashersColumn').addClass('active');

                $('#washersColumn').addClass('d-block');
                $('#washersColumn').removeClass('d-none');
                $('#washersColumn').removeClass('d-sm-none');
                $('#dryersColumn').addClass('d-none');
                $('#dryersColumn').addClass('d-sm-none');
                $('#dryersColumn').removeClass('d-block');
                $('#dryersColumn').removeClass('d-sm-block');
            });
            $('#showDryersColumn').on('click', function() {
                $('#showDryersColumn').addClass('active');
                $('#showWashersColumn').removeClass('active');

                $('#dryersColumn').addClass('d-block');
                $('#dryersColumn').removeClass('d-none');
                $('#dryersColumn').removeClass('d-sm-none');
                $('#washersColumn').addClass('d-none');
                $('#washersColumn').addClass('d-sm-none');
                $('#washersColumn').removeClass('d-block');
                $('#washersColumn').removeClass('d-sm-block');
            });
            
            //create listeners for the washer toggle display buttons
            $('#showAllWashers').on('click', function() {
                $('#showAvailableWashers').removeClass('active');
                $('#showInUseWashers').removeClass('active');
                $('#showOutOfOrderWashers').removeClass('active');
                $('#showAllWashers').addClass('active');

                $('.washer-available').show();
                $('.washer-in-use').show();
                $('.washer-out-of-order').show()
            });
            $('#showAvailableWashers').on('click', function() {
                $('#showAllWashers').removeClass('active');
                $('#showInUseWashers').removeClass('active');
                $('#showOutOfOrderWashers').removeClass('active');
                $('#showAvailableWashers').addClass('active');

                $('.washer-available').show();
                $('.washer-in-use').hide();
                $('.washer-out-of-order').hide()
            });
            $('#showInUseWashers').on('click', function() {
                $('#showAllWashers').removeClass('active');
                $('#showAvailableWashers').removeClass('active');
                $('#showOutOfOrderWashers').removeClass('active');
                $('#showInUseWashers').addClass('active');

                $('.washer-available').hide();
                $('.washer-in-use').show();
                $('.washer-out-of-order').hide()
            });
            $('#showOutOfOrderWashers').on('click', function() {
                $('#showAllWashers').removeClass('active');
                $('#showAvailableWashers').removeClass('active');
                $('#showInUseWashers').removeClass('active');
                $('#showOutOfOrderWashers').addClass('active');

                $('.washer-available').hide();
                $('.washer-in-use').hide();
                $('.washer-out-of-order').show()
            });


            //create listeners for the dryer toggle display buttons
            $('#showAllDryers').on('click', function() {
                $('#showAvailableDryers').removeClass('active');
                $('#showInUseDryers').removeClass('active');
                $('#showOutOfOrderDryers').removeClass('active');
                $('#showAllDryers').addClass('active');

                $('.dryer-available').show();
                $('.dryer-in-use').show();
                $('.dryer-out-of-order').show()
            });
            $('#showAvailableDryers').on('click', function() {
                $('#showAllDryers').removeClass('active');
                $('#showInUseDryers').removeClass('active');
                $('#showOutOfOrderDryers').removeClass('active');
                $('#showAvailableDryers').addClass('active');

                $('.dryer-available').show();
                $('.dryer-in-use').hide();
                $('.dryer-out-of-order').hide()
            });
            $('#showInUseDryers').on('click', function() {
                $('#showAllDryers').removeClass('active');
                $('#showAvailableDryers').removeClass('active');
                $('#showOutOfOrderDryers').removeClass('active');
                $('#showInUseDryers').addClass('active');

                $('.dryer-available').hide();
                $('.dryer-in-use').show();
                $('.dryer-out-of-order').hide()
            });
            $('#showOutOfOrderDryers').on('click', function() {
                $('#showAllDryers').removeClass('active');
                $('#showAvailableDryers').removeClass('active');
                $('#showInUseDryers').removeClass('active');
                $('#showOutOfOrderDryers').addClass('active');

                $('.dryer-available').hide();
                $('.dryer-in-use').hide();
                $('.dryer-out-of-order').show()
            });

            //listener for notify me
            $('#notifyMe').on('click', function(e) {
                var machineName = $(e.target).attr('machineName');
                var unixTimeEnd = $(e.target).attr('remain');
                var readableTime = $(e.target).attr('readable');

                //create the modal
                var modal = document.createElement('div');
                modal.classList.add('modal');
                modal.setAttribute('tabindex', '-1');
                modal.setAttribute('role', 'dialog');
                modal.setAttribute('id','emailModal');
                modal.innerHTML = "<div class='modal-dialog' role='document'><div class='modal-content'><div class='modal-header'><h5 class='modal-title'>Notify via email</h5><button type='button' class='close' data-dismiss='modal' aria-label='Close' id='removeModal'><span aria-hidden='true'>&times;</span></button></div><div class='modal-body'><p>" + machineName + " will finish it's cycle at <strong>" + readableTime +".</strong> Enter your email below to receive a notification.</p><input class='form-control form-control-lg' type='text' id='email' placeholder='Email'></div><div class='modal-footer'><button type='button' class='btn btn-primary' id='"+unixTimeEnd+"'>Notify Me</button><button type='button' class='btn btn-secondary' data-dismiss='modal' id='removeModal'>Close</button></div></div></div>";
                
                //add it to row
                row.appendChild(modal);

                //call the modal
                $('#emailModal').modal();

                //listener for Notify Me inside modal
                $('#'+unixTimeEnd).on('click', function(){
                    //call the email function
                    sendEmail(machineName,unixTimeEnd,readableTime);
                    $('#emailModal').modal('hide');
                    
                });

                //listener for Close modal button
                $('#removeModal').on('click', function(){
                    //remove item
                    $('#emailModal').remove();
                });

            })

            //build canvases after page ready
            buildCanvases();

            function buildCanvases() {
                var spaceRight = document.getElementById('spaceRight');
                spaceRight.innerHTML = "";

                var canvas = document.createElement('canvas');
                canvas.setAttribute('id', 'statsChart');

                spaceRight.appendChild(canvas);

                var ctx = document.getElementById("statsChart").getContext('2d');

                // Create Doughnut chart
                var donutchart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        datasets: [{
                            data: [countAvailable,countInUse,countOutOfOrder],
                            backgroundColor: [
                                'rgba(212,237,218,1)',
                                'rgba(248,215,218,1)',
                                'rgba(255,243,205,1)'
                            ]
                        }],
                    
                        // These labels appear in the legend and in the tooltips when hovering different arcs
                        labels: [
                            'Available',
                            'In Use',
                            'Out of Order'
                        ]
                    }
                });
            };

            rewriteJumbo();

            function rewriteJumbo() {
                $('#spaceTitle').html($('#'+$('.top-select').val()).html()  + " Machines");
                $('#locationSelect').html("View machine status below, or select another location.");
            }


        });



    };

    function sendEmail(nameOfMachine,timeEndUnix,timeEndReadable) {
        var sendgridjs_url      = "http://laundryspacemail.herokuapp.com/send";
        var sendgridjs_to       = $("#email").val();
        var sendgridjs_subject  = nameOfMachine + " is ready for use!";
        var sendgridjs_html     = "<p>Hey there! <br /> Looks like this machine is ready and it's cycle finished at " + timeEndReadable +". <br /><br /><strong>If you machine still isn't done, give it a few minutes. LaundryView tends to underestimate cycle times.</strong><br /><br /> <strong>Happy washing,<br /><a href='https://www.ulaundry.space'>LaundrySpace</a>,</strong><em> created by Scott Richman (UAlbany)</em></p>";
        var sendgridjs_sendat   = parseInt(timeEndUnix);

        var email = {
            to      : sendgridjs_to, 
            subject : sendgridjs_subject,
            html    : sendgridjs_html,
            send_at : sendgridjs_sendat
        }
        $.post(sendgridjs_url, email, function(response) {
            if (response.success) {
            // redirect somewhere or something. up to you. the email was sent successfully.
                return true;
            } else {
                alert(response.error.message);
            }
        });
    

    };




});