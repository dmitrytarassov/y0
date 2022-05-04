// eslint-disable-next-line import/extensions,import/no-unresolved
import { networks, printLevel } from "./utils";

const Web3 = require("web3");

require("dotenv").config();
const y0Contract = require("../build/contracts/y0.json");

const [account, network] = process.argv.reverse();

const networkData = networks[network];

if (!networkData) {
  console.log(`Unknown network ${network}`);
  process.exit();
}

const web3 = new Web3(networkData.providerUrl);

web3.eth.setProvider(networkData.providerUrl);

const contract = new web3.eth.Contract(
  y0Contract.abi,
  y0Contract.networks[networkData.networkId].address
);

// eslint-disable-next-line no-underscore-dangle
const _printLevel = printLevel(contract);

async function getRole(_account) {
  // @ts-ignore
  console.log(`Use ${web3.currentProvider.host}`);
  console.log(`Get account ${_account} role`);

  await _printLevel(_account);
}

getRole(account);
