export default class EnvSettings {
    public static SCREEN_W = 1400;
    public static FPS = 60;
    public static ga = -9.81*EnvSettings.FPS*5; //gravity
    public static af:number = 0.1*EnvSettings.FPS; // air friction
}
