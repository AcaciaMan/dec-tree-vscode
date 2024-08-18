import { PythonChannel, python_channel } from "./python_channel";
import { PythonApp } from "./python_app";
import { M_Settings } from "./m_settings/m_settings";

class M_App {
    public static channel: python_channel = new PythonChannel();
    public static pyApp: PythonApp = new PythonApp(M_App.channel);

    public static async send(jObj: object) {
        
        //if M_Settings.getInstance().bSent is false, then send the settings
        const iset = M_Settings.getInstance();
        if (!iset.bSent) {
            await M_App.pyApp.send(iset.getPythonScript);
        }

        await M_App.pyApp.send(jObj);
    }

}

export default M_App;