import emotes from "#bot/configs/emoji.config.js";

export function getEmoji(name) {
     return emotes[name] ?? "";
}
