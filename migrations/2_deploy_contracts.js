const y0Contract = artifacts.require("y0");

module.exports = function (deployer) {
  deployer.deploy(y0Contract);
};
