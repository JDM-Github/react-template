import { QUICK_TESTS, METHOD_BADGE, type QuickTest } from "../data/quick-tests";

type Props = {
    activeQuick: string | null;
    loading: boolean;
    onRun: (test: QuickTest, group: string) => void;
};

export function QuickTestsPanel({ activeQuick, loading, onRun }: Props) {
    return (
        <div className="flex flex-col gap-3">
            <span className="text-xs text-zinc-500 tracking-wider uppercase">Quick Tests</span>
            <div className="flex flex-col gap-3">
                {QUICK_TESTS.map(({ group, tests }) => (
                    <div key={group} className="flex flex-col gap-1.5">
                        <span className="text-[10px] text-zinc-700 tracking-widest uppercase">{group}</span>
                        <div className="flex flex-wrap gap-1.5">
                            {tests.map((test) => {
                                const key = `${group}:${test.label}`;
                                const isActive = activeQuick === key;
                                return (
                                    <button
                                        key={test.label}
                                        onClick={() => onRun(test, group)}
                                        disabled={loading}
                                        title={test.description}
                                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${isActive
                                                ? "border-zinc-500 bg-zinc-800 text-zinc-100"
                                                : "border-zinc-800/80 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 hover:bg-zinc-800/50"
                                            }`}
                                    >
                                        <span className={`font-bold text-[10px] px-1 py-0.5 rounded ${METHOD_BADGE[test.method]}`}>
                                            {test.method}
                                        </span>
                                        <span className="text-zinc-500">{test.label.replace(`${test.method} `, "")}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}