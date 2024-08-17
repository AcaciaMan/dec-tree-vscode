export interface python_channel {
  received_data: Buffer | undefined;
  received_json: object | undefined;
  received_output: string | undefined;
  bReceivedResponse: boolean;
  getJSONAs64ByteEncoded(jObj: object): string;
  encode(jObj: object): string;
  decode(data: Buffer): void;
  new_message(): void;
}

export class PythonChannel implements python_channel {
  received_data: Buffer | undefined;
  received_json: object | undefined;
  received_output: string | undefined;
  bReceivedResponse: boolean = false;

  constructor() {
    this.received_data = undefined;
    this.received_json = undefined;
    this.received_output = undefined;
  }

  getJSONAs64ByteEncoded(jObj: object): string {
    const jsonString = JSON.stringify(jObj);
    const encodedString = Buffer.from(jsonString).toString("base64");
    return encodedString;
  }

  encode(jObj: object): string {
    const jsonString = "#$%" + this.getJSONAs64ByteEncoded(jObj) + "%$#";

    return jsonString;
  }

  decode(data: Buffer): void {
    if (!this.received_data) {
      this.received_data = Buffer.from("", "latin1");
    }

    this.received_data = Buffer.concat([this.received_data, data]);

    const jsonString = Buffer.from(this.received_data).toString("latin1");
    // console.log(jsonString);

    // Check if the start and end markers for stdout are present 'out_start_###' and 'out_end_###' - if so, extract the string this.received_output between them
    const outStartMarker = "out_start_###";
    const outEndMarker = "out_end_###";
    const outStartIndex = jsonString.indexOf(outStartMarker);
    const outEndIndex = jsonString.indexOf(outEndMarker);

    if (outStartIndex > -1 && outEndIndex > -1) {
      this.received_output = jsonString.substring(
        outStartIndex + outStartMarker.length,
        outEndIndex
      );

    }

    const startMarker = "#$%";
    const endMarker = "%$#";
    const startIndex = jsonString.indexOf(startMarker);
    const endIndex = jsonString.indexOf(endMarker);

    if (startIndex > -1 && endIndex > -1) {
      const extractedString = jsonString.substring(
        startIndex + startMarker.length,
        endIndex
      );

      this.received_json = JSON.parse(
        Buffer.from(extractedString, "base64").toString("utf8")
      );

      this.bReceivedResponse = true;

      if (startIndex > 0) {
        console.log("recout:", jsonString.substring(0, startIndex));
      }

      if (endIndex < jsonString.length - 3) {
        console.log("recout:", jsonString.substring(endIndex + 3));
      }
      this.received_data = undefined;
    } 
    if (startIndex === -1 && outStartIndex === -1 && jsonString.length > 0) {
      console.log("recout:", jsonString);
      this.received_data = undefined;
    }
  }

  new_message(): void {
    this.bReceivedResponse = false;
    this.received_json = undefined;
    this.received_output = undefined;
  }
}
