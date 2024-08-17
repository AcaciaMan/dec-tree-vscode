export class M_Settings {
  private static instance: M_Settings;

  public obj: { [key: string]: string } = {};

  private constructor() {
    // Initialization code here
  }

  public static getInstance(): M_Settings {
    if (!M_Settings.instance) {
      M_Settings.instance = new M_Settings();
    }
    return M_Settings.instance;
  }

  public addSetting( name: string, value: string ): void {
    this.obj[name] = value;
  }
}
