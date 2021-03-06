import firebase from 'firebase/app';

//adds a friend request to the db and calls functions to assign friend request to sender and recipient
const sendFriendRequest = function(userID, recipientID) {
    return this.db.ref(`friendRequestPairs/${userID}/${recipientID}`)
    .once('value')
    .then(snapshot => {
        if (snapshot.exists()) {
            console.log('No request sent: You cannot send a friend request to someone you have already requested or been requested by.');
            return false;
        } else {
            return this.db.ref(`friends/${userID}/${recipientID}`)
            .once('value')
            .then(snapshot => {
                if (snapshot.exists()) {
                    console.log('No request sent: You cannot send a friend request to someone you are already friends with.');
                    return false;
                } else {
                    const newRequestID = this.db.ref().child(`friendRequests/`).push().key;
                    this.friendRequestToOwners(userID, recipientID, newRequestID);
                    this.friendRequestToPair(userID, recipientID);
                    this.db.ref(`friendRequests/${newRequestID}`)
                    .set({
                        id: newRequestID,
                        sender: userID,
                        recipient: recipientID,
                        answered: false,
                        accepted: false,
                    });
                    console.log('Friend Request Sent');
                    return true;
                }
            });
        }
    });
};

const friendRequestToPair = function(ownerID, recipientID) {
    this.db.ref(`friendRequestPairs/${ownerID}/${recipientID}`).set(true);
    this.db.ref(`friendRequestPairs/${recipientID}/${ownerID}`).set(true);
};

//sets the given friend request id to the sender of the request
const friendRequestToOwners = function(ownerID, recipientID, friendRequestID) {
    this.db.ref(`friendRequestOwners/${ownerID}/sent/${friendRequestID}`).set(true);
    this.db.ref(`friendRequestOwners/${recipientID}/received/${friendRequestID}`).set(true);
};

//grabs and sets friend information to state by user id
const getFriendRequests = function(userID) {
    this.db.ref(`friendRequestOwners/${userID}/received`)
    .once('value')
    .then(snapshot => {
        if (snapshot.exists()) {
            let friendRequests = Object.keys(snapshot.val());
            this.setState({
                friendRequests: friendRequests
            });
            return friendRequests;
        } else {
            throw 'No friend requests found for this user ID'
        }
    }).then(friendRequests => {
        const funcs = friendRequests.map(request => this.friendRequestsToInfo(request));
        Promise.all(funcs).then(results => {
            results = results.filter(n => n);
            this.setState({
                friendRequestsInfo: results
            });
        });
    }).catch(reason => {
        console.log(reason);
    });
};

//returns a promise containing the information of a friend request by friend request id
const friendRequestsToInfo = function(friendRequestID) {
    let friendRequest = null;
    return this.db.ref(`friendRequests/${friendRequestID}`)
    .once('value')
    .then(snapshot => {
        if (snapshot.exists()) {
            friendRequest = snapshot.val();
            if (friendRequest.answered === false) {
                this.getUsername(friendRequest.sender).then(username => {
                    friendRequest.senderUsername = username;
                });
                this.getUsername(friendRequest.recipient).then(username => {
                    friendRequest.recipientUsername = username;
                });
            } else {
                friendRequest = null;
            }
        }
    }).then(() => {
        return friendRequest;
    }).catch(reason => {
        console.log(reason);
    });
};

//accept a friend request and set according information on friend request and start a friend with relevant information
const acceptFriendRequest = function(friendRequestID, userID, senderID) {
    this.db.ref(`friendRequests/${friendRequestID}`)
    .set({
        answered: true,
        accepted: true,
    });

    this.addFriend(userID, senderID);
};

//reject a friend request and set according information on friend request 
const rejectFriendRequest = function(friendRequestID, userID, senderID) {
    this.db.ref(`friendRequests/${friendRequestID}`)
    .set({
        answered: true,
        accepted: false,
    });
};

export {
    sendFriendRequest,
    friendRequestToPair,
    friendRequestToOwners,
    getFriendRequests,
    friendRequestsToInfo,
    acceptFriendRequest,
    rejectFriendRequest,
};