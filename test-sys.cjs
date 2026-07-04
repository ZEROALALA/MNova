const si = require('systeminformation');

async function getStats() {
  const cpuLoad = await si.currentLoad();
  const mem = await si.mem();
  const net = await si.networkStats();
  const disk = await si.fsSize();
  const temp = await si.cpuTemperature();
  
  console.log({
    cpuLoad: cpuLoad.currentLoad,
    memUsage: (mem.active / mem.total) * 100,
    netRx: net[0] ? net[0].rx_sec / (1024 * 1024) : 0,
    netTx: net[0] ? net[0].tx_sec / (1024 * 1024) : 0,
    temp: temp.main,
    disk: disk.map(d => ({ fs: d.fs, size: d.size, used: d.used }))
  });
}

getStats();
