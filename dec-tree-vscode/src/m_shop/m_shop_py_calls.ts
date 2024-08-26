import M_App from "../m_app";
import { M_Logging } from "../m_logging";
import { PythonScript } from "../python_message";

export class M_ShopPyCalls {
  async train() {
    let pythonScript = new PythonScript();

    pythonScript.imports = ["from dec_tree.m_dec_tree_iris import M_DecTreeIris"];
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
    M_Logging.log("Channel output:", M_App.pyApp.channel.received_output);
  }

  async plot_tree() {
    let pythonScript = new PythonScript();
    pythonScript.code = ["m_DecTreeIris.plot_tree()", "m_result = 'OK'"];
    pythonScript.m_return = "m_result";
    await M_App.send(pythonScript);
    M_Logging.log("Channel output:", M_App.pyApp.channel.received_output);
  }

  async plot_importance() {
    let pythonScript = new PythonScript();
    pythonScript.code = [
      "m_DecTreeIris.plot_feature_importance()",
      "m_result = 'OK'",
    ];
    pythonScript.m_return = "m_result";
    await M_App.send(pythonScript);
    M_Logging.log("Channel output:", M_App.pyApp.channel.received_output);
  }
}
