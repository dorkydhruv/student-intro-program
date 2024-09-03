import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { StudentIntroProgram } from "../target/types/student_intro_program";
import { it } from "mocha";
import { expect } from "chai";

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
  it("create new student acc", async () => {
    const tx = await program.methods
      .createAccount(stduent.name, stduent.short_message)
      .rpc();
    const acc = await program.account.student.fetch(stduentPda);
    console.log(acc);
    expect(acc.name).to.equal(stduent.name);
    expect(acc.shortMessage).to.equal(stduent.short_message);
  });
  it("update student acc", async () => {
    const newShortMessage = "YO bu=itch!";
    const tx = await program.methods
      .updateAccount(stduent.name, newShortMessage)
      .rpc();
    const acc = await program.account.student.fetch(stduentPda);
    console.log(acc);
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
