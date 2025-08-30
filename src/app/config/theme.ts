// tokens.ts —— 纯数据结构，无逻辑
export interface ThemeTokens {

    mainColor: string;
    headerColor: string;
    rightColor: string;


    backgroundImage: string;
    opacity: number;
    textColor: string;
    buttonColor: string;
    buttonTextColor: string;
    buttonHoverColor: string;
    buttonHoverTextColor: string;
    buttonActiveColor: string;
    buttonActiveTextColor: string;
    buttonFontSize: string;
    buttonPadding: string;
    SelectButtonColor: string;
    IconColor: string;


}

export let IMGS = [
    {
        Label: '卡莎',
        value: 'https://pic.netbian.com/uploads/allimg/250804/202713-17543104339b64.jpg'
    },
    // {
    //     Label: '灵笼',
    //     value: "https://pic.netbian.com/uploads/allimg/250809/210515-175474471519c2.jpg"
    // },
    // {
    //     Label: '剑来宁姚',
    //     value: 'https://pic.netbian.com/uploads/allimg/250117/164351-1737103431a32c.jpg'
    // },
    // {
    //     label: '仙逆',
    //     value: 'https://pic.netbian.com/uploads/allimg/250307/161316-174133519641d9.jpg'
    // }
]
/** 默认主题 */
export const defaultTokens: ThemeTokens = {

    // 主色调
    mainColor: '#f5f1e8',
    // 头部颜色
    headerColor: '#EDE4D1',
    // 右侧颜色
    rightColor: '#EDE4D1',

    // 文字颜色 '#fff',
    textColor: '#0a0a0a',

    // '', 背景图片
    backgroundImage: '',//IMGS[Math.floor(Math.random() * IMGS.length)].value,

    // 透明度
    opacity: 0.8,


    buttonColor: '#007bff', // 按钮颜色
    buttonTextColor: '#fff', // 按钮文字颜色
    buttonHoverColor: '#0056b3', // 按钮悬停颜色
    buttonHoverTextColor: '#fff', // 按钮悬停文字颜色
    buttonActiveColor: '#EDE4D1', // 按钮激活颜色
    buttonActiveTextColor: '#0a0a0a', // 按钮激活文字颜色
    buttonFontSize: '16px', // 按钮字体大小
    buttonPadding: '10px 20px', // 按钮内边距
    SelectButtonColor: 'rgba(255, 255, 255,0.4)', // 下拉框按钮颜色
    IconColor: '#0a0a0a', // 图标颜色
};


export const themeToCssVars = (theme: ThemeTokens): string =>
    Object.entries(theme)
        .map(([key, value]) => `--${kebabCase(key)}:${value};`)
        .join('');

/** 驼峰转 kebab-case */
const kebabCase = (str: string) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();