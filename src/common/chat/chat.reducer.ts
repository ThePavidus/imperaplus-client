import { makeImmutable, IImmutable } from "immuts";
import reducerMap from "../../lib/reducerMap";
import { IAction, success, pending, failed } from "../../lib/action";
import {
    START, IStartPayload, SHOW_HIDE, SWITCH_CHANNEL, MESSAGE, RECEIVE_MESSAGE, CLOSE, JOIN, LEAVE,
    IUserChangePayload
} from "./chat.actions";
import { ChannelInformation, Message } from "../../external/chatModel";

const initialState = makeImmutable({
    isVisible: false,
    isActive: false,
    activeChannelId: null as string,
    channels: [] as ChannelInformation[],
    unreadCount: null as number
});

export type IChatState = typeof initialState;

const showHide = (state: IChatState, action: IAction<boolean>) => {
    const isVisible = action.payload;
    return state.merge(x => x, {
        isVisible: isVisible,
        unreadCount: null as number
    });
};

const close = (state: IChatState, action: IAction<void>) => {
    return initialState;
};

const switchChannel = (state: IChatState, action: IAction<string>) => {
    return state.set(x => x.activeChannelId, action.payload);
};

const start = (state: IChatState, action: IAction<IStartPayload>) => {
    return state.merge(x => x, {
        isActive: true,
        channels: action.payload.channels,
        activeChannelId: action.payload.channels && action.payload.channels.length && action.payload.channels[0].identifier
    });
};

const receiveMessage = (state: IChatState, action: IAction<Message>) => {
    const message = action.payload;

    const channels = state.data.channels;
    let matchingChannels = channels.filter((c: ChannelInformation) => c.identifier === message.channelIdentifier);
    if (!matchingChannels.length) {
        return;
    }

    const matchingChannel = matchingChannels[0];
    const idx = state.data.channels.indexOf(matchingChannel);

    return state.merge(x => x.channels[idx], {
        messages: matchingChannel.messages.concat([message])
    }).set(x => x.unreadCount, !state.data.isVisible ? (state.data.unreadCount || 0) + 1 : null);
};

const join = (state: IChatState, action: IAction<IUserChangePayload>) => {
    const channelIdx = getChannelIdxById(state.data.channels, action.payload.channelId);
    const channel = state.data.channels[channelIdx];

    return state.merge(x => x.channels[channelIdx], {
        users: channel.users.concat([{
            name: action.payload.userName,
            type: 0
        }])
    });
};

const leave = (state: IChatState, action: IAction<IUserChangePayload>) => {
    const channelIdx = getChannelIdxById(state.data.channels, action.payload.channelId);
    const channel = state.data.channels[channelIdx];

    return state.merge(x => x.channels[channelIdx], {
        users: channel.users.filter(u => u.name !== action.payload.userName)
    });
};

export const chat = <TPayload>(
    state = initialState,
    action?: IAction<TPayload>) => {

    return reducerMap(action, state, {
        [SHOW_HIDE]: showHide,
        [CLOSE]: close,
        [SWITCH_CHANNEL]: switchChannel,
        [START]: start,
        [RECEIVE_MESSAGE]: receiveMessage,
        [JOIN]: join,
        [LEAVE]: leave
    });
};

function getChannelIdxById(channels: ChannelInformation[], channelId: string): number {    
    let matchingChannels = channels.filter((c: ChannelInformation) => c.identifier === channelId);
    if (!matchingChannels.length) {
        throw new Error("No matching channel found");
    }

    const matchingChannel = matchingChannels[0];
    return channels.indexOf(matchingChannel);
}