$(function () {

    //edit the profile (username, picture) (email and password could be added in the future)
    $("#editProfileButton").on('click', function () {

        // CONSTANTS -----------------------------------
        const editButton = $(this);
        const usernameField = $("#username");
        const selectFile = $("#fileChooser");
        // ---------------------------------------------

        if (editButton.text() === "Profil bearbeiten") {
            const usernameText = usernameField.text();

            // change usernameField into an inputField
            const usernameInputField = "<input style='font-size: 25px; border: 2px black solid' name=\"new_username\" value=\"" + usernameText + "\">"; //hier nutze ich den style tag nur, weil er aus dem css sheet irgendwie nicht geladen wurde
            usernameField.html(usernameInputField);

            // display field to change profile-picture
            const selectFileButton = "<input style='font-size: 18px' id=\"file-upload\" type=\"file\" accept=\"image/jpeg\" />"
            selectFile.html(selectFileButton);
            $("#file-upload").on('change', function () {
                readURL(this);
            });

            editButton.text("Speichern");

        } else if (editButton.text() === "Speichern") {

            const newUsername = document.forms["userForm"]["new_username"].value;
            if (newUsername === "") {
                alert("Your Username should not be empty");
            } else {
                editButton.text("Profil bearbeiten");
                usernameField.html(newUsername);
                //updateUsernameInDatabaseAndSession(newUsername);
                selectFile.html("");

                updateUsernameInDatabaseAndSession(newUsername);
            }
        }
    });

    //function to upload pictures
    async function readURL(input) {
        if (input.files && input.files[0]) {
            const file = input.files[0];
            const fileType = file['type'];
            const validImageTypes = ['image/jpeg'];
            if (!validImageTypes.includes(fileType)) {
                alert("you can only choose jpegs")
            } else {
                const reader = new FileReader();
                reader.onload = async function (e) {
                    await uploadProfilePictureIntoDB(e.target.result);
                    $('#profile-picture').attr('src', e.target.result);

                }
                reader.readAsDataURL(file);//Actually change the picture
            }
        }
    }
});

function setup() {
    setupButtonOnclicksAndInputs();  //Buttons funktional machen

    getUsernameFromDatabase();
    getGesamtpunkteFromDatabase();
    getHighscoreFromDatabase();
    getMailFromDatabase();
    getTierFromDatabase();
    getProfilePicFromDatabase();
    getFriendsData();
}

function setupButtonOnclicksAndInputs() {
    document.getElementById("chatWithWhoButton").onclick = function () { //onclick f??r Chat mit Freund input (Wem willst du schreiben?)
        setupChatStuff(document.getElementById("chatWithWhoInput").value)
    };
    document.getElementById("sendMessageButton").onclick = function () { //onclick f??r Chat sendMessage
        let currentDate = new Date();
        sendMessage(document.getElementById("sendMessageInput").value, currentDate.getTime());
    };
    //Enter-Funktionalit??t
    document.getElementById("sendMessageInput").addEventListener("keyup", function (event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.code === 'Enter') {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            document.getElementById("sendMessageButton").click();
        }
    });
    //Enter-Funktionalit??t
    document.getElementById("chatWithWhoInput").addEventListener("keyup", function (event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.code === 'Enter') {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            document.getElementById("chatWithWhoButton").click();
        }
    });
    //Enter-Funktionalit??t
    document.getElementById("addFriendInput").addEventListener("keyup", function (event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.code === 'Enter') {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            document.getElementById("addFriendButton").click();
        }
    });
}

//TODO update username und profilepic zusammenlegen

// Sends a request to update the username in the session
function updateUsernameInDatabaseAndSession(newUsername) {
    fetch("/profile/updateUsername", {
            method: 'POST',
            body: JSON.stringify({username: newUsername}),
            headers: {'Content-Type': 'application/json'},
            credentials: 'include'
        }
    ).then(
        result => result.text()
    ).then(data => {
            let msg = data.toString();
            console.log(msg);
        }
    );
}

