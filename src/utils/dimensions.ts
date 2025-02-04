
export const isSM = () => {
    const width = window.innerWidth;
    return (width < 640);
}

export const isMD = () => {
    const width = window.innerWidth;
    return (width < 1024);
}
