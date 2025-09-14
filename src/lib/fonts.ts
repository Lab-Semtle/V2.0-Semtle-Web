import localFont from 'next/font/local';

export const pretendard = localFont({
    src: '../app/fonts/PretendardVariable.woff2',
    display: 'swap',
    weight: '45 920',
    variable: '--font-pretendard',
});

export const dungGeunMo = localFont({
    src: '../app/fonts/DungGeunMo.woff2',
    display: 'swap',
    variable: '--font-dunggeunmo',
});

export const fontVariables = `${pretendard.variable} ${dungGeunMo.variable}`;
