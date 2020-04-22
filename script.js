var feedURL = "https://api.thingspeak.com/channels/1012790/feeds.json?api_key=UAVE2ZYBLZS5LT6S&results=2";

function refreshSensors() {
    fetch(feedURL)
        .then((response) => {
            return response.json();
        })
        .then((myJson) => {
            console.log("feed");
            console.log(myJson);

            var feedStream = myJson.feeds[0];
            document.getElementById("sensorArea1").textContent = feedStream.field1;
            document.getElementById("sensorArea2").textContent = feedStream.field2;
            document.getElementById("sensorArea3").textContent = feedStream.field3;
        });
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

$(function () {

    let localStream = null;
    let peer = null;
    let existingCall = null;
    let connection = null;
    let closeTrigger = document.getElementById('leave');
    let sendTrigger = document.getElementById('send');
    let leftTrigger = document.getElementById('left');
    let rightTrigger = document.getElementById('right');
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

    // When host button is clicked
    $('#host').click(function () {
        $('#host').hide();
        $('#hostLink').show();
        $('#my-id').text(peer.id);
        $('#join-room').val(peer.id);
    });

    peer.on('error', function (err) {
        alert(err.message);
    });

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
            leftTrigger.addEventListener('click', onClickLeft);
            rightTrigger.addEventListener('click', onClickRight);
        });

        connection.on('data', data => {
            console.log("Self Handler: ");
            console.log(data);
            messages.textContent += `Remote: ${data}\n`;
        });

        connection.once('close', () => {
            messages.textContent += `=== DataConnection has been closed ===\n`;
            sendTrigger.removeEventListener('click', onClickSend);
            leftTrigger.removeEventListener('click', onClickLeft);
            rightTrigger.removeEventListener('click', onClickRight);
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

        // Movement buttons
        function onClickLeft() {
            const data = 'left';
            console.log(data);
            connection.send(data);
            messages.textContent += `You: ${data}\n`;
        }

        function onClickRight() {
            const data = 'right';
            console.log(data);
            connection.send(data);
            messages.textContent += `You: ${data}\n`;
        }
    });

    $('#leave').click(function () {
        existingCall.close();
        $('#host').show();
        $('#hostLink').hide();
    });

    peer.on('open', function () {
        console.log('open: ' + peer.id);
        console.log('from URL: ' + URLroom);
        $('#join-room').val(URLroom);
    });

    // Register connected peer handler
    peer.on('connection', function (connection) {
        console.log('in connection');

        connection.once('open', async () => {
            messages.textContent += `=== DataConnection has been opened ===\n`;
            sendTrigger.addEventListener('click', onClickSend);
            leftTrigger.addEventListener('click', onClickLeft);
            rightTrigger.addEventListener('click', onClickRight);
        });

        connection.on('data', data => {
            console.log("Peer Handler: ");
            console.log(data);
            messages.textContent += `Remote: ${data}\n`;
        });

        connection.once('close', () => {
            messages.textContent += `=== DataConnection has been closed ===\n`;
            sendTrigger.removeEventListener('click', onClickSend);
            leftTrigger.removeEventListener('click', onClickLeft);
            rightTrigger.removeEventListener('click', onClickRight);
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

        // Movement buttons
        function onClickLeft() {
            const data = 'left';
            console.log(data);
            connection.send(data);
            messages.textContent += `You: ${data}\n`;
        }

        function onClickRight() {
            const data = 'right';
            console.log(data);
            connection.send(data);
            messages.textContent += `You: ${data}\n`;
        }
    });

    function setupGetUserMedia() {
        let audioSource = $('#audioSource').val();
        let videoSource = $('#videoSource').val();
        let constraints = {
            audio: {deviceId: {exact: audioSource}},
            video: {deviceId: {exact: videoSource}}
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
        videoDom.style.transform = "rotate(90deg)";
        videoDom.get(0).srcObject = stream;
        $('#videosContainer').append(videoDom);
    }

    function addVideoMuted(stream) {
        const videoDom = $('<video autoplay muted="true">');
        videoDom.attr('id', stream.peerId);
        videoDom.get(0).srcObject = stream;
        $('#videosContainer').append(videoDom);
    }

    function removeVideo(peerId) {
        $('#' + peerId).remove();
    }
    
    function removeAllRemoteVideos() {
        $('#videosContainer').empty();
        // This brings back the muted localStream
        addVideoMuted(localStream);
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