import { Loader2 } from "lucide-react";

// 로딩 컴포넌트
export const LoadingSpinner = () => (
    <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
        <span className="text-lg font-medium text-gray-700">데이터를 불러오는 중...</span>
    </div>
);