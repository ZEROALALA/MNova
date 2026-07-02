const { usb } = require('usb');
console.log("USB module loaded successfully.");
const devices = usb.getDeviceList();
console.log("Found", devices.length, "USB devices.");
