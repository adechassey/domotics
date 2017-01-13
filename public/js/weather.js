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
    humidity.push(jsonPayload.humidity);
    heatIndex.push(jsonPayload.heatIndex);
    time.push(new Date().formatMMDDYYYY());

    temperatureChart.update();
    humidityChart.update();
}


/***************************
*                          *
*          CHART           *
*                          *
***************************/

// Variables
var temperature = [];
var humidity = [];
var heatIndex = [];
var time = [];
var weatherChart;

// Add a helper to format timestamp data
Date.prototype.formatMMDDYYYY = function() {
    /* return (this.getMonth() + 1) +
        "/" +  this.getDate() +
        "/" +  this.getFullYear();*/
    return (this.getHours() + 7) +
        ":" +  this.getMinutes();
}

$.getJSON( "/weathers", function( data ) {
    $.each( data, function( key, val ) {
        temperature.push(val.temperature);
        humidity.push(val.humidity);
        heatIndex.push(val.heatIndex);
        time.push(new Date(val.time).formatMMDDYYYY());
    });
    temperatureChart.update();
    humidityChart.update();
});

// Temperature Chart
var temperature_id = $("#temperature");
var data_temperature = {
    labels: time,
    datasets: [{
        label: "Temperature",
        backgroundColor: "rgba(38, 185, 154, 0.31)",
        borderColor: "rgba(38, 185, 154, 0.7)",
        pointBorderColor: "rgba(38, 185, 154, 0.7)",
        pointBackgroundColor: "rgba(38, 185, 154, 0.7)",
        pointHoverBackgroundColor: "#349155",
        pointHoverBorderColor: "rgba(255, 255, 255, 0.5)",
        pointHoverRadius: 8,
        pointBorderWidth: 4,
        data: temperature
    },{
        label: "Heat Index",
        backgroundColor: "rgba(185, 117, 38, 0.28)",
        borderColor: "rgba(185, 111, 38, 0.7)",
        pointBorderColor: "rgba(185, 140, 38, 0.7)",
        pointBackgroundColor: "rgba(185, 117, 38, 0.7)",
        pointHoverBackgroundColor: "#96514e",
        pointHoverBorderColor: "rgba(255, 255, 255, 0.5)",
        pointHoverRadius: 8,
        pointBorderWidth: 4,
        data: heatIndex
    }]
};

temperatureChart = new Chart(temperature_id, {
    type: 'line',
    data: data_temperature,
    options: {
        hover: {
            mode: 'nearest'
        },
        scales: {
            xAxes: [{
                display: true,
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
                scaleLabel: {
                    display: true,
                    labelString: 'Temperature (°C)'
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


// Humidity Chart
var humidity_id = $("#humidity");
var data_humidity = {
    labels: time,
    datasets: [{
        label: "Humidity",
        backgroundColor: "rgba(38, 72, 185, 0.31)",
        borderColor: "rgba(38, 55, 185, 0.7)",
        pointBorderColor: "rgba(38, 49, 185, 0.7)",
        pointBackgroundColor: "rgba(38, 100, 185, 0.7)",
        pointHoverBackgroundColor: "#4e5c96",
        pointHoverBorderColor: "rgba(255, 255, 255, 0.5)",
        pointHoverRadius: 8,
        pointBorderWidth: 4,
        data: humidity
    }]
};

humidityChart = new Chart(humidity_id, {
    type: 'line',
    data: data_humidity,
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
                    labelString: 'Humidity (%)'
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
