// var feedURL = "https://api.thingspeak.com/channels/1012790/feeds.json?api_key=UAVE2ZYBLZS5LT6S&results=2";
var feedURL = "https://api.thingspeak.com/channels/985815/feeds.json?results=2";

function refreshSensors() {
    fetch(feedURL)
        .then((response) => {
            return response.json();
        })
        .then((myJson) => {
            // console.log("feed");
            // console.log(myJson);

            var feedStream = myJson.feeds[1];
            // BPM
            document.getElementById("sensorArea1").textContent = feedStream.field1;
            // Temperature
            document.getElementById("sensorArea2").textContent = feedStream.field2;
            // Humidity
            document.getElementById("sensorArea3").textContent = feedStream.field3;
        });
}

function removeFace() {
    document.getElementById('faceContainer').style.display = 'none';
    document.getElementById('mainBody').style.display = 'block';
}

function startTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    m = checkTime(m);
    s = checkTime(s);
    document.getElementById('clock').innerHTML =
        h + ":" + m + ":" + s;
    var t = setTimeout(startTime, 500);
}

function checkTime(i) {
    if (i < 10) {
        i = "0" + i
    }; // add zero in front of numbers < 10
    return i;
}

function debugCheck(){
    if(document.getElementById("debugMode").checked) {
        document.getElementById("sources").style.display = "block";
    } else {
        document.getElementById("sources").style.display = "none";
    }
}

var mqtt;

$(function () {
    mqtt = new Paho.MQTT.Client("localhost", 9090, "cli01");
    console.log("connecting");

    var options = {
        timeout: 60,
        onSuccess: onConnect,
        onFailure: onFailure,
    };

    mqtt.onMessageArrived = onMessageArrived;
    mqtt.connect(options);
});

function onConnect() {
    console.log("on Connect");
    mqtt.subscribe("isyjp/tp01");
}

function onMessageArrived(msg) {
    console.log("on Arrived");
    console.log(msg.payloadString)
    $('#message').text(msg.payloadString);
}

function onFailure() {}

function left() {
    message = new Paho.MQTT.Message("left");
    message.destinationName = "isyjp/gpio21";
    mqtt.send(message);
    console.log("left turn");
}

function right() {
    message = new Paho.MQTT.Message("right");
    message.destinationName = "isyjp/gpio21";
    mqtt.send(message);
    console.log("right turn");
}

function elsaAlert(id) {
    message = new Paho.MQTT.Message(id);
    message.destinationName = "isyjp/alert";
    mqtt.send(message);
    console.log("alert sent");
    alert("Alert has been sent to caretakers");
}

