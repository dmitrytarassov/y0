import { Transaction } from "ethereumjs-tx";
import Web3 from "web3";
import { Contract } from "web3-eth-contract";

require("dotenv").config();

function validatePrivateKey(privateKey) {
  if (privateKey.startsWith("0x")) {
    return privateKey.substr(2);
  }
  return privateKey;
}

export interface Payload {
  to: string;
  data: string;
  value: string;
  privateKey: string;
  nonce: string;
}

// eslint-disable-next-line import/prefer-default-export
export async function signTx(web3: Web3, network: string, payload: Payload) {
  const { to, data, value, privateKey, nonce } = payload;

  const txParams = {
    to,
    data,
    value: web3.utils.toHex(value),
    gasPrice: web3.utils.toHex(20 * 1e9 * 10),
    gasLimit: web3.utils.toHex(21000 * 10),
    nonce: web3.utils.toHex(nonce),
  };

  const tx = new Transaction(txParams, { chain: network });
  const validatedPrivateKey = validatePrivateKey(privateKey);
  // eslint-disable-next-line no-buffer-constructor
  const bufferPrivateKey = Buffer.from(validatedPrivateKey, "hex");
  tx.sign(bufferPrivateKey);
  return tx;
}

export async function submitSignedTx(web3: Web3, serializedTx: string) {
  return new Promise((fullfill) => {
    const tx = web3.eth.sendSignedTransaction(serializedTx);
    tx.on("transactionHash", (txHash) => {
      console.log("transaction sent. hash =>", txHash);
      return fullfill({ success: true, txHash, tx });
    }).on("error", (e) => {
      console.log("unable to send tx", e);
      // console.log(e.message)
      return fullfill({ success: false, message: e });
    });
  });
}

export type AccessLevel = "no_rights" | "admin" | "reader";
export const roles: {
  [key: string]: AccessLevel;
} = {
  "0": "no_rights",
  "1": "admin",
  "2": "reader",
};

export const printLevel = (contract: Contract) => async (_account: string) => {
  const level = await contract.methods
    .getRole(_account)
    .call({ from: _account });
  console.log(`Account ${_account} has role ${roles[level] || roles["0"]}`);
};

export const networks = {
  bsctestnet: {
    providerUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    networkId: "97",
  },
  ropsten: {
    providerUrl: `https://ropsten.infura.io/v3/${process.env.INFURA_KEY}`,
    networkId: "3",
  },
  rinkeby: {
    providerUrl: `https://rinkeby.infura.io/v3/${process.env.INFURA_KEY}`,
    networkId: "4",
  },
};
