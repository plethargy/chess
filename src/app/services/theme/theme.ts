export interface Theme {
    name: string;
    properties: any;
  }
  
  export const light: Theme = {
    name: "light",
    properties: {
      "--main-background": "#fafafa",
      "--main-primary": "#b5b5b5",
      "--main-accent": "#015051",
      "--main-warning": "#ff5733",
      "--main-error": "#c70039",
      "--main-info": "#00adb5",
      "--main-success": "#17b978",
      "--main-font": "rgb(0, 0, 0)",

      "--main-fade-light": "rgba(0, 0, 0, 0.2)",
      "--main-fade-dark": "rgba(0, 0, 0, 0.4)",

      "--component-background": "#ffffff",

      "--chessboard-light": "transparent",
      "--chessboard-dark": "#b5b5b5",
      "--chesspiece-light": "#dcdcdc",
      "--chesspiece-dark": "#000000"

    }
  };
  
  export const dark: Theme = {
    name: "dark",
    properties: {
      "--main-background": "#303030",
      "--main-primary": "#c0c0c0",
      "--main-accent": "#015051",
      "--main-warning": "#ff5733",
      "--main-error": "#c70039",
      "--main-info": "#00adb5",
      "--main-success": "#17b978",    
      "--main-font": "rgb(255, 255, 255)",

      "--main-fade-light": "rgba(255, 255, 255, 0.2)",
      "--main-fade-dark": "rgba(255, 255, 255, 0.4)",   

      "--component-background": "#424242",

      "--chessboard-light": "#c0c0c0",
      "--chessboard-dark": "transparent",
      "--chesspiece-light": "#ffffff",
      "--chesspiece-dark": "#000000"
    }
  };
  