export type Theme = "light" | "dark";

export const THEME_KEY = "debate-buddy:theme";

/** Runs before first paint (inline in <head>) so a saved theme never flashes. */
export const themeInitScript = `try{var t=localStorage.getItem(${JSON.stringify(THEME_KEY)});if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
