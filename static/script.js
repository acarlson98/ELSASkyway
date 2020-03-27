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

    // peer.on('open', function () {
    //     $('#my-id').text(peer.id);
    // });

    // When host button is clicked
    $('#host').click(function () {
        $('#host').hide();
        $('#hostLink').show();
        $('#my-id').text(peer.id);

        // var xhttp = new XMLHttpRequest();
        // xhttp.onreadystatechange = function() {
        //     console.log('OnReadyState Entered');
        //     if (this.readyState == 4 && this.status == 200) {
        //         console.log('If Statement Entered');
        //         console.log(this.responseText);
        //     }
        // };
        // xhttp.open("GET", "https://elsa.unoteam5.com", true);
        // xhttp.send();

        // var socket = io.connect("/socket.io/socket.io.js");
        // socket.on("news", function(data){
        //     console.log(data);
        //     socket.emit('my other event', { my: 'data' });
        // });

        $('#join-room').val(peer.id);

        
        // Send LINE message with room URL
        // var data = {
        //     "Content-Type" : "application/json",
        //     "Authorization" : "Bearer rK1l5F+em4UBIwIx5ZooYIgpaesvVO4KdCRol150ecy4O6wIFwV3q0Ds2xV3GXj95Kcb/eu+sNX3nRcO+cFll0hMXbL1aDw9f8zWS1UeskkqY+YxcdZb+YosmS81zlCuEW1S60GfRLd+J0bH4js10wdB04t89/1O/w1cDnyilFU=",
        //     "to" : "",
        //     "messages" : 
        //         {
        //             "type" : "text",
        //             "text" : "Test Message"
        //         }
        //     };
        // $.post('https://api.line.me/v2/bot/message/push', data, function(data, status){
        //     console.log(`${data} and status is ${status}`);
        // });
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
        });

        connection.on('data', data => {
            console.log("Self Handler: ");
            console.log(data);
            if(data == "up"){
                up();
                messages.textContent += `Movement Remote: ${data}\n`;
            } else if (data == "down"){
                down();
                messages.textContent += `Movement Remote: ${data}\n`;
            } else if(data == "left"){
                left();
                messages.textContent += `Movement Remote: ${data}\n`;
            } else if (data == "right"){
                right();
                messages.textContent += `Movement Remote: ${data}\n`;
            }
            else{
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

    $('#end-call').click(function () {
        existingCall.close();
    });

    $('#headup').click(function () {
        console.log("up");
        // dataConn.send("up");
    });

    $('#headdown').click(function () {
        console.log("down");
        // dataConn.send("down");
    });

    $('#headleft').click(function () {
        console.log("left");
        // dataConn.send("left");
    });

    $('#headright').click(function () {
        console.log("right");
        // dataConn.send("right");
    });

    peer.on('open', function () {
        console.log('open: ' + peer.id);
        console.log('from URL: ' + URLroom);
        $('#join-room').val(URLroom);
    });

    // needed?
    // peer.once('open', id => (localId.textContent = id));

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
            if(data == "up"){
                up();
                messages.textContent += `Movement Remote: ${data}\n`;
            } else if (data == "down"){
                down();
                messages.textContent += `Movement Remote: ${data}\n`;
            } else if(data == "left"){
                left();
                messages.textContent += `Movement Remote: ${data}\n`;
            } else if (data == "right"){
                right();
                messages.textContent += `Movement Remote: ${data}\n`;
            }
            else{
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
        videoDom.get(0).srcObject = stream;
        $('#videosContainer').append(videoDom);
    }

    function removeVideo(peerId) {
        $('#' + peerId).remove();
    }

    // This removes all videos
    // TODO: Make it only remove the remote videos?
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