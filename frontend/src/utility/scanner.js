import store from "../redux/store";

var barcodeData = "";
const VENDOR_IDS = [11734, 3111];

const submitBarcode = () => {
  var output;
  if (barcodeData.startsWith("@")) {
    var fields = barcodeData.split("\n");
    for (var field of fields) {
      if (field.startsWith("DAQ")) {
        output = field.substring(3, 15);
      }
    }
  } else {
    output = barcodeData;
  }
  document.dispatchEvent(new CustomEvent("submit-barcode", { detail: output }));
  barcodeData = "";
};

const addBarcode = (text) => {
  if (barcodeData) {
    barcodeData = barcodeData + text;
  } else {
    barcodeData = text;
    setTimeout(submitBarcode, 100);
  }
};

const readStream = async (port) => {
  await port.open({ baudRate: 115200 });
  const reader = port.readable.getReader();
  var state = store.getState();
  store.dispatch({ type: "SET_DEVICES", devices: state.devices + 1 });
  try {
    while (true) {
      var enc = new TextDecoder("utf-8");
      const { value, done } = await reader.read();
      var data = enc.decode(value);
      addBarcode(data);
      if (done) {
        //pass
        break;
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    reader.releaseLock();
    state = store.getState();
    store.dispatch({ type: "SET_DEVICES", devices: state.devices - 1 });
  }
};

const scanner = {
  readStream: readStream,
  VENDOR_IDS: VENDOR_IDS,
};

export default scanner;
