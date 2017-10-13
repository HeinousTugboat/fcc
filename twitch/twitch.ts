
// User Story: I can see whether Free Code Camp is currently streaming on Twitch.tv.
// User Story: I can click the status output and be sent directly to the Free
//      Code Camp's Twitch.tv channel.
// User Story: if a Twitch user is currently streaming, I can see additional
//      details about what they are streaming.

// https://wind-bow.gomix.me/twitch-api

const urlBase = 'https://wind-bow.glitch.me/twitch-api/';
enum points { USERS = 'users/', CHANNELS = 'channels/', STREAMS = 'streams/'};
const exampleUsers = ["ESL_SC2", "OgamingSC2", "cretetion", "freecodecamp", "storbeck", "habathcx", "RobotCaleb", "noobs2ninjas"];

// fetch(urlBase+'users/freecodecamp').then(res=>res.json()).then(x=>console.log(x))

function getData(point: points, name: string) {
    return fetch(urlBase + point + name)
        .then(res => res.json());
    }
const userData: any[] = [];
const channelData: any[] = [];
const streamData: any[] = [];
exampleUsers.map(user => {
    getData(points.USERS, user).then(res=>userData.push(res));
    getData(points.CHANNELS, user).then(res=>channelData.push(res));
    getData(points.STREAMS, user).then(res=>streamData.push(res));
});
// getData(points.USERS, 'freecodecamp')
//     .then(res => console.log(res))
//     .catch(err => console.log(err));
