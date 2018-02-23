import firebase from 'firebase/app';

//adds a streak request to the db and calls functions to assign streak request to sender and recipient
const sendStreakRequest = function(userID, recipientID) {
    if (userID !== recipientID) {
        const newRequestID = this.db.ref().child(`streakRequests/`).push().key;
        this.streakRequestToSender(userID, newRequestID);
        this.streakRequestToRecipient(recipientID, newRequestID);
        this.db.ref(`streakRequests/${newRequestID}`)
        .set({
            id: newRequestID,
            sender: userID,
            recipient: recipientID,
            answered: false,
            accepted: false,
        });
    } else {
        console.log('No request sent: You cannot send a streak request to yourself.');
    }
};

//sets the given streak request id to the sender of the request
const streakRequestToSender = function(ownerID, streakRequestID) {
    this.db.ref(`streakRequestOwners/${ownerID}/sent/${streakRequestID}`).set(true);
};

//sets the given streak request id to the recipient of the request
const streakRequestToRecipient = function(recipientID, streakRequestID) {
    this.db.ref(`streakRequestOwners/${recipientID}/received/${streakRequestID}`).set(true);
};

//grabs and sets streak information to state by user id
const getStreakRequests = function(userID) {
    this.db.ref(`streakRequestOwners/${userID}/received`)
    .once('value')
    .then(snapshot => {
        if (snapshot.exists()) {
            let streakRequests = Object.keys(snapshot.val());
            this.setState({
                streakRequests: streakRequests
            });
            return streakRequests;
        } else {
            throw 'No streak requests found for this user ID'
        }
    }).then(streakRequests => {
        const funcs = streakRequests.map(request => this.streakRequestToInfo(request));
        Promise.all(funcs).then(results => {
            results = results.filter(n => n);
            this.setState({
                streakRequestsInfo: results
            });
        });
    }).catch(reason => {
        console.log(reason);
    });
};

//returns a promise containing the information of a streak request by streak request id
const streakRequestToInfo = function(streakRequestID) {
    let streakRequest = null;
    return this.db.ref(`streakRequests/${streakRequestID}`)
    .once('value')
    .then(snapshot => {
        if (snapshot.exists()) {
            streakRequest = snapshot.val();
            if (streakRequest.answered === false) {
                this.getUsername(streakRequest.sender).then(username => {
                    streakRequest.senderUsername = username;
                });
                this.getUsername(streakRequest.recipient).then(username => {
                    streakRequest.recipientUsername = username;
                });
            } else {
                streakRequest = null;
            }
        }
    }).then(() => {
        return streakRequest;
    }).catch(reason => {
        console.log(reason);
    });
};

//accept a streak request and set according information on streak request and start a streak with relevant information
const acceptStreakRequest = function(streakRequestID, userID, senderID) {
    this.db.ref(`streakRequests/${streakRequestID}`)
    .set({
        answered: true,
        accepted: true,
    });

    this.startStreak(userID, senderID);
};

//reject a streak request and set according information on streak request 
const rejectStreakRequest = function(streakRequestID, userID, senderID) {
    this.db.ref(`streakRequests/${streakRequestID}`)
    .set({
        answered: true,
        accepted: false,
    });
};

export {
    sendStreakRequest,
    streakRequestToSender,
    streakRequestToRecipient,
    getStreakRequests,
    streakRequestToInfo,
    acceptStreakRequest,
    rejectStreakRequest,
};