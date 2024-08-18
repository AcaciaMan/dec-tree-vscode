import { PythonScript } from "../python_message";

export class M_Settings {
  private static instance: M_Settings;

  public sent_obj: { [key: string]: any } = {};
  public obj: { [key: string]: any } = {};
  public pythonScript: PythonScript = new PythonScript();
  public bSent: boolean = true;

  private constructor() {
    // Initialization code here
  }

  public static getInstance(): M_Settings {
    if (!M_Settings.instance) {
      M_Settings.instance = new M_Settings();
    }
    return M_Settings.instance;
  }

  public addSetting( name: string, value: any ): void {
    this.obj[name] = value;
    this.bSent = false;
  }

  // get pythonScript to send only ansent settings
    public getPythonScript(): PythonScript {
        this.pythonScript.imports = [];
        this.pythonScript.declarations = [];
        this.pythonScript.code = ["m_result = 'OK'"];
        this.pythonScript.m_return = "m_result";
    
        let new_obj: { [key: string]: any } = {};

        for (const key in this.obj) {
        if (this.obj.hasOwnProperty(key)) {
            //make a new object with only the new settings
            if (this.sent_obj.hasOwnProperty(key)) {
              if (this.sent_obj[key] !== this.obj[key]) {
                new_obj[key] = this.obj[key];
              }
            } else {

              new_obj[key] = this.obj[key];
            }
        }    
        }

        this.pythonScript.declarations.push({ m_settings: new_obj });

        this.sent_obj = this.obj;
        this.bSent = true;
    
        return this.pythonScript;
    }
}
