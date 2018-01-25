var FADE_TIME = 150; // ms
var TYPING_TIMER_LENGTH = 400; // ms
var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
];
var chat = {};
var typing = false;
var lastTypingTime;
var unreadNum = 0;
var usersMsg = "";

function initChat(){
// Initialize variables
    chat.$usernameInput = $('.usernameInput'); // Input for username
    chat.$messages = $('.messages'); // Messages area
    chat.$inputMessage = $('.inputMessage'); // Input message input box
    chat.$loginWrapper = $('.login-wrapper'); // The login page
    chat.$chatWrapper = $('.chat-wrapper'); // The chatroom page
    chat.$welcome = $('.welcome-msg'); // The chatroom page
    chat.$onlineList = $('.ppl'); // The chatroom page
    chat.$unreadNotice = $('.chat_button .button-badge'); // The chatroom page
    chat.$currentInput = chat.$usernameInput.focus();

    chat.$inputMessage.on('input', function() {
        updateTyping();
    });
}


function openChat(){
    modals_open++;
    if(chat.username){
        clearUnreadMsg();
        $(".chat-wrapper").show();
        chat.$inputMessage.focus();
        chat.$inputMessage.select();
    }else{
        $(".login-wrapper").show().css('display', 'flex');
        chat.$usernameInput.focus();
        chat.$usernameInput.select();
    }
}

function hideChat(){
    modals_open--;
}

function updateParticipants(data){
    usersMsg = data.usernames.join(", ");
    addParticipantsMessage(data);
}

function addParticipantsMessage (data) {
    if (data.numUsers === 1) {
        message = "¡Estas solx por ahora!";
    }else{
        message = "Hay " + data.numUsers + " participantes activos: " + usersMsg ;
    }
    chat.$onlineList.text(message);
}

function setUsername () {
    chat.username = cleanInput(chat.$usernameInput.val().trim());
    // If the username is valid
    if (chat.username) {
        chat.$loginWrapper.fadeOut();
        chat.$chatWrapper.show();
        chat.$loginWrapper.off('click');
        chat.$currentInput = chat.$inputMessage.focus();

        socket.emit('add user', chat.username);
        clearUnreadMsg();
    }
}

// Sends a chat message
function sendMessage () {
    var message = chat.$inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message && connected) {
        chat.$inputMessage.val('');
        addChatMessage({
            username: chat.username,
            message: message
        });
        // tell server to execute 'new message' and send along one parameter
        socket.emit('new message', message);
    }
}

// Log a message
function addChatLog (message, options) {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
}

// Adds the visual chat message to the message list
function addChatMessage (data, options) {
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
        options.fade = false;
        $typingMessages.remove();
    }

    var $usernameDiv = $('<span class="username"/>')
        .text(data.username)
        .css('color', getUsernameColor(data.username));
    var $messageBodyDiv = $('<span class="messageBody">')
        .text(data.message);

    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"/>')
        .data('username', data.username)
        .addClass(typingClass)
        .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
}

// Adds the visual chat typing message
function addChatTyping (data) {
    data.typing = true;
    data.message = 'is typing';
    addChatMessage(data);
}

// Removes the visual chat typing message
function removeChatTyping (data) {
    getTypingMessages(data).fadeOut(function () {
        $(this).remove();
    });
}

// Adds a message element to the messages and scrolls to the bottom
// el - The element to add as a message
// options.fade - If the element should fade-in (default = true)
// options.prepend - If the element should prepend
//   all other messages (default = false)
function addMessageElement (el, options) {
    var $el = $(el);

    // Setup default options
    if (!options) {
        options = {};
    }
    if (typeof options.fade === 'undefined') {
        options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
        options.prepend = false;
    }

    // Apply options
    if (options.fade) {
        $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
        chat.$messages.prepend($el);
    } else {
        chat.$messages.append($el);
    }
    chat.$messages[0].scrollTop = chat.$messages[0].scrollHeight;
}

// Prevents input from having injected markup
function cleanInput (input) {
    return $('<div/>').text(input).html();
}

// Updates the typing event
function updateTyping () {
    if (connected) {
        if (!typing) {
            typing = true;
            socket.emit('typing');
        }
        lastTypingTime = (new Date()).getTime();

        setTimeout(function () {
            var typingTimer = (new Date()).getTime();
            var timeDiff = typingTimer - lastTypingTime;
            if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                socket.emit('stop typing');
                typing = false;
            }
        }, TYPING_TIMER_LENGTH);
    }
}

// Gets the 'X is typing' messages of a user
function getTypingMessages (data) {
    return $('.typing.message').filter(function (i) {
        return $(this).data('username') === data.username;
    });
}

// Gets the color of a username through our hash function
function getUsernameColor (username) {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
}

function clearUnreadMsg(){
    unreadNum = 0;
    chat.$unreadNotice.text(unreadNum);
    chat.$unreadNotice.hide();
}

function addUnreadMsg(){
    if(!modals_open){
        unreadNum++;
        chat.$unreadNotice.text(unreadNum);
        chat.$unreadNotice.show();
    }
}


// Click events

// // Focus input when clicking anywhere on login page
// $loginWrapper.click(function () {
//     $currentInput.focus();
// });
//
// // Focus input when clicking on the message input's border
// $inputMessage.click(function () {
//     $inputMessage.focus();
// });
