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

//Grab and returns just the username of a user by id
const getUsername = function(userID) {
    return this.db.ref(`users/${userID}`)
    .once('value')
    .then(snapshot => {
        if (snapshot.exists()) {
            return snapshot.val().username;
        } else {
            throw 'Get Username: No user found';
        }
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
        const stringID = friendID.toString();
        //add functionality to check that friend isn't already a friend
        this.state.friends.map((friend, index) => {
            this.db.ref(`friends/${userID}/${stringID}`).set(true);
        });
        let friends = this.state.friends.slice();
        friends.push(friendID);
        this.setState({ //set state to reflect updated friends list
            friends: friends
        });
        this.getFriends(userID);
    } else {
        console.log('No friend added: You cannot add yourself as a friend.')
    }
};

export {
    getFriends,
    getUsername,
    friendToInfo,
    addFriend
};