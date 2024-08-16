import M_App from "../m_app";
import { M_Logging } from "../m_logging";
import { PythonScript } from "../python_message";
import M_Config from "../m_config";

jest.mock("../m_config", () => {
    return {
        __esModule: true,
        default: {
            getString: jest.fn(),
            },
            };
}
);

describe("M_App", () => {
  it("init app", async () => {

        (M_Config.getString as jest.Mock).mockReturnValue("someValue");

    let pythonScript = new PythonScript();

    pythonScript.imports = ["import yaml", "import os", "import json"];
    pythonScript.declarations = [{ m_args: { obj: "str" } }, { m_result: {} }];
    pythonScript.code = ["m_result = json.dumps(&{m_args})"];
    //pythonScript.code = ["m_result = yaml.dump(m_args)"];
    //pythonScript.code = ["m_result = m_args"];
    pythonScript.m_return = "m_result";


    M_App.pyApp.app_params = {
      python_path: "C:/Tools/Python312/python.exe",
      child_process: "C:/work/GitHub/dec-tree-py/Python/src/child_process.py",
      PYTHONPATH:
        "C:/work/GitHub/dec-tree-py/Python/src;C:/work/GitHub/dec-tree-py/Python/tests",
      cwd: "C:/work/GitHub/dec-tree-py/Python",
    };

    await M_App.pyApp.send(pythonScript);
    M_Logging.log("Result:", JSON.stringify(M_App.pyApp.result));

    await M_App.pyApp.destroy(); // Terminate the child process
  }, 10000);


    it("call classifier", async () => {
      (M_Config.getString as jest.Mock).mockReturnValue("someValue");

      let pythonScript = new PythonScript();

      pythonScript.imports = [
        "from dec_tree.m_classifier import M_Classifier"
      ];
      pythonScript.declarations = [
        { m_result: {} }
      ];
      pythonScript.code = ["m_classifier = M_Classifier()", "m_result = m_classifier()"];
      //pythonScript.code = ["m_result = yaml.dump(m_args)"];
      //pythonScript.code = ["m_result = m_args"];
      pythonScript.m_return = "m_result";

      M_App.pyApp.app_params = {
        python_path: "C:/Tools/Python312/python.exe",
        child_process: "C:/work/GitHub/dec-tree-py/Python/src/child_process.py",
        PYTHONPATH:
          "C:/work/GitHub/dec-tree-py/Python/src;C:/work/GitHub/dec-tree-py/Python/tests",
        cwd: "C:/work/GitHub/dec-tree-py/Python",
      };

      await M_App.pyApp.send(pythonScript);
      M_Logging.log("Result:", JSON.stringify(M_App.pyApp.result));

      await M_App.pyApp.destroy(); // Terminate the child process
    }, 10000);
});
