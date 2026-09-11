"use client";

import { useState } from "react";
import Link from "next/link";
import { createUserAccount, assignMentorToIntern, deleteUserAccount } from "@/app/actions";

type UserType = {
  id: string;
  name: string;
  email: string;
  role: string;
  projectManagerId: string | null;
  projects?: { id: string; title: string }[];
  projectManager?: { id: string; name: string } | null;
  interns?: { id: string; name: string }[];
};

export default function UserManagementClient({ users }: { users: UserType[] }) {
  const [activeTab, setActiveTab] = useState<"INTERN" | "PROJECT_MANAGER" | "MEMBER_MANAGER" | "PARTNER" | "ADMIN" | "ALL">("INTERN");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  
  const [editUser, setEditUser] = useState<UserType | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserType | null>(null);

  const interns = users.filter(u => u.role === "INTERN");
  const mentors = users.filter(u => u.role === "PROJECT_MANAGER");

  const displayedUsers = users.filter((u) => {
    if (activeTab !== "ALL" && u.role !== activeTab) return false;
    if (searchQuery && !u.name.toLowerCase().includes(searchQuery.toLowerCase()) && !u.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <div className="flex border-b border-gray-200 dark:border-[#262626] w-full max-w-md">
          {(["INTERN", "PROJECT_MANAGER", "MEMBER_MANAGER", "PARTNER", "ADMIN", "ALL"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-4 text-sm font-semibold transition-all relative whitespace-nowrap ${
                activeTab === tab 
                  ? 'text-zinc-900 dark:text-zinc-100' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-[#A3A3A3] dark:hover:text-[#D4D4D4]'
              }`}
            >
              {tab === "INTERN" ? "Thực tập sinh" : 
               tab === "PROJECT_MANAGER" ? "QL Dự án" : 
               tab === "MEMBER_MANAGER" ? "QL Thành viên" :
               tab === "PARTNER" ? "Đối tác" :
               tab === "ADMIN" ? "Quản trị viên" : "Tất cả"}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-zinc-900 dark:bg-zinc-100 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-3 items-center">
          <input 
            type="text" 
            placeholder="Tìm kiếm tên, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-[#383838] bg-transparent px-4 py-2 text-sm focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none w-64 shadow-sm placeholder:text-slate-400"
          />
          <button 
            onClick={() => setCreateModalOpen(true)}
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm text-sm"
          >
            Tạo Tài khoản
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#171717] rounded-xl shadow-[0_1px_3px_0_rgb(0,0,0,0.05)] border border-slate-100 dark:border-[#262626] overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-[#262626]">
            <thead className="bg-slate-50/50 dark:bg-[#0A0A0A]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-[#737373] uppercase tracking-wider">Tài khoản</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-[#737373] uppercase tracking-wider">Vai trò</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-[#737373] uppercase tracking-wider">Thông tin liên quan</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-[#737373] uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#171717] divide-y divide-slate-100 dark:divide-[#262626]">
              {displayedUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-[#0A0A0A]/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-900 dark:text-[#EDEDED]">{user.name}</div>
                    <div className="text-sm text-slate-500 dark:text-[#737373]">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ring-1 ring-inset ${
                      user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 ring-purple-600/20' 
                      : user.role === 'PROJECT_MANAGER' ? 'bg-orange-50 text-orange-700 ring-orange-600/20' 
                      : 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-[#A3A3A3]">
                    {user.role === "INTERN" && (
                      <div className="space-y-1">
                        <div>
                          <span className="font-medium text-slate-800 dark:text-[#D4D4D4] mr-2">ProjectManager:</span>
                          {user.projectManager ? <span className="text-zinc-900 dark:text-zinc-100">{user.projectManager.name}</span> : <span className="italic text-slate-400">Chưa phân bổ</span>}
                        </div>
                        <div>
                          <span className="font-medium text-slate-800 dark:text-[#D4D4D4] block mb-1">Dự án:</span>
                          {user.projects && user.projects.length > 0 ? (
                            <div className="flex gap-2 flex-wrap">
                              {user.projects.map(p => (
                                <span key={p.id} className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                                  {p.title}
                                </span>
                              ))}
                            </div>
                          ) : <span className="italic text-slate-400">Chưa có dự án</span>}
                        </div>
                      </div>
                    )}
                    {user.role === "PROJECT_MANAGER" && (
                      <div>
                        <span className="font-medium text-slate-800 dark:text-[#D4D4D4] block mb-1">Quản lý {user.interns?.length || 0} Interns:</span>
                        {user.interns && user.interns.length > 0 ? (
                          <div className="flex gap-2 flex-wrap">
                            {user.interns.map(i => (
                              <span key={i.id} className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                                {i.name}
                              </span>
                            ))}
                          </div>
                        ) : <span className="italic text-slate-400 mt-1 block">Chưa phân bổ ai</span>}
                      </div>
                    )}
                    {user.role === "ADMIN" && (
                      <span className="italic text-slate-400">Quản trị viên hệ thống</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right flex justify-end items-center gap-1">
                    {user.role === "INTERN" && (
                      <button onClick={() => setEditUser(user)} className="px-3 py-1.5 text-slate-600 dark:text-slate-300 font-medium text-sm rounded-md hover:bg-slate-100 hover:text-slate-900 transition-colors">
                        Gán ProjectManager
                      </button>
                    )}
                    <Link href={`/dashboard/users/${user.id}`} className="px-3 py-1.5 text-zinc-600 dark:text-zinc-400 font-medium text-sm rounded-md hover:bg-zinc-100 hover:text-zinc-900 transition-colors">
                      Chi tiết
                    </Link>
                    {user.role !== "ADMIN" && (
                      <button onClick={() => setDeleteUser(user)} className="px-3 py-1.5 text-red-500 font-medium text-sm rounded-md hover:bg-red-50 hover:text-red-600 transition-colors">
                        Xóa
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {displayedUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500 dark:text-[#737373]">
                    Không tìm thấy dữ liệu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-100 dark:border-[#262626]">
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-4">Tạo Tài khoản Mới</h3>
            <form action={async (formData) => {
              await createUserAccount(formData);
              setCreateModalOpen(false);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-[#D4D4D4] mb-1">Vai trò</label>
                <select name="role" required className="w-full rounded-lg border-gray-300 dark:border-[#383838] bg-white dark:bg-[#0A0A0A] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 p-2 text-sm">
                  <option value="INTERN">Thực tập sinh (Intern)</option>
                  <option value="PROJECT_MANAGER">Người quản lý dự án (Project Manager)</option>
                  <option value="MEMBER_MANAGER">Người quản lý thành viên (Member Manager)</option>
                  <option value="PARTNER">Đối tác (Partner)</option>
                  <option value="ADMIN">Quản trị hệ thống (Admin)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-[#D4D4D4] mb-1">Họ và Tên</label>
                <input name="name" required type="text" className="w-full rounded-lg border-gray-300 dark:border-[#383838] bg-transparent ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 p-2 text-sm" placeholder="VD: Nguyễn Văn A" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-[#D4D4D4] mb-1">Email</label>
                <input name="email" required type="email" className="w-full rounded-lg border-gray-300 dark:border-[#383838] bg-transparent ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 p-2 text-sm" placeholder="VD: mail@test.local" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-[#D4D4D4] mb-1">Mật khẩu</label>
                <input name="password" required type="text" defaultValue="password123" className="w-full rounded-lg border-gray-300 dark:border-[#383838] bg-transparent ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 p-2 text-sm" />
              </div>
              
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setCreateModalOpen(false)} className="flex-1 px-4 py-2 bg-gray-100 dark:bg-[#262626] text-gray-800 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-200 transition-colors">Hủy</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-colors">Tạo ngay</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Assignment Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-100 dark:border-[#262626]">
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-4">Gán ProjectManager cho Intern</h3>
            <div className="mb-4 text-sm">
              <p>Thực tập sinh: <strong>{editUser.name}</strong></p>
              <p className="text-gray-500">{editUser.email}</p>
            </div>
            <form action={async (formData) => {
              await assignMentorToIntern(formData);
              setEditUser(null);
            }} className="space-y-4">
              <input type="hidden" name="internId" value={editUser.id} />
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-[#D4D4D4] mb-1">Chọn ProjectManager quản lý</label>
                <select name="projectManagerId" defaultValue={editUser.projectManagerId || "none"} className="w-full rounded-lg border-gray-300 dark:border-[#383838] bg-white dark:bg-[#0A0A0A] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 p-2 text-sm">
                  <option value="none">-- Chưa phân bổ (None) --</option>
                  {mentors.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setEditUser(null)} className="flex-1 px-4 py-2 bg-gray-100 dark:bg-[#262626] text-gray-800 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-200 transition-colors">Hủy</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-colors">Cập nhật</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirm Modal */}
      {deleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-100 dark:border-[#262626]">
            <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Xóa Tài Khoản</h3>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Bạn có chắc chắn muốn xóa tài khoản <strong>{deleteUser.name}</strong> không? Hành động này sẽ xóa toàn bộ dữ liệu liên quan (Dự án, Check-in, Sprint...) và không thể hoàn tác!
            </p>

            <form action={async (formData) => {
              await deleteUserAccount(formData);
              setDeleteUser(null);
            }} className="flex gap-3">
              <input type="hidden" name="id" value={deleteUser.id} />
              <button type="button" onClick={() => setDeleteUser(null)} className="flex-1 px-4 py-2 bg-gray-100 dark:bg-[#262626] text-gray-800 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-200 transition-colors">
                Hủy
              </button>
              <button type="submit" className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 transition-colors shadow-sm">
                Xóa Vĩnh Viễn
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
