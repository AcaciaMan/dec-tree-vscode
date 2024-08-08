import fs from "fs";
import * as vscode from "vscode";

class M_Config {
  public static readonly extensionId = "dec-tree-vscode";

  public static readonly pyPath = "pyPath";

  public static readonly extensionConfig = vscode.workspace.getConfiguration(
    M_Config.extensionId
  );

  public static getString(key: string, defaultValue: string): string {
    const value = M_Config.getConString(
      M_Config.extensionId,
      key,
      defaultValue
    );
    return value;
  }

  public static getConString(
    config: string,
    key: string,
    defaultValue: string,
    depth: number = 0
  ): string {

    if (depth > 100) {
      throw new Error("Too many levels of recursion in configuration");
    }
    
    let conString: string;
    if (config === M_Config.extensionId) {
      conString = M_Config.getConfigString(
        M_Config.extensionConfig,
        key,
        defaultValue
      );
    } else {
      const configVSCode = vscode.workspace.getConfiguration(config);
      conString = M_Config.getConfigString(configVSCode, key, defaultValue);
    }


    // in conString find regular expression ${config:extensionId.key}
    // extensionId can have _ and - 
    //  const regExp = /\${config:(\w+)\.(\w+)}/;
    const regExp = /\${config:([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)}/;
    let match = regExp.exec(conString);
    while (match !== null) {
      const configName = match[1];
      const configKey = match[2];
      const value = M_Config.getConString(configName, configKey, "", depth + 1);
      conString = conString.replace(match[0], value);
      match = regExp.exec(conString);
    }

    return conString;
  }

  public static getConfigString(
    config: vscode.WorkspaceConfiguration,
    key: string,
    defaultValue: string
  ): string {
    const value = config.get<string>(key, defaultValue);
    return value;
  }

  public static async setConString(configName: string, key: string, value: string): Promise<void> {

    const config = M_Config.extensionConfig;
      if(configName !== M_Config.extensionId) {
           const config = vscode.workspace.getConfiguration(configName);
        }
           await config.update(
          key,
          value,
          vscode.ConfigurationTarget.Global
      );
  }
}

export default M_Config;