async function uploadProfilePictureIntoDB(image) {
    fetch('/profile/uploadProfilePicture',
        {
            method: 'POST',
            body: JSON.stringify({img: image}),
            headers: {'Content-Type': 'application/json'},
            credentials: 'include'
        }
    ).then(
        result => result.text()
    )
}

// Reads username from Database and updates html
function getUsernameFromDatabase() {
    $.get("/getUsername", function (data, status) {
        document.getElementById("username").textContent = data
    }).fail(function (data, status) {
        document.getElementById("username").textContent = "Default Name";
        alert("Couldn't retrieve username from database");
    });
}

//TODO hier evtl "getMail" route nutzen
function getMailFromDatabase() {
    $.get("/profile/getMail", function (data, status) {
        document.getElementById("mail").textContent = "Email: " + data
    }).fail(function (data, status) {
        document.getElementById("mail").textContent = "Default Mail";
        alert("Couldn't retrieve mail from database");
    });
}

function getGesamtpunkteFromDatabase() {
    $.get("/profile/getTotalPoints", function (data, status) {
        document.getElementById("gesamtpunkte").textContent = "Gesamtpunkte: " + data
    }).fail(function (data, status) {
        document.getElementById("gesamtpunkte").textContent = "Default Gesamtpunkte";
        alert("Couldn't retrieve gesamtpunkte from database");
    });
}

function getHighscoreFromDatabase() {
    $.get("/profile/getHighScore", function (data, status) {
        document.getElementById("highscore").textContent = "Highscore: " + data
    }).fail(function (data, status) {
        document.getElementById("highscore").textContent = "Default Highscore";
        alert("Couldn't retrieve highscore from database");
    });
}

function getTierFromDatabase() {
    $.get("/profile/getTierName", function (data, status) {
        document.getElementById("tier").textContent = "Rang: " + data
    }).fail(function (data, status) {
        document.getElementById("highscore").textContent = "Default Tier";
        alert("Couldn't retrieve tier from database");
    });
}

function getProfilePicFromDatabase() {
    $.get("/profile/getProfilePic", function (data, status) {
        if (data != null) {
            document.getElementById("profile-picture").setAttribute("src", data)
        } else document.getElementById("profile-picture").setAttribute("src", "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png");
    }).fail(function (data, status) {
        alert("Couldn't retrieve Profile Picture from database");
    });
}

//onclick-function von friend aus friendlist (functions_friendlist.js)
function setupInformationFromFriend(elm) {
    if (document.getElementById("editProfileButton").innerText === "Speichern") {  //gegen seltenen Bug: w??hrend dem Editieren des Profiles das Profil eines Freundes anschauen
        alert("Bitte erst Profil speichern!")
    } else if (!viewOnly) {        //Funktion wird nur ausgef??hrt, wenn man auf dem eigenen Profil ist
        const name = elm.childNodes[1].innerHTML;  //childnodes[1] gibt das "name" child von friend

        friendGetUsernameFromDatabase(name);
        friendGetGesamtpunkteFromDatabase(name);
        friendGetHighscoreFromDatabase(name);
        friendGetMailFromDatabase(name);
        friendGetTierFromDatabase(name);
        friendGetProfilePicFromDatabase(name);


        deleteOldFriendList();          //Liste wird gel??scht, damit nur neue angezeigt wird
        friendGetFriendsData(name);

        hideSensibleStuff();

        document.getElementById("backToMyProfileButton").style.display = "block";  //Zur??ck Button visible
        document.getElementById("chat_heading").textContent = "Chat"; //Chat-??berschrift neutral machen

        viewOnly = true;                //in functions_friendlist.js wird der Freundeslisten hoverEffect und onclick nicht mehr ausgef??hrt (diese Funktion auch nicht)
    }
}

function backToMyProfile() {
    deleteOldFriendList();          //FreundesListe wird gel??scht, damit nur die vom logged in user angezeigt werden

    setup();

    showSensibleStuff();

    viewOnly = false;
}

