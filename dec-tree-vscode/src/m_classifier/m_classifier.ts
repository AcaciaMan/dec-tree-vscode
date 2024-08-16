import M_App from "../m_app";
import { M_Logging } from "../m_logging";
import { PythonScript } from "../python_message";

export  class M_Classifier {

    async __call__() {
              let pythonScript = new PythonScript();

              pythonScript.imports = [
                "from dec_tree.m_classifier import M_Classifier",
              ];
              pythonScript.declarations = [{ m_result: {} }];
              pythonScript.code = [
                "m_classifier = M_Classifier()",
                "m_result = m_classifier()",
              ];
              //pythonScript.code = ["m_result = yaml.dump(m_args)"];
              //pythonScript.code = ["m_result = m_args"];
              pythonScript.m_return = "m_result";
                    await M_App.pyApp.send(pythonScript);
                    M_Logging.log(
                      "Channel output:",
                      M_App.pyApp.channel.received_output
                    );
    }

    async plot_tree() {
      let pythonScript = new PythonScript();
      pythonScript.code = ["m_classifier.plot_tree()", "m_result = 'OK'"];
      pythonScript.m_return = "m_result";
      await M_App.pyApp.send(pythonScript);
      M_Logging.log("Channel output:", M_App.pyApp.channel.received_output);
    }
}