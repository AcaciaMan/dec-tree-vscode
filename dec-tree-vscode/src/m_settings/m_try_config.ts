// singleton class to manage the configuration of decision tree tries in file 'shop-config.json'

import { M_Settings } from "./m_settings";
import fs = require('fs');

export class M_TryConfig {
  private static instance: M_TryConfig;

  public obj: { [key: string]: any } = {};

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

}