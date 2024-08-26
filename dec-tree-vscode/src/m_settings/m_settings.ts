import { PythonScript } from "../python_message";

export class M_Settings {
  private static instance: M_Settings;

  public sent_obj: { [key: string]: any } = {};
  public obj: { [key: string]: any } = {};
  public m_conf: { [key: string]: any } = {};
  public m_try: { [key: string]: any } = {};
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
    if (name === 'shop-config') {
      this.addConf(value);
    }
    this.bSent = false;
  }

    public addConf( conf: { [key: string]: any } ): void {
        //"""go through the configuration dictionary and add them to the configuration dictionary"""
        
        for (const key in conf) {
            this.m_conf[key] = conf[key];
        }

        this.addTry(this.m_conf[this.getCurrentTry()]);
    }

    public addTry( try_dict: { [key: string]: any } ): void {
        //"""go through the try dictionary and add them to the try dictionary"""

        for (const key in try_dict) {
            this.m_try[key] = try_dict[key];
        }

    }

    public getCurrentTry(): string {
        //"""return the current try"""
        return this.m_conf['current_try'];
    }

        
        
    public getTryFolder(): string {
        //"""return the root folder"""
        return this.obj['rootFolder']+'/'+this.m_try['name'];
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
