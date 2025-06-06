import { Events, Message, MessageType } from "discord.js";
import Event from "../../classes/Event";
import DiscordClient from "../../classes/DiscordClient";
import { reactWithEmojiAuto } from "../../../utils/reactWithEmojiAuto";
import { CONFIG } from "../../..";
import Logger from "../../../utils/Logger";

export default class MessageHandler extends Event {
    autoReactChannels: Set<string>;
    // keep track of reply listeners -- map of message IDs to functions
    private listeners: Map<string, (msg: Message) => any>;

    constructor(client: DiscordClient) {
        super(client, {
            name: Events.MessageCreate,
            description: "Message handler event.",
            once: false,
        })
        Logger.once("messageHandler setup", "created message handler.");

        this.listeners = new Map();
        this.client.messageHandler = this;

        this.autoReactChannels = new Set(CONFIG.discord.auto_reaction_channel_ids)
        Logger.once("messageHandler setup", "autoReactChannels: " + [...this.autoReactChannels]);
    }

    async Execute(msg: Message) {

        if (msg.type === MessageType.Reply && this.listeners.has(msg.reference?.messageId || "")) {
            // if there's a listener for this reply, execute it
            this.listeners.get(msg.reference?.messageId || "")?.call(this, msg);

        } else if (!msg.author.bot && this.autoReactChannels.has(msg.channelId.trim())) {
            // finally, try to react to the message
            // ensure the author is not a bot, react if no
            reactWithEmojiAuto(this.client, msg);
        }
    }

    /**
     * add a listener for replies to a message
     * @param msgId the message ID to listen for replies to
     * @param listener the function to execute when a reply is received; return if the listener should be removed
     * @param timeout when to stop listening for replies
     */
    addListener(
        msgId: string,
        listener: (msg: Message) => Promise<boolean> | boolean,
        timeout: number = 43200000, // default 12 hour timeout
    ) {
        this.listeners.set(msgId,
            async (msg: Message) => {
                let remove = await listener(msg);
                if (remove) {
                    this.listeners.delete(msgId);
                }
            }
        );

        setTimeout(() => {
            this.listeners.delete(msgId);
        }, timeout);
    }
}