const { accounts, contract } = require("@openzeppelin/test-environment");
const { expect } = require("chai");

const y0 = contract.fromArtifact("y0");

describe("y0", () => {
  const [creator, user1, user2, user3] = accounts;
  let y0Contract;
  let adminRole;
  let readerRole;
  const noRole = "0";

  beforeEach(async () => {
    y0Contract = await y0.new({ from: creator });
    adminRole = (await y0Contract.admin.call()).toString();
    readerRole = (await y0Contract.reader.call()).toString();
  });

  it("check admin role", async () => {
    const creatorRole = (await y0Contract.getRole(creator)).toString();
    expect(creatorRole).to.eq(adminRole);
  });

  it("check user1 role", async () => {
    const userRole = (await y0Contract.getRole(user1)).toString();
    expect(userRole).to.eq(noRole);
  });

  describe("set roles to users", async () => {
    beforeEach(async () => {
      await y0Contract.grantRole(user1, +adminRole, { from: creator });
    });

    it("check user1 role", async () => {
      const userRole = (await y0Contract.getRole(user1)).toString();
      expect(userRole).to.eq(adminRole);
    });

    it("check user2 role", async () => {
      const userRole = (await y0Contract.getRole(user2)).toString();
      expect(userRole).to.eq(noRole);
    });

    it("try to set role to owner", async () => {
      try {
        await y0Contract.grantRole(creator, +readerRole, { from: user1 });
        expect(1).to.eq(2);
      } catch (e) {
        expect(e.message).to.eq(
          "Returned error: VM Exception while processing transaction: revert You can not set role to owner -- Reason given: You can not set role to owner."
        );
      }
    });

    it("try to set role to yourself", async () => {
      try {
        await y0Contract.grantRole(user1, +readerRole, { from: user1 });
        expect(1).to.eq(2);
      } catch (e) {
        expect(e.message).to.eq(
          "Returned error: VM Exception while processing transaction: revert You can not set role to yourself -- Reason given: You can not set role to yourself."
        );
      }
    });

    describe("check revoke role", () => {
      beforeEach(async () => {
        await y0Contract.grantRole(user3, +readerRole, { from: creator });
      });

      it("user3 can not revoke role", async () => {
        try {
          await y0Contract.revokeRole(user1, { from: user3 });
          expect(1).to.eq(2);
        } catch (e) {
          expect(e.message).to.eq(
            "Returned error: VM Exception while processing transaction: revert You have no access to this method -- Reason given: You have no access to this method."
          );
        }
      });

      it("user1 can not revoke creator role", async () => {
        try {
          await y0Contract.revokeRole(creator, { from: user1 });
          expect(1).to.eq(2);
        } catch (e) {
          expect(e.message).to.eq(
            "Returned error: VM Exception while processing transaction: revert You can not set revoke owner's role -- Reason given: You can not set revoke owner's role."
          );
        }
      });

      it("user1 can not revoke himself role", async () => {
        try {
          await y0Contract.revokeRole(user1, { from: user1 });
          expect(1).to.eq(2);
        } catch (e) {
          expect(e.message).to.eq(
            "Returned error: VM Exception while processing transaction: revert You can not set revoke your role -- Reason given: You can not set revoke your role."
          );
        }
      });

      it("user1 can revoke user3 role", async () => {
        await y0Contract.revokeRole(user3, { from: user1 });
        const userRole = (await y0Contract.getRole(user3)).toString();
        expect(userRole).to.eq(noRole);
      });
    });

    describe("check thar user2 can not set roles", () => {
      it("try to set role to from user without role", async () => {
        try {
          await y0Contract.grantRole(user1, +readerRole, { from: user2 });
          expect(1).to.eq(2);
        } catch (e) {
          expect(e.message).to.eq(
            "Returned error: VM Exception while processing transaction: revert You have no access to this method -- Reason given: You have no access to this method."
          );
        }
      });

      describe("set reader role from user1 to user 2", () => {
        it("try ro set role from new admin", async () => {
          await y0Contract.grantRole(user2, +readerRole, { from: user1 });
          const userRole = (await y0Contract.getRole(user2)).toString();
          expect(userRole).to.eq(readerRole);
        });

        describe("can not set role from reader", () => {
          it("try to to set role to from user2 to user1", async () => {
            try {
              await y0Contract.grantRole(user1, +readerRole, { from: user2 });
              expect(1).to.eq(2);
            } catch (e) {
              expect(e.message).to.eq(
                "Returned error: VM Exception while processing transaction: revert You have no access to this method -- Reason given: You have no access to this method."
              );
            }
          });
        });
      });
    });
  });
});