$(function () {

    let localStream = null;
    let peer = null;
    let existingCall = null;
    let connection = null;
    let closeTrigger = document.getElementById('leave');
    let sendTrigger = document.getElementById('send');
    let localText = document.getElementById('message');
    let messages = document.getElementById('response');
    let audioSelect = $('#audioSource');
    let videoSelect = $('#videoSource');


    navigator.mediaDevices.enumerateDevices()
        .then(function (deviceInfos) {
            for (let i = 0; i !== deviceInfos.length; ++i) {
                let deviceInfo = deviceInfos[i];
                let option = $('<option>');
                option.val(deviceInfo.deviceId);
                if (deviceInfo.kind === 'audioinput') {
                    option.text(deviceInfo.label);
                    audioSelect.append(option);
                } else if (deviceInfo.kind === 'videoinput') {
                    option.text(deviceInfo.label);
                    videoSelect.append(option);
                }
            }
            videoSelect.on('change', setupGetUserMedia);
            audioSelect.on('change', setupGetUserMedia);
            setupGetUserMedia();
        }).catch(function (error) {
            console.error('mediaDevices.enumerateDevices() error:', error);
            return;
        });

    // Gets URL parameter
    var getQueryString = function (field, url) {
        var href = url ? url : window.location.href;
        var reg = new RegExp('[?&]' + field + '=([^&#]*)', 'i');
        var string = reg.exec(href);
        return string ? string[1] : null;
    };

    // Get room ID from URL
    var URLroom = getQueryString('room');

    peer = new Peer({
        key: '7df85c95-5208-405f-95a4-bd5e1f566321',
        debug: 3
    });

    $('#idSend').click(function () {
        elsaAlert(peer.id);
    });

    peer.on('error', function (err) {
        alert(err.message);
    });

    // $('#faceContainer').click(function () {
    //     $('#faceContainer').attr('style','display: none');
    //     $('#mainBody').attr('style','display: block');
    //     $('#make-call').submit();
    // });

    // When 'Join' is clicked
    // Register connecter handler
    $('#make-call').submit(function (e) {
        e.preventDefault();
        let roomName = $('#join-room').val();
        if (!roomName) {
            return;
        }
        const call = peer.joinRoom(roomName, {
            mode: 'sfu',
            stream: localStream
        });
        setupCallEventHandlers(call);
        connection = peer.connect(roomName);

        connection.once('open', async () => {
            messages.textContent += `=== DataConnection has been opened ===\n`;
            sendTrigger.addEventListener('click', onClickSend);
        });

        connection.on('data', data => {
            console.log("Self Handler: ");
            console.log(data);
            if (data == "left") {
                left();
                // messages.textContent += `Movement Remote: ${data}\n`;
            } else if (data == "right") {
                right();
                // messages.textContent += `Movement Remote: ${data}\n`;
            } else {
                messages.textContent += `Remote: ${data}\n`;
            }
        });

        connection.once('close', () => {
            messages.textContent += `=== DataConnection has been closed ===\n`;
            sendTrigger.removeEventListener('click', onClickSend);
        });

        // Register closing handler
        closeTrigger.addEventListener('click', () => connection.close(), {
            once: true,
        });

        function onClickSend() {
            const data = localText.value;
            console.log(data);
            connection.send(data);

            messages.textContent += `You: ${data}\n`;
            localText.value = '';
        }
    });

    $('#leave').click(function () {
        existingCall.close();
        $('#host').show();
        $('#hostLink').hide();
    });

    peer.on('open', function () {
        console.log('open: ' + peer.id);
        // $("#select option:eq(2)").attr("selected", "selected");
        // $('#audioSource :nth-child(2)').prop('selected', true);
        $('#my-id').text(peer.id);
        $('#join-room').val(peer.id);
        $('#make-call').submit();
    });

    // Register connected peer handler
    peer.on('connection', function (connection) {
        console.log('in connection');

        connection.once('open', async () => {
            messages.textContent += `=== DataConnection has been opened ===\n`;
            sendTrigger.addEventListener('click', onClickSend);
        });

        connection.on('data', data => {
            console.log("Peer Handler: ");
            console.log(data);
            if (data == "left") {
                left();
                messages.textContent += `Movement Remote: ${data}\n`;
            } else if (data == "right") {
                right();
                messages.textContent += `Movement Remote: ${data}\n`;
            } else {
                messages.textContent += `Remote: ${data}\n`;
            }
        });

        connection.once('close', () => {
            messages.textContent += `=== DataConnection has been closed ===\n`;
            sendTrigger.removeEventListener('click', onClickSend);
        });

        // Register closing handler
        closeTrigger.addEventListener('click', () => connection.close(), {
            once: true,
        });

        function onClickSend() {
            const data = localText.value;
            console.log(data);
            connection.send(data);

            messages.textContent += `You: ${data}\n`;
            localText.value = '';
        }
    });

    function setupGetUserMedia() {
        let audioSource = $('#audioSource').val();
        let videoSource = $('#videoSource').val();
        let constraints = {
            audio: {
                deviceId: {
                    exact: audioSource
                }
            },
            video: {
                deviceId: {
                    exact: videoSource
                }
            }
        };
        constraints.video.width = {
            min: 320,
            max: 320
        };
        constraints.video.height = {
            min: 240,
            max: 240
        };

        if (localStream) {
            localStream = null;
        }

        navigator.mediaDevices.getUserMedia(constraints)
            .then(function (stream) {
                $('#myStream').get(0).srcObject = stream;
                localStream = stream;

                if (existingCall) {
                    existingCall.replaceStream(stream);
                }

            }).catch(function (error) {
                console.error('mediaDevice.getUserMedia() error:', error);
                return;
            });
    }

    function setupCallEventHandlers(call) {
        if (existingCall) {
            existingCall.close();
        };

        existingCall = call;
        setupEndCallUI();
        $('#room-id').text(call.name);

        call.on('stream', function (stream) {
            addVideo(stream);
        });

        call.on('removeStream', function (stream) {
            removeVideo(stream.peerId);
        });

        call.on('peerLeave', function (peerId) {
            removeVideo(peerId);
        });

        call.on('close', function () {
            removeAllRemoteVideos();
            setupMakeCallUI();
        });
    }

    function addVideo(stream) {
        const videoDom = $('<video autoplay>');
        videoDom.attr('id', stream.peerId);
        videoDom.attr('style', 'width: 100%');
        videoDom.get(0).srcObject = stream;
        $('#videosContainer').append(videoDom);
    }

    function removeVideo(peerId) {
        $('#' + peerId).remove();
    }
    
    function removeAllRemoteVideos() {
        $('#videosContainer').empty();
    }

    function setupMakeCallUI() {
        $('#make-call').show();
        $('#end-call').hide();
    }

    function setupEndCallUI() {
        $('#make-call').hide();
        $('#end-call').show();
    }
});