export default async function (ctx, otherwise) {
    if (ctx?.callbackQuery?.data === "back_callback" || ctx?.callbackQuery?.data === "main_menu") {
        return;
    }
    if (["/start"].includes(ctx?.message?.text ?? "")) {
        return;
    }

    return await otherwise();
}