function hideSensibleStuff() {
    document.getElementById("editProfileButton").style.display = "none";       //Edit-Profile-Knopf hidden
    document.getElementById("addFriendInputLabel").style.display = "none";          //Freund hinzuf??gen Label hidden
    document.getElementById("addFriendInput").style.display = "none";          //Freund hinzuf??gen Searchbar hidden
    document.getElementById("addFriendButton").style.display = "none";          //Freund hinzuf??gen Button hidden
    //chatStuff hiden
    document.getElementById("chatWithWhoInputLabel").style.display = "none";
    document.getElementById("chatWithWhoInput").style.display = "none";
    document.getElementById("chatWithWhoButton").style.display = "none";
    document.getElementById("sendMessageInput").style.display = "none";
    document.getElementById("sendMessageButton").style.display = "none";
    document.getElementById("chatMessages_div").style.display = "none"; //alles Messages hiden
}

function showSensibleStuff() {
    document.getElementById("editProfileButton").style.display = "block";       //Edit-Profile-Knopf zeigen
    document.getElementById("addFriendInputLabel").style.display = "inline";           //Freund hinzuf??gen Label zeigen
    document.getElementById("addFriendInput").style.display = "inline";          //Freund hinzuf??gen Searchbar zeigen
    document.getElementById("addFriendButton").style.display = "inline";         //Freund hinzuf??gen Button zeigen
    document.getElementById("backToMyProfileButton").style.display = "none";  //Zur??ck Button verstecken
    //chatStuff zeigen
    document.getElementById("chatWithWhoInputLabel").style.display = "inline";
    document.getElementById("chatWithWhoInput").style.display = "inline";
    document.getElementById("chatWithWhoButton").style.display = "inline";
    if (chatPartner !== undefined) {
        document.getElementById("sendMessageInput").style.display = "inline";
        document.getElementById("sendMessageButton").style.display = "inline";
        document.getElementById("chat_heading").textContent = "Chat mit " + chatPartner.toString().toUpperCase();  //??berschrift mit Username2
    }
    document.getElementById("chatMessages_div").style.display = "block"; //alles Messages zeigen
}

//l??scht Freundesliste um nur Freundesliste des Freundes zu sehen
function deleteOldFriendList() {
    const friendList = document.getElementsByClassName("friend-list");
    for (let i = 0; i < friendList.length; i++) {
        friendList.item(i).remove();
    }
}


function friendGetUsernameFromDatabase(username) {
    fetch("/friendGetUsername", {
        method: 'POST',
        body: JSON.stringify(username),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include'
    }).then(result => result.text())
        .then(result => document.getElementById("username").textContent = result)
}

function friendGetMailFromDatabase(username) {
    fetch("/profile/friendGetMail", {
        method: 'POST',
        body: JSON.stringify(username),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include'
    }).then(result => result.text())
        .then(result => document.getElementById("mail").textContent = "Email: " + result)
}

function friendGetGesamtpunkteFromDatabase(username) {
    fetch("/profile/friendGetTotalPoints", {
        method: 'POST',
        body: JSON.stringify(username),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include'
    }).then(result => result.text())
        .then(result => document.getElementById("gesamtpunkte").textContent = "Gesamtpunkte: " + result)
}

function friendGetHighscoreFromDatabase(username) {
    fetch("/profile/friendGetHighScore", {
        method: 'POST',
        body: JSON.stringify(username),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include'
    }).then(result => result.text())
        .then(result => document.getElementById("highscore").textContent = "Highscore: " + result)
}

function friendGetTierFromDatabase(username) {
    fetch("/profile/friendGetTierName", {
        method: 'POST',
        body: JSON.stringify(username),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include'
    }).then(result => result.text())
        .then(result => document.getElementById("tier").textContent = "Rang: " + result)
}

function friendGetProfilePicFromDatabase(username) {
    fetch("/profile/friendGetProfilePic", {
        method: 'POST',
        body: JSON.stringify(username),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include'
    }).then(result => result.json())
        .then(result => setFriendsProfilePic(result))
        .catch((error) => {
            alert("Couldn't retrieve Profile Picture from database");
            console.error('Error:', error);
        });
}

function setFriendsProfilePic(result) {
    if (result != null) {
        document.getElementById("profile-picture").setAttribute("src", result)
    } else document.getElementById("profile-picture").setAttribute("src", "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png");
}