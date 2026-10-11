import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { EquipulseProgram } from "../target/types/equipulse_program";

describe("equipulse-program", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.EquipulseProgram as Program<EquipulseProgram>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
