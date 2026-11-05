const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../apps/ceo1983_app_fe/src/routes/ai-assistant.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Thêm import CrmChatGPTView và MessageSquare icon
if (!content.includes('CrmChatGPTView')) {
  content = content.replace(
    'import { exportToExcel } from "@/lib/excel-export";',
    'import { exportToExcel } from "@/lib/excel-export";\nimport { CrmChatGPTView } from "@/components/ai/CrmChatGPTView";\nimport { MessageSquare } from "lucide-react";'
  );
}

// 2. Sửa type của activeTab và mặc định là "chat"
content = content.replace(
  'const [activeTab, setActiveTab] = useState<"analysis" | "finance_report" | "invoice" | "activity">("analysis");',
  'const [activeTab, setActiveTab] = useState<"chat" | "analysis" | "finance_report" | "invoice" | "activity">("chat");'
);

// 3. Thêm tab button "Trò Chuyện AI (ChatGPT)" trước tab "Phân Tích Thông Minh CRM"
const tabBtnTarget = `<button
            type="button"
            onClick={() => setActiveTab("analysis")}`;

const chatTabBtn = `<button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={\`pb-3 px-4 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer whitespace-nowrap \${
              activeTab === "chat"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }\`}
          >
            <MessageSquare className="size-4 text-primary" />
            <span>Trò Chuyện AI (ChatGPT Style)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
              Model Free
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("analysis")}`;

if (content.includes(tabBtnTarget) && !content.includes('setActiveTab("chat")')) {
  content = content.replace(tabBtnTarget, chatTabBtn);
}

// 4. Render {activeTab === "chat" && <CrmChatGPTView />} trước {activeTab === "analysis" && (
const renderTarget = `{activeTab === "analysis" && (`;
const chatRender = `{activeTab === "chat" && (
          <div className="space-y-4">
            <CrmChatGPTView />
          </div>
        )}

        {activeTab === "analysis" && (`;

if (content.includes(renderTarget) && !content.includes('CrmChatGPTView />')) {
  content = content.replace(renderTarget, chatRender);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully integrated CrmChatGPTView into ai-assistant.tsx!');

