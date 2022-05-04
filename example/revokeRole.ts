// eslint-disable-next-line import/extensions,import/no-unresolved
import { networks, Payload, printLevel, signTx, submitSignedTx } from "./utils";

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

const owner = web3.eth.accounts.privateKeyToAccount(
  process.env.ACCOUNT_PRIVATE_KEY
);

// eslint-disable-next-line no-underscore-dangle
const _printLevel = printLevel(contract);

async function revokeRole(_account) {
  // @ts-ignore
  console.log(`Use ${web3.currentProvider.host}`);
  console.log(`Revoke account ${_account} role`);

  await _printLevel(_account);
  await _printLevel(owner.address);

  const nonce = await web3.eth.getTransactionCount(owner.address, "pending");
  const extraData = await contract.methods.revokeRole(_account);
  const data = extraData.encodeABI();

  const txObj: Payload = {
    to: y0Contract.networks[networkData.networkId].address,
    data,
    privateKey: owner.privateKey,
    nonce,
    value: "0",
  };

  const signedTx = await signTx(web3, network, txObj);
  const signedTxString = `0x${signedTx.serialize().toString("hex")}`;

  const tx: any = await submitSignedTx(web3, signedTxString);
  if (tx && tx.success) {
    console.log(`Transaction: ${tx.txHash}`);
    console.log("Waiting for confirmation...");
    tx.tx.on("confirmation", async (confirmationNumber: number) => {
      console.log(`Confirmations: ${confirmationNumber}`);
      if (confirmationNumber > 1) {
        await _printLevel(_account);
        process.exit();
      }
    });
  }
}

revokeRole(account);
