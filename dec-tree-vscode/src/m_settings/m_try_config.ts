// singleton class to manage the configuration of decision tree tries in file 'shop-config.json'

import { M_Settings } from "./m_settings";
import fs = require('fs');

export class M_TryConfig {
  private static instance: M_TryConfig;

  public obj: { [key: string]: any } = {};
  public iset = M_Settings.getInstance();

  private constructor() {
    // Initialization code here
  }

  public static getInstance(): M_TryConfig {
    if (!M_TryConfig.instance) {
      M_TryConfig.instance = new M_TryConfig();
    }
    return M_TryConfig.instance;
  }

  public loadObj(): void {
    //read file without vscode
    //const fs = require('fs');
    const data = fs.readFileSync(this.iset.obj["rootFolder"] + "/shop-config.json");
    this.obj = JSON.parse(data.toString());
  }

  public saveObj(): void {
    //write obj in pretty format
    
    const fs = require('fs');
    const pretty = JSON.stringify(this.obj, null, 2);

    fs.writeFileSync(
      this.iset.obj["rootFolder"] + "/shop-config.json",
      pretty
    );
  }

  //method to get tries names dictionary
  public getTries(): { [key: string]: any } {
    //if obj key starts with try, add its name to the dictionary
    const tries: { [key: string]: any } = {};
    for (const key in this.obj) {
      if (key.startsWith("try")) {
        tries[this.obj[key]["name"]] = this.obj[key];
      }
    }

    return tries;
  }

  //set the object key to the new value
  public setObjKey(key: string, value: any): void {
    this.obj[key] = value;
    this.iset.addSetting("shop-config", this.obj);
  }
}