var broker = "antoinedechassey.fr";
var topic = "home/weather";
var port = 61614;

function makeid(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 15; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

// Create a client instance
client = new Paho.MQTT.Client(broker, port, "clientId"+makeid());

// set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// connect the client
client.connect({useSSL: true, cleanSession: true, onSuccess:onConnect});


// called when the client connects
function onConnect() {
    // Once a connection has been made, make a subscription and send a message.
    console.log("onConnect");
    client.subscribe(topic);
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:"+responseObject.errorMessage);
    }
}

// called when a message arrives
function onMessageArrived(message) {
    console.log(message.payloadString);
    var jsonPayload = JSON.parse(message.payloadString);
    temperature.push(jsonPayload.temperature);
    time.push(new Date().formatMMDDYYYY());
/*    weatherChart.config.data.datasets[0].data = temperature;
    weatherChart.config.data.labels = time;*/
    weatherChart.update();
}


/***************************
*                          *
*      WEATHER CHART       *
*                          *
***************************/

var temperature = [];
var time = [];
var weatherChart;

// Add a helper to format timestamp data
Date.prototype.formatMMDDYYYY = function() {
    /* return (this.getMonth() + 1) +
        "/" +  this.getDate() +
        "/" +  this.getFullYear();*/
    return this.getHours() +
        ":" +  this.getMinutes();
}

$.getJSON( "/weathers", function( data ) {
    $.each( data, function( key, val ) {
        temperature.push(val.temperature);
        time.push(new Date(val.time).formatMMDDYYYY());
    });
    weatherChart.update();
});

var weather_id = $("#weather");
var data_weather = {
    labels: time,
    datasets: [{
        label: "Temperature",
        backgroundColor: "rgba(38, 185, 154, 0.31)",
        borderColor: "rgba(38, 185, 154, 0.7)",
        pointBorderColor: "rgba(38, 185, 154, 0.7)",
        pointBackgroundColor: "rgba(38, 185, 154, 0.7)",
        pointHoverBackgroundColor: "#4e5c96",
        pointHoverBorderColor: "rgba(0, 0, 0, 0.72)",
        pointHoverRadius: 6,
        pointBorderWidth: 0.5,
        data: temperature
    }]
};

weatherChart = new Chart(weather_id, {
    type: 'line',
    data: data_weather,
    options: {
        hover: {
            mode: 'label'
        },
        scales: {
            xAxes: [{
                display: true,
                stacked: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Time'
                }/*,
                ticks: {
                    maxTicksLimit: 10
                }*/
            }],
            yAxes: [{
                display: true,
                stacked: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Temperature'
                }
                /* ticks: {
                    beginAtZero: true,
                    steps: 10,
                    stepValue: 5,
                    min: 0,
                    max: 40,
                    maxTicksLimit: 5
                }*/
            }]
        }
    }
});
