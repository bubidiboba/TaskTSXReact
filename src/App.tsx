import React, { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faApple,
    faGoogle,
    faAmazon,
} from "@fortawesome/free-brands-svg-icons";
import {
    faCheck,
    faChevronRight,
    faChevronLeft,
    faCartShopping,
    faBuildingColumns,
    faWallet,
    faBagShopping,
    faCreditCard,
    faStore,
    faUtensils,
    faBolt,
    faBusSimple,
} from "@fortawesome/free-solid-svg-icons";
import "./App.css";
import RAW_TRANSACTIONS from "./transactions.json";

type TxType = "Payment" | "Credit";

type Transaction = {
    id: string;
    type: TxType;
    name: string;
    description: string;
    amount: number;
    date: string;
    pending?: boolean;
    authorizedUser?: string;
    status?: "Approved" | "Declined" | "Pending";
    card?: string;
    iconHint?: string;
    location?: string;
    category?: string;
};

const MAX_LIMIT = 1500;

const TRANSACTIONS: Transaction[] = RAW_TRANSACTIONS.map((t) => {
    if (t.date === "yesterday") {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        t.date = d.toISOString();
    }
    if (t.id === "t1") {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        t.date = d.toISOString();
    }
    return t;
});

/* ---------- Helper Functions ---------- */

