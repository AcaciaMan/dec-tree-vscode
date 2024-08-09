import { ChildProcess, spawn } from "child_process";
import M_Config from "./m_config";
import { python_message, PythonScript } from "./python_message";
import { PythonChannel, python_channel } from "./python_channel";

export class PythonApp {
  private _child: ChildProcess | null = null;
  public python_message: python_message | null = null;
  public result: any;
  public channel: python_channel = new PythonChannel();

  constructor(channel: python_channel) {
    this.channel = channel;
  }

  public app_params = {
    python_path: M_Config.getString(M_Config.pyExePath, ""),
    child_process: M_Config.getString(M_Config.pyChildProcess, ""),
    PYTHONPATH: M_Config.getString(M_Config.pyPath, ""),
    cwd: M_Config.getString(M_Config.pyCWD, ""),
  };

  public get child(): ChildProcess | null {
    return this._child;
  }

  public set child(value: ChildProcess | null) {
    this._child = value;
  }

  public callPythonScript(): ChildProcess {
    this.child = spawn(
      this.app_params.python_path,
      [this.app_params.child_process],
      {
        env: {
          ...process.env,
          PYTHONPATH: this.app_params.PYTHONPATH,
        },
        cwd: this.app_params.cwd,
      }
    );

    if (this.child.stdout) {
      this.child.stdout.on("data", (data) => {
        this.channel.decode(data);
        this.result = this.channel.received_json;
        console.log("stdout:", this.result);
      });
    }

    if (this.child.stderr) {
      this.child.stderr.on("data", (data: Buffer) => {
        console.log(`stderr: ${data}`);
      });
    }

    return this.child;
  }

  public async send(jObj: object) {
    if (!this.child) {
      this.callPythonScript();
    }

    await this.sendStr(this.channel.encode(jObj));
  }

  public async sendStr(message: string) {
    this.channel.new_message();
    if (this.child && this.child.stdin) {
      this.child.stdin.write(message, (error: Error | null | undefined) => {
        if (error) {
          console.log(
            "Error sending message to Python subprocess: " + error.message
          );
        }
      });

      await this.waitUntilResult();
    }
  }

  public async waitUntilResult(): Promise<void> {
    const totalTime = 10000; // Total waiting time in milliseconds
    const intervalTime = 100; // Interval time in milliseconds

    const startTime = Date.now();
    while (
      !this.channel.bReceivedResponse &&
      Date.now() - startTime < totalTime
    ) {
      await new Promise((resolve) => setTimeout(resolve, intervalTime));
    }
  }

  public async destroy() {
    const pythonScript = new PythonScript();

    pythonScript.code = ["bTerminate = True"];
    pythonScript.m_return = "bTerminate";

    await this.send(pythonScript);
    console.log("Terminated:", JSON.stringify(this.result));

    // wait for the child process to terminate
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (this.child) {
      this.child.kill();
    }
    this.child = null;
  }
}
