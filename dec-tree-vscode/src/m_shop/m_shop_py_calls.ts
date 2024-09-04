import M_App from "../m_app";
import { M_Logging } from "../m_logging";
import { M_Settings } from "../m_settings/m_settings";
import { PythonScript } from "../python_message";

export class M_ShopPyCalls {

  async analyse() {
    let pythonScript = new PythonScript();
    pythonScript.imports = ["from m_shop.m_shop_analysis import M_ShopAnalysis"];
    pythonScript.code = [
      "m_shop_analysis = M_ShopAnalysis()",
      "m_shop_analysis.plot_yearly_sell()",
      "m_shop_analysis.plot_yearly_stock()",
      "m_result = 'OK'"
    ];
    pythonScript.m_return = "m_result";
    await M_App.send(pythonScript);
    M_Logging.log("Channel output:", M_App.pyApp.channel.received_output);
  }


  async train() {
    let pythonScript = new PythonScript();

    const iset = M_Settings.getInstance();
    switch (iset.m_try["name"]) {
      case "try_1":
            pythonScript.imports = [
              "from dec_tree.m_dec_tree_iris import M_DecTreeIris",
            ];
            pythonScript.declarations = [{ m_result: {} }];
            pythonScript.code = [
              "m_DecTreeIris = M_DecTreeIris()",
              "m_DecTreeIris.load_df()",
              "m_result = m_DecTreeIris.train_clf()",
            ];
            //pythonScript.code = ["m_result = yaml.dump(m_args)"];
            //pythonScript.code = ["m_result = m_args"];
            pythonScript.m_return = "m_result";
            await M_App.send(pythonScript);
            M_Logging.log(
              "Channel output:",
              M_App.pyApp.channel.received_output
            );
        break;
      case "ShopRegressor":
        pythonScript.imports = ["from dec_tree.m_regressor import M_Regressor"];
        pythonScript.declarations = [{ m_result: {} }];
        pythonScript.code = [
          "m_Regressor = M_Regressor()",
          "m_Regressor.train_regressor()",
          "m_result = 'Ok'",
        ];
        pythonScript.m_return = "m_result";
        await M_App.send(pythonScript);
        M_Logging.log("Channel output:", M_App.pyApp.channel.received_output);
        break;

      default:
        M_Logging.log("No appropriate try folder selected!");
    }


  }

  async plot_tree() {
    let pythonScript = new PythonScript();
    pythonScript.code = ["m_DecTreeIris.plot_tree()", "m_result = 'OK'"];
    pythonScript.m_return = "m_result";
    await M_App.send(pythonScript);
    M_Logging.log("Channel output:", M_App.pyApp.channel.received_output);
  }

  async plot_importance() {
    const iset = M_Settings.getInstance();
        let pythonScript = new PythonScript();

    switch (iset.m_try["name"]) {
      case "try_1":
            pythonScript.code = [
              "m_DecTreeIris.plot_feature_importance()",
              "m_result = 'OK'",
            ];
            pythonScript.m_return = "m_result";
            await M_App.send(pythonScript);
            M_Logging.log(
              "Channel output:",
              M_App.pyApp.channel.received_output
            );
        break;
      case "ShopRegressor":
        pythonScript.code = [
          "print('m_Regressor:', m_Regressor, flush=True)",
          "m_Regressor.plot_feature_importance()",
          "m_Regressor.plot_sell_prediction()",
          "m_result = 'Ok'",
        ];
        pythonScript.m_return = "m_result";
        await M_App.send(pythonScript);
        M_Logging.log("Channel output:", M_App.pyApp.channel.received_output);
        break;
      default:
        M_Logging.log("No appropriate try folder selected!");
    }



  }

  async generateData() {
    let pythonScript = new PythonScript();
    pythonScript.imports = ["from m_shop.m_shop import M_Shop",
      "from m_settings.m_settings import M_SettingsSingleton"
    ];
    pythonScript.code = ["iset = M_SettingsSingleton()",
      "m_shop_data = M_Shop()", 
      "file_name = iset.m_set['rootFolder'] + '\\\\' + 'shop_data.pkl'",
      "print('file_name:', file_name, flush=True)",
      "dfShopData = m_shop_data.buy_and_sell()",
      "print(dfShopData.info(), flush=True)",
      "print(dfShopData.head(60), flush=True)",
      "dfShopData.to_pickle(file_name)",
       "m_result = 'OK'"];
    pythonScript.m_return = "m_result";
    await M_App.send(pythonScript);
    M_Logging.log("Channel output:", M_App.pyApp.channel.received_output);
  }
}
