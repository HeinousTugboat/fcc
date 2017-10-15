
// User Story: I can see whether Free Code Camp is currently streaming on Twitch.tv.
// User Story: I can click the status output and be sent directly to the Free
//      Code Camp's Twitch.tv channel.
// User Story: if a Twitch user is currently streaming, I can see additional
//      details about what they are streaming.

// https://wind-bow.gomix.me/twitch-api

const urlBase = 'https://wind-bow.glitch.me/twitch-api/';
enum points { USERS = 'users/', CHANNELS = 'channels/', STREAMS = 'streams/' };
const exampleUsers = ["ESL_SC2", "OgamingSC2", "cretetion", "freecodecamp", "storbeck", "habathcx", "RobotCaleb", "noobs2ninjas"];

class Channel {
    static list: Channel[] = [];
    static container: HTMLUListElement | null;
    static template: HTMLTemplateElement | null;
    private logoUrl: string = 'http://placehold.it/50x50';
    private displayName: string;
    private status: string;
    private game: string;
    private online: boolean = false;
    private stream: any;
    private element: HTMLLIElement;
    constructor(public userName: string) {
        Channel.list.push(this);
        this.getData().then(() => this.build())
            .then(() => console.log(this))
            .catch(err => console.error(err));
    }
    build() {
        if (Channel.template === null) {
            throw new Error('No template found!');
        }
        if (Channel.container === null) {
            throw new Error('No UL element found!');
        }
        let logo: HTMLImageElement;
        let name: HTMLElement;
        let game: HTMLElement;
        let status: HTMLElement;

        this.element = Channel.template.content.querySelector('li') as HTMLLIElement;
        logo = this.element.querySelector('.logo') as HTMLImageElement;
        name = this.element.querySelector('.name') as HTMLElement;
        game = this.element.querySelector('.game') as HTMLElement;
        status = this.element.querySelector('.status') as HTMLElement;

        if (this.online) {
            this.element.classList.add('online');
            this.element.classList.remove('offline');
        } else {
            this.element.classList.remove('online');
            this.element.classList.add('offline');
        }

        logo.src = this.logoUrl;
        name.innerText = this.displayName;
        game.innerText = this.game;
        status.innerText = this.status;

        const clone = document.importNode(this.element, true);
        Channel.container.appendChild(clone);

    }
    getData() {
        let channelData: Promise<any> = fetch(urlBase + points.CHANNELS + this.userName)
            .then(res => res.json())
            .then((res: any) => {
                this.logoUrl = res.logo || this.logoUrl;
                this.displayName = res.display_name;
                this.status = res.status;
                this.game = res.game;
                console.log(res);
            }).catch(err => console.log(err));
        let streamData: Promise<any> = fetch(urlBase + points.STREAMS + this.userName)
            .then(res => res.json())
            .then((res: any) => {
                if (res.stream) {
                    this.online = true;
                    this.stream = res.stream;
                }
                console.log(res);
            }).catch(err => console.log(err));
        return Promise.all([channelData, streamData]);
    }
}

Channel.template = document.getElementById('channel-template') as HTMLTemplateElement;
Channel.container = document.getElementById('items') as HTMLUListElement;
exampleUsers.forEach(user => new Channel(user));
// let fcc = new Channel('freecodecamp');

////////////////////////////////////////////////////////////////////////////////////////////////////
// fetch(urlBase+'users/freecodecamp').then(res=>res.json()).then(x=>console.log(x))
function getData(point: points, name: string) {
    return fetch(urlBase + point + name)
        .then(res => res.json());
}
const userData: any[] = [];
const channelData: any[] = [];
const streamData: any[] = [];
exampleUsers.map(user => {
    getData(points.USERS, user).then(res => userData.push(res));
    getData(points.CHANNELS, user).then(res => channelData.push(res));
    getData(points.STREAMS, user).then(res => streamData.push(res));
});
// getData(points.USERS, 'freecodecamp')
//     .then(res => console.log(res))
//     .catch(err => console.log(err));
