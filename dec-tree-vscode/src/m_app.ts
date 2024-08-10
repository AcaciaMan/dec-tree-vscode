import { PythonChannel, python_channel } from "./python_channel";
import { PythonApp } from "./python_app";

class M_App {
    public static channel: python_channel = new PythonChannel();
    public static pyApp: PythonApp = new PythonApp(M_App.channel);
}

export default M_App;