import firebase from 'firebase/app';

//grabs and sets to state the friends list of a user by id
const getFriends = function(userID) {
    this.db.ref(`friends/${userID}`)
    .once('value')
    .then(snapshot => {
        if (snapshot.exists()) {
            let friends = Object.keys(snapshot.val());
            this.setState({
                friends: friends
            });
            return friends;
        } else {
            throw 'No friends found';
        }
    }).then(friends => {
        const funcs = friends.map(friend => this.friendToInfo(friend));
        Promise.all(funcs).then(friendsInfo => {
            this.setState({
                friendsInfo: friendsInfo
            });
        });
    }).catch(reason => {
        console.log(reason);
    });
};

//Grabs and returns user information by id
const friendToInfo = function(userID) {
    return this.db.ref(`users/${userID}`)
    .once('value')
    .then(snapshot => {
        if (snapshot.exists()) {
            let info = snapshot.val();
            info.uid = userID;

            this.getNumberOfStreaks(userID).then(result => {
                info.totalStreaks = result;
            });

            this.getNumberOfFriends(userID).then(result => {
                info.totalFriends = result;
            });
            return info;
        } else {
            throw 'Friend to Info: No user found';
        }
    }).catch(reason => {
        console.log(reason);
    });
};

//adds a friend to a users friends list
const addFriend = function(userID, friendID) {
    if (userID !== friendID) {
        this.db.ref(`friends/${userID}/${friendID}`).set(true);
        this.db.ref(`friends/${friendID}/${userID}`).set(true);
        this.getFriends(userID);
    } else {
        console.log('No friend added: You cannot add yourself as a friend.')
    }
};

const removeFriend = function(userID, friendID) {
    return this.db.ref(`streakOwners/${userID}`)
    .once('value')
    .then(snapshot => {
        if (snapshot.exists()) {
            let streaks = snapshot.val();
            Object.keys(streaks).map(streak => {
                this.db.ref(`streaks/${streak}`)
                .once('value')
                .then(snapshot => {
                    if (snapshot.exists()) {
                        let streakInfo = snapshot.val();
                        if (streakInfo.currentOwner === friendID || streakInfo.nextOwner === friendID) {
                            this.db.ref(`streaks/${streak}`).remove();
                            this.db.ref(`friends/${userID}/${friendID}`).remove();
                            this.db.ref(`friends/${friendID}/${userID}`).remove();
                            this.getFriends();
                            this.getStreaks();
                            return true;
                        }
                    } else {
                        throw '';
                    }
                }).catch(reason => {
                    console.log(reason);
                    return false;
                });
            });
        } else {
            throw '';
        }
    }).catch(reason => {
        console.log(reason);
        return false;
    });
};

//searches and returns a promise containing the user information by username
const searchUsers = function(username, userID) {
    return this.db.ref('users')
    .orderByChild('username')
    .equalTo(username)
    .once('value')
    .then(snapshot => {
        if (snapshot.exists()) {
            let result = {};
            let data = snapshot.val();
            let recipientID = Object.keys(data)[0];
             if (recipientID === userID) {
                result.self = true;
                result.addable = false;
            } else {
                result.self = false;
            }
            result.uid = recipientID;
            let innerData = snapshot.child(`${recipientID}`).val();
            result.first = innerData.first;
            result.last = innerData.last

            return this.db.ref(`friendRequestPairs/${userID}/${recipientID}`)
            .once('value')
            .then(snapshot => {
                if (snapshot.exists()) {
                    result.addable = false;
                    console.log('User cannot be added: Friend request has been made');
                    return result;
                } else {
                    return this.db.ref(`friends/${userID}/${recipientID}`)
                    .once('value')
                    .then(snapshot => {
                        if (snapshot.exists()) {
                            result.addable = false;
                            console.log('User cannot be added: Already friends');
                            return result;
                        } else {
                            result.addable = true;
                            return result;
                        }
                    });
                }
            });
        } else {
            console.log('User cannot be added: No user found for given username');
            return {};
        }
    });
};

export {
    getFriends,
    friendToInfo,
    addFriend,
    removeFriend,
    searchUsers,
};