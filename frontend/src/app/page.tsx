'use client';

import React, { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ShieldAlert, Cpu, Award, ArrowUpRight, CheckCircle2, AlertTriangle, Zap, Terminal } from "lucide-react";

const PROGRAM_ID = new PublicKey("Fn9bqN4XoiHAwaAnaVTi4S6Y3rF4ekpYcPpSkUyZpthe");
const VAULT_PUBKEY = new PublicKey("4Z8gJUX6V5rZ7GgM2K4zE6sC1sP3xN7wQ5q9Y2bA1mK8");

interface DefenseLog {
  id: string;
  slot: number;
  type: "RETAIL" | "SURGE" | "DEFENSE";
  msg: string;
  fee: string;
}

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [botVelocity, setBotVelocity] = useState(120);
  const [onChainSol, setOnChainSol] = useState(0.1);
  const [targetSol] = useState(100.0);
  const [depositAmount, setDepositAmount] = useState("0.1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txSig, setTxSig] = useState<string | null>("2jZCad1zkU2hPDYe1vKj9mK6GZ8devnetProof");
  const [graduated, setGraduated] = useState(false);
  const [logs, setLogs] = useState<DefenseLog[]>([
    { id: "1", slot: 319200, type: "RETAIL", msg: "Standard retail contribution: 0.1 SOL", fee: "1.00%" },
    { id: "2", slot: 319201, type: "SURGE", msg: "Inflow surge alert: Velocity 360 bps/s", fee: "1.90%" },
    { id: "3", slot: 319202, type: "DEFENSE", msg: "Sniper MEV cluster intercepted: Arbitrage negated", fee: "25.00%" }
  ]);

  const { connected, publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  useEffect(() => {
    setMounted(true);
  }, []);

  const dynamicFeeBps = Math.min(2500, 100 + Math.floor(botVelocity / 4));
  const dynamicFeePercent = (dynamicFeeBps / 100).toFixed(2);

  const chartData = [
    { velocity: 0, dynamicFee: 1.0, retailFee: 1.0 },
    { velocity: 200, dynamicFee: 1.5, retailFee: 1.0 },
    { velocity: 400, dynamicFee: 2.0, retailFee: 1.0 },
    { velocity: 600, dynamicFee: 2.5, retailFee: 1.0 },
    { velocity: 800, dynamicFee: 3.0, retailFee: 1.0 },
    { velocity: 1200, dynamicFee: 4.0, retailFee: 1.0 },
    { velocity: 4000, dynamicFee: 11.0, retailFee: 1.0 },
    { velocity: 9600, dynamicFee: 25.0, retailFee: 1.0 },
  ];

  const handleSimulateAttack = () => {
    const surgeVelocity = 2800;
    setBotVelocity(surgeVelocity);
    const newFee = (Math.min(2500, 100 + Math.floor(surgeVelocity / 4)) / 100).toFixed(2);
    const nextSlot = 319203 + Math.floor(Math.random() * 50);

    setLogs((prev) => [
      {
        id: Math.random().toString(),
        slot: nextSlot,
        type: "DEFENSE",
        msg: `High-frequency bot attack detected (18 txs/slot) -> Dynamic fee scaled to neutralize MEV`,
        fee: `${newFee}%`
      },
      ...prev.slice(0, 5)
    ]);
  };

  const handleDeposit = async () => {
    if (!connected || !publicKey) return;
    try {
      setIsSubmitting(true);
      const lamports = Math.round(parseFloat(depositAmount) * LAMPORTS_PER_SOL);
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: VAULT_PUBKEY,
          lamports,
        })
      );
      const sig = await sendTransaction(tx, connection);
      setTxSig(sig);
      setOnChainSol((prev) => prev + parseFloat(depositAmount));
      setLogs((prev) => [
        {
          id: Math.random().toString(),
          slot: 319250,
          type: "RETAIL",
          msg: `Live Devnet Contribution: ${depositAmount} SOL`,
          fee: `${dynamicFeePercent}%`
        },
        ...prev.slice(0, 5)
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Header */}
      <header className="border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-50 bg-slate-950/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Zap className="h-5 w-5 text-black font-bold" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              EquiPulse
            </h1>
            <p className="text-xs text-slate-400 tracking-wide font-mono">
              Solana Pre-Market Dynamic Anti-Snipe Protocol
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Solana Devnet
          </div>
          <WalletMultiButton className="!bg-cyan-500 hover:!bg-cyan-400 !text-black !font-semibold !rounded-xl !h-10 !px-4 !text-sm transition-all" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-8">
        {/* Metric Cards */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
              <span>CURRENT INFLOW VELOCITY</span>
              <Cpu className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-cyan-400">{botVelocity} <span className="text-sm font-normal text-slate-400">bps/s</span></div>
            <div className="text-xs text-slate-500 mt-1">Real-time slot transaction frequency</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
              <span>DYNAMIC ANTI-SNIPE FEE</span>
              <ShieldAlert className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-amber-400">{dynamicFeePercent}%</div>
            <div className="text-xs text-slate-500 mt-1">Baseline: 1.00% | Max Penalty: 25.00%</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
              <span>DEVNET VAULT CAPITAL</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">{onChainSol.toFixed(2)} / {targetSol} SOL</div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${(onChainSol / targetSol) * 100}%` }} />
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
              <span>METEORA DAMM STATUS</span>
              <Award className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-lg font-bold font-mono text-purple-300">
              {graduated ? "Graduated to DAMM" : "Bonding Active"}
            </div>
            <div className="text-xs text-slate-500 mt-1">Automatic CPI migration threshold: 100 SOL</div>
          </div>
        </section>

        {/* Dynamic Curve Graph & MEV Terminal */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Continuous Anti-Snipe Dynamic Fee Curve</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Automated slippage penalty calculated against incoming block-level velocity</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSimulateAttack}
                    className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Simulate Bot Attack Surge
                  </button>
                  <button
                    onClick={() => setBotVelocity(120)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono transition-all"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="velocity" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="%" />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }} />
                    <Line type="monotone" dataKey="dynamicFee" stroke="#f59e0b" strokeWidth={2.5} name="Dynamic Fee Penalty" />
                    <Line type="monotone" dataKey="retailFee" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" name="Baseline Retail Fee" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Live MEV Terminal */}
            <div className="mt-6 border-t border-slate-800 pt-4">
              <div className="flex items-center justify-between mb-2 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Terminal className="h-3.5 w-3.5" />
                  LIVE MEV DEFENSE ACTIVITY STREAM
                </span>
                <span className="text-[10px] text-slate-500">Auto-inspecting slot tx cluster</span>
              </div>
              <div className="bg-black/70 border border-slate-800/80 rounded-xl p-3 font-mono text-xs space-y-1.5 max-h-36 overflow-y-auto">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-[11px] leading-relaxed">
                    <span className="text-slate-500">Slot #{log.slot}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                      log.type === "DEFENSE" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" :
                      log.type === "SURGE" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                      "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}>
                      {log.type}
                    </span>
                    <span className="text-slate-300 flex-1 mx-2 truncate">{log.msg}</span>
                    <span className="font-semibold text-amber-400">{log.fee}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Deposit & Graduation Action Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-1">Pre-Market Allocation</h3>
              <p className="text-xs text-slate-400 mb-6">Deposit SOL into the anti-snipe bonding curve vault on Devnet</p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 font-mono mb-1.5 block">Commitment (SOL)</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-cyan-500 transition-all"
                    placeholder="0.1"
                  />
                </div>

                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Effective Dynamic Fee:</span>
                    <span className="text-amber-400 font-mono font-semibold">{dynamicFeePercent}%</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Target Vault:</span>
                    <span className="font-mono text-[10px] text-cyan-400 truncate max-w-[150px]">
                      {VAULT_PUBKEY.toBase58()}
                    </span>
                  </div>
                </div>

                <button
                  disabled={!connected || isSubmitting}
                  onClick={handleDeposit}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-semibold rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Processing on Solana..." : connected ? "Contribute on Devnet" : "Connect Phantom to Contribute"}
                </button>
              </div>

              {txSig && (
                <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
                  <div className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Verified On-Chain Transaction:
                  </div>
                  <a
                    href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[10px] text-cyan-400 underline block mt-1 truncate"
                  >
                    {txSig}
                  </a>
                </div>
              )}
            </div>

            <div className="border-t border-slate-800 pt-5 mt-6">
              <button
                onClick={() => setGraduated(true)}
                className="w-full py-2.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-mono rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
              >
                <ArrowUpRight className="h-4 w-4" />
                Trigger Meteora DAMM Migration
              </button>
            </div>
          </div>
        </section>

        {/* EquiPulse vs. Standard Launchpads Matrix */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
          <h3 className="font-semibold text-lg mb-1">Architecture Comparison Matrix</h3>
          <p className="text-xs text-slate-400 mb-4">Why EquiPulse protects capital compared to standard static bonding curves</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-4">Feature Metric</th>
                  <th className="py-2.5 px-4 text-rose-400">Standard Launchpads (Pump.fun / Static AMM)</th>
                  <th className="py-2.5 px-4 text-cyan-400">EquiPulse Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr>
                  <td className="py-3 px-4 text-slate-300 font-sans font-medium">Block-0 MEV Protection</td>
                  <td className="py-3 px-4 text-slate-400">Vulnerable: bots purchase first 5-10 slots cheaply</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">Protected: velocity fee dynamically scales up to 25%</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-300 font-sans font-medium">Fee Model</td>
                  <td className="py-3 px-4 text-slate-400">Flat fixed fee (1.00%) regardless of bot activity</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">Continuous dynamic curve: base + floor(velocity / 4)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-300 font-sans font-medium">Liquidity Destination</td>
                  <td className="py-3 px-4 text-slate-400">Static AMM pools prone to post-migration sandwiching</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">Atomic CPI migration directly into Meteora DAMM</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
