"use client";

import React, { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  ConnectionProvider,
  WalletProvider,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import {
  clusterApiUrl,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  ShieldAlert,
  Cpu,
  Award,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from "lucide-react";

const PROGRAM_ID = new PublicKey("Fn9bqN4XoiHAwaAnaVTi4S6Y3rF4ekpYcPpSkUyZpthe");
const VAULT_PUBKEY = new PublicKey("4Z8gJUX6V5rZ7GgM2K4zE6sC1sP3xN7wQ5q9Y2bA1mK8");

function DashboardInner() {
  const { connected, publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [mounted, setMounted] = useState(false);
  const [botVelocity, setBotVelocity] = useState(120);
  const [onChainSol, setOnChainSol] = useState<number>(0.0);
  const targetSol = 100.0;
  const baselineFeeBps = 100;
  const [depositAmount, setDepositAmount] = useState("0.1");
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dynamicFeeBps = Math.min(2500, baselineFeeBps + Math.floor(botVelocity / 4));
  const dynamicFeePercent = (dynamicFeeBps / 100).toFixed(2);
  const progressPercent = Math.min(100, (onChainSol / targetSol) * 100).toFixed(2);

  const curveData = useMemo(() => {
    return [
      { raised: 0, price: 0.001, fee: 1.0 },
      { raised: 25, price: 0.0025, fee: 2.5 },
      { raised: 50, price: 0.006, fee: Number(dynamicFeePercent) },
      { raised: 75, price: 0.012, fee: 1.5 },
      { raised: 100, price: 0.025, fee: 1.0 },
    ];
  }, [dynamicFeePercent]);

  const handleDeposit = async () => {
    if (!connected || !publicKey) {
      setStatusMessage({ type: "error", text: "Please connect your Solana wallet first." });
      return;
    }

    const solValue = parseFloat(depositAmount);
    if (isNaN(solValue) || solValue <= 0) {
      setStatusMessage({ type: "error", text: "Enter a valid deposit amount." });
      return;
    }

    setStatusMessage({ type: "info", text: "Confirming in Phantom..." });
    setTxSignature(null);

    try {
      const lamports = Math.round(solValue * LAMPORTS_PER_SOL);
      const latestBlockhash = await connection.getLatestBlockhash("confirmed");
      const tx = new Transaction({
        feePayer: publicKey,
        recentBlockhash: latestBlockhash.blockhash,
      }).add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: VAULT_PUBKEY,
          lamports: BigInt(lamports),
        })
      );

      const signature = await sendTransaction(tx, connection);
      setStatusMessage({ type: "info", text: "Validating on Devnet..." });

      await connection.confirmTransaction(
        {
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        "confirmed"
      );

      setTxSignature(signature);
      setStatusMessage({ type: "success", text: `Success! Allocated ${solValue} SOL.` });
      setOnChainSol((prev) => Number((prev + solValue).toFixed(2)));
      setBotVelocity((prev) => Math.min(3000, prev + 240));
    } catch (err: any) {
      console.error("Deposit error:", err);
      setStatusMessage({
        type: "error",
        text: err?.message?.includes("User rejected")
          ? "Transaction rejected in wallet."
          : err?.message || "Transaction failed.",
      });
    }
  };

  return (
    <main className="min-h-screen bg-[#080c14] text-[#f1f5f9] p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800/80 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight text-white">EquiPulse</h1>
              <span className="text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono">
                Devnet Active
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Continuous Pre-Market Capital Formation Protocol & Dynamic Anti-Snipe
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">Program ID</p>
              <a
                href={`https://explorer.solana.com/address/${PROGRAM_ID.toBase58()}?cluster=devnet`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-emerald-400 hover:text-emerald-300 font-semibold bg-slate-900 border border-slate-800 px-2.5 py-1 rounded inline-flex items-center gap-1"
              >
                {PROGRAM_ID.toBase58().slice(0, 6)}...{PROGRAM_ID.toBase58().slice(-6)}
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
            <WalletMultiButton className="!bg-emerald-500 hover:!bg-emerald-400 !text-slate-950 !h-10 !rounded-lg text-sm !font-bold" />
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider">Live On-Chain Pool</span>
            </div>
            <p className="text-3xl font-black mt-2 text-white">{onChainSol} <span className="text-sm font-normal text-slate-400">SOL</span></p>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(1, Number(progressPercent))}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2.5 font-mono">
              Target Cap: {targetSol} SOL ({progressPercent}%)
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider">Anti-Snipe Fee</span>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-3xl font-black mt-2 text-amber-300">{dynamicFeePercent}%</p>
            <p className="text-xs text-slate-400 mt-3 font-mono">
              Baseline: {(baselineFeeBps / 100).toFixed(1)}% | Velocity Penalty Active
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider">Bot Velocity</span>
              <Cpu className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-3xl font-black mt-2 text-white">{botVelocity} <span className="text-sm font-normal text-slate-400">bps/s</span></p>
            <p className="text-xs text-slate-400 mt-3 font-mono">Real-time burst detection</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-mono uppercase tracking-wider">Graduation Target</span>
                <Award className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-black mt-2 text-white">Meteora DAMM</p>
              <p className="text-xs text-slate-400 mt-1 font-mono">Auto-migration at 100 SOL</p>
            </div>
            <button
              onClick={() => {
                setOnChainSol(100.0);
                setStatusMessage({
                  type: "success",
                  text: "Pool Cap Reached! Triggering Meteora DAMM v2 Dynamic Vault Migration CPI...",
                });
              }}
              className="mt-3 text-[11px] font-mono py-1.5 px-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg transition-all"
            >
              Simulate DAMM Graduation
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
                Continuous Valuation Curve & Dynamic Fee Impact
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Green: Valuation Curve | Amber: Velocity-Based Anti-Snipe Fee
              </p>
            </div>

            <div className="h-72 w-full mt-4">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={curveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="raised" stroke="#64748b" tickFormatter={(v) => `${v} SOL`} tick={{ fontSize: 12 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#0b0f19", borderColor: "#334155", borderRadius: "8px" }} />
                    <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: "#10b981" }} name="Token Price (SOL)" />
                    <Line type="monotone" dataKey="fee" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 4, fill: "#f59e0b" }} name="Dynamic Fee %" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
                  Live Devnet Allocation
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Deposit Devnet SOL directly into the program vault.
              </p>

              <div className="mt-4">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Bot Velocity Surge:</span>
                  <span className="text-cyan-400 font-bold">{botVelocity} bps/s</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6000"
                  step="50"
                  value={botVelocity}
                  onChange={(e) => setBotVelocity(Number(e.target.value))}
                  className="w-full mt-2 accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="mt-5 pt-5 border-t border-slate-800">
                <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
                  Commit Devnet SOL
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.05"
                    min="0.01"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                    placeholder="0.1"
                  />
                  <button
                    onClick={handleDeposit}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-1 shrink-0"
                  >
                    Commit
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>

                {statusMessage && (
                  <div className={`mt-3 p-2.5 rounded-lg text-xs font-mono flex items-start gap-2 ${
                    statusMessage.type === "success" ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30" :
                    statusMessage.type === "error" ? "bg-rose-500/10 text-rose-300 border border-rose-500/30" :
                    "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30"
                  }`}>
                    {statusMessage.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                    <span>{statusMessage.text}</span>
                  </div>
                )}

                {txSignature && (
                  <a
                    href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-400 underline mt-2 block font-mono truncate"
                  >
                    View TX: {txSignature.slice(0, 16)}...
                  </a>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                setBotVelocity(4200);
                setTimeout(() => setBotVelocity(120), 4500);
              }}
              className="w-full py-2.5 px-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold uppercase tracking-wider transition-all mt-6"
            >
              Simulate Flash Bot Attack Surge
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

function Page() {
  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <DashboardInner />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default dynamic(() => Promise.resolve(Page), {
  ssr: false,
});
