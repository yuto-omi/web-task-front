import type { Metadata } from "next"

export const metadata: Metadata = { title: "工数レポート | WebTask" }

const METRICS = [
  { label: "月間合計工数", value: "187h", sub: "チーム全体" },
  { label: "見積もり合計", value: "210h", sub: "超過率 11%" },
  { label: "完了プロジェクト", value: "3", sub: "今月" },
  { label: "工数超過案件", value: "2", sub: "要確認", valueColor: "#791F1F" },
]

const MEMBERS = [
  {
    initials: "近江",
    name: "近江 裕人",
    actual: 52,
    estimated: 60,
    diff: -8,
    completedTasks: 14,
    avatarStyle: { background: "#E6F1FB", color: "#0C447C" },
  },
  {
    initials: "田中",
    name: "田中 誠",
    actual: 48,
    estimated: 40,
    diff: 8,
    completedTasks: 11,
    avatarStyle: { background: "#E1F5EE", color: "#085041" },
  },
  {
    initials: "佐藤",
    name: "佐藤 花",
    actual: 41,
    estimated: 45,
    diff: -4,
    completedTasks: 9,
    avatarStyle: { background: "#FBEAF0", color: "#72243E" },
  },
  {
    initials: "山本",
    name: "山本 健",
    actual: 46,
    estimated: 40,
    diff: 6,
    completedTasks: 10,
    avatarStyle: { background: "#FAEEDA", color: "#633806" },
  },
]

const PROJECTS_HOURS = [
  {
    name: "コーポレートサイト",
    client: "株式会社〇〇",
    actual: 47,
    estimated: 40,
    progressPercent: 100,
    progressColor: "#E24B4A",
    over: true,
  },
  {
    name: "ECサイト リニューアル",
    client: "△△株式会社",
    actual: 36,
    estimated: 80,
    progressPercent: 45,
    progressColor: "#1D9E75",
    over: false,
  },
  {
    name: "□□クリニック LP",
    client: "□□クリニック",
    actual: 6,
    estimated: 30,
    progressPercent: 20,
    progressColor: "#378ADD",
    over: false,
  },
]

const MONTHS = ["2026年 4月", "2026年 3月"]

export default function ReportPage() {
  return (
    <>
      <header className="bg-white border-b border-gray-200 px-5 py-2.5 flex items-center gap-2.5 flex-shrink-0">
        <h1 className="text-[15px] font-medium flex-1">工数レポート</h1>
        <select className="text-xs px-2 py-1.5 border border-gray-300 rounded-md bg-white text-gray-900">
          {MONTHS.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </header>

      <div className="p-5 flex-1">
        {/* メトリクス */}
        <div className="grid grid-cols-4 gap-2.5 mb-4">
          {METRICS.map((m) => (
            <div key={m.label} className="bg-gray-50 rounded-lg px-3.5 py-3">
              <div className="text-[11px] text-gray-400 mb-1">{m.label}</div>
              <div
                className="text-[22px] font-medium"
                style={{ color: m.valueColor ?? "#111827" }}
              >
                {m.value}
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">{m.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[1fr_320px] gap-3.5">
          {/* メンバー別工数 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-medium flex-1">メンバー別工数</h2>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    {["メンバー", "実績工数", "見積工数", "差分", "完了タスク"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-2.5 py-2 text-[11px] text-gray-400 font-medium border-b border-gray-200"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MEMBERS.map((m) => (
                    <tr key={m.name} className="hover:bg-gray-50">
                      <td className="px-2.5 py-2.5 font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium flex-shrink-0"
                            style={m.avatarStyle}
                          >
                            {m.initials}
                          </div>
                          {m.name}
                        </div>
                      </td>
                      <td className="px-2.5 py-2.5 text-gray-600">{m.actual}h</td>
                      <td className="px-2.5 py-2.5 text-gray-600">{m.estimated}h</td>
                      <td
                        className="px-2.5 py-2.5 font-medium"
                        style={{ color: m.diff > 0 ? "#791F1F" : "#27500A" }}
                      >
                        {m.diff > 0 ? `+${m.diff}h` : `${m.diff}h`}
                      </td>
                      <td className="px-2.5 py-2.5 text-gray-600">{m.completedTasks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 案件別工数 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-medium flex-1">案件別工数</h2>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-2">
              {PROJECTS_HOURS.map((p, i) => (
                <div
                  key={p.name}
                  className={`flex justify-between items-center py-2 ${
                    i < PROJECTS_HOURS.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <div>
                    <div className="text-xs font-medium text-gray-900">{p.name}</div>
                    <div className="text-[11px] text-gray-400">{p.client}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-900">
                      {p.actual}h{" "}
                      <span style={{ color: p.over ? "#791F1F" : "#9ca3af" }}>
                        / {p.estimated}h
                      </span>
                    </div>
                    <div className="w-20 h-1 bg-gray-100 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${p.progressPercent}%`,
                          backgroundColor: p.progressColor,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