function formatMoney(n: number): string {
    return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function dayNameOrDate(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor((+now - +d) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays <= 6) return d.toLocaleDateString(undefined, { weekday: "long" });
    return d.toLocaleDateString();
}

function iconFor(hint?: string) {
    switch ((hint || "").toLowerCase()) {
        case "apple":
            return faApple;
        case "amazon":
            return faAmazon;
        case "google":
            return faGoogle;
        case "bank":
            return faBuildingColumns;
        case "wallet":
            return faWallet;
        case "bag":
            return faBagShopping;
        case "store":
            return faStore;
        case "utensils":
            return faUtensils;
        case "bolt":
            return faBolt;
        case "bus":
            return faBusSimple;
        default:
            return faCartShopping;
    }
}

function randomDarkColor(seed: string) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue} 70% 20%)`;
}

function getSeasonStart(d: Date): Date {
    const y = d.getFullYear();
    const mm = d.getMonth();
    let start: Date;
    if (mm >= 11 || mm < 2) start = new Date(mm >= 11 ? y : y - 1, 11, 1);
    else if (mm >= 2 && mm < 5) start = new Date(y, 2, 1);
    else if (mm >= 5 && mm < 8) start = new Date(y, 5, 1);
    else start = new Date(y, 8, 1);
    return start;
}

/* Daily Points: 2, 3, then n = n-2 + 0.6 * n-1 */
function todaysPoints(): number {
    const today = new Date();
    const seasonStart = getSeasonStart(today);
    const day = Math.floor((+today - +seasonStart) / (1000 * 60 * 60 * 24)) + 1;
    if (day <= 1) return 2;
    if (day === 2) return 3;
    let p1 = 2, p2 = 3;
    for (let i = 3; i <= day; i++) {
        const pn = p1 + 0.6 * p2;
        p1 = p2;
        p2 = pn;
    }
    return Math.round(p2);
}

function formatPoints(n: number): string {
    if (n >= 1000) return `${Math.round(n / 1000)}K`;
    return n.toLocaleString();
}

/** Random number for balance (0–1500) with 2 decimals */
function randomBalance(): number {
    const n = Math.random() * MAX_LIMIT;
    return Math.round(n * 100) / 100;
}

type Route = { name: "list" } | { name: "detail"; tx: Transaction };

const App: React.FC = () => {
    const [route, setRoute] = useState<Route>({ name: "list" });

    return (
        <div className="app-shell">
            {route.name === "list" ? (
                <TransactionsList
                    transactions={TRANSACTIONS.slice(0, 10)}
                    onOpen={(tx) => setRoute({ name: "detail", tx })}
                />
            ) : (
                <TransactionDetail
                    tx={route.tx}
                    onBack={() => setRoute({ name: "list" })}
                />
            )}
        </div>
    );
};

type ListProps = {
    transactions: Transaction[];
    onOpen: (t: Transaction) => void;
};

const TransactionsList: React.FC<ListProps> = ({ transactions, onOpen }) => {
    // Random card balance each render (0–1500)
    const balance = useMemo(() => randomBalance(), []);
    const available = MAX_LIMIT - balance;
    const todaysPts = useMemo(() => todaysPoints(), []);

    return (
        <>
            <div className="header">
                <FontAwesomeIcon icon={faCreditCard} />
                <h1>Card Balance</h1>
            </div>

            <div className="section">
                <div className="grid">
                    {/* Left column */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        <div className="card">
                            <h3>Card Balance</h3>
                            <div className="balance-amount">{formatMoney(balance)}</div>
                            <div className="balance-sub">{formatMoney(available)} Available</div>
                        </div>

                        <div className="card daily-points">
                            <h3>Daily Points</h3>
                            <div className="balance-amount-points-value">
                                {formatPoints(todaysPts)}
                            </div>
                        </div>
                    </div>

                    {/* Right column */}
                    <div className="card duedone">
                        <div>
                            <h4>No Payment Due</h4>
                            <div
                                style={{
                                    marginTop: 6,
                                    fontWeight: 400,
                                    color: "var(--muted)",
                                    fontSize: 14,
                                }}
                            >
                                You’ve paid your September balance.
                            </div>
                        </div>
                        <div className="tick">
                            <FontAwesomeIcon icon={faCheck} style={{ fontSize: 30 }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="section-title">Latest Transactions</div>
            <div className="list">
                {transactions.map((t) => (
                    <TransactionRow key={t.id} t={t} onClick={() => onOpen(t)} />
                ))}
            </div>
        </>
    );
};

const TransactionRow: React.FC<{ t: Transaction; onClick: () => void }> = ({
                                                                               t,
                                                                               onClick,
                                                                           }) => {
    const icon = iconFor(t.iconHint || t.name.toLowerCase());
    const bg = randomDarkColor(t.name);
    const amountSign = t.type === "Payment" ? "+" : "-";

    const cleanedDesc = (t.description || "")
        .split(/\n|—/g)
        .map((s) => s.trim())
        .filter(
            (s) => s && s.toLowerCase() !== (t.authorizedUser || "").toLowerCase()
        )
        .join(" — ");

    const descLine = [t.pending ? "Pending" : null, cleanedDesc]
        .filter(Boolean)
        .join(" — ");

    const userDateLine = [t.authorizedUser, dayNameOrDate(t.date)]
        .filter(Boolean)
        .join(" — ");

    const percent = Math.floor(Math.random() * 10) + 1;

    return (
        <div className="item" role="button" onClick={onClick}>
            <div className="icon-badge" style={{ background: bg }}>
                <FontAwesomeIcon icon={icon} />
            </div>

            <div className="item-content grid">
                <div className="item-name">{t.name}</div>

                <div className="item-amount-group">
                    <div className="item-amount">
                        {amountSign}
                        {formatMoney(t.amount)}
                    </div>
                    <div className="percent-box">{percent}%</div>
                </div>

                {descLine && <div className="item-desc">{descLine}</div>}
                {userDateLine && <div className="item-meta">{userDateLine}</div>}
            </div>

            <FontAwesomeIcon icon={faChevronRight} style={{ color: "var(--muted)" }} />
        </div>
    );
};

const TransactionDetail: React.FC<{ tx: Transaction; onBack: () => void }> = ({
                                                                                  tx,
                                                                                  onBack,
                                                                              }) => {
    const dt = new Date(tx.date);
    return (
        <div className="detail">
            <button className="back" onClick={onBack}>
                <FontAwesomeIcon icon={faChevronLeft} /> Back
            </button>

            <div className="detail-amount">
                {(tx.type === "Payment" ? "+" : "-") + formatMoney(tx.amount)}
            </div>
            <div className="detail-merchant">{tx.name}</div>
            <div className="detail-datetime">
                {dt.toLocaleDateString()}{" "}
                {dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>

            <div className="detail-card">
                <div className="row">
                    <div className="label" style={{ color: "black", fontWeight: 700 }}>
                        Status: {tx.status || (tx.pending ? "Pending" : "Approved")}
                        <div
                            style={{
                                color: "var(--muted)",
                                marginTop: "6px",
                                fontWeight: "400",
                            }}
                        >
                            RBC Debit Card
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="label" style={{ color: "black", fontWeight: 700 }}>
                        Total:
                    </div>
                    <div style={{ color: "black", fontWeight: 700 }}>
                        {(tx.type === "Payment" ? "+" : "-") + formatMoney(tx.amount)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
