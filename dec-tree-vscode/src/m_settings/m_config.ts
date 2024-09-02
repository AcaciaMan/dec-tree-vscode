// singleton class to manage the configuration of decision tree tries in file 'shop-config.json'

import { M_Settings } from "./m_settings";
import fs = require('fs');

export class M_Config {
  private static instance: M_Config;

  public obj: { [key: string]: any } = {};

  private constructor() {
    // Initialization code here
  }

  public static getInstance(): M_Config {
    if (!M_Config.instance) {
      M_Config.instance = new M_Config();
    }
    return M_Config.instance;
  }

  public loadObj(): void {
    const iset = M_Settings.getInstance();
    //read file without vscode
    //const fs = require('fs');
    const data = fs.readFileSync(iset.obj["rootFolder"] + "/shop-config.json");
    this.obj = JSON.parse(data.toString());
    }

    public saveObj(): void {
        const iset = M_Settings.getInstance();
        fs.writeFileSync(iset.obj["rootFolder"] + "/shop-config.json", JSON.stringify(this.obj));
    }

}