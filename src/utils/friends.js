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
                console.log('Streaks:' + result);
                info.totalStreaks = result;
            });
            this.getNumberOfFriends(userID).then(result => {
                console.log('Friends:' + result)
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

export {
    getFriends,
    friendToInfo,
    addFriend
};