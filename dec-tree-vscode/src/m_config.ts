import fs from "fs";
import * as vscode from "vscode";

class M_Config {
  public static readonly extensionId = "dec-tree-vscode";

  public static readonly pyPath = "pyPath";

  public static readonly extensionConfig = vscode.workspace.getConfiguration(
    M_Config.extensionId
  );

  public static getString(key: string, defaultValue: string): string {
    const value = M_Config.getConfigString(
      M_Config.extensionConfig,
      key,
      defaultValue
    );
    return value;
  }

  public static getConString(
    config: string,
    key: string,
    defaultValue: string
  ): string {
    if (config === M_Config.extensionId) {
      return M_Config.getConfigString(
        M_Config.extensionConfig,
        key,
        defaultValue
      );
    } else {
      const configVSCode = vscode.workspace.getConfiguration(config);
      return M_Config.getConfigString(configVSCode, key, defaultValue);
    }
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