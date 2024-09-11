import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { StudentIntroProgram } from "../target/types/student_intro_program";
import { it } from "mocha";
import { expect } from "chai";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";

describe("student-intro-program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace
    .StudentIntroProgram as Program<StudentIntroProgram>;
  const stduent = {
    name: "John Doe",
    short_message: "helloworld",
  };
  const [stduentPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from(stduent.name), provider.wallet.publicKey.toBuffer()],
    program.programId
  );
  const [rewardPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("reward")],
    program.programId
  );
  it("initialize a token mint", async () => {
    const tx = await program.methods.initializeRewardToken().rpc();
  });
  it("create new student acc", async () => {
    const tokenAccount = await getAssociatedTokenAddress(
      rewardPda,
      provider.wallet.publicKey
    );
    const tx = await program.methods
      .createAccount(stduent.name, stduent.short_message)
      .accounts({
        reward_account: tokenAccount,
      })
      .rpc();
    const acc = await program.account.student.fetch(stduentPda);
    expect(acc.name).to.equal(stduent.name);
    expect(acc.shortMessage).to.equal(stduent.short_message);

    const userAta = await getAccount(provider.connection, tokenAccount);
    expect(Number(userAta.amount)).to.equal((10 * 10) ^ 6);
  });
  it("update student acc", async () => {
    const newShortMessage = "YO bu=itch!";
    const tx = await program.methods
      .updateAccount(stduent.name, newShortMessage)
      .rpc();
    const acc = await program.account.student.fetch(stduentPda);
    expect(acc.name).to.equal(stduent.name);
    expect(acc.shortMessage).to.equal(newShortMessage);
  });

  it("delete student acc", async () => {
    const tx = await program.methods.deleteAccount(stduent.name).rpc();
    try {
      const acc = await program.account.student.fetch(stduentPda);
    } catch (e) {
      expect(e).to.be.an("error");
    }
  });
});
