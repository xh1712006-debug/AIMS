"use client";

import { useState, useTransition, useMemo } from "react";
import { savePermissions } from "@/app/actions/permissions";

type PermissionItem = {
  feature: string;
  intern: boolean;
  projectManager: boolean;
  memberManager: boolean;
  partner: boolean;
  admin: boolean;
};

export default function PermissionsClient({ initialPermissions }: { initialPermissions: PermissionItem[] }) {
  const [isPending, startTransition] = useTransition();
  const [draftPermissions, setDraftPermissions] = useState<PermissionItem[]>(initialPermissions);

  // So sánh mảng draft và initial để xem có thay đổi không
  const hasChanges = useMemo(() => {
    return JSON.stringify(draftPermissions) !== JSON.stringify(initialPermissions);
  }, [draftPermissions, initialPermissions]);

  const handleToggle = (rowIndex: number, roleField: 'intern' | 'projectManager' | 'memberManager' | 'partner' | 'admin') => {
    const newDrafts = [...draftPermissions];
    newDrafts[rowIndex] = {
      ...newDrafts[rowIndex],
      [roleField]: !newDrafts[rowIndex][roleField]
    };
    setDraftPermissions(newDrafts);
  };

  const handleSave = () => {
    if (!hasChanges) return;
    
    // Tìm các thay đổi để gửi đi (chỉ gửi những ô bị đổi)
    const changes: { role: string, feature: string, isEnabled: boolean }[] = [];
    
    draftPermissions.forEach((draft, idx) => {
      const orig = initialPermissions[idx];
      if (draft.intern !== orig.intern) changes.push({ role: 'INTERN', feature: draft.feature, isEnabled: draft.intern });
      if (draft.projectManager !== orig.projectManager) changes.push({ role: 'PROJECT_MANAGER', feature: draft.feature, isEnabled: draft.projectManager });
      if (draft.memberManager !== orig.memberManager) changes.push({ role: 'MEMBER_MANAGER', feature: draft.feature, isEnabled: draft.memberManager });
      if (draft.partner !== orig.partner) changes.push({ role: 'PARTNER', feature: draft.feature, isEnabled: draft.partner });
      if (draft.admin !== orig.admin) changes.push({ role: 'ADMIN', feature: draft.feature, isEnabled: draft.admin });
    });

    startTransition(async () => {
      await savePermissions(changes);
      // Giao diện sẽ tự động được cập nhật bản gốc do server trả về (revalidatePath)
    });
  };

  const handleDiscard = () => {
    setDraftPermissions(initialPermissions);
  };

  // Nút Checkbox Custom
  const CustomCheckbox = ({ checked, colorClass }: { checked: boolean, colorClass: string }) => {
    return (
      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center mx-auto transition-all duration-200 shadow-sm ${
        checked 
          ? `${colorClass} border-transparent` // Checked state (Màu nền tùy theo Role)
          : 'bg-transparent border-gray-300 dark:border-gray-600' // Unchecked state (Rỗng)
      }`}>
        {checked && (
          <svg className="w-4 h-4 text-white font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-end mb-6">
        {/* Nhóm nút Lưu và Hủy */}
        <div className="flex items-center gap-3">
          {hasChanges && (
            <button 
              onClick={handleDiscard}
              disabled={isPending}
              className="px-4 py-2 font-bold text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-[#262626] rounded-lg hover:bg-gray-200 dark:hover:bg-[#383838] transition-colors"
            >
              Hủy bỏ (Discard)
            </button>
          )}
          <button 
            onClick={handleSave}
            disabled={!hasChanges || isPending}
            className={`px-6 py-2 font-bold rounded-lg transition-all shadow-sm flex items-center gap-2 ${
              hasChanges 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 shadow-lg cursor-pointer transform hover:scale-105' 
                : 'bg-gray-200 text-gray-400 dark:bg-[#262626] dark:text-[#525252] cursor-not-allowed'
            }`}
          >
            {isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Đang lưu...
              </>
            ) : (
              'Lưu thay đổi'
            )}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#171717] rounded-xl shadow-[0_1px_3px_0_rgb(0,0,0,0.05)] border border-slate-100 dark:border-[#262626] overflow-hidden relative">
        {isPending && (
          <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-[#262626]">
            <thead className="bg-slate-50/50 dark:bg-[#0A0A0A]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-[#737373] uppercase tracking-wider">Tính năng / Chức năng</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 dark:text-[#737373] uppercase tracking-wider">Thực tập sinh</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 dark:text-[#737373] uppercase tracking-wider">Quản lý dự án</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 dark:text-[#737373] uppercase tracking-wider">Quản lý thành viên</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 dark:text-[#737373] uppercase tracking-wider">Đối tác</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 dark:text-[#737373] uppercase tracking-wider">Quản trị viên</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#171717] divide-y divide-slate-100 dark:divide-[#262626]">
              {draftPermissions.map((perm, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-[#0A0A0A]/50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium text-slate-800 dark:text-[#D4D4D4]">
                    {perm.feature}
                  </td>
                  
                  {/* Intern Cell */}
                  <td 
                    className="px-6 py-4 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1f1f1f] transition-colors" 
                    onClick={() => handleToggle(idx, 'intern')}
                  >
                    <CustomCheckbox checked={perm.intern} colorClass="bg-green-500" />
                  </td>
                  
                  {/* ProjectManager Cell */}
                  <td 
                    className="px-6 py-4 text-center border-l border-slate-100 dark:border-[#262626] cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1f1f1f] transition-colors" 
                    onClick={() => handleToggle(idx, 'projectManager')}
                  >
                    <CustomCheckbox checked={perm.projectManager} colorClass="bg-green-500" />
                  </td>
                  
                  {/* MemberManager Cell */}
                  <td 
                    className="px-6 py-4 text-center border-l border-slate-100 dark:border-[#262626] cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1f1f1f] transition-colors" 
                    onClick={() => handleToggle(idx, 'memberManager')}
                  >
                    <CustomCheckbox checked={perm.memberManager} colorClass="bg-green-500" />
                  </td>

                  {/* Partner Cell */}
                  <td 
                    className="px-6 py-4 text-center border-l border-slate-100 dark:border-[#262626] cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1f1f1f] transition-colors" 
                    onClick={() => handleToggle(idx, 'partner')}
                  >
                    <CustomCheckbox checked={perm.partner} colorClass="bg-green-500" />
                  </td>
                  
                  {/* Admin Cell */}
                  <td 
                    className="px-6 py-4 text-center border-l border-slate-100 dark:border-[#262626] cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1f1f1f] transition-colors" 
                    onClick={() => handleToggle(idx, 'admin')}
                  >
                    <CustomCheckbox checked={perm.admin} colorClass="bg-green-500" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
