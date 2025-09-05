// 清除 #
export function removeExternalHash(str: string) {
    return str.replace(/#/g, function (match, offset, fullString) {
        // 检查 # 是否在标签内
        let before = fullString.substring(0, offset);
        let after = fullString.substring(offset);

        // 检查是否在属性中（在 < 和 > 之间）
        if (/<[^>]*$/.test(before) && />/.test(after)) {
            return match; // 在标签内，保留
        }

        // 检查是否在内容中（在 > 和 < 之间）
        const lastOpen = before.lastIndexOf('>');
        const lastClose = before.lastIndexOf('<');
        if (lastOpen > lastClose && after.indexOf('<') !== -1) {
            return match; // 在标签内容中，保留
        }

        return ''; // 在标签外，删除
    });
}

