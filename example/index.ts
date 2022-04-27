import Web3 from "web3";

const y0Contract = require("../build/contracts/y0.json");
const config = require("../truffle-config");

const web3 = new Web3(
  `http://${config.networks.development.host}:${config.networks.development.port}`
);

const contract = new web3.eth.Contract(
  y0Contract.abi,
  y0Contract.networks[config.networks.development.network_id].address
);

type AccessLevel = "no_rights" | "admin" | "reader";
const roles: {
  [key: string]: AccessLevel;
} = {
  "0": "no_rights",
  "1": "admin",
  "2": "reader",
};

async function checkRole(account: string): Promise<AccessLevel> {
  try {
    const level = await contract.methods
      .getRole(account)
      .call({ from: account });
    return roles[level] || roles["0"];
  } catch (e) {
    console.log(e);
  }
  return roles["0"];
}

async function grantRole(
  account: string,
  from: string,
  role: "1" | "2"
): Promise<boolean> {
  try {
    await contract.methods.grantRole(account, role).send({ from });
    return true;
  } catch (e) {
    return false;
  }
}

async function revokeRole(account: string, from: string): Promise<boolean> {
  try {
    await contract.methods.revokeRole(account).send({ from });
    return true;
  } catch (e) {
    return false;
  }
}

const printRole = async (name: string, account: string) => {
  console.log(`${name} is`, await checkRole(account));
};

const tryTo = async (name: string, callback: any, expected?: boolean) => {
  console.log(`Try to ${name}`);
  const result = await callback();
  if (result) {
    console.log("ok");
  } else if (expected === false) {
    console.error("failed but it is expected");
  } else {
    console.error("failed");
  }
};

function separator(name: string) {
  console.log("");
  console.log("");
  console.log("");
  console.log(name);
}

async function main() {
  const accounts = await web3.eth.getAccounts();
  const [owner, user1, user2] = accounts;

  await printRole("owner", owner);
  await printRole("user1", user1);
  await tryTo(
    `grantRole ${roles["2"]} by owner to user1`,
    async () => await grantRole(user1, owner, "2")
  );
  await printRole("user1", user1);
  await tryTo(
    `grantRole ${roles["1"]} by owner to user1`,
    async () => await grantRole(user1, owner, "1")
  );
  await printRole("user1", user1);
  await printRole("user2", user2);
  await tryTo(
    `grantRole ${roles["2"]} by user1 to user2`,
    async () => await grantRole(user2, user1, "2")
  );
  await printRole("user2", user2);
  await tryTo(
    `grantRole ${roles["2"]} by user2 to user1`,
    async () => await grantRole(user1, user2, "2"),
    false
  );
  await printRole("user1", user1);

  // revoke
  separator("Revoke");
  await printRole("user2", user2);
  await tryTo(
    `revokeRole by user2 to user1`,
    async () => await revokeRole(user1, user2),
    false
  );
  await printRole("user1", user1);
  await tryTo(
    `revokeRole by user1 to user2`,
    async () => await revokeRole(user2, user1)
  );
  await printRole("user2", user2);
  await tryTo(
    `revokeRole by user1 to user1`,
    async () => await revokeRole(user1, user1),
    false
  );
  await printRole("user1", user1);
  await tryTo(
    `revokeRole by user1 to creator`,
    async () => await revokeRole(owner, user1),
    false
  );
  await printRole("owner", owner);
}

main();
